import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { toAuthErrorMessage } from './authMessages';

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export default function LoginView() {
  const { logIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = useMemo(() => {
    const state = location.state as LocationState | null;
    return state?.from?.pathname ?? '/dashboard';
  }, [location.state]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    navigate('/dashboard', { replace: true });
  }, [navigate, user]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await logIn({ email, password, rememberMe });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(toAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[380px] animate-scaleIn">
      <div className="bg-white border border-gray-200 shadow-sm px-10 py-10 animate-slideUp">
        <div className="text-center mb-10 animate-fadeIn delay-100">
          <div className="text-[9px] font-mono font-bold tracking-[0.2em] text-gray-400 uppercase">
            AUTH MODULE 01
          </div>
          <h1 className="text-3xl font-black tracking-tight text-iron-900 mt-2 uppercase">
            LOGIN
          </h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="animate-slideUp delay-150">
            <div className="text-[9px] font-mono font-bold tracking-widest text-gray-400 uppercase mb-2">
              IDENTIFICATION
            </div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              type="email"
              className="w-full border border-gray-200 bg-white px-4 py-3 font-mono text-[11px] tracking-widest uppercase placeholder:text-gray-300 outline-none transition-all duration-200 ease-out focus:border-iron-900 focus:ring-2 focus:ring-iron-red focus:ring-offset-2 hover:border-gray-300 hover:shadow-sm"
              placeholder="EMAIL_ADDRESS"
            />
          </div>

          <div className="animate-slideUp delay-200">
            <div className="text-[9px] font-mono font-bold tracking-widest text-gray-400 uppercase mb-2">
              ACCESS KEY
            </div>
            <div className="relative group">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="w-full border border-gray-200 bg-white px-4 py-3 pr-12 font-mono text-[11px] tracking-widest placeholder:text-gray-300 outline-none transition-all duration-200 ease-out focus:border-iron-900 focus:ring-2 focus:ring-iron-red focus:ring-offset-2 hover:border-gray-300 hover:shadow-sm"
                placeholder="········"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-iron-900 transition-all duration-200 ease-out hover:scale-125 active:scale-95 focus:outline-none"
                aria-label={showPassword ? 'Hide access key' : 'Show access key'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-3 select-none animate-slideUp delay-250 group cursor-pointer hover:opacity-80 transition-opacity duration-200">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 border-gray-300 text-iron-900 focus:ring-iron-900 cursor-pointer transition-all duration-200 accent-iron-red hover:scale-110 active:scale-95"
            />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-gray-500 transition-colors duration-200 group-hover:text-iron-900">
              REMEMBER DEVICE
            </span>
          </label>

          {error && (
            <div className="text-[10px] font-mono font-bold tracking-widest uppercase text-iron-red animate-shake bg-red-50 border border-iron-red px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-iron-red text-white uppercase text-[11px] font-bold py-3 px-6 transition-all duration-200 ease-out hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:hover:translate-y-0 inline-flex items-center justify-center gap-2 tracking-widest animate-slideUp delay-300"
          >
            {isSubmitting ? (
              <>
                <span className="animate-pulse">AUTHENTICATING...</span>
              </>
            ) : (
              <>
                LOG_IN
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-3">
          <Link
            to="/forgot-password"
            className="block text-[9px] font-mono font-bold tracking-[0.2em] uppercase text-gray-400 hover:text-iron-900 transition-all duration-200 ease-out active:scale-95 focus:outline-none focus:ring-2 focus:ring-iron-red focus:ring-offset-2 animate-fadeIn delay-400 py-2"
          >
            FORGOT ACCESS CREDENTIALS?
          </Link>

          <div className="text-[9px] font-mono font-bold tracking-[0.2em] uppercase text-gray-300 animate-fadeIn delay-450">
            —
          </div>

          <Link
            to="/signup"
            className="inline-flex text-[9px] font-mono font-bold tracking-[0.2em] uppercase text-iron-900 hover:text-iron-red transition-all duration-200 ease-out active:scale-95 focus:outline-none focus:ring-2 focus:ring-iron-red focus:ring-offset-2 animate-fadeIn delay-500 px-2 py-1"
          >
            CREATE AN ACCOUNT
          </Link>
        </div>
      </div>
    </div>
  );
}
