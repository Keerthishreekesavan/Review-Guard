import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { RiLockPasswordLine, RiLockLine, RiEyeLine, RiEyeOffLine, RiLoader4Line } from 'react-icons/ri';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const calculateStrength = (pass) => {
    if (!pass) return 0;
    let s = 0;
    if (pass.length >= 8) s++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) s++;
    if (/[0-9]/.test(pass) && /[!@#$%^&*(),.?":{}|<> ]/.test(pass)) s++;
    return s;
  };

  const strength = calculateStrength(password);
  const strengthColors = ['', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`/api/auth/reset-password/${token}`, { password });
      toast.success(response.data.message);
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-900 px-4">
        <div className="card text-center max-w-md w-full">
          <h1 className="text-xl font-bold text-white mb-4">Invalid Link</h1>
          <p className="text-slate-400 mb-6">This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" title="Go to Forgot Password" className="btn-primary w-full">Request New Link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-900 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md relative animate-slide-up">
        <div className="card">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center">
              <RiLockPasswordLine className="text-brand-400 text-3xl" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white">Set New Password</h1>
            <p className="text-slate-400 mt-2">Please choose a strong password you haven't used before.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="pass" className="label">New Password</label>
              <div className="relative">
                <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  id="pass"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="input pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
              {password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1.5 items-center">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= strength ? strengthColors[strength] : 'bg-surface-500'}`} />
                    ))}
                    <span className={`text-xs font-medium ml-1 ${['', 'text-rose-400', 'text-amber-400', 'text-emerald-400'][strength]}`}>
                      {strengthLabels[strength]}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <p className={`text-[10px] flex items-center gap-1 ${password.length >= 8 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <span className={`w-1 h-1 rounded-full ${password.length >= 8 ? 'bg-emerald-400' : 'bg-slate-500'}`} /> 8+ Characters
                    </p>
                    <p className={`text-[10px] flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <span className={`w-1 h-1 rounded-full ${/[A-Z]/.test(password) ? 'bg-emerald-400' : 'bg-slate-500'}`} /> Uppercase
                    </p>
                    <p className={`text-[10px] flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <span className={`w-1 h-1 rounded-full ${/[0-9]/.test(password) ? 'bg-emerald-400' : 'bg-slate-500'}`} /> Number
                    </p>
                    <p className={`text-[10px] flex items-center gap-1 ${/[!@#$%^&*(),.?":{}|<> ]/.test(password) ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <span className={`w-1 h-1 rounded-full ${/[!@#$%^&*(),.?":{}|<> ]/.test(password) ? 'bg-emerald-400' : 'bg-slate-500'}`} /> Special Symbol
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirm" className="label">Confirm New Password</label>
              <div className="relative">
                <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  id="confirm"
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={`input pl-10 ${confirmPassword && confirmPassword !== password ? 'border-rose-500/50' : ''}`}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
            >
              {loading ? <RiLoader4Line className="animate-spin" /> : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
