import { Link } from 'react-router-dom';

export default function SupportView() {
  return (
    <div className="w-full max-w-[720px]">
      <div className="bg-white border border-gray-200 shadow-sm px-10 py-10">
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight text-iron-900 uppercase">
            SUPPORT
          </h1>
          <div className="text-[9px] font-mono font-bold tracking-[0.2em] text-gray-400 uppercase mt-2">
            CONTACT YOUR SYSTEM ADMINISTRATOR FOR ACCESS
          </div>
        </div>

        <div className="mt-10 space-y-4 text-[11px] font-mono tracking-widest text-gray-600 uppercase">
          <div>IF YOU CAN’T LOG IN, TRY RESETTING YOUR ACCESS KEY.</div>
          <div>
            FOR ACCOUNT ISSUES, PROVIDE YOUR <span className="text-iron-900">SYSTEM_ID_EMAIL</span> TO SUPPORT.
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/login"
            className="inline-flex bg-iron-900 text-white uppercase text-[11px] font-bold py-3 px-6 hover:bg-black transition-colors items-center justify-center tracking-widest"
          >
            RETURN TO LOGIN
          </Link>
        </div>
      </div>
    </div>
  );
}

