import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  RiShieldCheckLine, RiLoginCircleLine, 
  RiStarFill, RiQuestionLine, RiDoubleQuotesL,
  RiErrorWarningLine, RiShieldKeyholeLine, RiInformationLine, RiEditLine, RiCheckLine, RiAlertLine, RiGithubFill,
  RiArrowRightLine, RiCloseLine
} from 'react-icons/ri';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          } else {
            entry.target.classList.remove('visible');
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const [activeModal, setActiveModal] = useState(null);

  const modalData = {
    xai: {
      title: "Explainable AI (XAI)",
      icon: <RiStarFill className="text-brand-400" size={24} />,
      iconClass: "bg-brand-500/10 border-brand-500/20",
      simpleDef: "Instead of just saying 'This is bad', our AI points exactly to what is bad and why.",
      projectUse: "When a user writes a review, our LLM analyzes it. If it finds hate speech, it highlights the exact sentence and returns a specific reason code so everyone understands the decision.",
      example: "Imagine a bouncer at a club who doesn't just say 'You can't come in', but says, 'You can't come in because you are wearing flip-flops.' That's Explainable AI.",
      visual: (
        <div className="bg-surface-950 border border-surface-800 rounded-xl p-5 font-mono text-xs sm:text-sm text-slate-300 shadow-inner">
          <div className="mb-4 leading-relaxed">"This product is okay, but the <span className="bg-rose-500/20 text-rose-400 px-1 rounded border border-rose-500/30">customer service is absolutely terrible and they are scammers</span>."</div>
          <div className="flex items-center gap-2 text-rose-400 font-bold bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
            <RiAlertLine size={18} /> Flagged: Defamation (98% confidence)
          </div>
        </div>
      )
    },
    lifecycle: {
      title: "Lifecycle Tracking",
      icon: <RiShieldCheckLine className="text-emerald-400" size={24} />,
      iconClass: "bg-emerald-500/10 border-emerald-500/20",
      simpleDef: "A transparent history book for every single review on the platform.",
      projectUse: "From the moment a review is submitted, every edit the user makes, and every decision a moderator takes is permanently logged with a timestamp in the database.",
      example: "Like tracking a package on Amazon. You know exactly when it shipped, when it arrived at a facility, and who signed for it. Nothing is hidden.",
      visual: (
        <div className="relative border-l-2 border-surface-700 ml-4 py-2 space-y-6">
          <div className="relative pl-8">
            <div className="absolute w-4 h-4 bg-emerald-500 rounded-full -left-[9px] top-1 shadow-[0_0_15px_rgba(16,185,129,0.5)] border-2 border-surface-900"></div>
            <div className="text-sm font-bold text-white mb-1">Review Submitted</div>
            <div className="text-xs text-slate-500 font-mono">10:00:05 AM</div>
          </div>
          <div className="relative pl-8">
            <div className="absolute w-4 h-4 bg-amber-500 rounded-full -left-[9px] top-1 shadow-[0_0_15px_rgba(245,158,11,0.5)] border-2 border-surface-900"></div>
            <div className="text-sm font-bold text-white mb-1">AI Flagged (Toxicity)</div>
            <div className="text-xs text-slate-500 font-mono">10:00:06 AM</div>
          </div>
          <div className="relative pl-8">
            <div className="absolute w-4 h-4 bg-brand-500 rounded-full -left-[9px] top-1 shadow-[0_0_15px_rgba(124,58,237,0.5)] border-2 border-surface-900"></div>
            <div className="text-sm font-bold text-white mb-1">User Revised Text</div>
            <div className="text-xs text-slate-500 font-mono">10:05:12 AM</div>
          </div>
        </div>
      )
    },
    duplicate: {
      title: "Duplicate Guard",
      icon: <RiQuestionLine className="text-amber-400" size={24} />,
      iconClass: "bg-amber-500/10 border-amber-500/20",
      simpleDef: "An incredibly smart filter that catches copy-pasted or slightly altered spam.",
      projectUse: "It uses AI embeddings to understand the actual *meaning* of a review. So if someone changes 'Great product' to 'Awesome item', the system still knows they are duplicates.",
      example: "Like a teacher catching a student copying homework, even though the student used a thesaurus to change a few words to make it look different.",
      visual: (
        <div className="flex flex-col gap-4">
          <div className="bg-surface-900 border border-surface-700 rounded-xl p-4 text-sm text-slate-300 shadow-lg">
            "This phone has an amazing battery life!"
          </div>
          <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest my-1">
            <RiCheckLine size={18} /> 96% Semantic Match
          </div>
          <div className="relative bg-surface-900 border border-surface-700 rounded-xl p-4 text-sm text-slate-300 shadow-lg">
            <div className="absolute -inset-0.5 bg-amber-500/20 rounded-xl blur z-0"></div>
            <div className="relative z-10">"The battery life on this mobile is incredible!"</div>
          </div>
        </div>
      )
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 text-white selection:bg-brand-500/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(124,58,237,0.15)_0%,_transparent_60%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-surface-900 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in">
            <RiShieldCheckLine className="text-sm" />
            AI-POWERED MODERATION ENGINE
          </div>

          <h1 className="text-5xl lg:text-7xl font-black mb-8 leading-[1.1] animate-slide-up">
            Next-Gen Content <br />
            <span className="gradient-text">Trust & Safety</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-slate-400 text-lg lg:text-xl font-medium mb-12 animate-slide-up delay-100 italic">
            "Intercept toxic and duplicate reviews before they're posted. Real-time AI warnings, semantic duplicate detection, and full moderation transparency, built in."
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-200">
            <Link 
              to="/login" 
              className="px-10 py-4 rounded-2xl bg-brand-600 text-white font-black text-sm uppercase tracking-widest hover:bg-brand-500 transition-all shadow-2xl shadow-brand-500/20 flex items-center justify-center gap-3 group"
            >
              Let's Get Started
              <RiLoginCircleLine size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
      {/* Impact Stats */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-20 relative z-20 reveal">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Stat 1 */}
          <div className="relative group cursor-default">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500/50 to-purple-500/50 rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative bg-surface-800/90 rounded-3xl p-8 text-center border border-surface-600/50 backdrop-blur-xl transform transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:shadow-[0_20px_40px_-15px_rgba(124,58,237,0.5)] group-hover:border-brand-500/50">
              <div className="text-3xl font-black text-white mb-1 transition-colors duration-300 group-hover:text-brand-400">&lt; 800ms</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg Response Time</div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="relative group cursor-default">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/50 to-teal-500/50 rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative bg-surface-800/90 rounded-3xl p-8 text-center border border-surface-600/50 backdrop-blur-xl transform transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.4)] group-hover:border-emerald-500/50">
              <div className="text-3xl font-black text-white mb-1 transition-colors duration-300 group-hover:text-emerald-400">Dual AI</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Groq + HuggingFace</div>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="relative group cursor-default">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/50 to-orange-500/50 rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative bg-surface-800/90 rounded-3xl p-8 text-center border border-surface-600/50 backdrop-blur-xl transform transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.4)] group-hover:border-amber-500/50">
              <div className="text-3xl font-black text-white mb-1 transition-colors duration-300 group-hover:text-amber-400">3 Layers</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Of Hybrid Defense</div>
            </div>
          </div>

        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
          {/* Feature 1 */}
          <div className="reveal relative group" style={{ transitionDelay: '0ms' }}>
            <div className="w-16 h-16 rounded-[1.5rem] bg-surface-900 border border-brand-500/20 shadow-[0_0_20px_rgba(124,58,237,0.1)] flex items-center justify-center mb-8 text-brand-400 group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(124,58,237,0.3)] transition-all duration-500">
              <RiStarFill size={28} />
            </div>
            <h3 className="text-2xl font-black mb-4 text-white group-hover:text-brand-400 transition-colors">Explainable AI</h3>
            <p className="text-slate-400 leading-relaxed font-medium text-lg">
              Powered by Groq LLM, every review gets a toxicity score, category flags and exact keyword highlights so you always know why.
            </p>
            <button 
              onClick={() => setActiveModal('xai')}
              className="mt-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-brand-400 hover:text-brand-300 transition-colors group/btn"
            >
              More details on XAI <RiArrowRightLine className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Feature 2 */}
          <div className="reveal relative group" style={{ transitionDelay: '150ms' }}>
            {/* Subtle Divider Line (Desktop Only) */}
            <div className="hidden md:block absolute top-0 bottom-0 -left-6 lg:-left-8 w-px bg-gradient-to-b from-surface-700 via-surface-700 to-transparent"></div>
            
            <div className="w-16 h-16 rounded-[1.5rem] bg-surface-900 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)] flex items-center justify-center mb-8 text-emerald-400 group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all duration-500">
              <RiShieldCheckLine size={28} />
            </div>
            <h3 className="text-2xl font-black mb-4 text-white group-hover:text-emerald-400 transition-colors">Lifecycle Tracking</h3>
            <p className="text-slate-400 leading-relaxed font-medium text-lg">
              Every review carries a full audit trail: from submission and user revisions to moderator approvals, all timestamped and visible.
            </p>
            <button 
              onClick={() => setActiveModal('lifecycle')}
              className="mt-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors group/btn"
            >
              More details on Lifecycle <RiArrowRightLine className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Feature 3 */}
          <div className="reveal relative group" style={{ transitionDelay: '300ms' }}>
            {/* Subtle Divider Line (Desktop Only) */}
            <div className="hidden md:block absolute top-0 bottom-0 -left-6 lg:-left-8 w-px bg-gradient-to-b from-surface-700 via-surface-700 to-transparent"></div>

            <div className="w-16 h-16 rounded-[1.5rem] bg-surface-900 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)] flex items-center justify-center mb-8 text-amber-400 group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(245,158,11,0.3)] transition-all duration-500">
              <RiQuestionLine size={28} />
            </div>
            <h3 className="text-2xl font-black mb-4 text-white group-hover:text-amber-400 transition-colors">Duplicate Guard</h3>
            <p className="text-slate-400 leading-relaxed font-medium text-lg">
              Our hybrid semantic engine catches near-identical reviews across all products using HuggingFace embeddings and TF-IDF matching.
            </p>
            <button 
              onClick={() => setActiveModal('duplicate')}
              className="mt-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors group/btn"
            >
              More details on Duplicate Guard <RiArrowRightLine className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Warning Preview Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 reveal">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-widest mb-4">
            <RiErrorWarningLine className="text-sm" />
            Live Preview
          </div>
          <h2 className="text-3xl font-black mb-4">See It In Action</h2>
          <p className="text-slate-400">This is exactly what your users see when our AI intercepts a toxic review.</p>
        </div>

        {/* Static Modal Mock */}
        <div className="relative group">
          {/* Decorative glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-600 to-orange-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative bg-surface-800 border border-rose-500/30 rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-600/20 to-transparent p-6 border-b border-surface-700 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center shrink-0">
                <RiErrorWarningLine className="text-3xl text-rose-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Community Guidelines Warning</h3>
                <p className="text-sm text-slate-400">Our AI detected content that may violate our policies.</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex items-center justify-between p-4 bg-surface-900/50 rounded-2xl border border-surface-700">
                  <div className="flex items-center gap-3">
                    <RiShieldKeyholeLine className="text-brand-400" />
                    <span className="text-sm font-medium text-slate-300">Toxicity Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-surface-700 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 w-[85%]" />
                    </div>
                    <span className="text-lg font-bold text-rose-500">85</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center p-4 bg-surface-900/50 rounded-2xl border border-surface-700">
                  <span className="text-xs text-slate-400 mb-2">Detected Flags:</span>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold rounded uppercase">
                      Hate Speech
                    </span>
                    <span className="px-2 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold rounded uppercase">
                      Profanity
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  Review Analysis
                </h4>
                <div className="relative p-5 rounded-2xl bg-surface-900 border border-surface-700">
                  <div className="text-sm text-slate-300 leading-relaxed">
                    This product is absolute <mark className="bg-rose-500/30 text-rose-200 px-0.5 rounded font-medium">garbage</mark> and the support team are complete <mark className="bg-rose-500/30 text-rose-200 px-0.5 rounded font-medium">idiots</mark>. I demand a refund right now.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 text-xs text-rose-200/80 leading-relaxed flex gap-3">
                <RiInformationLine className="text-lg shrink-0 mt-0.5" />
                <p>
                  Reviews containing toxic or harmful language may be rejected or affect your account standing. 
                  <strong> You can revise your review</strong> to align with our community guidelines.
                </p>
              </div>
            </div>

            {/* Mock Footer Actions */}
            <div className="p-6 bg-surface-900 border-t border-surface-700 flex gap-4">
              <div className="flex-1 px-6 py-3 bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2 cursor-default">
                <RiEditLine />
                I want to Revise
              </div>
              <div className="flex-1 px-6 py-3 bg-surface-700 text-slate-400 font-bold rounded-xl border border-surface-600 flex items-center justify-center gap-2 cursor-default">
                <RiCheckLine />
                Submit Anyway
              </div>
            </div>
          </div>
        </div>

        {/* Static Modal Mock 2: Duplicate Content */}
        <div className="relative group mt-16 reveal">
          {/* Decorative glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative bg-surface-800 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600/20 to-transparent p-6 border-b border-surface-700 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <RiAlertLine className="text-3xl text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Duplicate Content Detected</h3>
                <p className="text-sm text-slate-400">Our AI found a similar review already exists in our platform.</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Similarity Score Card */}
              <div className="flex items-center justify-between p-4 bg-surface-900/50 rounded-2xl border border-surface-700">
                <div className="flex items-center gap-3">
                  <RiInformationLine className="text-brand-400" />
                  <span className="text-sm font-medium text-slate-300">Similarity Confidence</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-surface-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-[92%]" />
                  </div>
                  <span className="text-lg font-bold text-amber-500">92%</span>
                </div>
              </div>

              {/* Comparison */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  Matched Review Analysis
                </h3>
                
                <div className="relative p-5 rounded-2xl bg-surface-900 border border-surface-700">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 bg-surface-700 text-slate-300 text-[10px] font-bold rounded uppercase">
                      Existing Review
                    </span>
                    <span className="text-[10px] text-slate-500 tracking-tight">
                      Product: <span className="text-slate-300">Wireless Headphones Pro</span>
                    </span>
                  </div>

                  <div className="text-sm text-slate-300 leading-relaxed">
                    These <mark className="bg-amber-500/30 text-amber-200 px-0.5 rounded font-medium">headphones</mark> are <mark className="bg-amber-500/30 text-amber-200 px-0.5 rounded font-medium">pretty</mark> good, but the <mark className="bg-amber-500/30 text-amber-200 px-0.5 rounded font-medium">battery</mark> life <mark className="bg-amber-500/30 text-amber-200 px-0.5 rounded font-medium">isn't</mark> great.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-xs text-amber-200/80 leading-relaxed flex gap-3">
                <RiInformationLine className="text-lg shrink-0 mt-0.5" />
                <p>
                  Submitting duplicate content frequently may result in lower trust scores for your account. 
                  <strong> You can choose to revise your review once</strong> to make it unique.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-surface-900 border-t border-surface-700 flex gap-4">
              <div className="flex-1 px-6 py-3 bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2 cursor-default">
                <RiEditLine />
                I want to Revise
              </div>
              <div className="flex-1 px-6 py-3 bg-surface-700 text-slate-400 font-bold rounded-xl border border-surface-600 flex items-center justify-center gap-2 cursor-default">
                <RiCheckLine />
                Submit Anyway
              </div>
            </div>
          </div>
        </div>

        {/* Static Modal Mock 3: Combined Analysis */}
        <div className="relative group mt-16 reveal">
          {/* Decorative glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-rose-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative bg-surface-800 border border-orange-500/40 rounded-3xl shadow-2xl overflow-hidden">
            {/* Header - Sunset Gradient */}
            <div className="bg-gradient-to-r from-orange-600/20 via-rose-600/10 to-transparent p-6 border-b border-surface-700 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center shrink-0">
                <RiAlertLine className="text-3xl text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Multiple Violations Detected</h2>
                <p className="text-sm text-slate-400">This review has been flagged for both content guidelines and duplication.</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              
              {/* Dual Score Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Toxicity */}
                <div className="p-4 bg-surface-900/50 rounded-2xl border border-rose-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <RiShieldKeyholeLine className="text-rose-400 text-sm" />
                      <span className="text-xs font-bold text-slate-300 uppercase">Toxicity</span>
                    </div>
                    <span className="text-sm font-bold text-rose-500">95</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-700 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 w-[95%]" />
                  </div>
                </div>

                {/* Similarity */}
                <div className="p-4 bg-surface-900/50 rounded-2xl border border-amber-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <RiErrorWarningLine className="text-amber-400 text-sm" />
                      <span className="text-xs font-bold text-slate-300 uppercase">Similarity</span>
                    </div>
                    <span className="text-sm font-bold text-amber-500">88%</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-[88%]" />
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
                    "This <mark className="bg-amber-500/30 text-amber-200 px-0.5 rounded">product</mark> is <mark className="bg-orange-500/40 text-orange-100 px-0.5 rounded border-b border-orange-400">terrible</mark> and the <mark className="bg-rose-500/30 text-rose-200 px-0.5 rounded">idiots</mark> who made it <mark className="bg-amber-500/30 text-amber-200 px-0.5 rounded">should</mark> be ashamed."
                  </div>
                </div>
              </div>

              {/* Warnings Log */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-black rounded uppercase">
                    Profanity
                  </span>
                </div>
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
              <div className="flex-1 px-6 py-4 bg-brand-600 text-white font-bold rounded-2xl shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2 cursor-default">
                <RiEditLine className="text-xl" />
                Fix Both Issues
              </div>
              <div className="flex-1 px-6 py-4 bg-surface-700 text-slate-400 font-bold rounded-2xl border border-surface-600 flex items-center justify-center gap-2 cursor-default">
                <RiCheckLine className="text-xl" />
                Submit Anyway
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Quote Section */}
      <div className="max-w-5xl mx-auto px-4 py-32 reveal">
        <div className="relative rounded-3xl p-px bg-gradient-to-b from-surface-700 via-surface-800 to-surface-900 group shadow-2xl shadow-brand-900/20">
          
          {/* Subtle animated background glow on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-600/20 via-purple-500/20 to-brand-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-xl rounded-3xl" />
          
          <div className="relative bg-surface-900/90 backdrop-blur-xl rounded-3xl px-8 py-16 sm:px-16 text-center border border-surface-700/50 overflow-hidden">
            
            {/* Giant decorative background quotes */}
            <RiDoubleQuotesL className="absolute -top-10 -left-10 text-[180px] text-brand-500/5 -rotate-12 select-none pointer-events-none transition-transform duration-700 group-hover:-translate-y-4 group-hover:-translate-x-4" />
            <RiDoubleQuotesL className="absolute -bottom-10 -right-10 text-[180px] text-brand-500/5 rotate-180 select-none pointer-events-none transition-transform duration-700 group-hover:translate-y-4 group-hover:translate-x-4" />
            
            <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-500/10 flex items-center justify-center mb-8 border border-brand-500/20 shadow-[0_0_30px_rgba(124,58,237,0.15)] relative z-10">
              <RiDoubleQuotesL size={28} className="text-brand-400" />
            </div>
            
            <h2 className="relative z-10 text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight md:leading-snug mb-6">
              Users are warned before a harmful <br className="hidden lg:block"/> review ever goes live.
            </h2>
            
            <p className="relative z-10 text-slate-400 font-medium text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
              Moderators review flagged content with full AI context. Every single decision is logged and traceable.
            </p>
            
            <div className="relative z-10 inline-block">
              <span className="bg-surface-800 border border-surface-600 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent shadow-lg">
                That's Trust by Design
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Pipeline */}
      <div id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16 reveal">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-widest mb-6">
            How it Works
          </div>
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-white mb-4">
            The AI Pipeline
          </h2>
          <p className="text-slate-400 text-lg">A seamless four-step moderation lifecycle.</p>
        </div>
        
        <div className="relative">
          {/* Connecting Line (Desktop only) */}
          <div className="hidden md:block absolute top-24 left-10 w-[calc(100%-5rem)] h-0.5 bg-gradient-to-r from-brand-500/0 via-brand-500/50 to-brand-500/0 z-0"></div>
          
          <div className="grid md:grid-cols-4 gap-6 relative z-10">

            {/* Step 1 */}
            <div className="relative group reveal" style={{ transitionDelay: '0ms' }}>
              <div className="absolute -inset-0.5 bg-brand-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative h-full bg-surface-900 border border-surface-700 p-8 rounded-3xl text-center hover:border-brand-500/50 hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-surface-800 border border-brand-500/30 text-brand-400 font-black text-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(124,58,237,0.2)] group-hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] transition-all">1</div>
                <h4 className="font-bold text-white mb-3 text-sm uppercase tracking-wider group-hover:text-brand-400 transition-colors">Submit Review</h4>
                <p className="text-slate-400 text-xs leading-relaxed">User writes a product review and hits submit on the frontend.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group reveal" style={{ transitionDelay: '150ms' }}>
              <div className="absolute -inset-0.5 bg-emerald-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative h-full bg-surface-900 border border-surface-700 p-8 rounded-3xl text-center hover:border-emerald-500/50 hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-surface-800 border border-emerald-500/30 text-emerald-400 font-black text-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all">2</div>
                <h4 className="font-bold text-white mb-3 text-sm uppercase tracking-wider group-hover:text-emerald-400 transition-colors">AI Analysis</h4>
                <p className="text-slate-400 text-xs leading-relaxed">Groq LLM scans for toxicity. HuggingFace embeddings check for duplicates instantly.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group reveal" style={{ transitionDelay: '300ms' }}>
              <div className="absolute -inset-0.5 bg-amber-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative h-full bg-surface-900 border border-surface-700 p-8 rounded-3xl text-center hover:border-amber-500/50 hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-surface-800 border border-amber-500/30 text-amber-400 font-black text-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(245,158,11,0.2)] group-hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all">3</div>
                <h4 className="font-bold text-white mb-3 text-sm uppercase tracking-wider group-hover:text-amber-400 transition-colors">Warn or Approve</h4>
                <p className="text-slate-400 text-xs leading-relaxed">Clean reviews go live. Flagged ones trigger a warning so the user can revise.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative group reveal" style={{ transitionDelay: '450ms' }}>
              <div className="absolute -inset-0.5 bg-purple-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative h-full bg-surface-900 border border-surface-700 p-8 rounded-3xl text-center hover:border-purple-500/50 hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-surface-800 border border-purple-500/30 text-purple-400 font-black text-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(168,85,247,0.2)] group-hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all">4</div>
                <h4 className="font-bold text-white mb-3 text-sm uppercase tracking-wider group-hover:text-purple-400 transition-colors">Moderation</h4>
                <p className="text-slate-400 text-xs leading-relaxed">Moderators review pending submissions with full AI context to make the final call.</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Final Push CTA - Split Layout with Visual */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 reveal">
        <div className="relative group">
          {/* Animated Ambient Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-600/30 via-purple-500/30 to-brand-600/30 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
          
          <div className="relative rounded-[2.5rem] bg-surface-900/90 backdrop-blur-xl border border-surface-700/50 overflow-hidden shadow-2xl z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center p-8 md:p-16">
              
              {/* Left Column: Text & Buttons */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-widest mb-6">
                  <RiShieldCheckLine className="text-sm" />
                  Synchronous Architecture
                </div>

                <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight text-white">
                  Intelligent <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-cyan-400">Moderation</span> Layer.
                </h2>
                
                <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
                  ReviewGuard intercepts requests before they hit the database. Our dual-engine architecture flags toxicity and semantic duplicates in real-time, preventing bad data from ever being stored.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <a 
                    href="https://github.com/Keerthishreekesavan/Review-Guard.git" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-brand-600 to-purple-600 text-white font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] flex items-center justify-center gap-3"
                  >
                    View Source Code
                    <RiGithubFill className="text-2xl" />
                  </a>
                </div>
              </div>

              {/* Right Column: Visual (Fake Code Editor / API Response) */}
              <div className="relative mt-8 lg:mt-0 lg:ml-auto w-full max-w-md mx-auto transform transition-all duration-700 ease-out group-hover:-translate-y-6 group-hover:rotate-[4deg] group-hover:scale-105 z-20">
                {/* Decorative glow behind code editor */}
                <div className="absolute inset-0 bg-brand-500/20 blur-2xl rounded-full"></div>
                
                <div className="relative bg-surface-950 border border-surface-700 rounded-2xl overflow-hidden shadow-2xl">
                  {/* Editor Header */}
                  <div className="bg-surface-800 px-4 py-3 flex items-center gap-2 border-b border-surface-700">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                    <span className="ml-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">POST /api/moderate</span>
                  </div>
                  
                  {/* Editor Body */}
                  <div className="p-6 font-mono text-sm leading-[1.8]">
                    <div className="text-slate-400">{"{"}</div>
                    <div className="pl-4 text-cyan-300">"status"<span className="text-slate-400">: </span><span className="text-rose-400">"blocked"</span><span className="text-slate-400">,</span></div>
                    <div className="pl-4 text-cyan-300">"toxicity_score"<span className="text-slate-400">: </span><span className="text-amber-300">0.98</span><span className="text-slate-400">,</span></div>
                    <div className="pl-4 text-cyan-300">"flags"<span className="text-slate-400">: [</span></div>
                    <div className="pl-8 text-emerald-300">"Hate Speech"<span className="text-slate-400">,</span></div>
                    <div className="pl-8 text-emerald-300">"Profanity"</div>
                    <div className="pl-4 text-slate-400">]<span className="text-slate-400">,</span></div>
                    <div className="pl-4 text-cyan-300">"action"<span className="text-slate-400">: </span><span className="text-brand-300">"Require Revision"</span></div>
                    <div className="text-slate-400">{"}"}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-surface-800 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Tagline */}
          <p className="text-center text-slate-400 text-sm font-medium mb-8 italic">
            "Real-time AI moderation for communities that care about quality."
          </p>

          {/* Nav Links */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <Link
              to="/login"
              className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Login
            </Link>
            <span className="w-1 h-1 rounded-full bg-surface-700" />
            <Link
              to="/register"
              className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Register
            </Link>
            <span className="w-1 h-1 rounded-full bg-surface-700" />
            <a
              href="#how-it-works"
              className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
            >
              How it Works
            </a>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-surface-800 mb-8" />

          {/* Bottom row — tech stack */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 text-[10px] uppercase tracking-widest font-semibold">
              Powered by&nbsp;
              <span className="text-slate-500">Groq</span>
              &nbsp;·&nbsp;
              <span className="text-slate-500">HuggingFace</span>
              &nbsp;·&nbsp;
              <span className="text-slate-500">MongoDB</span>
              &nbsp;·&nbsp;
              <span className="text-slate-500">Socket.io</span>
            </p>
            <p className="text-slate-600 text-[10px] uppercase tracking-widest font-semibold italic">
              Developed by Keerthishree Kesavan
            </p>
          </div>


        </div>
      </footer>

      {/* Detail Modal Overlay */}
      {activeModal && modalData[activeModal] && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-surface-950/80 backdrop-blur-sm transition-opacity duration-300" onClick={() => setActiveModal(null)}></div>
          
          <div className="relative w-full max-w-4xl bg-surface-900 border border-surface-700 rounded-3xl shadow-2xl overflow-hidden animate-fade-in flex flex-col md:flex-row">
            
            {/* Left Content */}
            <div className="p-8 md:p-12 md:w-1/2 border-b md:border-b-0 md:border-r border-surface-700">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${modalData[activeModal].iconClass}`}>
                  {modalData[activeModal].icon}
                </div>
                <h3 className="text-2xl font-black text-white">{modalData[activeModal].title}</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">The Simple Definition</h4>
                  <p className="text-slate-300 leading-relaxed font-medium">{modalData[activeModal].simpleDef}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">How it works here</h4>
                  <p className="text-slate-300 leading-relaxed font-medium">{modalData[activeModal].projectUse}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Real World Example</h4>
                  <p className="text-slate-400 leading-relaxed italic border-l-2 border-surface-600 pl-4">{modalData[activeModal].example}</p>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="p-8 md:p-12 md:w-1/2 bg-surface-800/50 flex flex-col justify-center relative">
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface-800 border border-surface-600 flex items-center justify-center text-slate-400 hover:text-white hover:bg-surface-700 transition-colors"
              >
                <RiCloseLine size={24} />
              </button>
              
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-8 text-center">Visual Representation</h4>
              <div className="w-full">
                {modalData[activeModal].visual}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
