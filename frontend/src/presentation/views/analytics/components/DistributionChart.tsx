import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const data = [
  { name: 'Hypertrophy', value: 400 },
  { name: 'Strength', value: 300 },
  { name: 'Endurance', value: 300 },
  { name: 'Powerlifting', value: 200 },
];

const COLORS = ['#111111', '#dc2626', '#4b5563', '#9ca3af'];

export default function DistributionChart() {
  return (
    <div className="panel h-[400px] flex flex-col animate-slide-up opacity-0 delay-400">
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-iron-900 text-sm tracking-widest font-bold">PROGRAM DISTRIBUTION</h3>
      </div>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
              animationBegin={200}
              animationDuration={1500}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: '#111111',
                borderColor: '#111111',
                color: '#ffffff',
                fontSize: '12px',
                borderRadius: '4px',
              }}
              itemStyle={{ color: '#ffffff' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              formatter={(value) => <span className="text-xs font-bold text-gray-700 tracking-wider ml-1">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
