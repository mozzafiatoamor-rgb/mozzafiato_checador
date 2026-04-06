# SETUP — Checador Mozzafiato

Guía paso a paso para configurar y desplegar la aplicación.

---

## Paso 1: Google Sheets

1. Ve a [sheets.google.com](https://sheets.google.com) y crea un nuevo spreadsheet
2. Nómbralo **"Mozzafiato Sistema"**
3. Copia el **ID del spreadsheet** de la URL:
   `https://docs.google.com/spreadsheets/d/**ESTE_ES_EL_ID**/edit`
4. Las hojas se crearán automáticamente al ejecutar `setupSpreadsheet()` en Apps Script

---

## Paso 2: Google Drive — Carpeta de Selfies

1. En [drive.google.com](https://drive.google.com), crea una carpeta: **"Checador_Selfies"**
2. Copia el **ID de la carpeta** de la URL:
   `https://drive.google.com/drive/folders/**ESTE_ES_EL_ID**`

---

## Paso 3: Google Apps Script

1. Ve a [script.google.com](https://script.google.com)
2. Clic en **"Nuevo proyecto"**
3. Nómbralo **"Checador Mozzafiato Backend"**
4. Borra todo el contenido del archivo `Code.gs`
5. Copia y pega **TODO** el contenido del archivo `Code.gs` de este proyecto
6. Modifica las 3 variables al inicio:
   ```
   var SPREADSHEET_ID = 'tu_spreadsheet_id_aqui';
   var DRIVE_FOLDER_ID = 'tu_folder_id_aqui';
   var ADMIN_EMAIL = 'tu@email.com';
   ```
7. **Guarda** (Ctrl+S)

### Crear las hojas del spreadsheet:
8. En el menú de Apps Script, selecciona la función `setupSpreadsheet`
9. Clic en **Ejecutar** (botón ▶)
10. Autoriza los permisos cuando te lo pida
11. Verifica en Google Sheets que se crearon todas las hojas

### Crear el trigger de limpieza:
12. Selecciona la función `createCleanupTrigger`
13. Clic en **Ejecutar**

### Desplegar como Web App:
14. Clic en **Implementar** → **Nueva implementación**
15. Tipo: **App web**
16. Ejecutar como: **Yo** (tu cuenta)
17. Quién tiene acceso: **Cualquier persona**
18. Clic en **Implementar**
19. Copia la **URL de la Web App** — la necesitarás para el frontend
    Se ve así: `https://script.google.com/macros/s/XXXX.../exec`

---

## Paso 4: Agregar empleados

En Google Sheets, ve a la hoja **"Empleados"** y agrega filas con estos datos:

| id | nombre | email | telefono | pin | horario | sueldo_semanal | activo |
|----|--------|-------|----------|-----|---------|----------------|--------|
| 1 | Juan Pérez | juan@email.com | 6141234567 | 1234 | manana | 3000 | true |
| 2 | María López | maria@email.com | 6149876543 | 5678 | noche | 3500 | true |

Horarios válidos: `manana`, `noche`, `cortado_manana`, `cortado_noche`

---

## Paso 5: Íconos PWA

Necesitas 2 imágenes del logo de Mozzafiato:
- `icon-192.png` — 192x192 píxeles
- `icon-512.png` — 512x512 píxeles

Colócalos en la carpeta `public/icons/`

---

## Paso 6: Repositorio en GitHub

1. Crea un nuevo repositorio en GitHub: **checador-mozzafiato**
2. Marca la opción **Public** (necesario para GitHub Pages gratuito)
3. NO inicialices con README

---

## Paso 7: Configurar en VS Code

```bash
# Clona el repo vacío
git clone https://github.com/TU_USUARIO/checador-mozzafiato.git
cd checador-mozzafiato

# Copia todos los archivos de este proyecto al repo
# (todos los archivos que generamos: src/, public/, etc.)

# Crea el archivo .env
cp .env.example .env

# Edita .env con tu URL de Apps Script:
# VITE_API_URL=https://script.google.com/macros/s/TU_ID/exec
# VITE_BASE_PATH=/checador-mozzafiato/

# Instala dependencias
npm install

# Prueba en local
npm run dev
```

---

## Paso 8: Variables en GitHub

1. En GitHub, ve a tu repo → **Settings** → **Secrets and variables** → **Actions**
2. Pestaña **Variables** (no Secrets)
3. Agrega estas variables de repositorio:
   - `VITE_API_URL` = `https://script.google.com/macros/s/TU_ID/exec`
   - `VITE_BASE_PATH` = `/checador-mozzafiato/`

---

## Paso 9: Habilitar GitHub Pages

1. En GitHub, ve a tu repo → **Settings** → **Pages**
2. Source: **GitHub Actions**

---

## Paso 10: Push y deploy

```bash
git add .
git commit -m "Initial commit - Checador Mozzafiato"
git push origin main
```

El workflow de GitHub Actions se ejecutará automáticamente y desplegará la app.

Tu app estará en: `https://TU_USUARIO.github.io/checador-mozzafiato/`

---

## Paso 11: Instalar como PWA en la tablet

1. Abre Chrome en la tablet Android
2. Navega a `https://TU_USUARIO.github.io/checador-mozzafiato/`
3. Chrome mostrará un banner "Agregar a pantalla de inicio" o ve al menú ⋮ → "Instalar app"
4. La app se instalará como aplicación independiente en pantalla completa

---

## Solución de problemas

**La API no responde:**
- Verifica que la URL de Apps Script sea correcta en `.env`
- Asegúrate de que el deploy de Apps Script sea "Cualquier persona"
- Si modificas el Code.gs, necesitas hacer una **nueva implementación**

**La cámara no funciona:**
- La app necesita HTTPS (GitHub Pages ya lo tiene)
- En local, `localhost` también permite cámara
- Verifica permisos de cámara en Chrome

**Las selfies no se guardan:**
- Verifica el ID de la carpeta de Drive
- Asegúrate de que Apps Script tenga permisos de Drive

**Los emails no se envían:**
- Apps Script tiene un límite diario de emails (100 para cuentas gratuitas)
- Verifica que los emails de empleados sean válidos
