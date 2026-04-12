import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventDropdown from '../components/EventDropdown';
import AnalyticsChart from '../components/AnalyticsChart';
import ParticipantsTable from '../components/ParticipantsTable';
import NaviBar from '../NaviBar';
import { toast } from 'react-toastify';
import { BarChart2, Users, Calendar, ArrowUpRight } from 'lucide-react';
import './AdminAnalytics.css';

const API_BASE_URL = 'http://localhost:5000/api';

const AdminAnalytics = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchAnalytics(selectedEventId);
    } else {
      setAnalyticsData(null);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/events`);
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to load events');
    }
  };

  const fetchAnalytics = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics/event/${id}`);
      setAnalyticsData(response.data);
    } catch (error) {
      toast.error('Failed to load event analytics');
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!selectedEventId) {
      toast.warning('Please select an event first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/events/${selectedEventId}/upload-excel`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      toast.success(response.data.message || 'Participants uploaded successfully');
      fetchAnalytics(selectedEventId);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload participants');
    } finally {
      setUploading(false);
      event.target.value = null;
    }
  };

  return (
    <div className="admin-analytics-page">
      <NaviBar />
      <div className="admin-analytics-container">
        
        {/* Editorial Header */}
        <div className="page-eyebrow"><BarChart2 size={12} /> Admin · Analytics</div>
        <h2 className="admin-analytics-title">
          Event <em>Analytics</em>
        </h2>
        <p className="admin-analytics-subtitle">
          Insights, participation metrics, and cross-event data management.
        </p>

        <div className="analytics-controls">
          <EventDropdown 
            events={events} 
            selectedEventId={selectedEventId} 
            onSelect={setSelectedEventId} 
          />
          
          {selectedEventId && (
            <div className="upload-section">
              <label className={`ghost-btn-primary ${uploading ? 'uploading' : ''}`}>
                {uploading ? 'Uploading...' : 'Upload Excel Sheet'}
                <input 
                  type="file" 
                  accept=".xlsx, .xls" 
                  onChange={handleFileUpload} 
                  disabled={uploading}
                  hidden
                />
              </label>
            </div>
          )}
        </div>

        {loading ? (
          <div className="analytics-loading">
            <div className="spinner-editorial"></div>
            <p>Gathering metrics...</p>
          </div>
        ) : analyticsData ? (
          <div className="analytics-content">
            
            {/* Native Editorial Event Info Panel */}
            <div className="event-info-section">
              <h3>{analyticsData.eventName}</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Date</span>
                  <span className="info-value">
                    {analyticsData.date ? new Date(analyticsData.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Location</span>
                  <span className="info-value">{analyticsData.location || 'Pending Venue'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Organizer</span>
                  <span className="info-value">{analyticsData.organizer || 'Loksetu Team'}</span>
                </div>
              </div>
              
              {analyticsData.registered > 0 && (analyticsData.participated / analyticsData.registered) < 0.3 && (
                <div className="warning-banner critical">
                  <strong>Warning:</strong> Low attendance detected. Re-engagement workflows recommended.
                </div>
              )}
              {analyticsData.registered > 0 && (analyticsData.totalVolunteers / analyticsData.registered) < 0.1 && (
                <div className="warning-banner attention">
                  <strong>Notice:</strong> Low volunteer ratio. Additional recruitment advised.
                </div>
              )}
            </div>

            {/* Editorial Stats Grid */}
            <div className="section-label-thin">Performance Metrics</div>
            <div className="stats-grid-analytics">
              {[
                { label: 'Registered', val: analyticsData.registered, cls: 'blue' },
                { label: 'Participated', val: analyticsData.participated, cls: 'green' },
                { label: 'Volunteers', val: analyticsData.totalVolunteers, cls: 'amber' },
                { label: 'Attendance', val: analyticsData.registered > 0 ? `${Math.round((analyticsData.participated / analyticsData.registered) * 100)}%` : '0%', cls: 'orange' }
              ].map((m, i) => (
                <div key={i} className="stat-card">
                  <div className={`stat-icon ${m.cls}`}><BarChart2 size={20} /></div>
                  <div className="stat-value">{m.val}</div>
                  <div className="stat-label">{m.label}</div>
                  <div className="stat-link-fake">Metric Overview <ArrowUpRight size={13} /></div>
                </div>
              ))}
            </div>

            {/* Premium Chart */}
            <div className="chart-wrapper">
              <div className="section-label-thin">Participation Overview</div>
              <AnalyticsChart 
                registered={analyticsData.registered} 
                participated={analyticsData.participated} 
              />
            </div>

            {/* Roster Sections */}
            <div className="participants-section">
              <div className="section-label-thin">🤝 Volunteer Team</div>
              <ParticipantsTable participants={analyticsData.volunteers || []} />
            </div>

            <div className="participants-section">
              <div className="section-label-thin">🎟️ Participant Roster</div>
              <ParticipantsTable participants={analyticsData.participants || []} />
            </div>

          </div>
        ) : (
          <div className="analytics-empty">
            <BarChart2 size={40} className="empty-icon-ghost" />
            <p>Select an event from the dropdown to load predictive indices and participant rosters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
