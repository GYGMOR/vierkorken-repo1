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
        userId, // The content of the QR code is the User ID
        {
          width: 120,
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
    <div className="w-full max-w-md mx-auto aspect-[1.586/1] perspective-1000">
      <div 
        className={`relative w-full h-full transition-transform duration-700 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front of Card */}
        <div className="absolute w-full h-full backface-hidden rounded-xl shadow-2xl overflow-hidden bg-gradient-to-br from-warmwhite via-rose-light to-accent-gold/20 border-2 border-accent-gold/30 flex flex-col justify-between p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold tracking-widest text-graphite/60 uppercase">Vierkorken Club</p>
              <h3 className="text-xl font-serif text-graphite-dark mt-1">{firstName} {lastName}</h3>
            </div>
            <div className="bg-white/80 p-2 rounded-lg backdrop-blur-sm">
              <Image
                src="/images/layout/Wein Boutique_edited.png"
                alt="VIER KORKEN Logo"
                width={120}
                height={40}
                className="h-6 w-auto"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-end mt-4">
            <div className="mb-2">
              <p className="text-xs text-graphite/60 uppercase tracking-wider mb-1">Punktestand</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-serif text-accent-burgundy font-medium">{loyaltyPoints.toLocaleString('de-CH')}</span>
                <span className="text-sm font-medium text-graphite/60">PTS</span>
              </div>
            </div>
            
            <div className="bg-white p-1.5 rounded-lg shadow-sm border border-taupe-light/50">
               <canvas ref={canvasRef} className="max-w-full h-auto rounded" />
            </div>
          </div>
          
          <div className="absolute bottom-4 left-0 w-full flex justify-center opacity-0 hover:opacity-100 transition-opacity">
            <span className="text-xs text-graphite/50 bg-white/60 px-2 py-1 rounded-full backdrop-blur-md">Klicken zum Wenden</span>
          </div>
        </div>

        {/* Back of Card */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-xl shadow-2xl overflow-hidden bg-graphite-dark border-2 border-graphite flex flex-col justify-between p-6">
          <div className="flex justify-between items-start w-full">
            <p className="text-xs font-semibold tracking-widest text-warmwhite/50 uppercase">Kundenkarte scannen</p>
            <Image
                src="/images/layout/Wein Boutique_edited.png"
                alt="VIER KORKEN Logo"
                width={120}
                height={40}
                className="h-6 w-auto brightness-0 invert opacity-80"
              />
          </div>
          
          <div className="flex-1 flex items-center justify-center bg-white my-4 rounded-lg px-4 py-2">
             <Barcode 
               value={userId} 
               format="CODE128" 
               width={1.8} 
               height={60} 
               displayValue={false} 
               background="#ffffff" 
               lineColor="#000000" 
               margin={0}
             />
          </div>
          
          <div className="text-center">
            <p className="text-xs font-mono text-warmwhite/60 tracking-widest">{userId}</p>
          </div>
          
          <div className="absolute bottom-4 left-0 w-full flex justify-center opacity-0 hover:opacity-100 transition-opacity">
            <span className="text-xs text-warmwhite/40 bg-black/40 px-2 py-1 rounded-full backdrop-blur-md">Klicken zum Wenden</span>
          </div>
        </div>
      </div>
    </div>
  );
}
