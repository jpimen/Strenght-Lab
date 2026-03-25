import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';

const navItems = [
  { to: '/program-builder', label: 'TRAINING' },
  { to: '/analytics', label: 'METRICS' },
  { to: '/dashboard', label: 'ENGINE' },
];

function HeaderLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          'text-[10px] font-bold tracking-widest uppercase font-mono transition-colors px-2 py-1',
          isActive ? 'text-iron-900' : 'text-gray-400 hover:text-iron-900'
        )
      }
    >
      {label}
    </NavLink>
  );
}

export default function AuthLayout() {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="h-14 border-b border-gray-200 flex items-center justify-between px-6">
        <div className="font-bold tracking-tight text-iron-900 uppercase select-none">
          IRON_LOG
        </div>

        <nav className="flex items-center gap-3">
          {navItems.map((item) => (
            <HeaderLink key={item.to} to={item.to} label={item.label} />
          ))}

          <div className="w-px h-5 bg-gray-200 mx-2" />

          <HeaderLink to="/login" label="LOGIN" />

          <NavLink
            to="/signup"
            className={({ isActive }) =>
              clsx(
                'text-[10px] font-bold tracking-widest uppercase font-mono px-3 py-1 border transition-colors',
                isActive
                  ? 'bg-iron-900 text-white border-iron-900'
                  : 'bg-white text-iron-900 border-gray-200 hover:border-iron-900'
              )
            }
          >
            SIGNUP
          </NavLink>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <Outlet />
      </main>

      <footer className="h-12 border-t border-gray-200 flex items-center justify-between px-6">
        <div className="text-[10px] font-mono text-gray-400 tracking-widest uppercase">
          © {year} IRON_LOG SYSTEMS.
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono tracking-widest uppercase">
          <NavLink to="/terms" className="text-gray-400 hover:text-iron-900 transition-colors">
            TERMS
          </NavLink>
          <NavLink to="/privacy" className="text-gray-400 hover:text-iron-900 transition-colors">
            PRIVACY
          </NavLink>
          <NavLink to="/support" className="text-gray-400 hover:text-iron-900 transition-colors">
            SUPPORT
          </NavLink>
        </div>
      </footer>
    </div>
  );
}

