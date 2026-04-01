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
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-20 shadow-sm relative animate-slideDown">
      <div className="flex items-center gap-8 flex-1">
        
        {/* Context indicator */}
        <div className="flex items-center gap-3 animate-fadeIn delay-100">
          <div className={clsx(
              "w-6 h-6 flex items-center justify-center rounded-sm transition-all duration-300 ease-out",
              location.pathname === '/dashboard' ? "bg-iron-red text-white scale-110" : "bg-transparent text-gray-400"
            )}>
             {location.pathname === '/dashboard' ? (
                <div className="w-3 h-3 border-2 border-white rounded-sm animate-pop" />
             ) : (
                <div className="text-xs font-bold leading-none select-none">&gt;</div>
             )}
          </div>
          <span className="font-mono text-[10px] text-gray-500 font-bold tracking-widest uppercase truncate max-w-[300px] transition-colors duration-200">
            {getContextName()}
          </span>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-lg relative group animate-fadeIn delay-150">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-iron-red">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 bg-gray-50 text-gray-900 transition-all duration-200 ease-out focus:ring-2 focus:ring-iron-red focus:ring-offset-0 focus:border-iron-red focus:bg-white focus:shadow-sm sm:text-xs tracking-wider uppercase placeholder:text-gray-400 outline-none font-mono hover:border-gray-300 hover:shadow-sm"
            placeholder={
              location.pathname === '/athletes' ? "SEARCH_DATABASE..." : 
              location.pathname === '/program-builder' ? "CMD_SEARCH_DATABASE..." : 
              "QUERY ATHLETE DATA..."
            }
          />
        </div>
      </div>

      <div className="flex items-center gap-6 ml-4 text-gray-500">
        <button className="transition-all duration-200 ease-out hover:text-iron-900 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-iron-red focus:ring-offset-2 rounded-lg p-1 relative group">
          <Bell className="w-5 h-5 fill-current transition-transform duration-300 group-hover:rotate-12" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-iron-red rounded-full border-2 border-white animate-pulse" />
        </button>
        <button className="transition-all duration-200 ease-out hover:text-iron-900 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-iron-red focus:ring-offset-2 rounded-lg p-1">
          <Monitor className="w-5 h-5 transition-transform duration-300 hover:rotate-12" />
        </button>
        <button className="transition-all duration-200 ease-out hover:text-iron-900 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-iron-red focus:ring-offset-2 rounded-lg p-1">
          <UserCircle2 className="w-6 h-6 transition-transform duration-300 hover:rotate-12" />
        </button>
      </div>
    </header>
  );
}
