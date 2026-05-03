import React from 'react';
import { RiAlertLine, RiCheckLine, RiEditLine, RiInformationLine, RiShieldKeyholeLine, RiErrorWarningLine } from 'react-icons/ri';

const CombinedWarningModal = ({ isOpen, onClose, toxicityData, duplicateData, text, onEdit, onSubmitAnyway }) => {
  if (!isOpen || !toxicityData || !duplicateData) return null;

  const { score: toxScore, flags = [], detectedKeywords = [] } = toxicityData;
  const { similarity, matchedText, matchedProduct } = duplicateData;

  const highlightContent = (content) => {
    const toxKeywords = new Set(detectedKeywords.map(k => k.toLowerCase()));
    const dupWords = new Set(matchedText ? matchedText.toLowerCase().split(/\s+/).filter(w => w.length > 2) : []);
    
    const words = content.split(/(\s+)/);
    
    return words.map((word, i) => {
      const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      const isToxic = cleanWord && toxKeywords.has(cleanWord);
      const isDuplicate = cleanWord && dupWords.has(cleanWord);

      if (isToxic && isDuplicate) {
        return <mark key={i} className="bg-orange-500/40 text-orange-100 px-0.5 rounded border-b border-orange-400">{word}</mark>;
      }
      if (isToxic) {
        return <mark key={i} className="bg-rose-500/30 text-rose-200 px-0.5 rounded">{word}</mark>;
      }
      if (isDuplicate) {
        return <mark key={i} className="bg-amber-500/30 text-amber-200 px-0.5 rounded">{word}</mark>;
      }
      return word;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="card max-w-2xl w-full bg-surface-800 border border-orange-500/40 rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header - Sunset Gradient */}
        <div className="bg-gradient-to-r from-orange-600/20 via-rose-600/10 to-transparent p-6 border-b border-surface-700 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center shrink-0">
            <RiAlertLine className="text-3xl text-orange-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Multiple Violations Detected</h2>
            <p className="text-sm text-slate-400">This review has been flagged for both content guidelines and duplication.</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto custom-scrollbar">
          
          {/* Dual Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Toxicity */}
            <div className="p-4 bg-surface-900/50 rounded-2xl border border-rose-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <RiShieldKeyholeLine className="text-rose-400 text-sm" />
                  <span className="text-xs font-bold text-slate-300 uppercase">Toxicity</span>
                </div>
                <span className="text-sm font-bold text-rose-500">{(toxScore * 100).toFixed(0)}</span>
              </div>
              <div className="w-full h-1.5 bg-surface-700 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: `${toxScore * 100}%` }} />
              </div>
            </div>

            {/* Similarity */}
            <div className="p-4 bg-surface-900/50 rounded-2xl border border-amber-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <RiErrorWarningLine className="text-amber-400 text-sm" />
                  <span className="text-xs font-bold text-slate-300 uppercase">Similarity</span>
                </div>
                <span className="text-sm font-bold text-amber-500">{(similarity * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-700 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${similarity * 100}%` }} />
              </div>
            </div>
          </div>

          {/* Analysis Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Review Content Analysis</h3>
               <div className="flex gap-3 text-[9px] uppercase font-bold">
                 <span className="flex items-center gap-1 text-rose-400"><span className="w-1.5 h-1.5 rounded-full bg-rose-400"/> Toxic</span>
                 <span className="flex items-center gap-1 text-amber-400"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"/> Duplicate</span>
               </div>
            </div>
            
            <div className="relative p-5 rounded-2xl bg-surface-900 border border-surface-700">
               <div className="text-sm text-slate-300 leading-relaxed italic">
                "{highlightContent(text)}"
              </div>
            </div>
          </div>

          {/* Warnings Log */}
          <div className="space-y-2">
             {flags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                   {flags.map((f, i) => (
                     <span key={i} className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-black rounded uppercase">
                       {f.replace('_', ' ')}
                     </span>
                   ))}
                </div>
             )}
             <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 text-[11px] text-orange-200/80 leading-relaxed flex gap-3">
                <RiInformationLine className="text-lg shrink-0" />
                <p>
                  High toxicity and duplication scores significantly increase the risk of rejection. 
                  <strong> We strongly recommend revising</strong> both the tone and the uniqueness of your content before submission.
                </p>
             </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-surface-900 border-t border-surface-700 flex gap-4">
          <button
            onClick={onEdit}
            className="flex-1 px-6 py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-95"
          >
            <RiEditLine className="text-xl" />
            Fix Both Issues
          </button>
          <button
            onClick={onSubmitAnyway}
            className="flex-1 px-6 py-4 bg-surface-700 hover:bg-surface-600 text-slate-200 font-bold rounded-2xl transition-all border border-surface-600 flex items-center justify-center gap-2 hover:text-orange-400 hover:border-orange-500/50"
          >
            <RiCheckLine className="text-xl" />
            Submit Anyway
          </button>
        </div>
      </div>
    </div>
  );
};

export default CombinedWarningModal;
