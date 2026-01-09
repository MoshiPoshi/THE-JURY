import React, { useState, useEffect, useRef } from 'react';
import { TranslationDictionary } from '../types';

export type PersonaVariant = 'cto' | 'genz' | 'mom';

interface PersonaCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  thoughtTitle: string;
  thoughtContent: string;
  verdictTitle: string;
  verdictContent: string;
  status: string;
  variant: PersonaVariant;
  isRTL?: boolean;
  t: TranslationDictionary;
}

// ElevenLabs Configuration
const ELEVENLABS_API_KEY = 'sk_ccfb87243bf15b7f5eb8304c3b6dac43fa402c50ab40fddc';

const VOICE_CONFIG = {
  cto: {
    id: '2EiwWnXFnvU5JabPnv8n', // Clyde - Deep/Grumpy
    settings: { stability: 0.5, similarity_boost: 0.5 }
  },
  genz: {
    id: '21m00Tcm4TlvDq8ikWAM', // Rachel - Standard (Tweaked for energy)
    settings: { stability: 0.3, similarity_boost: 0.8 }
  },
  mom: {
    id: 'ThT5KcBeYPX3keUQqHPh', // Dorothy - Mature/Strict
    settings: { stability: 0.7, similarity_boost: 0.5 }
  }
};

const PersonaCard: React.FC<PersonaCardProps> = ({
  title,
  subtitle,
  icon,
  thoughtTitle,
  thoughtContent,
  verdictTitle,
  verdictContent,
  status,
  variant,
  isRTL = false,
  t
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio Object
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => setIsPlaying(false);
    audioRef.current.onerror = (e) => {
      console.error("Audio playback error", e);
      setIsPlaying(false);
      setIsLoadingAudio(false);
    };

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Stop this card's audio if another card starts playing
  useEffect(() => {
    const handleStopOtherAudio = (e: CustomEvent) => {
      if (e.detail.variant !== variant) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
        setIsLoadingAudio(false);
      }
    };

    window.addEventListener('stop-persona-audio', handleStopOtherAudio as EventListener);
    
    return () => {
      window.removeEventListener('stop-persona-audio', handleStopOtherAudio as EventListener);
    };
  }, [variant]);

  const getHeaderStyles = () => {
    switch (variant) {
      case 'cto':
        return 'bg-[#070707] text-white border-b-[3px] border-[#070707]';
      case 'genz':
        return 'bg-[#E5E5E5] text-[#070707] border-b-[3px] border-[#070707]';
      case 'mom':
        return 'bg-white text-[#070707] border-b-[3px] border-[#070707]';
      default:
        return 'bg-white text-[#070707] border-b-[3px] border-[#070707]';
    }
  };

  const handleSpeak = async () => {
    // If currently playing or loading, stop it
    if (isPlaying || isLoadingAudio) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setIsLoadingAudio(false);
      return;
    }

    // Notify others to stop
    const event = new CustomEvent('stop-persona-audio', { detail: { variant } });
    window.dispatchEvent(event);

    setIsLoadingAudio(true);

    try {
      let fullText = `${thoughtContent}. Verdict: ${verdictContent}. Decision: ${status}.`;
      
      // Inject energy for Gen-Z to simulate faster/more expressive speech by adding emphasis marks
      if (variant === 'genz') {
         fullText = `${thoughtContent}!! Verdict: ${verdictContent}!! Decision: ${status}!!`;
      }

      const config = VOICE_CONFIG[variant];

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${config.id}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: fullText,
          model_id: "eleven_turbo_v2_5", // Using Turbo v2.5 for low latency
          voice_settings: config.settings
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API Error: ${response.status} - ${errorText}`);
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Failed to generate/play voice:", error);
      alert("Audio generation failed. Check console for details."); // Minimal feedback for debugging
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const headerClass = getHeaderStyles();
  const iconClass = variant === 'cto' ? 'bg-white text-[#070707]' : 'bg-[#070707] text-white';
  const subtitleClass = variant === 'cto' ? 'text-gray-400' : 'text-gray-500';

  return (
    <div 
      className="flex flex-col h-full border-[3px] border-[#070707] bg-white shadow-[8px_8px_0px_0px_#070707] rounded-none relative"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className={`p-5 flex items-center justify-between ${headerClass}`}>
        <div className="flex items-center gap-4">
          <div className={`p-2 border-[2px] border-[#070707] ${iconClass} rounded-none shrink-0`}>
            {icon}
          </div>
          <div className="flex flex-col">
            <h3 className="font-display font-bold text-3xl uppercase tracking-tighter leading-none">{title}</h3>
            <p className={`font-mono text-[10px] font-bold uppercase tracking-widest ${subtitleClass}`}>{subtitle}</p>
          </div>
        </div>

        {/* Speaker Button */}
        <button 
          onClick={handleSpeak}
          disabled={isLoadingAudio && !isPlaying}
          className={`p-2 hover:scale-110 transition-transform focus:outline-none ${variant === 'cto' ? 'text-white' : 'text-[#070707]'}`}
          title={isPlaying ? "Stop Audio" : "Play Verdict (Neural Voice)"}
        >
          {isLoadingAudio ? (
             <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : isPlaying ? (
            <div className="flex items-center gap-1 h-6">
               <div className="w-1.5 bg-current animate-[pulse_0.6s_ease-in-out_infinite] h-3"></div>
               <div className="w-1.5 bg-current animate-[pulse_0.6s_ease-in-out_infinite_0.2s] h-6"></div>
               <div className="w-1.5 bg-current animate-[pulse_0.6s_ease-in-out_infinite_0.4s] h-4"></div>
            </div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
      </div>
      
      <div className={`p-6 flex-1 flex flex-col gap-8 ${isRTL ? 'text-right' : 'text-left'}`}>
        <div className="flex-1">
          <h4 className="font-bold text-xs uppercase tracking-widest text-[#070707] mb-3 bg-[#F5F1F1] inline-block px-2 border border-[#070707]">
            {thoughtTitle}
          </h4>
          <p className={`text-[#070707] leading-relaxed text-sm font-mono border-[#070707] ${isRTL ? 'border-r-[3px] pr-4' : 'border-l-[3px] pl-4'}`}>
            {thoughtContent}
          </p>
        </div>

        <div>
           <h4 className="font-bold text-xs uppercase tracking-widest text-[#070707] mb-3 bg-[#F5F1F1] inline-block px-2 border border-[#070707]">
             {verdictTitle}
           </h4>
           <div className="mt-1">
             <p className="text-[#070707] text-lg font-display font-bold italic mb-5 leading-snug">"{verdictContent}"</p>
             <div className="flex items-center justify-between border-t-[3px] border-[#070707] pt-4">
                <span className="font-mono text-xs font-bold uppercase tracking-wide">{t.decision}</span>
                <span className={`px-4 py-1 text-base font-black border-[2px] border-[#070707] rounded-none bg-[#070707] text-white uppercase`}>
                  {status}
                </span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PersonaCard;