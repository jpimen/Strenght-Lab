import { useState } from 'react';
import { Search, Plus, X, Clock, Wrench, Tag, FileText } from 'lucide-react';
import clsx from 'clsx';

/* ─── Types ─── */
interface EquipmentItem {
  assetId: string;
  type: string;
  brand: string;
  condition: 'EXCELLENT' | 'GOOD' | 'REPAIR';
  inspected: string;
  status: 'IN_USE' | 'AVAILABLE' | 'OFFLINE';
}

interface MaintenanceEntry {
  title: string;
  date: string;
  description: string;
}

interface AssetDetail {
  assetId: string;
  brand: string;
  serialNumber: string;
  procured: string;
  location: string;
  maintenanceLog: MaintenanceEntry[];
}

/* ─── Mock Data ─── */
const equipment: EquipmentItem[] = [
  { assetId: 'BAR-01', type: 'Power Bar (20kg)', brand: 'ELEIKO', condition: 'EXCELLENT', inspected: '2023-11-12', status: 'IN_USE' },
  { assetId: 'PL-45-08', type: 'Plate (45lb)', brand: 'ROGUE', condition: 'GOOD', inspected: '2023-10-05', status: 'AVAILABLE' },
  { assetId: 'RCK-02', type: 'Power Rack', brand: 'SBD', condition: 'REPAIR', inspected: '2023-08-15', status: 'OFFLINE' },
  { assetId: 'BAR-02', type: 'Deadlift Bar', brand: 'TEXAS', condition: 'GOOD', inspected: '2023-11-20', status: 'AVAILABLE' },
  { assetId: 'PL-25-12', type: 'Plate (25kg)', brand: 'ELEIKO', condition: 'EXCELLENT', inspected: '2023-11-12', status: 'IN_USE' },
  { assetId: 'RCK-05', type: 'Half Rack', brand: 'ROGUE', condition: 'GOOD', inspected: '2023-09-28', status: 'AVAILABLE' },
  { assetId: 'ACC-03', type: 'Belt (Lever)', brand: 'SBD', condition: 'EXCELLENT', inspected: '2023-11-01', status: 'IN_USE' },
];

const assetDetails: Record<string, AssetDetail> = {
  'BAR-01': {
    assetId: 'BAR-01',
    brand: 'ELEIKO',
    serialNumber: 'EK-20-8843-XP',
    procured: '2022-01-15',
    location: 'PLATFORM_04 / ZONE_A',
    maintenanceLog: [
      { title: 'KNURL_CLEANING', date: '2023-11-12', description: 'Standard wire brush application and oiling. Verified straightness and sleeve rotation. No issues found.' },
      { title: 'SLEEVE_LUBRICATION', date: '2023-06-01', description: 'Internal bearing lubrication. Rotation tested within tolerance. Used 3-in-1 oil per manufacturer spec.' },
    ],
  },
  'PL-45-08': {
    assetId: 'PL-45-08',
    brand: 'ROGUE',
    serialNumber: 'RG-45-1122-BK',
    procured: '2021-06-20',
    location: 'STORAGE_02 / ZONE_B',
    maintenanceLog: [
      { title: 'SURFACE_INSPECTION', date: '2023-10-05', description: 'Checked for chips and cracks. Rubber coating intact. Weight calibration verified within 10g tolerance.' },
    ],
  },
  'RCK-02': {
    assetId: 'RCK-02',
    brand: 'SBD',
    serialNumber: 'SB-RK-0042-HD',
    procured: '2020-09-10',
    location: 'PLATFORM_02 / ZONE_A',
    maintenanceLog: [
      { title: 'J-HOOK_REPLACEMENT', date: '2023-08-15', description: 'Left j-hook liner worn. Replaced with OEM part. Safety pins tested under 300kg load.' },
      { title: 'FRAME_WELD_CHECK', date: '2023-03-20', description: 'Annual weld inspection completed. Minor surface corrosion treated with rust converter.' },
    ],
  },
};

const tabs = ['ALL_EQUIPMENT', 'BARS', 'PLATES', 'RACKS', 'ACCESSORIES'];

const conditionColor: Record<string, string> = {
  EXCELLENT: 'text-green-600 font-bold',
  GOOD: 'text-emerald-500 font-bold',
  REPAIR: 'text-iron-red font-bold',
};

const statusBadge: Record<string, string> = {
  IN_USE: 'bg-gray-100 text-iron-900 border-gray-300',
  AVAILABLE: 'bg-green-50 text-green-700 border-green-300',
  OFFLINE: 'bg-red-50 text-iron-red border-red-300',
};

/* ─── Component ─── */
export default function InventoryView() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<string | null>('BAR-01');

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      item.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 0) return matchesSearch;
    const tabName = tabs[activeTab];
    if (tabName === 'BARS') return matchesSearch && item.assetId.startsWith('BAR');
    if (tabName === 'PLATES') return matchesSearch && item.assetId.startsWith('PL');
    if (tabName === 'RACKS') return matchesSearch && item.assetId.startsWith('RCK');
    if (tabName === 'ACCESSORIES') return matchesSearch && item.assetId.startsWith('ACC');
    return matchesSearch;
  });

  const detail = selectedAsset ? assetDetails[selectedAsset] : null;

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-2">
        <div>
          <h2 className="text-5xl font-black text-iron-900 tracking-tighter leading-[0.95] uppercase">
            EQUIPMENT<br />INVENTORY
          </h2>
          <p className="font-mono text-[10px] text-gray-500 font-bold uppercase tracking-[0.15em] mt-2">
            FACILITY_ASSET_LOG_V1.0
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="SEARCH ASSETS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 text-xs font-mono tracking-widest focus:outline-none focus:border-iron-900 w-64 placeholder:text-gray-400 bg-white"
            />
          </div>
          <button className="bg-iron-900 text-white uppercase text-[10px] font-mono font-bold py-2.5 px-4 hover:bg-iron-800 transition-colors flex items-center gap-2 tracking-widest">
            <Plus className="w-3.5 h-3.5" />
            ADD ASSET
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={clsx(
              'text-[11px] font-mono font-bold tracking-widest uppercase px-5 py-3 transition-colors relative',
              activeTab === i
                ? 'text-iron-900'
                : 'text-gray-400 hover:text-gray-600'
            )}
          >
            {tab}
            {activeTab === i && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-iron-900" />
            )}
          </button>
        ))}
      </div>

      {/* ── Main Content ── */}
      <div className="grid grid-cols-12 gap-6">
        {/* Table */}
        <div className={clsx(
          'panel p-0 overflow-hidden animate-slide-up opacity-0 transition-all',
          selectedAsset ? 'col-span-7' : 'col-span-12'
        )} style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="font-mono text-[10px] font-bold tracking-widest text-gray-500 py-3 px-5 uppercase">ASSET ID</th>
                  <th className="font-mono text-[10px] font-bold tracking-widest text-gray-500 py-3 px-5 uppercase">TYPE</th>
                  <th className="font-mono text-[10px] font-bold tracking-widest text-gray-500 py-3 px-5 uppercase">BRAND</th>
                  <th className="font-mono text-[10px] font-bold tracking-widest text-gray-500 py-3 px-5 uppercase">CONDITION</th>
                  <th className="font-mono text-[10px] font-bold tracking-widest text-gray-500 py-3 px-5 uppercase">INSPECTED</th>
                  <th className="font-mono text-[10px] font-bold tracking-widest text-gray-500 py-3 px-5 uppercase text-center">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipment.map((item) => (
                  <tr
                    key={item.assetId}
                    onClick={() => setSelectedAsset(item.assetId === selectedAsset ? null : item.assetId)}
                    className={clsx(
                      'border-b border-gray-100 cursor-pointer transition-colors',
                      selectedAsset === item.assetId ? 'bg-gray-50' : 'hover:bg-gray-50/50'
                    )}
                  >
                    <td className={clsx(
                      'py-4 px-5 font-mono text-xs font-bold tracking-wider',
                      item.condition === 'REPAIR' ? 'text-iron-red' : 'text-iron-900'
                    )}>
                      {item.assetId}
                    </td>
                    <td className="py-4 px-5 text-xs text-gray-700">{item.type}</td>
                    <td className="py-4 px-5 text-xs font-mono text-gray-600 tracking-wider">{item.brand}</td>
                    <td className={clsx('py-4 px-5 text-xs font-mono tracking-wider', conditionColor[item.condition])}>
                      {item.condition}
                    </td>
                    <td className="py-4 px-5 text-xs font-mono text-gray-500 tracking-wider">{item.inspected}</td>
                    <td className="py-4 px-5 text-center">
                      <span className={clsx(
                        'text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 border inline-block',
                        statusBadge[item.status]
                      )}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Asset Detail Panel */}
        {selectedAsset && detail && (
          <div
            className="col-span-5 panel flex flex-col gap-5"
            style={{ animation: 'slideInRight 0.35s cubic-bezier(0.16,1,0.3,1) forwards' }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black tracking-tighter text-iron-900 uppercase">ASSET DETAIL</h3>
                <p className="text-[10px] font-mono text-gray-400 tracking-widest mt-0.5">
                  {detail.assetId} / {detail.brand}
                </p>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-gray-400 hover:text-iron-900 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Equipment Image Placeholder */}
            <div className="w-full h-40 bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
              <div className="text-center">
                <Wrench className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <span className="text-[9px] font-mono text-gray-400 tracking-widest">ASSET_IMG_PENDING</span>
              </div>
            </div>

            {/* Detail Grid */}
            <div className="grid grid-cols-2 gap-px bg-gray-200 border border-gray-200">
              <div className="bg-white p-3">
                <div className="text-[9px] font-mono text-gray-400 tracking-widest mb-1">SERIAL NUMBER</div>
                <div className="text-sm font-black tracking-tight text-iron-900">{detail.serialNumber}</div>
              </div>
              <div className="bg-white p-3">
                <div className="text-[9px] font-mono text-gray-400 tracking-widest mb-1">PROCURED</div>
                <div className="text-sm font-black tracking-tight text-iron-900">{detail.procured}</div>
              </div>
              <div className="bg-white p-3 col-span-2">
                <div className="text-[9px] font-mono text-gray-400 tracking-widest mb-1">LOCATION</div>
                <div className="text-sm font-black tracking-tight text-iron-900">{detail.location}</div>
              </div>
            </div>

            {/* Maintenance Log */}
            <div>
              <h4 className="text-xs font-black tracking-widest text-iron-900 uppercase flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4" />
                MAINTENANCE_LOG
              </h4>
              <div className="space-y-4">
                {detail.maintenanceLog.map((entry, i) => (
                  <div key={i} className="border-l-2 border-gray-200 pl-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-mono font-bold tracking-widest text-iron-900">{entry.title}</span>
                      <span className="text-[10px] font-mono text-gray-400 tracking-widest">{entry.date}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">{entry.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto pt-4 flex flex-col gap-2">
              <button className="bg-iron-red text-white uppercase text-[10px] font-mono font-bold py-3 px-5 hover:bg-red-700 transition-colors flex items-center justify-center gap-2 tracking-widest w-full">
                <Tag className="w-3.5 h-3.5" />
                GEN_LABEL
              </button>
              <button className="bg-white text-iron-900 border border-gray-300 uppercase text-[10px] font-mono font-bold py-3 px-5 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 tracking-widest w-full">
                <FileText className="w-3.5 h-3.5" />
                SERVICE_REQ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
