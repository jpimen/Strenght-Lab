import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { toAuthErrorMessage } from './authMessages';

type Stage = 'request' | 'reset' | 'done';

export default function ForgotPasswordView() {
  const { requestPasswordReset, resetPassword } = useAuth();

  const [stage, setStage] = useState<Stage>('request');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [issuedCode, setIssuedCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const expiryText = useMemo(() => {
    if (!expiresAt) return null;
    const date = new Date(expiresAt);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [expiresAt]);

  const onRequest = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const challenge = await requestPasswordReset(email);
      setIssuedCode(challenge.resetCode);
      setExpiresAt(challenge.expiresAt);
      setResetCode(challenge.resetCode);
      setStage('reset');
    } catch (err) {
      setError(toAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onReset = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('ACCESS KEYS DO NOT MATCH.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword({ email, resetCode, newPassword });
      setStage('done');
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
          <div className="text-[9px] font-mono font-bold tracking-[0.2em] text-gray-400 uppercase">
            RECOVERY MODULE
          </div>
          <h1 className="text-2xl font-black tracking-tight text-iron-900 mt-2 uppercase">
            RESET ACCESS
          </h1>
        </div>

        {stage === 'request' && (
          <form onSubmit={onRequest} className="space-y-5">
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
              {isSubmitting ? 'GENERATING...' : 'INITIATE RECOVERY'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex text-[9px] font-mono font-bold tracking-[0.2em] uppercase text-gray-400 hover:text-iron-900 transition-colors"
              >
                RETURN TO LOGIN
              </Link>
            </div>
          </form>
        )}

        {stage === 'reset' && (
          <form onSubmit={onReset} className="space-y-5">
            <div className="text-[9px] font-mono font-bold tracking-[0.2em] uppercase text-gray-400">
              DEMO RESET CODE ISSUED{expiryText ? ` — EXPIRES ${expiryText}` : ''}
            </div>
            {issuedCode && (
              <div className="border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-[12px] tracking-[0.3em] uppercase text-iron-900 text-center">
                {issuedCode}
              </div>
            )}

            <div>
              <div className="text-[9px] font-mono font-bold tracking-widest text-gray-400 uppercase mb-2">
                RESET_CODE
              </div>
              <input
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                inputMode="numeric"
                className="w-full border border-gray-200 bg-white px-4 py-3 font-mono text-[11px] tracking-widest uppercase placeholder:text-gray-300 outline-none focus:border-iron-900"
                placeholder="000000"
              />
            </div>

            <div>
              <div className="text-[9px] font-mono font-bold tracking-widest text-gray-400 uppercase mb-2">
                NEW_ACCESS_KEY
              </div>
              <div className="relative">
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type={showNew ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="w-full border border-gray-200 bg-white px-4 py-3 pr-12 font-mono text-[11px] tracking-widest placeholder:text-gray-300 outline-none focus:border-iron-900"
                  placeholder="********"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-iron-900 transition-colors"
                  aria-label={showNew ? 'Hide new access key' : 'Show new access key'}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

            {error && (
              <div className="text-[10px] font-mono font-bold tracking-widest uppercase text-iron-red">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-iron-red text-white uppercase text-[11px] font-bold py-3 px-6 hover:bg-red-700 transition-colors inline-flex items-center justify-center gap-2 tracking-widest disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'RESETTING...' : 'RESET ACCESS KEY'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setStage('request');
                  setIssuedCode(null);
                  setExpiresAt(null);
                  setResetCode('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setError(null);
                }}
                className="text-[9px] font-mono font-bold tracking-[0.2em] uppercase text-gray-400 hover:text-iron-900 transition-colors"
              >
                REQUEST NEW CODE
              </button>
            </div>
          </form>
        )}

        {stage === 'done' && (
          <div className="space-y-6 text-center">
            <div className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-green-600">
              ACCESS KEY UPDATED.
            </div>
            <Link
              to="/login"
              className="inline-flex bg-iron-900 text-white uppercase text-[11px] font-bold py-3 px-6 hover:bg-black transition-colors items-center justify-center gap-2 tracking-widest"
            >
              RETURN TO LOGIN
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
