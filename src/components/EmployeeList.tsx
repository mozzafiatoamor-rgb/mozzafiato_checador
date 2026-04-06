import type { Employee } from '../types';

interface Props {
  employees: Employee[];
  onSelect: (employee: Employee) => void;
}

const SCHEDULE_LABELS: Record<string, string> = {
  manana: 'Mañana (7:20-16:00)',
  noche: 'Noche (15:50-00:00)',
  cortado_manana: 'Cortado AM (7:20-12:00)',
  cortado_noche: 'Cortado PM (19:50-00:00)'
};

const AVATAR_COLORS = [
  'bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-amber-600',
  'bg-rose-600', 'bg-cyan-600', 'bg-indigo-600', 'bg-teal-600',
  'bg-orange-600', 'bg-pink-600', 'bg-lime-600', 'bg-sky-600'
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function getColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export default function EmployeeList({ employees, onSelect }: Props) {
  if (employees.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-xl">No hay empleados activos</p>
          <p className="text-sm mt-2">Agrega empleados en Google Sheets</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 overflow-y-auto">
      <p className="text-gray-400 text-center mb-6 text-lg">
        Selecciona tu nombre para registrar asistencia
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-w-7xl mx-auto">
        {employees.map((emp, idx) => (
          <button
            key={emp.id}
            onClick={() => onSelect(emp)}
            className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-mozzafiato-dark border border-gray-800 hover:border-mozzafiato-gold hover:bg-gray-800/50 transition-all duration-200 active:scale-95"
          >
            <div className={`w-16 h-16 rounded-full ${getColor(idx)} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
              {getInitials(emp.nombre)}
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-base leading-tight">
                {emp.nombre}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                {SCHEDULE_LABELS[emp.horario] || emp.horario}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
