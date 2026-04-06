// ============================================================
// CHECADOR MOZZAFIATO — Code.gs (Apps Script Backend)
// Pegar este archivo COMPLETO en el editor de Apps Script
// ============================================================

// ===== CONFIGURACIÓN =====
var SPREADSHEET_ID = 'TU_SPREADSHEET_ID';
var DRIVE_FOLDER_ID = 'TU_DRIVE_FOLDER_ID';
var ADMIN_EMAIL = 'admin@tudominio.com';

// ===== NOMBRES DE HOJAS =====
var SHEET_EMPLEADOS = 'Empleados';
var SHEET_CHECADAS = 'Checadas';
var SHEET_CONFIGURACION = 'Configuracion';

// ===== HORARIOS =====
var HORARIOS = {
  manana: { entrada: { hora: 7, minuto: 20 }, salida: { hora: 16, minuto: 0 } },
  noche: { entrada: { hora: 15, minuto: 50 }, salida: { hora: 0, minuto: 0 } },
  cortado_manana: { entrada: { hora: 7, minuto: 20 }, salida: { hora: 12, minuto: 0 } },
  cortado_noche: { entrada: { hora: 19, minuto: 50 }, salida: { hora: 0, minuto: 0 } }
};

// ===== WEB APP ENTRY POINTS =====
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var params = e.parameter || {};
  var action = params.action || '';

  if (e.postData && e.postData.contents) {
    try {
      var postBody = JSON.parse(e.postData.contents);
      action = postBody.action || action;
      for (var key in postBody) {
        if (postBody.hasOwnProperty(key)) {
          params[key] = postBody[key];
        }
      }
    } catch (err) {
      // Si no es JSON válido, ignorar
    }
  }

  var result;
  try {
    switch (action) {
      case 'getEmployees':
        result = getActiveEmployees();
        break;
      case 'validatePin':
        result = validatePin(params.employeeId, params.pin);
        break;
      case 'getEmployeeStatus':
        result = getEmployeeStatus(params.employeeId);
        break;
      case 'registerCheck':
        result = registerCheck(params.employeeId, params.selfieBase64);
        break;
      case 'getConfig':
        result = getConfig();
        break;
      default:
        result = { success: false, error: 'Acción no válida: ' + action };
    }
  } catch (err) {
    result = { success: false, error: err.message };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== EMPLEADOS =====
function getActiveEmployees() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_EMPLEADOS);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var employees = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var activo = String(row[getColIndex(headers, 'activo')]).toLowerCase();
    if (activo === 'true' || activo === 'si' || activo === 'sí' || activo === '1') {
      employees.push({
        id: String(row[getColIndex(headers, 'id')]),
        nombre: row[getColIndex(headers, 'nombre')],
        email: row[getColIndex(headers, 'email')],
        telefono: row[getColIndex(headers, 'telefono')],
        horario: row[getColIndex(headers, 'horario')],
        sueldo_semanal: Number(row[getColIndex(headers, 'sueldo_semanal')])
      });
    }
  }

  return { success: true, employees: employees };
}

// ===== VALIDAR PIN =====
function validatePin(employeeId, pin) {
  if (!employeeId || !pin) {
    return { success: false, error: 'ID y PIN son requeridos' };
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_EMPLEADOS);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(row[getColIndex(headers, 'id')]) === String(employeeId)) {
      var storedPin = String(row[getColIndex(headers, 'pin')]);
      if (storedPin === String(pin)) {
        return { success: true, valid: true };
      } else {
        return { success: true, valid: false, error: 'PIN incorrecto' };
      }
    }
  }

  return { success: false, error: 'Empleado no encontrado' };
}

// ===== ESTADO DEL EMPLEADO HOY =====
function getEmployeeStatus(employeeId) {
  if (!employeeId) {
    return { success: false, error: 'ID de empleado requerido' };
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_CHECADAS);
  var today = getTodayString();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  var checksToday = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var rowDate = formatDateString(row[getColIndex(headers, 'fecha')]);
    if (String(row[getColIndex(headers, 'empleado_id')]) === String(employeeId) && rowDate === today) {
      checksToday.push({
        tipo: row[getColIndex(headers, 'tipo')],
        hora: row[getColIndex(headers, 'hora')],
        retardo: row[getColIndex(headers, 'retardo')]
      });
    }
  }

  var lastCheck = checksToday.length > 0 ? checksToday[checksToday.length - 1] : null;
  var nextType = 'entrada';
  if (lastCheck && lastCheck.tipo === 'entrada') {
    nextType = 'salida';
  }

  return {
    success: true,
    checksToday: checksToday,
    nextType: nextType,
    hasCheckedIn: checksToday.length > 0
  };
}

// ===== REGISTRAR CHECADA =====
function registerCheck(employeeId, selfieBase64) {
  if (!employeeId) {
    return { success: false, error: 'ID de empleado requerido' };
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Obtener datos del empleado
  var empSheet = ss.getSheetByName(SHEET_EMPLEADOS);
  var empData = empSheet.getDataRange().getValues();
  var empHeaders = empData[0];
  var employee = null;

  for (var i = 1; i < empData.length; i++) {
    if (String(empData[i][getColIndex(empHeaders, 'id')]) === String(employeeId)) {
      employee = {
        id: String(empData[i][getColIndex(empHeaders, 'id')]),
        nombre: empData[i][getColIndex(empHeaders, 'nombre')],
        email: empData[i][getColIndex(empHeaders, 'email')],
        horario: empData[i][getColIndex(empHeaders, 'horario')]
      };
      break;
    }
  }

  if (!employee) {
    return { success: false, error: 'Empleado no encontrado' };
  }

  // Determinar tipo de checada
  var statusResult = getEmployeeStatus(employeeId);
  var checkType = statusResult.nextType;
  var now = new Date();
  var timeString = Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm:ss');
  var dateString = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');

  // Verificar retardo
  var retardo = false;
  var minutosRetardo = 0;

  if (checkType === 'entrada') {
    var horario = HORARIOS[employee.horario];
    if (horario) {
      var tolerancia = Number(getConfigValue('tolerancia_minutos', 10));
      var entradaLimite = new Date(now);
      entradaLimite.setHours(horario.entrada.hora, horario.entrada.minuto + tolerancia, 0, 0);

      if (now > entradaLimite) {
        retardo = true;
        minutosRetardo = Math.round((now.getTime() - entradaLimite.getTime()) / 60000);
      }
    }
  }

  // Guardar selfie en Drive
  var selfieUrl = '';
  var selfieFileId = '';
  if (selfieBase64) {
    var selfieResult = saveSelfie(selfieBase64, employee.nombre, dateString, checkType);
    if (selfieResult.success) {
      selfieUrl = selfieResult.url;
      selfieFileId = selfieResult.fileId;
    }
  }

  // Registrar en hoja de Checadas
  var checkSheet = ss.getSheetByName(SHEET_CHECADAS);
  var checkId = Utilities.getUuid();
  checkSheet.appendRow([
    checkId,
    employeeId,
    dateString,
    timeString,
    checkType,
    retardo ? 'SI' : 'NO',
    minutosRetardo,
    selfieUrl,
    selfieFileId,
    now
  ]);

  // Enviar email de confirmación
  try {
    sendConfirmationEmail(employee, checkType, timeString, dateString, retardo, minutosRetardo);
  } catch (emailErr) {
    Logger.log('Error enviando email: ' + emailErr.message);
  }

  return {
    success: true,
    checkType: checkType,
    time: timeString,
    date: dateString,
    retardo: retardo,
    minutosRetardo: minutosRetardo,
    employeeName: employee.nombre
  };
}

// ===== GUARDAR SELFIE EN DRIVE =====
function saveSelfie(base64Data, employeeName, dateString, checkType) {
  try {
    var parentFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    var weekFolder = getOrCreateWeekFolder(parentFolder, dateString);
    var empFolderName = employeeName.replace(/[^a-zA-Z0-9\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1\u00c1\u00c9\u00cd\u00d3\u00da\u00d1 ]/g, '');
    var empFolder = getOrCreateSubFolder(weekFolder, empFolderName);

    var cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    var decoded = Utilities.base64Decode(cleanBase64);
    var blob = Utilities.newBlob(decoded, 'image/jpeg',
      employeeName + '_' + checkType + '_' + dateString + '_' + new Date().getTime() + '.jpg');

    var file = empFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return {
      success: true,
      url: file.getUrl(),
      fileId: file.getId()
    };
  } catch (err) {
    Logger.log('Error guardando selfie: ' + err.message);
    return { success: false, error: err.message };
  }
}

function getOrCreateWeekFolder(parentFolder, dateString) {
  var date = new Date(dateString + 'T12:00:00');
  var day = date.getDay();
  var diff = date.getDate() - day + (day === 0 ? -6 : 1);
  var monday = new Date(date);
  monday.setDate(diff);
  var weekName = 'Semana_' + Utilities.formatDate(monday, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return getOrCreateSubFolder(parentFolder, weekName);
}

function getOrCreateSubFolder(parent, folderName) {
  var folders = parent.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parent.createFolder(folderName);
}

// ===== ENVIAR EMAIL =====
function sendConfirmationEmail(employee, checkType, timeString, dateString, retardo, minutosRetardo) {
  var tipoTexto = checkType === 'entrada' ? 'Entrada' : 'Salida';
  var retardoTexto = retardo ? '\n⚠️ Retardo de ' + minutosRetardo + ' minutos' : '';

  var subject = 'Checador | ' + tipoTexto + ' — ' + employee.nombre;
  var body = 'Hola ' + employee.nombre + ',\n\n' +
    'Tu ' + tipoTexto.toLowerCase() + ' ha sido registrada.\n\n' +
    'Fecha: ' + dateString + '\n' +
    'Hora: ' + timeString + '\n' +
    'Tipo: ' + tipoTexto + retardoTexto + '\n\n' +
    '— Sistema Checador Mozzafiato';

  if (employee.email) {
    MailApp.sendEmail(employee.email, subject, body);
  }

  var adminEmail = getConfigValue('admin_email', ADMIN_EMAIL);
  if (adminEmail) {
    MailApp.sendEmail(adminEmail, subject, body);
  }
}

// ===== LIMPIAR SELFIES ANTIGUAS (Trigger semanal) =====
function cleanOldSelfies() {
  var parentFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  var folders = parentFolder.getFolders();
  var now = new Date();
  var sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  while (folders.hasNext()) {
    var folder = folders.next();
    var folderName = folder.getName();

    if (folderName.indexOf('Semana_') === 0) {
      var dateStr = folderName.replace('Semana_', '');
      var folderDate = new Date(dateStr + 'T12:00:00');

      if (folderDate < sevenDaysAgo) {
        deleteFolderContents(folder);
        folder.setTrashed(true);
        Logger.log('Carpeta eliminada: ' + folderName);
      }
    }
  }
}

function deleteFolderContents(folder) {
  var files = folder.getFiles();
  while (files.hasNext()) {
    files.next().setTrashed(true);
  }
  var subfolders = folder.getFolders();
  while (subfolders.hasNext()) {
    var sub = subfolders.next();
    deleteFolderContents(sub);
    sub.setTrashed(true);
  }
}

// ===== CONFIGURACIÓN =====
function getConfig() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_CONFIGURACION);
  var data = sheet.getDataRange().getValues();
  var config = {};

  for (var i = 1; i < data.length; i++) {
    config[data[i][0]] = data[i][1];
  }

  return { success: true, config: config };
}

function getConfigValue(key, defaultValue) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_CONFIGURACION);
    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        return data[i][1];
      }
    }
  } catch (err) {
    Logger.log('Error leyendo config: ' + err.message);
  }
  return defaultValue;
}

// ===== HELPERS =====
function getColIndex(headers, colName) {
  for (var i = 0; i < headers.length; i++) {
    if (String(headers[i]).toLowerCase().trim() === colName.toLowerCase().trim()) {
      return i;
    }
  }
  return -1;
}

function getTodayString() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function formatDateString(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(value).substring(0, 10);
}

// ===== SETUP: Crear hojas iniciales =====
function setupSpreadsheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  var empSheet = ss.getSheetByName(SHEET_EMPLEADOS);
  if (!empSheet) {
    empSheet = ss.insertSheet(SHEET_EMPLEADOS);
    empSheet.appendRow(['id', 'nombre', 'email', 'telefono', 'pin', 'horario', 'sueldo_semanal', 'activo']);
    empSheet.appendRow(['1', 'Juan Perez', 'juan@email.com', '6141234567', '1234', 'manana', '3000', 'true']);
    empSheet.appendRow(['2', 'Maria Lopez', 'maria@email.com', '6149876543', '5678', 'noche', '3000', 'true']);
  }

  var checkSheet = ss.getSheetByName(SHEET_CHECADAS);
  if (!checkSheet) {
    checkSheet = ss.insertSheet(SHEET_CHECADAS);
    checkSheet.appendRow(['id', 'empleado_id', 'fecha', 'hora', 'tipo', 'retardo', 'minutos_retardo', 'selfie_url', 'selfie_file_id', 'timestamp']);
  }

  var configSheet = ss.getSheetByName(SHEET_CONFIGURACION);
  if (!configSheet) {
    configSheet = ss.insertSheet(SHEET_CONFIGURACION);
    configSheet.appendRow(['parametro', 'valor']);
    configSheet.appendRow(['tolerancia_minutos', '10']);
    configSheet.appendRow(['multa_retardo', '50']);
    configSheet.appendRow(['descuento_falta_justificada', '1']);
    configSheet.appendRow(['descuento_falta_injustificada', '2']);
    configSheet.appendRow(['admin_email', ADMIN_EMAIL]);
    configSheet.appendRow(['dias_laborales', 'L,M,X,J,V,S']);
    configSheet.appendRow(['dia_corte', 'lunes']);
  }

  var nomSheet = ss.getSheetByName('Nomina');
  if (!nomSheet) {
    nomSheet = ss.insertSheet('Nomina');
    nomSheet.appendRow(['id', 'empleado_id', 'semana_inicio', 'semana_fin', 'sueldo_base', 'dias_trabajados', 'retardos', 'descuento_retardos', 'faltas_justificadas', 'descuento_faltas_just', 'faltas_injustificadas', 'descuento_faltas_injust', 'prestamos', 'adelantos', 'cuenta_restaurante', 'bonos', 'ajustes', 'total_descuentos', 'total_percepciones', 'neto_pagar', 'status', 'timestamp']);
  }

  var prestSheet = ss.getSheetByName('Prestamos');
  if (!prestSheet) {
    prestSheet = ss.insertSheet('Prestamos');
    prestSheet.appendRow(['id', 'empleado_id', 'monto_total', 'monto_parcialidad', 'parcialidades_total', 'parcialidades_pagadas', 'saldo_pendiente', 'fecha_inicio', 'motivo', 'activo']);
  }

  var adelSheet = ss.getSheetByName('Adelantos');
  if (!adelSheet) {
    adelSheet = ss.insertSheet('Adelantos');
    adelSheet.appendRow(['id', 'empleado_id', 'monto', 'fecha', 'descontado', 'semana_descuento']);
  }

  var restSheet = ss.getSheetByName('CuentaRestaurante');
  if (!restSheet) {
    restSheet = ss.insertSheet('CuentaRestaurante');
    restSheet.appendRow(['id', 'empleado_id', 'fecha', 'concepto', 'monto', 'semana_descuento']);
  }

  var ajustSheet = ss.getSheetByName('AjustesManuales');
  if (!ajustSheet) {
    ajustSheet = ss.insertSheet('AjustesManuales');
    ajustSheet.appendRow(['id', 'empleado_id', 'semana', 'tipo_ajuste', 'concepto_original', 'monto_original', 'monto_ajustado', 'motivo', 'fecha_ajuste', 'ajustado_por']);
  }

  var bitSheet = ss.getSheetByName('Bitacora');
  if (!bitSheet) {
    bitSheet = ss.insertSheet('Bitacora');
    bitSheet.appendRow(['id', 'fecha', 'hora', 'usuario', 'accion', 'detalle', 'modulo']);
  }

  Logger.log('Todas las hojas creadas exitosamente');
}

// ===== TRIGGER PARA LIMPIEZA AUTOMÁTICA =====
function createCleanupTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'cleanOldSelfies') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger('cleanOldSelfies')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(3)
    .create();

  Logger.log('Trigger de limpieza creado');
}
