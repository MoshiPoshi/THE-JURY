import React, { useState, useEffect } from 'react';
import { analyzePitch, startChat, sendMessageToGroup } from './services/geminiService';
import { FocusGroupResponse, ChatMessage, CaseFile, TranslationDictionary } from './types';
import AnalysisForm from './components/AnalysisForm';
import PersonaCard from './components/PersonaCard';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';

// --- MASCOT SYSTEM ---
const MASCOT_STATES = {
  default: (
    <div className="w-32 h-32 bg-white border-[3px] border-[#070707] flex items-center justify-center relative overflow-hidden group">
      <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-[#070707] rounded-none"></div>
      <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-[#070707] rounded-none"></div>
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#070707]"></div>
    </div>
  ),
  thinking: (
    <div className="w-32 h-32 bg-[#070707] border-[3px] border-[#070707] flex items-center justify-center relative overflow-hidden animate-pulse">
       <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white rounded-none"></div>
       <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-white rounded-none"></div>
       <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-8 h-8 border-[3px] border-white rounded-full"></div>
    </div>
  ),
  error: (
    <div className="w-32 h-32 bg-white border-[3px] border-[#070707] flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/3 left-1/4 text-2xl font-black">X</div>
      <div className="absolute top-1/3 right-1/4 text-2xl font-black">X</div>
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-10 h-4 border-t-[3px] border-[#070707] rounded-t-full"></div>
    </div>
  ),
  excited: (
    <div className="w-32 h-32 bg-white border-[3px] border-[#070707] flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/3 left-1/4 w-5 h-5 border-[2px] border-[#070707] bg-white"></div>
      <div className="absolute top-1/3 right-1/4 w-5 h-5 border-[2px] border-[#070707] bg-white"></div>
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-12 h-6 bg-[#070707]"></div>
    </div>
  )
};

const UI_TEXT: Record<string, TranslationDictionary> = {
  en: {
    tagline: "Verdict First. Launch Second.",
    pitchPlaceholder: "Paste your landing page copy, product manifesto, or startup idea here...",
    uploadBtn: "UPLOAD IMAGE",
    roastBtn: "INITIATE ROAST",
    sidebarTitle: "CASE FILES",
    sidebarNew: "NEW CASE",
    vsBtn: "VS",
    vsModalTitle: "Who is the defendant?",
    vsPlaceholder: "e.g. Slack, Linear...",
    rustyTitle: "SENIOR ENGINEER",
    julesTitle: "TREND ANALYST",
    barbTitle: "THE BUDGET KEEPER",
    rustyName: "RUSTY",
    julesName: "JULES",
    barbName: "BARB",
    // Extra keys
    clearRecords: "CLEAR RECORDS",
    decision: "DECISION",
    evidenceUpload: "Evidence (Screenshot)",
    thePitch: "The Pitch",
    negotiationWindow: "Negotiation Window",
    juryListening: "The Jury is Listening",
    plaintiff: "PLAINTIFF (YOU)",
    jury: "THE JURY",
    send: "SEND",
    cancel: "CANCEL",
    crossExamine: "CROSS-EXAMINE",
    // Main Status
    courtSession: "COURT IS IN SESSION. PRESENT YOUR CASE.",
    reviewingEvidence: "RUSTY, JULES, AND BARB ARE REVIEWING THE EVIDENCE...",
    verdictReached: "THE VERDICT HAS BEEN REACHED."
  },
  fr: {
    tagline: "Verdict d'abord. Lancement ensuite.",
    pitchPlaceholder: "Collez votre texte de vente ou idée de startup ici...",
    uploadBtn: "TÉLÉCHARGER IMAGE",
    roastBtn: "LANCER LE PROCÈS",
    sidebarTitle: "DOSSIERS",
    sidebarNew: "NOUVEAU CAS",
    vsBtn: "VS",
    vsModalTitle: "Qui est l'accusé ?",
    vsPlaceholder: "ex: Slack, Linear...",
    rustyTitle: "INGÉNIEUR SENIOR",
    julesTitle: "ANALYSTE DE TENDANCES",
    barbTitle: "GARDIENNE DU BUDGET",
    rustyName: "RUSTY",
    julesName: "JULES",
    barbName: "BARB",
    // Extra keys
    clearRecords: "EFFACER L'HISTORIQUE",
    decision: "DÉCISION",
    evidenceUpload: "Preuve (Capture d'écran)",
    thePitch: "Le Pitch",
    negotiationWindow: "Fenêtre de Négociation",
    juryListening: "Le Jury Écoute",
    plaintiff: "PLAIGNANT (VOUS)",
    jury: "LE JURY",
    send: "ENVOYER",
    cancel: "ANNULER",
    crossExamine: "INTERROGER",
    // Main Status
    courtSession: "LA SÉANCE EST OUVERTE. PRÉSENTEZ VOTRE CAS.",
    reviewingEvidence: "RUSTY, JULES ET BARB EXAMINENT LES PREUVES...",
    verdictReached: "LE VERDICT EST TOMBÉ."
  },
  es: {
    tagline: "Veredicto primero. Lanzamiento después.",
    pitchPlaceholder: "Pega tu texto de venta o idea de startup aquí...",
    uploadBtn: "SUBIR IMAGEN",
    roastBtn: "INICIAR JUICIO",
    sidebarTitle: "ARCHIVOS",
    sidebarNew: "NUEVO CASO",
    vsBtn: "VS",
    vsModalTitle: "¿Quién es el acusado?",
    vsPlaceholder: "ej: Slack, Linear...",
    rustyTitle: "INGENIERO SENIOR",
    julesTitle: "ANALISTA DE TENDENCIAS",
    barbTitle: "GUARDIANA DEL PRESUPUESTO",
    rustyName: "RUSTY",
    julesName: "JULES",
    barbName: "BARB",
    // Extra keys
    clearRecords: "BORRAR HISTORIAL",
    decision: "DECISIÓN",
    evidenceUpload: "Evidencia (Captura)",
    thePitch: "El Discurso",
    negotiationWindow: "Ventana de Negociación",
    juryListening: "El Jurado Escucha",
    plaintiff: "DEMANDANTE (TÚ)",
    jury: "EL JURADO",
    send: "ENVIAR",
    cancel: "CANCELAR",
    crossExamine: "INTERROGAR",
    // Main Status
    courtSession: "SE ABRE LA SESIÓN. PRESENTE SU CASO.",
    reviewingEvidence: "RUSTY, JULES Y BARB ESTÁN REVISANDO LA EVIDENCIA...",
    verdictReached: "SE HA LLEGADO A UN VEREDICTO."
  },
  ar: {
    tagline: "الحكم أولاً. الإطلاق ثانياً.",
    pitchPlaceholder: "الصق نص الصفحة المقصودة أو فكرة المشروع هنا...",
    uploadBtn: "رفع صورة",
    roastBtn: "بدء المحاكمة",
    sidebarTitle: "ملفات القضايا",
    sidebarNew: "قضية جديدة",
    vsBtn: "ضد",
    vsModalTitle: "من هو المتهم؟",
    vsPlaceholder: "مثلاً: Slack, Linear...",
    rustyTitle: "كبير المهندسين",
    julesTitle: "محلل الصيحات",
    barbTitle: "حارسة الميزانية",
    rustyName: "رستي",
    julesName: "جولز",
    barbName: "بارب",
    // Extra keys
    clearRecords: "مسح السجلات",
    decision: "القرار",
    evidenceUpload: "الأدلة (لقطة شاشة)",
    thePitch: "العرض التقديمي",
    negotiationWindow: "نافذة التفاوض",
    juryListening: "لجنة التحكيم تستمع",
    plaintiff: "المدعي (أنت)",
    jury: "هيئة المحلفين",
    send: "إرسال",
    cancel: "إلغاء",
    crossExamine: "استجواب",
    // Main Status
    courtSession: "المحكمة منعقدة. اعرض قضيتك.",
    reviewingEvidence: "رستي، جولز وبارب يراجعون الأدلة...",
    verdictReached: "تم التوصل إلى الحكم."
  }
};

const LANGUAGES = [
  { code: 'en', label: '🇺🇸 English' },
  { code: 'fr', label: '🇫🇷 Français' },
  { code: 'es', label: '🇪🇸 Español' },
  { code: 'ar', label: '🇸🇦 العربية' }
];

const App: React.FC = () => {
  const [result, setResult] = useState<FocusGroupResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  
  // Comparison Animation State
  const [isComparing, setIsComparing] = useState(false);
  const [competitorName, setCompetitorName] = useState('');
  
  // History & Sidebar State
  const [cases, setCases] = useState<CaseFile[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formText, setFormText] = useState('');
  const [formImage, setFormImage] = useState<string | null>(null);

  // Language State
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const isRTL = selectedLanguage === 'ar';
  const t = UI_TEXT[selectedLanguage] || UI_TEXT['en'];

  // Load History on Mount
  useEffect(() => {
    const saved = localStorage.getItem('THE_JURY_CASE_FILES');
    if (saved) {
      try {
        const parsedCases = JSON.parse(saved);
        const migratedCases = parsedCases.map((c: any) => ({
          ...c,
          name: c.name || (c.pitchText ? c.pitchText.substring(0, 15).trim() + (c.pitchText.length > 15 ? '...' : '') : `Evidence #${c.id.substring(0,4)}`)
        }));
        setCases(migratedCases);
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (pitchText: string, imageBase64: string | undefined, imageMimeType: string | undefined, response: FocusGroupResponse) => {
    let autoName = response.case_title;
    if (!autoName || autoName.trim() === "") {
       const dateStr = new Date().toLocaleDateString();
       autoName = `Unidentified Case [${dateStr}]`;
    }

    const newCase: CaseFile = {
      id: Date.now().toString(),
      name: autoName,
      timestamp: Date.now(),
      pitchText,
      imageBase64,
      imageMimeType,
      response
    };
    
    const updatedCases = [...cases, newCase];
    try {
      localStorage.setItem('THE_JURY_CASE_FILES', JSON.stringify(updatedCases));
      setCases(updatedCases);
    } catch (e) {
      console.error("Storage full, could not save case file.", e);
      if (imageBase64) {
         const newCaseLite = { ...newCase, imageBase64: undefined, imageMimeType: undefined };
         const updatedCasesLite = [...cases, newCaseLite];
         try {
            localStorage.setItem('THE_JURY_CASE_FILES', JSON.stringify(updatedCasesLite));
            setCases(updatedCasesLite);
         } catch (e2) {
           console.error("Storage critical.", e2);
         }
      }
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem('THE_JURY_CASE_FILES');
    setCases([]);
  };

  const handleRenameCase = (id: string, newName: string) => {
    const updatedCases = cases.map(c => 
      c.id === id ? { ...c, name: newName } : c
    );
    setCases(updatedCases);
    localStorage.setItem('THE_JURY_CASE_FILES', JSON.stringify(updatedCases));
  };

  const handleSelectCase = (c: CaseFile) => {
    setResult(c.response);
    setFormText(c.pitchText);
    if (c.imageBase64 && c.imageMimeType) {
        setFormImage(`data:${c.imageMimeType};base64,${c.imageBase64}`);
    } else {
        setFormImage(null);
    }
    
    setChatMessages([]);
    const contextSummary = `
        [HISTORICAL CASE RELOADED: "${c.name}"]
        User Input: ${c.pitchText.substring(0, 200)}...
        
        RUSTY (CTO): ${c.response.cto.thought} (Verdict: ${c.response.cto.status})
        JULES (Gen-Z): ${c.response.genZ.vibe} (Verdict: ${c.response.genZ.status})
        BARB (Mom): ${c.response.mom.concerns} (Verdict: ${c.response.mom.status})
    `;
    // Pass the full language name (e.g. "Arabic") to the service for proper prompting
    const langLabel = LANGUAGES.find(l => l.code === selectedLanguage)?.label || 'English';
    startChat(contextSummary, langLabel);
    
    if (window.innerWidth < 768) {
        setSidebarOpen(false);
    }
  };

  const handleAnalysis = async (text: string, imageFile: File | null) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setChatMessages([]);

    try {
      let imageBase64: string | undefined;
      let mimeType: string | undefined;

      if (imageFile) {
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
             const result = reader.result as string;
             const base64Content = result.split(',')[1];
             resolve(base64Content);
          };
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
        mimeType = imageFile.type;
      }

      // Pass the label (e.g. "Arabic" not "ar") for the system prompt
      const langLabel = LANGUAGES.find(l => l.code === selectedLanguage)?.label || 'English';
      const response = await analyzePitch(text, imageBase64, mimeType, langLabel);
      setResult(response);
      saveToHistory(text, imageBase64, mimeType, response);

      const contextSummary = `
        User Input: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''} ${imageFile ? '(+ Image Uploaded)' : ''}
        
        RUSTY (CTO): ${response.cto.thought} (Verdict: ${response.cto.status})
        JULES (Gen-Z): ${response.genZ.vibe} (Verdict: ${response.genZ.status})
        BARB (Mom): ${response.mom.concerns} (Verdict: ${response.mom.status})
      `;
      startChat(contextSummary, langLabel);

    } catch (err: any) {
      setError(err.message || "Something went wrong during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleChatMessage = async (msg: string) => {
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setChatLoading(true);
    try {
      const responseText = await sendMessageToGroup(msg);
      setChatMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'model', text: "Error: Could not reach the focus group." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleComparisonRequest = async (competitor: string) => {
     setIsComparing(true);
     setCompetitorName(competitor);
     
     const prompt = `Cross-examine my product against ${competitor}`;
     setChatMessages(prev => [...prev, { role: 'user', text: prompt }]);
     setChatLoading(true);

     try {
       const responseText = await sendMessageToGroup(prompt);
       setChatMessages(prev => [...prev, { role: 'model', text: responseText }]);
     } catch (err) {
       console.error(err);
       setChatMessages(prev => [...prev, { role: 'model', text: "Error: Could not complete cross-examination." }]);
     } finally {
       setChatLoading(false);
       setIsComparing(false);
       setCompetitorName('');
     }
  };

  const getMascotState = () => {
    if (loading) return 'thinking';
    if (error) return 'error';
    if (result) return 'excited';
    return 'default';
  };

  return (
    <div className={`flex h-screen overflow-hidden bg-[#F5F1F1] text-[#070707] ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        cases={cases}
        onSelectCase={handleSelectCase}
        onClearHistory={handleClearHistory}
        onRenameCase={handleRenameCase}
        isRTL={isRTL}
        t={t}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="border-b-[3px] border-[#070707] bg-white py-6 shrink-0 flex items-center justify-between px-4 sticky top-0 z-30">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 border-2 border-[#070707] hover:bg-[#070707] hover:text-white transition-colors"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex flex-col items-center flex-1">
             <h1 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter leading-none">
               THE JURY
             </h1>
             <p className="mt-1 font-mono text-[10px] md:text-xs bg-[#070707] text-white px-3 py-0.5 uppercase tracking-widest font-bold">
               {t.tagline}
             </p>
          </div>
          
          <div className={`md:absolute md:top-1/2 md:-translate-y-1/2 ${isRTL ? 'md:left-8' : 'md:right-8'}`}>
             <select 
               value={selectedLanguage}
               onChange={(e) => setSelectedLanguage(e.target.value)}
               className="bg-white border-[2px] border-[#070707] text-[#070707] py-2 px-3 font-mono text-xs font-bold uppercase cursor-pointer focus:outline-none focus:bg-[#F5F1F1] rounded-none appearance-none hover:bg-gray-50"
             >
               {LANGUAGES.map((lang) => (
                 <option key={lang.code} value={lang.code}>{lang.label}</option>
               ))}
             </select>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Mascot & Intro */}
            <div className="flex flex-col items-center mb-16 mt-8">
              <div className="mb-8 shadow-[12px_12px_0px_0px_#070707]">
                 {MASCOT_STATES[getMascotState()]}
              </div>
              <p className="text-xl md:text-2xl font-bold max-w-3xl text-center font-display leading-tight uppercase">
                 {loading 
                   ? t.reviewingEvidence
                   : result 
                     ? t.verdictReached 
                     : t.courtSession}
              </p>
            </div>

            {/* Input Section */}
            <div className="mb-20">
              <AnalysisForm 
                onAnalyze={handleAnalysis} 
                isLoading={loading} 
                initialText={formText}
                initialImage={formImage}
                t={t}
              />
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-[#070707] text-white border-[3px] border-red-500 p-6 font-mono font-bold text-center mb-10 shadow-[8px_8px_0px_0px_#ef4444]">
                [SYSTEM_FAILURE]: {error}
              </div>
            )}

            {/* Results Section */}
            {result && (
              <div className="animate-fade-in-up pb-20">
                <div className="flex items-center gap-4 mb-8 border-b-[3px] border-[#070707] pb-4">
                  <div className="w-4 h-4 bg-[#070707]"></div>
                  <h3 className="text-4xl font-display font-black text-[#070707] uppercase tracking-tighter">
                    Official Sentences
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* CTO Card -> RUSTY */}
                  <PersonaCard
                    title={t.rustyName}
                    subtitle={t.rustyTitle}
                    variant="cto"
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    }
                    thoughtTitle="Technical Audit"
                    thoughtContent={result.cto.thought}
                    verdictTitle="Feasibility"
                    verdictContent={result.cto.verdict}
                    status={result.cto.status}
                    isRTL={isRTL}
                    t={t}
                  />

                  {/* Gen-Z Card -> JULES */}
                  <PersonaCard
                    title={t.julesName}
                    subtitle={t.julesTitle}
                    variant="genz"
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    }
                    thoughtTitle="Vibe Check"
                    thoughtContent={result.genZ.vibe}
                    verdictTitle="Cop or Drop?"
                    verdictContent={result.genZ.verdict}
                    status={result.genZ.status}
                    isRTL={isRTL}
                    t={t}
                  />

                  {/* Mom Card -> BARB */}
                  <PersonaCard
                    title={t.barbName}
                    subtitle={t.barbTitle}
                    variant="mom"
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                    thoughtTitle="Value Audit"
                    thoughtContent={result.mom.concerns}
                    verdictTitle="Trust Level"
                    verdictContent={result.mom.verdict}
                    status={result.mom.status}
                    isRTL={isRTL}
                    t={t}
                  />
                </div>

                {/* Chat Section */}
                <ChatInterface 
                   messages={chatMessages} 
                   onSendMessage={handleChatMessage} 
                   onCompare={handleComparisonRequest}
                   isLoading={chatLoading} 
                   isComparing={isComparing}
                   competitorName={competitorName}
                   isRTL={isRTL}
                   t={t}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;