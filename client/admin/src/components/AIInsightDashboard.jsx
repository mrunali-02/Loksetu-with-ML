import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle, Info, Sparkles } from 'lucide-react';
import KpiCard from './KpiCard';
import './AIInsightDashboard.css';

const ExpandableEventCard = ({ event, aiSummary }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Calculate attendance
  const participants = event.participants ? event.participants.filter(p => p.role !== 'Volunteer') : [];
  const volunteers = event.participants ? event.participants.filter(p => p.role === 'Volunteer') : [];
  const registered = participants.length > 0 ? participants.length : (event.registered || 0);
  const attended = participants.length > 0 ? participants.filter(p => p.attended).length : (event.actual_participants || 0);
  const activeVolunteers = volunteers.length > 0 ? volunteers.length : (event.volunteerCap || 0);
  const attendanceRate = registered > 0 ? (attended / registered) * 100 : 0;
  const retentionRate = attendanceRate;
  
  const status = retentionRate >= 85 ? 'green' : retentionRate >= 75 ? 'yellow' : 'red';

  return (
    <div className={`report-event-card expandable ${status}`} onClick={() => setExpanded(!expanded)}>
      <div className="card-header">
        <div className="card-title">
          <h5>{event.title}</h5>
          <div className={`status-badge ${status}`}>
            {status === 'green' ? <CheckCircle size={14}/> : status === 'yellow' ? <Info size={14}/> : <AlertCircle size={14}/>}
            {attendanceRate.toFixed(1)}% Attendance
          </div>
        </div>
        <button className="expand-btn">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      
      {expanded && (
        <div className="card-expanded-content" onClick={(e) => e.stopPropagation()}>
          <div className="mini-stats-grid">
            <div className="ms-box"><label>Registered</label><br/><span>{registered}</span></div>
            <div className="ms-box"><label>Attended</label><br/><span>{attended}</span></div>
            <div className="ms-box"><label>Retention Rate</label><br/><span>{retentionRate.toFixed(1)}%</span></div>
          </div>
          <div className="event-meta">
            <div><strong>Location:</strong> {event.venue || 'N/A'}</div>
            <div><strong>Organizer:</strong> {event.organizers || 'N/A'}</div>
            <div style={{marginTop: 8}}><strong>Volunteers Active:</strong> {activeVolunteers}</div>
          </div>
          {aiSummary ? (
            <div className="ai-summary-box">
               <div className="ai-heading-row">
                 <div className="ai-heading-chip"><Sparkles size={12}/> AI STRATEGIC INSIGHT</div>
               </div>
               <p className="ai-text">{aiSummary}</p>
            </div>
          ) : (
            <div className="ai-summary-box empty">
               <div className="ai-empty-state-content">
                 <Sparkles size={28} className="empty-sparkle" />
                 <p className="empty-text">No specialized predictive insights are available for this event yet.</p>
                 <span className="empty-subtext">Insights are generated once registration and participation cycles are complete.</span>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function AIInsightDashboard({ reportData, eventsData, globalKpi }) {
  
  // Prepare chart data
  const chartData = eventsData.map(ev => {
    const parts = ev.participants ? ev.participants.filter(p => p.role !== 'Volunteer') : [];
    const registered = parts.length > 0 ? parts.length : (ev.registered || 0);
    const attended = parts.length > 0 ? parts.filter(p => p.attended).length : (ev.actual_participants || 0);
    return {
      name: ev.title,
      Registered: registered,
      Attended: attended
    };
  });

  return (
    <div className="ai-insight-dashboard">
       {/* KPI cards */}
       <div className="stats-grid-analytics" style={{ marginBottom: 30 }}>
         <KpiCard title="Total Impact" value={globalKpi?.totalParticipants || 0} type="impact" />
         <KpiCard title="Total Events" value={globalKpi?.totalEvents || 0} type="events" />
         <KpiCard title="Avg Attendance" value={globalKpi?.avgAttendanceRate || 0} suffix="%" type="attendance" />
         <KpiCard title="Avg Retention" value={globalKpi?.avgRetentionRate || 0} suffix="%" type="retention" />
       </div>

       {/* Recommendations Panel */}
       <div className="insights-panel">
         <h4><Sparkles size={18} className="sparkle-icon"/> AI Strategic Insights</h4>
         <div className="insight-blocks">
           <div className="insight-block global">
             <div className="block-title">Key Global Overview</div>
             <p>{reportData.globalSummary}</p>
           </div>
           <div className="insight-block recommendation">
             <div className="block-title">Recommendations & Alerts</div>
             <ul>
               {(reportData.recommendations || '').split('\\n').map((line, idx) => {
                 let txt = line.replace(/^[-*]\s*/, '').trim();
                 if (!txt) return null;
                 return <li key={idx}>{txt}</li>
               })}
             </ul>
           </div>
         </div>
       </div>

       {/* Chart */}
       <div className="chart-wrapper" style={{ marginTop: 40 }}>
         <div className="section-label-thin">Event Participation Comparison</div>
         <div style={{ width: '100%', height: 350, marginTop: 20 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 12, fontFamily: 'var(--font-body)' }} axisLine={{ stroke: '#CBD5E1' }} />
              <YAxis tick={{ fill: 'currentColor', fontFamily: 'var(--font-body)' }} axisLine={{ stroke: '#CBD5E1' }} allowDecimals={false} />
              <Tooltip cursor={{ fill: 'rgba(34, 197, 94, 0.04)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-accent)', backgroundColor: 'var(--bg-card)' }} />
              <Legend wrapperStyle={{ paddingTop: '20px', fontFamily: 'var(--font-mono)' }} />
              <Bar dataKey="Registered" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Attended" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
         </div>
       </div>

       {/* Event Cards */}
       <div className="section-label-thin" style={{ marginTop: 50, marginBottom: 20 }}>Event Deep-dive List</div>
       <div className="expandable-cards-list">
         {eventsData.map(ev => {
            const aiSummary = (reportData.eventReports || []).find(r => r.eventName === ev.title)?.summary || null;
            return <ExpandableEventCard key={ev._id} event={ev} aiSummary={aiSummary} />;
         })}
       </div>
    </div>
  );
}
