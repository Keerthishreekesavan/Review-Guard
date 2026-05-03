import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';
import socket from '../socket';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  RiStarFill, RiSendPlaneLine, RiFileTextLine,
  RiAlertLine, RiCheckboxCircleLine, RiCloseCircleLine, RiTimeLine,
  RiEditLine, RiArrowGoBackLine, RiDeleteBin6Line
} from 'react-icons/ri';
import AIInsights from '../components/AIInsights';
import ReviewTimeline from '../components/ReviewTimeline';
import HighlightedText from '../components/HighlightedText';
import DuplicateWarningModal from '../components/DuplicateWarningModal';
import ToxicityWarningModal from '../components/ToxicityWarningModal';
import CombinedWarningModal from '../components/CombinedWarningModal';

// Environment-aware Socket.io setup removed - using shared socket

const STAT_CARDS = [
  { key: 'total',    label: 'Total Reviews',    icon: RiFileTextLine,       color: 'text-brand-400',   bg: 'bg-brand-500/10' },
  { key: 'pending',  label: 'Pending',           icon: RiTimeLine,           color: 'text-amber-400',   bg: 'bg-amber-500/10' },
  { key: 'approved', label: 'Approved',          icon: RiCheckboxCircleLine, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { key: 'rejected', label: 'Rejected',          icon: RiCloseCircleLine,    color: 'text-rose-400',    bg: 'bg-rose-500/10' },
];

export default function UserDashboard() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expandedReview, setExpandedReview] = useState(null);
  const [form, setForm] = useState({ productName: '', rating: 5, reviewText: '' });
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [hasRevised, setHasRevised] = useState(false);
  
  // Duplicate Modal State
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateData, setDuplicateData] = useState(null);

  // Toxicity Modal State
  const [showToxicityModal, setShowToxicityModal] = useState(false);
  const [toxicityData, setToxicityData] = useState(null);

  const [showCombinedModal, setShowCombinedModal] = useState(false);

  // Delete confirm state
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);


  const fetchReviews = useCallback(async () => {
    try {
      const res = await api.get('/reviews/my');
      setReviews(res.data);
    } catch {
      toast.error('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();

    // join() must be called AFTER the socket is confirmed connected.
    // Calling emit() immediately after connect() races the handshake and is silently lost.
    const joinRoom = () => {
      socket.emit('join', user.id);
      console.log('[Socket] Joining room for user:', user.id);
    };

    socket.on('connect', joinRoom);
    socket.on('reconnect', joinRoom);

    // Initial join if already connected
    if (socket.connected) joinRoom();

    const handleStatusUpdate = (data) => {
      setReviews((prev) =>
        prev.map((r) =>
          r._id === data.reviewId ? { ...r, status: data.status } : r
        )
      );
      // Removed individual toasts as they are now in Notification Center
      fetchReviews(); 
    };
    socket.on('review:status-updated', handleStatusUpdate);

    // Fired by the AI worker when background toxicity analysis finishes
    const handleAIComplete = (data) => {
      setReviews((prev) =>
        prev.map((r) =>
          r._id === data.reviewId
            ? {
                ...r,
                aiStatus:         data.aiStatus,
                toxicityScore:    data.toxicityScore,
                toxicityFlags:    data.toxicityFlags,
                detectedKeywords: data.detectedKeywords
              }
            : r
        )
      );
    };
    socket.on('review:ai-complete', handleAIComplete);

    // Fired when the worker detects the review is toxic
    const handleAIFlagged = (data) => {
      toast.error(data.message, { duration: 7000, icon: '⚠️' });
    };
    socket.on('review:ai-flagged', handleAIFlagged);

    const handleHighlight = (e) => {
      const reviewId = e.detail;
      setExpandedReview(reviewId);
      setTimeout(() => {
        const el = document.getElementById(`review-${reviewId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-brand-500', 'ring-offset-4', 'ring-offset-surface-900');
          setTimeout(() => el.classList.remove('ring-2', 'ring-brand-500', 'ring-offset-4', 'ring-offset-surface-900'), 3000);
        }
      }, 300);
    };
    window.addEventListener('highlight-review', handleHighlight);

    return () => {
      socket.off('connect', joinRoom);
      socket.off('reconnect', joinRoom);
      socket.off('review:status-updated', handleStatusUpdate);
      socket.off('review:ai-complete', handleAIComplete);
      socket.off('review:ai-flagged', handleAIFlagged);
      window.removeEventListener('highlight-review', handleHighlight);
    };
  }, [user.id, fetchReviews]);

  const validate = () => {
    const e = {};
    if (!form.productName.trim()) e.productName = 'Product name is required.';
    if (!form.reviewText.trim()) e.reviewText = 'Review text is required.';
    else if (form.reviewText.trim().length < 10) e.reviewText = 'Review must be at least 10 characters.';
    return e;
  };

  const handleEdit = (review) => {
    setEditingId(review._id);
    setHasRevised(false); // Reset for the new editing session
    setForm({
      productName: review.productName,
      rating: review.rating,
      reviewText: review.reviewText
    });
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setHasRevised(false);
    setForm({ productName: '', rating: 5, reviewText: '' });
    setErrors({});
  };

  const handleSubmit = async (e, { confirmDuplicate = false, confirmToxicity = false } = {}) => {
    if (e) e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      let res;
      // If user already revised once, we force confirmation for both
      const finalConfirmDuplicate = confirmDuplicate || hasRevised;
      const finalConfirmToxicity  = confirmToxicity  || hasRevised;
      const payload = { ...form, confirmDuplicate: finalConfirmDuplicate, confirmToxicity: finalConfirmToxicity, wasRevised: hasRevised };

      if (editingId) {
        res = await api.put(`/reviews/${editingId}`, payload);
        toast.success('Review updated successfully!', { duration: 4000 });
        setReviews((prev) => prev.map(r => r._id === editingId ? res.data.review : r));
        setEditingId(null);
        setHasRevised(false);
      } else {
        res = await api.post('/reviews', payload);
        toast.success('Review submitted successfully!', { duration: 4000, icon: '✅' });
        setReviews((prev) => [res.data.review, ...prev]);
        setHasRevised(false);
      }

      setForm({ productName: '', rating: 5, reviewText: '' });
      setShowDuplicateModal(false);
      setShowToxicityModal(false);
      setShowCombinedModal(false);
      setHasRevised(false);
    } catch (err) {
      if (err.response?.data?.aiAnalysis) {
        const { toxicity, duplicate, isCombined } = err.response.data.aiAnalysis;
        
        if (isCombined) {
          setToxicityData(toxicity);
          setDuplicateData(duplicate);
          setShowCombinedModal(true);
        } else if (toxicity?.isToxic) {
          setToxicityData(toxicity);
          setShowToxicityModal(true);
        } else if (duplicate?.isDuplicate) {
          setDuplicateData(duplicate);
          setShowDuplicateModal(true);
        }
      } else {
        const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Submission failed.';
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalRevise = () => {
    setShowDuplicateModal(false);
    setHasRevised(true);
    toast('You can now revise your review once before final submission.', { icon: '✍️' });
  };

  // Duplicate modal: confirm only the duplicate, toxicity check still runs
  const handleModalSubmitAnyway = () => {
    setShowDuplicateModal(false);
    handleSubmit(null, { confirmDuplicate: true, confirmToxicity: false });
  };

  const handleToxicityModalRevise = () => {
    setShowToxicityModal(false);
    setHasRevised(true);
    toast('Please revise your review to align with guidelines.', { icon: '✍️' });
  };

  // Toxicity modal: confirm only toxicity, duplicate check still runs
  const handleToxicityModalSubmitAnyway = () => {
    setShowToxicityModal(false);
    handleSubmit(null, { confirmDuplicate: false, confirmToxicity: true });
  };

  // Combined modal: confirm both
  const handleCombinedModalSubmitAnyway = () => {
    setShowCombinedModal(false);
    handleSubmit(null, { confirmDuplicate: true, confirmToxicity: true });
  };

  const handleCombinedModalRevise = () => {
    setShowCombinedModal(false);
    setHasRevised(true);
    toast('Please revise your review to align with guidelines.', { icon: '✍️' });
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/reviews/${deleteConfirm}`);
      toast.success('Review deleted successfully.');
      setReviews(prev => prev.filter(r => r._id !== deleteConfirm));
      setDeleteConfirm(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="page-header mb-8">
        <h1 className="page-title text-3xl font-bold">
          Welcome back, <span className="gradient-text">{user.name}</span>
        </h1>
        <p className="page-subtitle text-slate-400">Submit and track your product reviews</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(({ key, label, icon: Icon, color, bg }) => (
          <div key={key} className="card flex items-center gap-4 bg-surface-800 p-4 rounded-xl border border-surface-700">
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`text-xl ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats[key]}</p>
              <p className="text-xs text-slate-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6 items-stretch">
        {/* Submit Review Form - ONLY FOR USERS */}
        {user.role === 'user' && (
          <div className="lg:col-span-2">
            <div className="card bg-surface-800 p-6 rounded-2xl border border-surface-700 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <RiSendPlaneLine className="text-brand-400" />
                Submit a Review
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="productName" className="label text-sm text-slate-300 mb-1 block">Product Name</label>
                  <input
                    id="productName"
                    type="text"
                    value={form.productName}
                    onChange={(e) => setForm({ ...form, productName: e.target.value })}
                    placeholder="e.g. MacBook Pro M3"
                    className={`input w-full bg-surface-900 border border-surface-600 rounded-lg p-2.5 text-white ${errors.productName ? 'border-rose-500/50 focus:border-rose-500' : 'focus:border-brand-500'}`}
                  />
                  {errors.productName && <p className="text-xs text-rose-400 mt-1">{errors.productName}</p>}
                </div>

                <div>
                  <label className="label text-sm text-slate-300 mb-1 block">Rating</label>
                  <div className="flex gap-2 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setForm({ ...form, rating: star })}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <RiStarFill
                          className={`text-2xl transition-colors ${
                            star <= form.rating ? 'text-amber-400' : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-sm text-slate-400 self-center ml-1">
                      {form.rating}/5
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="reviewText" className="label text-sm text-slate-300 mb-1 block">
                    Review
                    <span className="ml-auto text-slate-500 text-xs float-right">{form.reviewText.length}/2000</span>
                  </label>
                  <textarea
                    id="reviewText"
                    value={form.reviewText}
                    onChange={(e) => setForm({ ...form, reviewText: e.target.value })}
                    placeholder="Share your honest experience..."
                    rows={5}
                    maxLength={2000}
                    className={`input w-full bg-surface-900 border border-surface-600 rounded-lg p-2.5 text-white resize-none ${errors.reviewText ? 'border-rose-500/50 focus:border-rose-500' : 'focus:border-brand-500'}`}
                  />
                  {errors.reviewText && <p className="text-xs text-rose-400 mt-1">{errors.reviewText}</p>}
                </div>

                <div className="flex gap-3">
                  {editingId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="btn-secondary flex-1 bg-surface-700 hover:bg-surface-600 text-white font-semibold py-3 rounded-xl transition-all border border-surface-600 flex items-center justify-center gap-2"
                    >
                      <RiArrowGoBackLine />
                      Cancel
                    </button>
                  )}
                  <button
                    id="submit-review-btn"
                    type="submit"
                    disabled={submitting}
                    className={`btn-primary ${editingId ? 'flex-[2]' : 'w-full'} bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2`}
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {editingId ? 'Updating...' : 'Submitting...'}
                      </>
                    ) : (
                      <>
                        {editingId ? <RiEditLine /> : <RiSendPlaneLine />}
                        {editingId ? 'Update Review' : 'Submit Review'}
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-4 p-3 rounded-xl bg-surface-700/30 border border-surface-600 text-[11px] text-slate-400 flex items-start gap-2">
                <RiAlertLine className="text-brand-400 shrink-0 mt-0.5 text-sm" />
                <span>AI instantly analyzes reviews for duplicate submissions and community guidelines violations upon submission.</span>
              </div>
            </div>

            {/* Trust & Impact Meter */}
            <div className="mt-6 card bg-surface-800 p-6 rounded-2xl border border-surface-700 shadow-xl relative overflow-hidden group">
              {/* Decorative Background Glow */}
              <div className="absolute -right-20 -top-20 w-40 h-40 bg-brand-500/10 rounded-full blur-3xl group-hover:bg-brand-500/20 transition-all duration-700"></div>
              
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2 relative z-10">
                <RiCheckboxCircleLine className="text-brand-400" />
                Trust & Impact
              </h2>

              <div className="flex items-center gap-8 relative z-10">
                {/* Score Circle */}
                <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="48" cy="48" r="40"
                      className="fill-none stroke-surface-700 stroke-[6px]"
                    />
                    <circle
                      cx="48" cy="48" r="40"
                      className="fill-none stroke-brand-500 stroke-[6px] transition-all duration-1000"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - (stats.total > 0 ? (stats.approved / stats.total) : 1))}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white leading-none">
                      {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 100}
                    </span>
                    <span className="text-[10px] font-black text-slate-500 uppercase">Trust</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Standing</p>
                    <p className="text-xl font-black text-white leading-none">
                      {stats.approved >= 10 ? 'Elite Guardian' : stats.approved >= 5 ? 'Trusted Reviewer' : 'Probationary'}
                    </p>
                  </div>
                  
                  <div className="flex gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Impact</p>
                      <p className="text-sm font-black text-emerald-400">+{stats.approved} Safe Reviews</p>
                    </div>
                    <div className="w-px h-8 bg-surface-700"></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Consistency</p>
                      <p className="text-sm font-black text-brand-400">{stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 100}%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 bg-surface-900/50 rounded-xl border border-surface-700/50 text-[11px] text-slate-400 italic">
                "Your trust score reflects the quality of your contributions. High scores unlock priority processing."
              </div>
            </div>
          </div>
        )}

        {/* My Reviews Table */}
        <div className={user.role === 'user' ? 'lg:col-span-3 h-full' : 'lg:col-span-12'}>
          <div className="card bg-surface-800 p-8 rounded-2xl border border-surface-700 shadow-xl overflow-hidden h-full flex flex-col">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <RiFileTextLine className="text-brand-400" />
              My History & Lifecycle
            </h2>

            {loading ? (
              <LoadingSpinner className="py-12" />
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <RiFileTextLine className="text-5xl text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No reviews yet.</p>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto pr-3 custom-scrollbar flex-1 max-h-[720px]">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    id={`review-${review._id}`}
                    className="p-6 rounded-2xl bg-surface-700/30 border border-surface-700/50 hover:border-brand-500/30 transition-all group relative overflow-hidden"
                  >
                    {/* Subtle Side Border for status */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      review.status === 'approved' ? 'bg-emerald-500' : 
                      review.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
                    } opacity-50`}></div>

                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-white text-base">{review.productName}</p>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(s => (
                            <RiStarFill key={s} className={`text-xs ${s <= review.rating ? 'text-amber-400' : 'text-slate-700'}`} />
                          ))}
                        </div>
                        <button 
                          onClick={() => setDeleteConfirm(review._id)}
                          className="ml-1 p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors group/del"
                          title="Delete Review"
                        >
                          <RiDeleteBin6Line className="text-base group-hover/del:scale-110 transition-transform" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-xs font-medium text-slate-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        <StatusBadge status={review.status} />
                      </div>
                    </div>
                    
                    <div className="text-sm text-slate-300 leading-relaxed mb-5">
                      <HighlightedText text={review.reviewText} keywords={review.detectedKeywords} />
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-surface-700/50">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* AI processing status badges */}
                        {review.aiStatus !== 'processing' && review.toxicityScore > 0.3 && (
                          <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-black rounded uppercase">
                            ⚠ Toxic
                          </span>
                        )}

                        {review.isDuplicate && (
                          <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black rounded uppercase">
                            🔁 Duplicate
                          </span>
                        )}
                      </div>

                      <button 
                        onClick={() => setExpandedReview(expandedReview === review._id ? null : review._id)}
                        className="text-[10px] font-black text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1 uppercase tracking-widest"
                      >
                        {expandedReview === review._id ? 'Close Insights' : 'View AI Insights'}
                        <RiTimeLine className={expandedReview === review._id ? 'rotate-180' : ''} />
                      </button>
                    </div>

                    {expandedReview === review._id && (
                      <div className="mt-4 pt-4 border-t border-surface-700 animate-slide-down">
                        <AIInsights 
                          toxicityScore={review.toxicityScore}
                          detectedKeywords={review.detectedKeywords}
                          similarity={review.duplicateSimilarity}
                          isDuplicate={review.isDuplicate}
                          matchedText={review.duplicateOf?.reviewText}
                          matchedProduct={review.duplicateOf?.productName}
                          currentText={review.reviewText}
                        />
                        <div className="mt-6">
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Review Lifecycle Timeline</h4>
                          <ReviewTimeline timeline={review.timeline} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <DuplicateWarningModal 
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        data={duplicateData}
        onEdit={handleModalRevise}
        onSubmitAnyway={handleModalSubmitAnyway}
      />

      <ToxicityWarningModal
        isOpen={showToxicityModal}
        onClose={() => setShowToxicityModal(false)}
        data={toxicityData}
        text={form.reviewText}
        onEdit={handleToxicityModalRevise}
        onSubmitAnyway={handleToxicityModalSubmitAnyway}
      />

      <CombinedWarningModal
        isOpen={showCombinedModal}
        onClose={() => setShowCombinedModal(false)}
        toxicityData={toxicityData}
        duplicateData={duplicateData}
        text={form.reviewText}
        onEdit={handleCombinedModalRevise}
        onSubmitAnyway={handleCombinedModalSubmitAnyway}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="card max-w-sm w-full bg-surface-800 border border-rose-500/30 rounded-3xl shadow-2xl p-6 animate-scale-up">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 flex items-center justify-center mb-6 mx-auto">
              <RiDeleteBin6Line className="text-3xl text-rose-500" />
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">Delete Review?</h3>
            <p className="text-sm text-slate-400 text-center mb-8">
              This will hide the review from your dashboard. This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-6 py-3 bg-surface-700 hover:bg-surface-600 text-white font-bold rounded-xl transition-all border border-surface-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2"
              >
                {deleteLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
