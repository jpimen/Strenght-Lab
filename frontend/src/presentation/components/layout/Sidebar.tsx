import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  BarChart3,
  SlidersHorizontal,
  UserSquare2,
  LogOut,
} from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'DASHBOARD' },
  { path: '/program-builder', icon: CalendarDays, label: 'PROGRAM BUILDER' },
  { path: '/athletes', icon: Users, label: 'ATHLETES' },
  { path: '/analytics', icon: BarChart3, label: 'ANALYTICS' },
  { path: '/inventory', icon: SlidersHorizontal, label: 'INVENTORY' },
];

export default function Sidebar() {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0 z-10 shadow-sm relative animate-slideRight">
      <div className="p-6 border-b border-gray-200 animate-fadeIn">
        <h1 className="text-xl font-bold tracking-tighter text-iron-900 leading-none">
          IRON ARCHITECT
        </h1>
        <p className="text-[10px] text-gray-400 font-mono mt-1 font-bold tracking-widest uppercase">
          V2.0.4-STABLE
        </p>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {navItems.map((item, idx) => (
            <li key={item.path} style={{ animationDelay: `${idx * 50}ms` }} className="animate-slideRight">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-4 px-6 py-4 text-xs font-bold tracking-wider relative',
                    'transition-all duration-200 ease-out',
                    'hover:shadow-sm hover:bg-gray-50 hover:translate-x-1',
                    'active:scale-95',
                    'focus:outline-none focus:ring-2 focus:ring-iron-red focus:ring-inset',
                    isActive 
                      ? 'text-iron-900 bg-gray-50 border-l-1.5 border-l-iron-red' 
                      : 'text-gray-500'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-iron-red animate-slideRight" />
                    )}
                    <item.icon 
                      className={clsx(
                        'w-5 h-5 transition-all duration-200',
                        isActive ? 'text-iron-red scale-110' : 'text-gray-400 group-hover:scale-105'
                      )} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className="uppercase">{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto p-6 border-t border-gray-200 animate-slideUp delay-300">
        <div className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 border border-gray-200 overflow-hidden transition-all duration-200 ease-out group-hover:border-iron-red group-hover:bg-red-50 group-hover:text-iron-red">
            <UserSquare2 className="w-6 h-6 transition-transform duration-300" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-iron-900 uppercase tracking-wider truncate">
              {user?.fullName ?? 'ACTIVE SESSION'}
            </div>
            <div className="text-[10px] text-gray-500 font-mono tracking-widest truncate uppercase">
              {user?.email ?? 'UNIDENTIFIED'}
            </div>
          </div>
        </div>

        <button
          onClick={async () => {
            await logOut();
            navigate('/login', { replace: true });
          }}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 bg-white text-[10px] font-mono font-bold tracking-widest uppercase text-gray-500 transition-all duration-200 ease-out hover:text-iron-red hover:border-iron-red hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-iron-red focus:ring-offset-2"
          type="button"
        >
          <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          LOG_OUT
        </button>
      </div>
    </div>
  );
}
