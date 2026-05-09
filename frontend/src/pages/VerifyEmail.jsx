import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { RiMailCheckLine, RiErrorWarningLine, RiLoader4Line, RiArrowRightLine } from 'react-icons/ri';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    const verify = async () => {
      try {
        const response = await api.get(`/auth/verify-email/${token}`);
        // Add a tiny delay so the transition is smooth and visible
        setTimeout(() => {
          setStatus('success');
          setMessage(response.data.message);
          toast.success(response.data.message);
        }, 800);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-900 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md relative animate-slide-up">
        <div className="card text-center py-12">
          {status === 'loading' && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center mb-6">
                <RiLoader4Line className="text-brand-400 text-4xl animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Verifying your email</h1>
              <p className="text-slate-400">Please wait while we activate your account...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                <RiMailCheckLine className="text-emerald-400 text-4xl" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Account Verified!</h1>
              <p className="text-slate-400 mb-8">{message}</p>
              <Link to="/login" className="btn-primary w-full flex items-center justify-center gap-2">
                Sign In to ReviewGuard <RiArrowRightLine />
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-6">
                <RiErrorWarningLine className="text-rose-400 text-4xl" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
              <p className="text-slate-400 mb-8">{message}</p>
              <Link to="/register" className="btn-secondary w-full">
                Try Registering Again
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
