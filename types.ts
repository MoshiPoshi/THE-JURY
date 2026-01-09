
export interface FocusGroupResponse {
  case_title: string; // Smart auto-generated title
  cto: {
    thought: string;
    verdict: string;
    status: 'PASS' | 'FAIL';
  };
  genZ: {
    vibe: string;
    verdict: string;
    status: 'COP' | 'DROP';
  };
  mom: {
    concerns: string;
    verdict: string;
    status: 'TRUST' | 'NO TRUST';
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AnalysisRequest {
  text?: string;
  image?: string; // base64
  mimeType?: string;
}

export interface CaseFile {
  id: string;
  name: string; // New field for custom/auto naming
  timestamp: number;
  pitchText: string;
  imageBase64?: string; // base64 string without prefix
  imageMimeType?: string;
  response: FocusGroupResponse;
}

export interface TranslationDictionary {
  tagline: string;
  pitchPlaceholder: string;
  uploadBtn: string;
  roastBtn: string;
  sidebarTitle: string;
  sidebarNew: string;
  vsBtn: string;
  vsModalTitle: string;
  vsPlaceholder: string;
  // Persona Titles
  rustyTitle: string;
  julesTitle: string;
  barbTitle: string;
  // Persona Names
  rustyName: string;
  julesName: string;
  barbName: string;
  // Extra UI Elements
  clearRecords: string;
  decision: string;
  evidenceUpload: string;
  thePitch: string;
  negotiationWindow: string;
  juryListening: string;
  plaintiff: string;
  jury: string;
  send: string;
  cancel: string;
  crossExamine: string;
  // Main Status Messages
  courtSession: string;
  reviewingEvidence: string;
  verdictReached: string;
}