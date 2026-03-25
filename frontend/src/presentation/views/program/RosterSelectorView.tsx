import { Search, ChevronDown, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRosterViewModel } from '../../viewmodels/useRosterViewModel';
import AthleteCard from './components/AthleteCard';

export default function RosterSelectorView() {
  const { athletes, isLoading, searchQuery, setSearchQuery, deleteProgram } = useRosterViewModel();
  const navigate = useNavigate();

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col bg-[#f2f2f2]">
      {/* Header */}
      <div className="p-8 bg-white border-b border-gray-200">
        <h1 className="text-4xl font-black text-iron-900 tracking-tighter mb-2">
          ROSTER_SELECTOR
        </h1>
        <div className="text-[10px] font-mono font-bold tracking-[0.3em] text-gray-500 uppercase">
          DATABASE_VIEW: ACTIVE_ATHLETES
        </div>
      </div>

      {/* Search & Filters */}
      <div className="px-8 mt-8">
        <div className="flex bg-white border border-gray-200 shadow-sm h-14">
          <div className="flex-1 flex items-center px-6 gap-4 border-r border-gray-200">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="SEARCH_ATHLETE_NAME..."
              className="w-full bg-transparent border-none outline-none font-mono text-[11px] font-bold tracking-widest text-iron-900 placeholder:text-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-64 flex items-center justify-between px-6 border-r border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono font-bold text-gray-400 tracking-widest uppercase">CLASS:</span>
              <span className="text-[11px] font-mono font-bold text-iron-900 tracking-widest uppercase">ALL</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          <div className="w-64 flex items-center justify-between px-6 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono font-bold text-gray-400 tracking-widest uppercase">GOAL:</span>
              <span className="text-[11px] font-mono font-bold text-iron-900 tracking-widest uppercase">ALL</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          <button
            onClick={() => navigate('/program-builder/editor/new')}
            className="min-w-[180px] flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-mono font-bold tracking-widest uppercase px-4"
          >
            <Plus className="w-4 h-4" /> Create New Program
          </button>
        </div>
      </div>

      {/* Roster List */}
      <div className="flex-1 overflow-auto p-8 flex flex-col gap-4">
        {isLoading ? (
          <div className="text-iron-red font-mono font-bold tracking-widest animate-pulse">
            LOADING_ROSTER_DATA...
          </div>
        ) : (
          <>
            {athletes.map(athlete => (
              <AthleteCard key={athlete.id} athlete={athlete} onDeleteProgram={deleteProgram} />
            ))}
            
            {athletes.length === 0 && (
              <div className="text-gray-400 font-mono text-sm tracking-widest py-12 text-center">
                NO_ATHLETES_FOUND_MATCHING_CRITERIA
              </div>
            )}

            {/* Pagination / Load More */}
            <div className="mt-8 flex justify-between items-center text-[10px] font-mono font-bold tracking-widest text-gray-400">
              <div>SHOWING {athletes.length} OF 124 ENTRIES</div>
              <button className="bg-white border border-gray-200 px-8 py-4 hover:bg-gray-50 transition-colors text-iron-900 uppercase">
                LOAD_BATCH_NEXT_25
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
