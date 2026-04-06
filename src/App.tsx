import { useState, useEffect, useCallback } from 'react';
import type { Employee, AppScreen } from './types';
import { getEmployees, validatePin, getEmployeeStatus, registerCheck } from './api';
import EmployeeList from './components/EmployeeList';
import PinEntry from './components/PinEntry';
import CameraCapture from './components/CameraCapture';
import SuccessOverlay from './components/SuccessOverlay';
import Clock from './components/Clock';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('employees');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [nextCheckType, setNextCheckType] = useState<string>('entrada');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<{
    employeeName: string;
    checkType: string;
    time: string;
    retardo: boolean;
    minutosRetardo: number;
  } | null>(null);

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const result = await getEmployees();
      setEmployees(result.employees);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando empleados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleSelectEmployee = async (employee: Employee) => {
    setSelectedEmployee(employee);
    try {
      const status = await getEmployeeStatus(employee.id);
      setNextCheckType(status.nextType);
    } catch {
      setNextCheckType('entrada');
    }
    setScreen('pin');
  };

  const handlePinSubmit = async (pin: string) => {
    if (!selectedEmployee) return;

    try {
      const result = await validatePin(selectedEmployee.id, pin);
      if (result.valid) {
        setScreen('camera');
      } else {
        setError('PIN incorrecto. Intenta de nuevo.');
        setTimeout(() => setError(''), 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error validando PIN');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSelfieCapture = async (selfieBase64: string) => {
    if (!selectedEmployee) return;

    setScreen('processing');
    try {
      const result = await registerCheck(selectedEmployee.id, selfieBase64);
      setSuccessData({
        employeeName: result.employeeName,
        checkType: result.checkType,
        time: result.time,
        retardo: result.retardo,
        minutosRetardo: result.minutosRetardo
      });
      setScreen('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error registrando checada');
      setScreen('error');
      setTimeout(() => {
        resetToHome();
      }, 4000);
    }
  };

  const resetToHome = useCallback(() => {
    setScreen('employees');
    setSelectedEmployee(null);
    setSuccessData(null);
    setError('');
    setNextCheckType('entrada');
  }, []);

  const handleSuccessComplete = useCallback(() => {
    resetToHome();
    loadEmployees();
  }, [resetToHome, loadEmployees]);

  const handleBack = () => {
    if (screen === 'pin') {
      resetToHome();
    } else if (screen === 'camera') {
      setScreen('pin');
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-mozzafiato-darker">
      {/* Header */}
      {screen !== 'success' && (
        <header className="flex items-center justify-between px-6 py-3 bg-mozzafiato-dark border-b border-gray-800">
          <div className="flex items-center gap-4">
            {(screen === 'pin' || screen === 'camera') && (
              <button
                onClick={handleBack}
                className="text-gray-400 hover:text-white text-2xl px-2"
              >
                ←
              </button>
            )}
            <h1 className="text-xl font-bold text-mozzafiato-gold tracking-wide">
              MOZZAFIATO
            </h1>
            {selectedEmployee && screen !== 'employees' && (
              <span className="text-gray-400 text-lg ml-4">
                {selectedEmployee.nombre} — {nextCheckType === 'entrada' ? 'Registrar Entrada' : 'Registrar Salida'}
              </span>
            )}
          </div>
          <Clock />
        </header>
      )}

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {loading && screen === 'employees' && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-mozzafiato-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Cargando empleados...</p>
            </div>
          </div>
        )}

        {screen === 'employees' && !loading && (
          <EmployeeList
            employees={employees}
            onSelect={handleSelectEmployee}
          />
        )}

        {screen === 'pin' && selectedEmployee && (
          <PinEntry
            employeeName={selectedEmployee.nombre}
            checkType={nextCheckType}
            onSubmit={handlePinSubmit}
            onCancel={resetToHome}
            error={error}
          />
        )}

        {screen === 'camera' && (
          <CameraCapture onCapture={handleSelfieCapture} />
        )}

        {screen === 'processing' && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-mozzafiato-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white text-xl">Registrando checada...</p>
              <p className="text-gray-400 mt-2">Guardando selfie y enviando confirmación</p>
            </div>
          </div>
        )}

        {screen === 'success' && successData && (
          <SuccessOverlay
            employeeName={successData.employeeName}
            checkType={successData.checkType}
            time={successData.time}
            retardo={successData.retardo}
            minutosRetardo={successData.minutosRetardo}
            onComplete={handleSuccessComplete}
          />
        )}

        {screen === 'error' && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-8 bg-red-900/30 rounded-2xl border border-red-700 max-w-md mx-auto">
              <div className="text-5xl mb-4">⚠️</div>
              <p className="text-red-300 text-xl font-semibold mb-2">Error</p>
              <p className="text-red-200">{error}</p>
              <p className="text-gray-500 text-sm mt-4">Regresando a inicio...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
