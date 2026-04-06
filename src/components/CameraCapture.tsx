import { useEffect, useRef, useState } from 'react';

interface Props {
  onCapture: (base64: string) => void;
}

export default function CameraCapture({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        });

        if (!mounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (mounted) setCameraReady(true);
          };
        }
      } catch (err) {
        if (mounted) {
          setCameraError(
            err instanceof Error ? err.message : 'No se pudo acceder a la cámara'
          );
        }
      }
    }

    startCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Countdown and auto-capture
  useEffect(() => {
    if (!cameraReady) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          capturePhoto();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraReady]);

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror for selfie
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    const base64 = canvas.toDataURL('image/jpeg', 0.7);

    // Stop camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }

    onCapture(base64);
  }

  if (cameraError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8 bg-red-900/30 rounded-2xl border border-red-700 max-w-md">
          <p className="text-red-300 text-xl mb-2">Error de Cámara</p>
          <p className="text-red-200 text-sm">{cameraError}</p>
          <p className="text-gray-500 text-xs mt-4">
            Verifica que la cámara esté habilitada en los ajustes del navegador
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center bg-black">
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="rounded-2xl max-h-[70vh] transform -scale-x-100"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Countdown overlay */}
        {cameraReady && countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">
            <div className="text-center">
              <div className="text-8xl font-bold text-white animate-pulse-slow">
                {countdown}
              </div>
              <p className="text-white text-xl mt-2">Preparando foto...</p>
            </div>
          </div>
        )}

        {/* Frame guide */}
        {cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-2xl">
            <div className="w-48 h-48 border-2 border-mozzafiato-gold/50 rounded-full" />
          </div>
        )}

        {!cameraReady && !cameraError && (
          <div className="w-96 h-72 flex items-center justify-center bg-gray-900 rounded-2xl">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-mozzafiato-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400">Iniciando cámara...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
