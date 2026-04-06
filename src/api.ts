import type { Employee, CheckRecord } from './types';

const API_URL = import.meta.env.VITE_API_URL || '';

// GET para operaciones de lectura — evita problemas de CORS con Apps Script
async function apiGet<T>(action: string, params: Record<string, string> = {}): Promise<T> {
  const qs = new URLSearchParams({ action, ...params }).toString();
  const response = await fetch(`${API_URL}?${qs}`);

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Error desconocido');
  }

  return data as T;
}

// POST solo para registerCheck (necesita enviar la selfie en base64)
async function apiPost<T>(action: string, params: Record<string, string> = {}): Promise<T> {
  const body = JSON.stringify({ action, ...params });

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body,
    redirect: 'follow'
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
  return apiGet<{ success: boolean; employees: Employee[] }>('getEmployees');
}

export async function validatePin(employeeId: string, pin: string) {
  return apiGet<{ success: boolean; valid: boolean; error?: string }>('validatePin', { employeeId, pin });
}

export async function getEmployeeStatus(employeeId: string) {
  return apiGet<{
    success: boolean;
    checksToday: CheckRecord[];
    nextType: string;
    hasCheckedIn: boolean;
  }>('getEmployeeStatus', { employeeId });
}

export async function registerCheck(employeeId: string, selfieBase64: string) {
  return apiPost<{
    success: boolean;
    checkType: string;
    time: string;
    date: string;
    retardo: boolean;
    minutosRetardo: number;
    employeeName: string;
  }>('registerCheck', { employeeId, selfieBase64 });
}
