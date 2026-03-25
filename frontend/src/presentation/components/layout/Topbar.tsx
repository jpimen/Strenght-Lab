import { Search, Bell, Monitor, UserCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { useLocation } from 'react-router-dom';

export default function Topbar() {
  const location = useLocation();
  
  // Format pathname like "ROOT@MECHANICAL-ATHLETE: DASHBOARD"
  const getContextName = () => {
    switch (location.pathname) {
      case '/dashboard': return 'ROOT@MECHANICAL-ATHLETE: DASHBOARD';
      case '/athletes': return 'MECHANICAL_ATHLETE';
      case '/program-builder': return 'MECHANICAL_ATHLETE';
      default: return 'SYSTEM_CONTEXT';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-20 shadow-sm relative">
      <div className="flex items-center gap-8 flex-1">
        
        {/* Context indicator */}
        <div className="flex items-center gap-3">
          <div className={clsx(
              "w-6 h-6 flex items-center justify-center rounded-sm",
              location.pathname === '/dashboard' ? "bg-iron-red text-white" : "bg-transparent text-gray-400"
            )}>
             {location.pathname === '/dashboard' ? (
                <div className="w-3 h-3 border-2 border-white rounded-sm" />
             ) : (
                <div className="text-xs font-bold leading-none select-none">&gt;</div>
             )}
          </div>
          <span className="font-mono text-[10px] text-gray-500 font-bold tracking-widest uppercase truncate max-w-[300px]">
            {getContextName()}
          </span>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-lg relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 bg-gray-50 text-gray-900 focus:ring-1 focus:ring-iron-red focus:border-iron-red sm:text-xs tracking-wider uppercase placeholder:text-gray-400 outline-none font-mono"
            placeholder={
              location.pathname === '/athletes' ? "SEARCH_DATABASE..." : 
              location.pathname === '/program-builder' ? "CMD_SEARCH_DATABASE..." : 
              "QUERY ATHLETE DATA..."
            }
          />
        </div>
      </div>

      <div className="flex items-center gap-6 ml-4 text-gray-500">
        <button className="hover:text-iron-900 transition-colors relative">
          <Bell className="w-5 h-5 fill-current" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-iron-red rounded-full border-2 border-white" />
        </button>
        <button className="hover:text-iron-900 transition-colors">
          <Monitor className="w-5 h-5" />
        </button>
        <button className="hover:text-iron-900 transition-colors">
          <UserCircle2 className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
