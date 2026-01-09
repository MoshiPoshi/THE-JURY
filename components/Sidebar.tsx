import React, { useState } from 'react';
import { CaseFile, TranslationDictionary } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cases: CaseFile[];
  onSelectCase: (caseFile: CaseFile) => void;
  onClearHistory: () => void;
  onRenameCase: (id: string, newName: string) => void;
  isRTL?: boolean;
  t: TranslationDictionary;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, cases, onSelectCase, onClearHistory, onRenameCase, isRTL = false, t }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [savedId, setSavedId] = useState<string | null>(null);

  const startEditing = (e: React.MouseEvent, c: CaseFile) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditName(c.name);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      onRenameCase(editingId, editName.trim());
      
      // Trigger success animation/cue
      setSavedId(editingId);
      setTimeout(() => setSavedId(null), 2000);
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    }
  };

  const getSummaryVerdict = (c: CaseFile) => {
    // Brutalist summary: "PASS / DROP / TRUST"
    return `${c.response.cto.status} / ${c.response.genZ.status} / ${c.response.mom.status}`;
  };

  // Logic for RTL Sidebar
  // If RTL: "Closed" means translated POSITIVELY (off screen to right)
  // If LTR: "Closed" means translated NEGATIVELY (off screen to left)
  const transformClass = isRTL 
    ? (isOpen ? 'translate-x-0' : 'translate-x-full') 
    : (isOpen ? 'translate-x-0' : '-translate-x-full');

  const positionClass = isRTL ? 'right-0 border-l-[3px]' : 'left-0 border-r-[3px]';

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed top-0 h-full w-80 bg-[#070707] text-white border-[#070707] z-50 transform transition-transform duration-300 ease-in-out
          ${transformClass}
          ${positionClass}
          md:relative md:translate-x-0 md:h-auto md:min-h-full flex flex-col shadow-[10px_0_20px_rgba(0,0,0,0.5)] md:shadow-none
        `}
      >
        <div className="p-6 border-b-[3px] border-white/20 flex justify-between items-center bg-[#070707]">
          <h2 className="font-display font-bold text-2xl tracking-widest uppercase text-white">{t.sidebarTitle}</h2>
          <button onClick={onClose} className="md:hidden text-white hover:bg-white hover:text-black p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#070707]">
          {cases.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 opacity-50">
               <span className="text-4xl mb-2">📂</span>
               <p className="font-mono text-xs text-center uppercase tracking-wider">Locker Empty</p>
            </div>
          ) : (
            cases.slice().reverse().map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  if (editingId !== c.id) {
                    onSelectCase(c);
                    if (window.innerWidth < 768) onClose();
                  }
                }}
                className={`w-full text-left p-4 border border-white/20 hover:bg-white hover:text-[#070707] transition-all group relative overflow-hidden cursor-pointer ${savedId === c.id ? 'border-l-4 border-l-green-500' : ''}`}
              >
                {/* ID & EDIT ROW */}
                <div className="flex items-center justify-between mb-2 pb-1 border-b border-white/10 group-hover:border-[#070707]/20">
                    <span className="font-mono text-[10px] text-gray-400 group-hover:text-gray-600">
                      CASE #{c.id.substring(c.id.length - 4)}
                    </span>
                    
                    {/* EDIT BUTTON / SAVED INDICATOR */}
                    {editingId !== c.id && (
                      savedId === c.id ? (
                        <span className="text-green-500 animate-pulse ml-2 flex items-center gap-1 font-mono text-[10px] uppercase font-bold">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          SAVED
                        </span>
                      ) : (
                        <button 
                          onClick={(e) => startEditing(e, c)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-[#070707] p-1"
                          title="Rename Case"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                             <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                           </svg>
                        </button>
                      )
                    )}
                </div>
                
                {/* NAME OR INPUT */}
                {editingId === c.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-white text-[#070707] border border-[#070707] font-bold text-sm uppercase font-display leading-tight p-1 focus:outline-none focus:ring-2 focus:ring-[#070707]"
                  />
                ) : (
                  <p className="font-bold text-sm truncate uppercase font-display leading-tight">
                    {c.name}
                  </p>
                )}
                
                {/* VERDICT SUMMARY */}
                <p className="mt-2 text-[10px] font-mono text-gray-500 group-hover:text-[#070707] tracking-tighter">
                   VERDICT: <span className="font-bold">{getSummaryVerdict(c)}</span>
                </p>

                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-0 bottom-0 w-1 bg-white opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t-[3px] border-white/20 bg-[#070707]">
          <button
            onClick={onClearHistory}
            className="w-full py-4 bg-red-600 text-white font-black font-display text-sm uppercase hover:bg-red-700 transition-colors border-2 border-transparent hover:border-white tracking-widest"
          >
            {t.clearRecords}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;