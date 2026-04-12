import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsChart = ({ registered, participated }) => {
  const data = [
    {
      name: 'Event Participation',
      Registered: registered,
      Participated: participated
    }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'var(--ink)',
          padding: '12px',
          border: '1px solid var(--gold)',
          borderRadius: '3px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: 'var(--white)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
          {payload.map((entry, index) => (
            <div key={index} style={{ color: entry.color, fontWeight: '600' }}>
              {entry.name}: {entry.value}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 350 }}>
      {registered > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barSize={100}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: 'currentColor', fontWeight: 500, fontFamily: 'var(--font-body)' }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
            <YAxis tick={{ fill: 'currentColor', fontFamily: 'var(--font-body)' }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }} />
            <Legend wrapperStyle={{ paddingTop: '20px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }} />
            <Bar dataKey="Registered" fill="var(--teal)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Participated" fill="var(--gold)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: '#a0aec0',
          fontSize: '1.1rem',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '2px dashed #e2e8f0'
        }}>
          No participation data available to chart
        </div>
      )}
    </div>
  );
};

export default AnalyticsChart;
