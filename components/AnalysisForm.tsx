import React, { useState, useRef, useEffect } from 'react';
import { TranslationDictionary } from '../types';

interface AnalysisFormProps {
  onAnalyze: (text: string, imageFile: File | null) => void;
  isLoading: boolean;
  initialText?: string;
  initialImage?: string | null;
  t: TranslationDictionary;
}

const AnalysisForm: React.FC<AnalysisFormProps> = ({ onAnalyze, isLoading, initialText = '', initialImage = null, t }) => {
  const [text, setText] = useState(initialText);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when props change (history restore)
  useEffect(() => {
    setText(initialText);
    if (initialImage) {
        // Handle restoration of image preview
        const src = initialImage.startsWith('data:') ? initialImage : `data:image/png;base64,${initialImage}`;
        setPreview(src);
    } else {
        setPreview(null);
    }
    // Clear file input as we can't restore the File object
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [initialText, initialImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text && !file && !preview) return; 
    onAnalyze(text, file);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 border-[3px] border-[#070707] shadow-[8px_8px_0px_0px_#070707] max-w-4xl mx-auto">
      <div className="mb-6">
        <label className="block text-[#070707] text-lg font-display font-bold mb-3 uppercase tracking-wider">
          {t.thePitch}
        </label>
        <textarea
          className="w-full bg-[#F5F1F1] border-[3px] border-[#070707] p-4 text-[#070707] font-mono text-sm focus:outline-none focus:bg-white transition-all resize-y min-h-[150px] placeholder-gray-500 rounded-none"
          placeholder={t.pitchPlaceholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="mb-8">
        <label className="block text-[#070707] text-lg font-display font-bold mb-3 uppercase tracking-wider">
          {t.evidenceUpload}
        </label>
        <div className="flex items-start gap-4 flex-wrap">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="px-6 py-3 bg-white text-[#070707] text-sm font-bold border-[3px] border-[#070707] hover:bg-[#070707] hover:text-white transition-all flex items-center gap-2 rounded-none uppercase tracking-wide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              {t.uploadBtn}
            </button>

            {preview && (
              <div className="relative group border-[3px] border-[#070707]">
                <img src={preview} alt="Preview" className="h-24 w-24 object-cover" />
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute -top-3 -right-3 bg-[#070707] text-white p-1 border-2 border-white hover:scale-110 transition-transform rounded-none"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || (!text && !file && !preview)}
        className={`w-full py-5 text-xl font-display font-black border-[3px] border-[#070707] transition-all rounded-none uppercase tracking-widest
          ${isLoading || (!text && !file && !preview)
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' 
            : 'bg-[#070707] text-white hover:bg-white hover:text-[#070707] shadow-[8px_8px_0px_0px_#070707] hover:shadow-[12px_12px_0px_0px_#070707] active:translate-y-1 active:shadow-[4px_4px_0px_0px_#070707]'
          }`}
      >
        {isLoading ? "..." : t.roastBtn}
      </button>
    </form>
  );
};

export default AnalysisForm;