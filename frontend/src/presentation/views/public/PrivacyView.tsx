import { Link } from 'react-router-dom';

export default function PrivacyView() {
  return (
    <div className="w-full max-w-[900px]">
      <div className="bg-white border border-gray-200 shadow-sm px-10 py-10">
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight text-iron-900 uppercase">
            PRIVACY
          </h1>
          <div className="text-[9px] font-mono font-bold tracking-[0.2em] text-gray-400 uppercase mt-2">
            DEMO DOCUMENT — REPLACE WITH YOUR POLICY
          </div>
        </div>

        <div className="mt-10 space-y-4 text-[11px] font-mono tracking-widest text-gray-600 uppercase">
          <div>
            THIS DEMO STORES ACCOUNTS AND SESSIONS IN YOUR BROWSER STORAGE FOR DEVELOPMENT ONLY.
          </div>
          <div>
            CLEAR YOUR BROWSER STORAGE TO REMOVE ALL DEMO USERS AND AUTH DATA.
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/login"
            className="inline-flex text-[9px] font-mono font-bold tracking-[0.2em] uppercase text-gray-400 hover:text-iron-900 transition-colors"
          >
            RETURN TO LOGIN
          </Link>
        </div>
      </div>
    </div>
  );
}

