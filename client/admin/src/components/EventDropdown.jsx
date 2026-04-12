import React from 'react';

const EventDropdown = ({ events, selectedEventId, onSelect }) => {
  return (
    <div className="event-dropdown-wrapper">
      <label htmlFor="event-select">Select Event</label>
      <div className="select-container">
        <select 
          id="event-select" 
          value={selectedEventId} 
          onChange={(e) => onSelect(e.target.value)}
          className="event-select"
        >
          <option value="">-- Choose an Event --</option>
          {events.map((event) => (
            <option key={event._id} value={event._id}>
              {event.title || event.name}
            </option>
          ))}
        </select>
        <div className="select-arrow">▼</div>
      </div>
    </div>
  );
};

export default EventDropdown;
