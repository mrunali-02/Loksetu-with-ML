import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import NaviBar from "./NaviBar";
import {
  Calendar, Pencil, Trash2, X, Plus, Tag,
  BarChart2, Loader2, FolderOpen, Clock, MapPin,
  Users, TrendingUp,
} from "lucide-react";
import "./ManageEvents.css";



/* ── Main component ── */
function ManageEvents() {
  const [events,      setEvents]      = useState([]);
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [date,        setDate]        = useState("");
  const [time,        setTime]        = useState("");
  const [venue,       setVenue]       = useState("");
  const [organizers,  setOrganizers]  = useState("");
  const [status,      setStatus]      = useState("Open");
  const [volunteerCap,setVolCap]      = useState("");
  const [poster,      setPoster]      = useState(null);
  const [editingId,   setEditingId]   = useState(null);
  const [message,     setMessage]     = useState("");
  const [msgType,     setMsgType]     = useState("success");
  const fileInputRef = useRef();

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/events");
      setEvents(res.data);
    } catch (err) { console.error(err); }
  };

  const resetForm = () => {
    setTitle(""); setDescription(""); setDate(""); setTime("");
    setVenue(""); setOrganizers(""); setStatus("Open");
    setVolCap(""); setPoster(null); setEditingId(null); setMessage("");
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("title",       title);
    fd.append("description", description);
    fd.append("date",        date);
    fd.append("time",        time);
    fd.append("venue",       venue);
    fd.append("organizers",  organizers);
    fd.append("status",      status);
    if (volunteerCap !== "") fd.append("volunteerCap", volunteerCap);
    if (poster)              fd.append("poster", poster);

    try {
      await axios({
        method: editingId ? "PUT" : "POST",
        url: `http://localhost:5000/api/events${editingId ? `/${editingId}` : ""}`,
        data: fd,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(editingId ? "Event updated successfully." : "Event added successfully.");
      setMsgType("success");
      resetForm();
      fetchEvents();
    } catch (err) {
      console.error(err);
      setMessage("Failed to save event.");
      setMsgType("error");
    }
  };

  const handleEdit = (ev) => {
    setTitle(ev.title); setDescription(ev.description);
    setDate(ev.date ? ev.date.substring(0, 10) : "");
    setTime(ev.time); setVenue(ev.venue); setOrganizers(ev.organizers);
    setStatus(ev.status); setVolCap(ev.volunteerCap || "");
    setEditingId(ev._id); setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/events/${id}`);
      fetchEvents();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="manage-events-page">
      <NaviBar />
      <div className="manage-events-container">

        {/* Heading */}
        <div className="page-eyebrow"><Calendar size={12} /> Admin · Events</div>
        <h2 className="manage-events-title">
          {editingId ? <>Edit <em>Event</em></> : <>Add <em>Event</em></>}
        </h2>

        {/* Form */}
        <form className="event-form" onSubmit={handleSubmit}>

          <div className="form-field">
            <label className="form-label">Event Title *</label>
            <input type="text" placeholder="e.g. Beach Clean-Up Drive"
              value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          <div className="form-field">
            <label className="form-label">Description *</label>
            <textarea placeholder="Describe the event…"
              value={description} onChange={e => setDescription(e.target.value)} required />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Date *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="form-field">
              <label className="form-label">Time *</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Venue *</label>
              <input type="text" placeholder="e.g. Airoli Beach"
                value={venue} onChange={e => setVenue(e.target.value)} required />
            </div>
            <div className="form-field">
              <label className="form-label">Organizers *</label>
              <input type="text" placeholder="e.g. Loksetu Team"
                value={organizers} onChange={e => setOrganizers(e.target.value)} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Max Volunteers</label>
              <input type="number" min="0" placeholder="Leave blank for unlimited"
                value={volunteerCap} onChange={e => setVolCap(e.target.value)} />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Poster Image</label>
            <input type="file" ref={fileInputRef} accept="image/*"
              onChange={e => setPoster(e.target.files[0])} />
          </div>

          <div className="form-actions">
            <button type="submit" className="add-event-btn">
              {editingId ? <><Pencil size={15} /> Update Event</> : <><Plus size={15} /> Add Event</>}
            </button>
            {editingId && (
              <button type="button" className="cancel-btn" onClick={resetForm}>
                <X size={13} /> Cancel
              </button>
            )}
          </div>
        </form>

        {message && <p className={`message ${msgType === "error" ? "error" : ""}`}>{message}</p>}

        {/* List */}
        <h3 className="existing-events-title">Existing Events</h3>

        {events.length === 0 ? (
          <div className="no-events">
            <div className="no-events-icon"><FolderOpen size={26} /></div>
            <p>No events yet — add your first above.</p>
          </div>
        ) : (
          <ul className="events-list">
            {events.map(ev => (
              <li key={ev._id} className="event-item">
                <div className="event-info">
                  <h4>{ev.title}</h4>
                  <p>{ev.description}</p>
                  <div className="event-details">
                      {ev.category && (
                        <span className="ai-tag">
                          <Tag size={10} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                          {ev.category}
                        </span>
                      )}
                    <span>{new Date(ev.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <span>{ev.time}</span>
                    <span>{ev.venue}</span>
                    <span>{ev.status}</span>
                    <span>Cap: {ev.volunteerCap || "N/A"}</span>
                  </div>

                </div>
                <div className="event-actions">
                  <button className="edit-event-btn" onClick={() => handleEdit(ev)}>
                    <Pencil size={12} /> Edit
                  </button>
                  <button className="delete-event-btn" onClick={() => handleDelete(ev._id)}>
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

      </div>
    </div>
  );
}

export default ManageEvents;