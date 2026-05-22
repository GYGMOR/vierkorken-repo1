'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import Barcode from 'react-barcode';

interface CustomerCardProps {
  firstName: string;
  lastName: string;
  userId: string;
  loyaltyPoints: number;
}

export function CustomerCard({ firstName, lastName, userId, loyaltyPoints }: CustomerCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isFlipped && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        userId,
        {
          width: 80,
          margin: 1,
          color: {
            dark: '#6B1B29', // Burgundy
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) console.error('Error generating QR code:', error);
        }
      );
    }
  }, [isFlipped, userId]);

  return (
    <div className="w-full max-w-sm mx-auto">
      <div
        className="relative w-full transition-transform duration-700 transform-style-3d cursor-pointer"
        style={{ perspective: '1000px', aspectRatio: '85.6 / 54' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Rotate inner wrapper */}
        <div
          className={`relative w-full h-full transform-style-3d transition-transform duration-700 ${isFlipped ? 'rotate-y-180' : ''}`}
        >
          {/* Front of Card */}
          <div className="absolute w-full h-full backface-hidden rounded-xl shadow-2xl overflow-hidden bg-gradient-to-br from-warmwhite via-rose-light to-accent-gold/20 border-2 border-accent-gold/30 flex flex-col justify-between p-3 sm:p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold tracking-widest text-graphite/60 uppercase">Vierkorken Club</p>
              <h3 className="text-base sm:text-xl font-serif text-graphite-dark mt-0.5">{firstName} {lastName}</h3>
            </div>
            <div className="bg-white/80 p-1 rounded-lg backdrop-blur-sm">
              <Image
                src="/images/layout/Wein Boutique_edited.png"
                alt="VIER KORKEN Logo"
                width={100}
                height={34}
                className="h-4 sm:h-5 w-auto"
              />
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] sm:text-xs text-graphite/60 uppercase tracking-wider mb-0.5">Punktestand</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-serif text-accent-burgundy font-medium">{loyaltyPoints.toLocaleString('de-CH')}</span>
                <span className="text-[10px] sm:text-xs font-medium text-graphite/60">PTS</span>
              </div>
            </div>

            <div className="bg-white p-0.5 rounded-lg shadow-sm border border-taupe-light/50">
               <canvas ref={canvasRef} className="max-w-full h-auto rounded" style={{ maxHeight: '70px' }} />
            </div>
          </div>

          <div className="text-center">
            <p className="text-[10px] sm:text-xs text-graphite/40 italic">Klicken zum Wenden</p>
          </div>
        </div>

          {/* Back of Card */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-xl shadow-2xl overflow-hidden bg-graphite-dark border-2 border-graphite flex flex-col justify-between p-3 sm:p-5">
          <div className="flex justify-between items-start w-full">
            <p className="text-[10px] sm:text-xs font-semibold tracking-widest text-warmwhite/50 uppercase">Kundenkarte scannen</p>
            <Image
                src="/images/layout/Wein Boutique_edited.png"
                alt="VIER KORKEN Logo"
                width={80}
                height={28}
                className="h-4 sm:h-5 w-auto brightness-0 invert opacity-80"
              />
          </div>
          <div className="flex-1 flex items-center justify-center bg-white my-1.5 rounded-lg px-1 py-0.5">
             <Barcode
               value={userId}
               format="CODE128"
               width={1.2}
               height={40}
               displayValue={false}
               background="#ffffff"
               lineColor="#000000"
               margin={0}
             />
          </div>

          <div className="text-center">
            <p className="text-[9px] sm:text-xs font-mono text-warmwhite/60 tracking-widest truncate">{userId}</p>
            <p className="text-[10px] sm:text-xs text-warmwhite/40 italic mt-0.5">Klicken zum Wenden</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
