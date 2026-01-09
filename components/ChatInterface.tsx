import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, TranslationDictionary } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  onCompare: (competitor: string) => void;
  isLoading: boolean;
  isComparing: boolean;
  competitorName: string;
  isRTL?: boolean;
  t: TranslationDictionary;
}

const InlineLoadingBubble = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const steps = [
    "Searching public data records...",
    "Analyzing competitor pricing models...",
    "Cross-examining feature sets...",
    "Finalizing persona verdicts..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-start w-full mb-4 animate-fade-in">
      <div className="bg-white border-[2px] border-[#070707] rounded px-4 py-3 max-w-[80%] flex items-center gap-3 shadow-sm">
        {/* Icon */}
        <div className="text-[#070707] icon-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        {/* Text */}
        <span className="text-[#070707] font-sans text-sm font-medium animate-fade">
          {steps[stepIndex]}
        </span>
      </div>
      <style>{`
        @keyframes scale-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .icon-pulse {
          animation: scale-pulse 1.5s ease-in-out infinite;
        }
        @keyframes fadeText {
            0% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        .animate-fade {
            animation: fadeText 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  onCompare, 
  isLoading,
  isComparing,
  competitorName: externalCompetitorName,
  isRTL = false,
  t
}) => {
  const [input, setInput] = useState('');
  const [isVsModalOpen, setIsVsModalOpen] = useState(false);
  const [localCompetitorName, setLocalCompetitorName] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isComparing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isComparing) return;
    onSendMessage(input);
    setInput('');
  };

  const handleVsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localCompetitorName.trim()) return;
    setIsVsModalOpen(false);
    
    // Trigger the dedicated comparison handler which will start animation + message
    onCompare(localCompetitorName);
    
    setLocalCompetitorName('');
  };

  return (
    <div className="flex flex-col h-[600px] bg-white border-[3px] border-[#070707] shadow-[8px_8px_0px_0px_#070707] mt-16 rounded-none relative overflow-hidden">
      
      <div className="bg-[#070707] p-4 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-white"></div>
            <h3 className="text-white font-display font-bold tracking-widest uppercase">{t.negotiationWindow}</h3>
         </div>
         <div className="text-white font-mono text-xs">LIVE_FEED_V3.0</div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#F5F1F1]">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full opacity-30">
            <p className="text-[#070707] font-display font-bold text-2xl uppercase text-center">
              {t.juryListening}
            </p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] p-5 text-sm rounded-none relative
              ${msg.role === 'user' 
                  ? 'bg-[#070707] text-white' 
                  : 'bg-white text-[#070707] border-[2px] border-[#070707]'
              }`}
            >
              <span className={`font-mono text-[10px] font-bold uppercase block mb-3 pb-2 border-b border-opacity-20
                ${msg.role === 'user' ? 'text-gray-400 border-gray-600' : 'text-gray-500 border-gray-300'}
                ${isRTL ? 'text-right' : 'text-left'}
                `}>
                {msg.role === 'user' ? t.plaintiff : t.jury}
              </span>
              
              <div 
                className={`markdown-content ${msg.role === 'user' ? 'text-gray-100' : 'text-gray-900'} ${isRTL ? 'text-right' : 'text-left'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <ReactMarkdown 
                  components={{
                    ul: ({node, ...props}) => <ul className={`list-disc mb-2 space-y-1 ${isRTL ? 'pr-4' : 'pl-4'}`} {...props} />,
                    ol: ({node, ...props}) => <ol className={`list-decimal mb-2 space-y-1 ${isRTL ? 'pr-4' : 'pl-4'}`} {...props} />,
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                    li: ({node, ...props}) => <li className={isRTL ? 'pr-1' : 'pl-1'} {...props} />,
                    a: ({node, ...props}) => <a className="underline hover:text-blue-600" target="_blank" rel="noopener noreferrer" {...props} />
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {/* Inline Loading State */}
        {(isLoading || isComparing) && (
           <InlineLoadingBubble />
        )}
        
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white border-t-[3px] border-[#070707] flex gap-4">
        <button 
          type="button" 
          onClick={() => setIsVsModalOpen(true)}
          disabled={isLoading || isComparing}
          className="w-14 bg-[#070707] text-white font-black border-[2px] border-[#070707] hover:bg-gray-800 transition-all rounded-none flex items-center justify-center text-sm disabled:opacity-50"
          title={t.crossExamine}
        >
          {t.vsBtn}
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isRTL ? "اعرض قضيتك..." : "Present your case..."}
          className={`flex-1 bg-white border-[2px] border-[#070707] px-4 py-4 text-[#070707] focus:outline-none focus:bg-[#F5F1F1] transition-all font-mono text-sm rounded-none placeholder-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}
          disabled={isLoading || isComparing}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
        <button 
          type="submit"
          disabled={isLoading || isComparing || !input.trim()}
          className="bg-[#070707] hover:bg-white hover:text-[#070707] disabled:bg-gray-400 text-white px-8 font-black uppercase tracking-widest border-[2px] border-[#070707] transition-all rounded-none text-sm"
        >
          {t.send}
        </button>
      </form>

      {/* VS Modal Overlay - Input Dialog */}
      {isVsModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className="bg-white border-[3px] border-[#070707] p-8 max-w-md w-full shadow-[8px_8px_0px_0px_#ffffff]" dir={isRTL ? 'rtl' : 'ltr'}>
              <h3 className="font-display font-bold text-2xl uppercase mb-1 tracking-tighter">
                {t.vsModalTitle}
              </h3>
              <p className="font-mono text-xs text-gray-500 mb-6 uppercase tracking-wide">
                {isRTL ? "أدخل اسم المنافس للاستجواب" : "Enter Competitor Name for Cross-Examination"}
              </p>
              
              <form onSubmit={handleVsSubmit}>
                <input
                  autoFocus
                  className="w-full bg-[#F5F1F1] border-[2px] border-[#070707] p-4 font-mono text-sm mb-6 focus:outline-none focus:bg-white text-[#070707] placeholder-gray-400"
                  placeholder={t.vsPlaceholder}
                  value={localCompetitorName}
                  onChange={(e) => setLocalCompetitorName(e.target.value)}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsVsModalOpen(false)} 
                    className="flex-1 py-3 font-bold border-[2px] border-[#070707] hover:bg-gray-100 uppercase tracking-wider text-sm"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    type="submit" 
                    disabled={!localCompetitorName.trim()}
                    className="flex-1 py-3 bg-[#070707] text-white font-bold border-[2px] border-[#070707] hover:bg-white hover:text-[#070707] uppercase tracking-wider text-sm disabled:opacity-50"
                  >
                    {t.crossExamine}
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;