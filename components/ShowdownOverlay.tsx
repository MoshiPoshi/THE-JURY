import React from 'react';

interface ShowdownOverlayProps {
  isVisible: boolean;
  competitorName: string;
}

const ShowdownOverlay: React.FC<ShowdownOverlayProps> = ({ isVisible, competitorName }) => {
  if (!isVisible) return null;

  const logs = [
    `TARGET: ${competitorName.toUpperCase()}`,
    "INITIATING_CROSS_EXAMINATION...",
    "ACCESSING_G2_REVIEWS_DB...",
    "BYPASSING_MARKETING_FLUFF...",
    "SCANNING_FOR_VAPORWARE...",
    "COMPARING_PRICING_MODELS...",
    "DETECTING_HIDDEN_FEES...",
    "ANALYZING_TECH_STACK_INTEGRITY...",
    "CHECKING_GITHUB_ISSUES...",
    "PINGING_LEGAL_TEAMS...",
    "DECRYPTING_USER_SENTIMENT...",
    "CALCULATING_CHURN_RATE...",
    "IDENTIFYING_SECURITY_VULNERABILITIES...",
    "EXTRACTING_COMPETITIVE_MOAT...",
    "GENERATING_SUBPOENA...",
    "FINALIZING_VERDICT..."
  ];

  // Repeat logs to ensure smooth infinite scroll
  const displayLogs = [...logs, ...logs, ...logs, ...logs];

  return (
    <div className="absolute inset-0 z-50 bg-[#070707] text-white font-mono flex flex-col overflow-hidden">
      <style>{`
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes glitchFlash {
          0%, 90% { opacity: 0; }
          92% { opacity: 1; }
          94% { opacity: 0; }
          96% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes textPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-scroll-up {
          animation: scrollUp 10s linear infinite;
        }
        .animate-glitch {
          animation: glitchFlash 2.5s infinite;
        }
        .animate-pulse-fast {
          animation: textPulse 1s ease-in-out infinite;
        }
      `}</style>

      {/* HEADER */}
      <div className="border-b-[2px] border-white p-4 flex items-center justify-center bg-[#070707] z-10">
        <div className="w-3 h-3 bg-white animate-pulse mr-3"></div>
        <h2 className="text-sm md:text-base font-bold tracking-widest animate-pulse-fast">
          ** CROSS-EXAMINATION IN PROGRESS **
        </h2>
        <div className="w-3 h-3 bg-white animate-pulse ml-3"></div>
      </div>

      {/* SCANNING BODY */}
      <div className="flex-1 relative overflow-hidden p-8 flex items-center justify-center">
        
        {/* Background Grid/Lines (Decorative) */}
        <div className="absolute inset-0 pointer-events-none opacity-20" 
             style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, #333 25%, #333 26%, transparent 27%, transparent 74%, #333 75%, #333 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, #333 25%, #333 26%, transparent 27%, transparent 74%, #333 75%, #333 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' }}>
        </div>

        {/* Scrolling Logs */}
        <div className="absolute inset-0 opacity-60 px-6 py-2">
            <div className="animate-scroll-up w-full text-xs md:text-sm leading-loose text-green-500 font-bold">
              {displayLogs.map((log, i) => (
                <div key={i} className="mb-1">
                  <span className="mr-2 text-white">[{Math.floor(Math.random() * 9999).toString().padStart(4, '0')}]</span>
                  {log}
                </div>
              ))}
            </div>
        </div>

        {/* Center Focus Text */}
        <div className="relative z-20 text-center">
           <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">
             {competitorName}
           </h1>
           <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Target Acquired</p>
        </div>

        {/* Glitch Overlay */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 bg-white text-[#070707] py-2 animate-glitch transform rotate-2 z-30 flex justify-center items-center">
             <span className="font-black text-2xl tracking-widest">[REDACTED]</span>
        </div>
        
        {/* Scanline */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-transparent h-full w-full animate-pulse opacity-10"></div>

      </div>

      {/* FOOTER */}
      <div className="border-t-[2px] border-white p-2 flex justify-between text-[10px] uppercase tracking-wider bg-[#070707] z-10">
        <span>SYS_INTEGRITY: UNKNOWN</span>
        <span>MODE: AGGRESSIVE</span>
      </div>
    </div>
  );
};

export default ShowdownOverlay;
