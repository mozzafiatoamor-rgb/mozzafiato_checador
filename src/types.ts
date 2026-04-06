export interface Employee {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  horario: string;
  sueldo_semanal: number;
}

export interface CheckRecord {
  tipo: string;
  hora: string;
  retardo: string;
}

export type AppScreen = 'employees' | 'pin' | 'camera' | 'processing' | 'success' | 'error';
