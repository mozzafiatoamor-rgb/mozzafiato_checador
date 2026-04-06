import { useState } from 'react';

interface Props {
  employeeName: string;
  checkType: string;
  onSubmit: (pin: string) => void;
  onCancel: () => void;
  error: string;
}

export default function PinEntry({ employeeName, checkType, onSubmit, onCancel, error }: Props) {
  const [pin, setPin] = useState('');

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => {
          onSubmit(newPin);
          setPin('');
        }, 200);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        {/* Employee info */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">{employeeName}</h2>
          <div className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${
            checkType === 'entrada'
              ? 'bg-green-900/50 text-green-300 border border-green-700'
              : 'bg-orange-900/50 text-orange-300 border border-orange-700'
          }`}>
            {checkType === 'entrada' ? '→ Registrar Entrada' : '← Registrar Salida'}
          </div>
        </div>

        {/* PIN dots */}
        <div className="flex justify-center gap-4 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full transition-all duration-200 ${
                i < pin.length
                  ? 'bg-mozzafiato-gold scale-110'
                  : 'bg-gray-700 border-2 border-gray-600'
              }`}
            />
          ))}
        </div>

        <p className="text-gray-400 text-sm mb-6">Ingresa tu PIN de 4 dígitos</p>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="h-16 rounded-xl bg-mozzafiato-dark border border-gray-700 text-white text-2xl font-bold hover:bg-gray-700 active:bg-mozzafiato-gold active:text-black transition-colors"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-16 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 text-sm font-semibold hover:bg-gray-700 transition-colors"
          >
            Limpiar
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="h-16 rounded-xl bg-mozzafiato-dark border border-gray-700 text-white text-2xl font-bold hover:bg-gray-700 active:bg-mozzafiato-gold active:text-black transition-colors"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-16 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 text-2xl hover:bg-gray-700 transition-colors"
          >
            ⌫
          </button>
        </div>

        {/* Cancel button */}
        <button
          onClick={onCancel}
          className="mt-6 text-gray-500 hover:text-white text-sm transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
