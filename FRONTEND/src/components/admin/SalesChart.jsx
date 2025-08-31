import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatCurrency = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{`Pukul: ${label}`}</p>
        <p className="text-sm text-blue-500">{`Pendapatan Hari Ini: ${formatCurrency(payload[0].value)}`}</p>
        <p className="text-sm text-gray-500">{`Pendapatan Kemarin: ${formatCurrency(payload[1].value)}`}</p>
      </div>
    );
  }
  return null;
};

function SalesChart({ data }) {
  const todayTotal = data.length > 0 ? data[data.length - 1]['Hari Ini'] : 0;
  const yesterdayTotal = data.length > 0 ? data[data.length - 1]['Kemarin'] : 0;
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
      {/* Bagian Ringkasan */}
      <div className="flex gap-12 mb-6">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Hari Ini</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{formatCurrency(todayTotal)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Data diperbarui pukul {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Kemarin</p>
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 tabular-nums">{formatCurrency(yesterdayTotal)}</p>
        </div>
      </div>
      
      {/* Bagian Grafik */}
      <div className="h-72 w-full text-gray-500 dark:text-white">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
            <XAxis dataKey="hour" stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} className='dark:text-white' />
            <YAxis stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp${value/1000000} Jt`} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#888', strokeWidth: 1, strokeDasharray: '3 3' }} />
            <defs>
              <linearGradient id="colorToday" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="Kemarin" stroke="#9ca3af" fill="transparent" strokeDasharray="4 4" strokeWidth={2} />
            <Area type="monotone" dataKey="Hari Ini" stroke="#3b82f6" fill="url(#colorToday)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SalesChart;

