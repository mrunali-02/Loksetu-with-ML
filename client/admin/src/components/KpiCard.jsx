import React, { useState, useEffect } from 'react';
import { Calendar, Users, TrendingUp, TrendingDown, ArrowUpRight, Leaf, BarChart2 } from 'lucide-react';

const icons = {
  events: <Calendar size={20} />,
  impact: <Leaf size={20} />,
  volunteers: <Users size={20} />,
  attendance: <BarChart2 size={20} />,
  retention: <TrendingUp size={20} />
};

export default function KpiCard({ title, value, type, suffix = '' }) {
  // Optional animated count-up logic could be handled globally, but simple display is required.
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(value) || 0;
    if (end === 0) return;
    const duration = 1000;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.ceil(start * 10) / 10);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  const colorClass = 
    type === 'attendance' && parseFloat(value) >= 70 ? 'green' :
      type === 'attendance' && parseFloat(value) < 70 ? 'orange' :
        type === 'retention' && parseFloat(value) >= 80 ? 'green' :
          type === 'retention' && parseFloat(value) < 80 ? 'red' :
            type === 'impact' ? 'green' : type === 'events' ? 'blue' : 'amber';

  return (
    <div className="stat-card" title={`Metric: ${title}`}>
      <div className={`stat-icon ${colorClass}`}>
        {icons[type] || <Calendar size={20} />}
      </div>
      <div className="stat-value">
        {type === 'events' || type === 'impact' || type === 'volunteers' ? Math.floor(displayValue) : displayValue}{suffix && <span className="stat-suffix">{suffix}</span>}
      </div>
      <div className="stat-label">{title}</div>
      <div className="stat-link-fake">
        Global Overview <ArrowUpRight size={13} />
      </div>
    </div>
  );
}
