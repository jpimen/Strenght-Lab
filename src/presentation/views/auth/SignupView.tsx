import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { toAuthErrorMessage } from './authMessages';

function getStrengthLabel(password: string) {
  if (!password) return { label: '—', className: 'text-gray-300' };
  if (password.length < 8) return { label: 'WEAK', className: 'text-iron-red' };

  let score = 0;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score >= 3 && password.length >= 12) return { label: 'STRONG', className: 'text-green-600' };
  if (score >= 2) return { label: 'OK', className: 'text-iron-900' };
  return { label: 'WEAK', className: 'text-iron-red' };
}

export default function SignupView() {
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = useMemo(() => getStrengthLabel(password), [password]);

  useEffect(() => {
    if (!user) return;
    navigate('/dashboard', { replace: true });
  }, [navigate, user]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('ACCESS KEYS DO NOT MATCH.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp({ fullName, email, password, rememberMe });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(toAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[420px]">
      <div className="bg-white border border-gray-200 shadow-sm px-10 py-10">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-black tracking-tight text-iron-900 uppercase">
            CREATE ACCOUNT
          </h1>
          <div className="text-[9px] font-mono font-bold tracking-[0.2em] text-gray-400 uppercase mt-2">
            PROTOCOL VERSION 2.0.4 — SYSTEM INITIALIZATION
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <div className="text-[9px] font-mono font-bold tracking-widest text-gray-400 uppercase mb-2">
              ATHLETE_NAME
            </div>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              className="w-full border border-gray-200 bg-white px-4 py-3 font-mono text-[11px] tracking-widest uppercase placeholder:text-gray-300 outline-none focus:border-iron-900"
              placeholder="FULL NAME"
            />
          </div>

          <div>
            <div className="text-[9px] font-mono font-bold tracking-widest text-gray-400 uppercase mb-2">
              SYSTEM_ID_EMAIL
            </div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              type="email"
              className="w-full border border-gray-200 bg-white px-4 py-3 font-mono text-[11px] tracking-widest uppercase placeholder:text-gray-300 outline-none focus:border-iron-900"
              placeholder="USER@DOMAIN.COM"
            />
          </div>

          <div>
            <div className="flex items-end justify-between mb-2">
              <div className="text-[9px] font-mono font-bold tracking-widest text-gray-400 uppercase">
                ACCESS_ENCRYPTION
              </div>
              <div className="text-[9px] font-mono font-bold tracking-widest uppercase text-gray-400">
                STRENGTH:{' '}
                <span className={strength.className}>{strength.label}</span>
              </div>
            </div>
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="w-full border border-gray-200 bg-white px-4 py-3 pr-12 font-mono text-[11px] tracking-widest placeholder:text-gray-300 outline-none focus:border-iron-900"
                placeholder="********"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-iron-900 transition-colors"
                aria-label={showPassword ? 'Hide access key' : 'Show access key'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <div className="text-[9px] font-mono font-bold tracking-widest text-gray-400 uppercase mb-2">
              CONFIRM_ACCESS_KEY
            </div>
            <div className="relative">
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                className="w-full border border-gray-200 bg-white px-4 py-3 pr-12 font-mono text-[11px] tracking-widest placeholder:text-gray-300 outline-none focus:border-iron-900"
                placeholder="********"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-iron-900 transition-colors"
                aria-label={showConfirm ? 'Hide confirm access key' : 'Show confirm access key'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-3 select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 border-gray-300 text-iron-900 focus:ring-iron-900"
            />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-gray-500">
              REMEMBER DEVICE
            </span>
          </label>

          {error && (
            <div className="text-[10px] font-mono font-bold tracking-widest uppercase text-iron-red">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-iron-900 text-white uppercase text-[11px] font-bold py-3 px-6 hover:bg-black transition-colors inline-flex items-center justify-center gap-2 tracking-widest disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'INITIALIZING...' : 'INITIALIZE SYNC'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 text-center space-y-2">
          <div className="text-[9px] font-mono font-bold tracking-[0.2em] uppercase text-gray-300">
            ALREADY SYNCHRONIZED?
          </div>
          <Link
            to="/login"
            className="inline-flex text-[9px] font-mono font-bold tracking-[0.2em] uppercase text-iron-900 hover:text-iron-red transition-colors"
          >
            ACCESS LOG IN
          </Link>
        </div>
      </div>
    </div>
  );
}
