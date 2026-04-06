import { useEffect, useState, useMemo } from 'react';

interface Props {
  employeeName: string;
  checkType: string;
  time: string;
  retardo: boolean;
  minutosRetardo: number;
  onComplete: () => void;
}

const MENSAJES_MOTIVACIONALES = [
  '¡Tu esfuerzo de hoy construye tu éxito de mañana!',
  '¡Cada día es una nueva oportunidad para ser mejor!',
  '¡Tu dedicación es lo que te hace extraordinario!',
  '¡El éxito es la suma de pequeños esfuerzos día tras día!',
  '¡Hoy es un gran día para hacer cosas increíbles!',
  '¡Tu actitud determina tu altitud!',
  '¡Eres parte fundamental de este equipo!',
  '¡La constancia es la madre de todos los logros!',
  '¡Tu compromiso marca la diferencia!',
  '¡Cada jornada bien trabajada es un paso al éxito!',
  '¡El trabajo duro siempre da frutos!',
  '¡Tu presencia aquí demuestra tu compromiso!',
  '¡Los grandes logros empiezan con la puntualidad!',
  '¡Eres más fuerte de lo que crees!',
  '¡Hoy será un día productivo y lleno de logros!'
];

export default function SuccessOverlay({
  employeeName,
  checkType,
  time,
  retardo,
  minutosRetardo,
  onComplete
}: Props) {
  const [visible, setVisible] = useState(true);

  const mensaje = useMemo(() => {
    const idx = Math.floor(Math.random() * MENSAJES_MOTIVACIONALES.length);
    return MENSAJES_MOTIVACIONALES[idx];
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
      visible ? 'opacity-100' : 'opacity-0'
    }`}
    style={{
      background: 'radial-gradient(ellipse at center, #1a1a3e 0%, #0a0a1a 70%)'
    }}>
      {/* Confetti particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="confetti absolute w-3 h-3 rounded-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10px',
              backgroundColor: ['#C41E3A', '#D4A843', '#4CAF50', '#2196F3', '#FF9800'][i % 5],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="text-center animate-fade-in max-w-lg mx-auto px-8">
        {/* Logo placeholder */}
        <div className="mb-6 animate-scale-in">
          <div className="w-32 h-32 mx-auto rounded-full bg-mozzafiato-dark border-4 border-mozzafiato-gold flex items-center justify-center shadow-2xl shadow-mozzafiato-gold/20">
            <span className="text-mozzafiato-gold text-lg font-bold tracking-wider">
              MOZZAFIATO
            </span>
          </div>
        </div>

        {/* Success checkmark */}
        <div className="mb-4 animate-scale-in">
          <svg className="w-20 h-20 mx-auto" viewBox="0 0 52 52">
            <circle className="fill-none stroke-green-500 stroke-2" cx="26" cy="26" r="24" opacity="0.3" />
            <circle className="fill-none stroke-green-500 stroke-2" cx="26" cy="26" r="24"
              strokeDasharray="151"
              strokeDashoffset="0"
              style={{ animation: 'none' }}
            />
            <path className="checkmark-animate fill-none stroke-green-400 stroke-[3]" strokeLinecap="round" strokeLinejoin="round"
              d="M14 27l7 7 16-16"
            />
          </svg>
        </div>

        {/* Check type badge */}
        <div className={`inline-block px-6 py-2 rounded-full text-lg font-bold mb-4 animate-slide-up ${
          checkType === 'entrada'
            ? 'bg-green-900/50 text-green-300 border border-green-600'
            : 'bg-orange-900/50 text-orange-300 border border-orange-600'
        }`}>
          {checkType === 'entrada' ? '✓ Entrada Registrada' : '✓ Salida Registrada'}
        </div>

        {/* Employee name */}
        <h2 className="text-3xl font-bold text-white mb-2 animate-slide-up">
          {employeeName}
        </h2>

        {/* Time */}
        <p className="text-xl text-gray-300 mb-4 animate-slide-up">
          {time}
        </p>

        {/* Retardo warning */}
        {retardo && (
          <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg animate-slide-up">
            <p className="text-yellow-300 text-sm">
              ⚠️ Retardo de {minutosRetardo} minutos registrado
            </p>
          </div>
        )}

        {/* Motivational message */}
        <p className="text-mozzafiato-gold text-lg italic animate-slide-up mt-4">
          &ldquo;{mensaje}&rdquo;
        </p>
      </div>
    </div>
  );
}
