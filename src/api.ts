const API_URL = import.meta.env.VITE_API_URL || '';

async function apiCall<T>(action: string, params: Record<string, string> = {}): Promise<T> {
  const body = JSON.stringify({ action, ...params });

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body
  });

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Error desconocido');
  }

  return data as T;
}

export async function getEmployees() {
  return apiCall<{ success: boolean; employees: import('./types').Employee[] }>('getEmployees');
}

export async function validatePin(employeeId: string, pin: string) {
  return apiCall<{ success: boolean; valid: boolean; error?: string }>('validatePin', { employeeId, pin });
}

export async function getEmployeeStatus(employeeId: string) {
  return apiCall<{
    success: boolean;
    checksToday: import('./types').CheckRecord[];
    nextType: string;
    hasCheckedIn: boolean;
  }>('getEmployeeStatus', { employeeId });
}

export async function registerCheck(employeeId: string, selfieBase64: string) {
  return apiCall<{
    success: boolean;
    checkType: string;
    time: string;
    date: string;
    retardo: boolean;
    minutosRetardo: number;
    employeeName: string;
  }>('registerCheck', { employeeId, selfieBase64 });
}
