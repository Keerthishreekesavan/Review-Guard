import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { RiShieldKeyholeLine, RiMailLine, RiArrowLeftSLine, RiLoader4Line } from 'react-icons/ri';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    if (!email.toLowerCase().endsWith('@gmail.com')) {
      toast.error('Only @gmail.com addresses are allowed.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`/api/auth/forgot-password`, { email });
      toast.success(response.data.message);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-900 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md relative animate-slide-up">
        <div className="card">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center">
              <RiShieldKeyholeLine className="text-brand-400 text-3xl" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
            <p className="text-slate-400 mt-2">
              {submitted 
                ? "We've sent a password reset link to your email."
                : "No worries, we'll send you reset instructions."}
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="label">Email address</label>
                <div className="relative">
                  <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="input pl-10"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? <RiLoader4Line className="animate-spin" /> : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSubmitted(false)}
              className="btn-secondary w-full"
            >
              Didn't receive email? Try again
            </button>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-slate-400 hover:text-white inline-flex items-center gap-1 transition-colors">
              <RiArrowLeftSLine /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
