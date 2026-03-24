import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { name: 'Mon', athletes: 40, programs: 24 },
  { name: 'Tue', athletes: 55, programs: 38 },
  { name: 'Wed', athletes: 48, programs: 43 },
  { name: 'Thu', athletes: 65, programs: 53 },
  { name: 'Fri', athletes: 80, programs: 60 },
  { name: 'Sat', athletes: 75, programs: 55 },
  { name: 'Sun', athletes: 95, programs: 68 },
];

export default function ActivityChart() {
  return (
    <div className="panel h-[400px] flex flex-col animate-slide-up opacity-0 delay-300">
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-iron-900 text-sm tracking-widest font-bold">SYSTEM ACTIVITY</h3>
        <span className="badge badge-outline">LAST 7 DAYS</span>
      </div>
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111111',
                borderColor: '#111111',
                color: '#ffffff',
                fontSize: '12px',
                borderRadius: '4px',
              }}
              itemStyle={{ color: '#ffffff' }}
              cursor={{ stroke: '#e5e7eb', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Line 
              type="monotone" 
              dataKey="athletes" 
              stroke="#111111" 
              strokeWidth={3}
              activeDot={{ r: 6, fill: '#111111', stroke: '#ffffff', strokeWidth: 2 }} 
              animationDuration={1500}
            />
            <Line 
              type="monotone" 
              dataKey="programs" 
              stroke="#dc2626" 
              strokeWidth={3}
              activeDot={{ r: 6, fill: '#dc2626', stroke: '#ffffff', strokeWidth: 2 }} 
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
