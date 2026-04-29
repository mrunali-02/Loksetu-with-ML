import React, { useState, useMemo } from 'react';

const ParticipantsTable = ({ participants, eventName = 'Event' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAttended, setFilterAttended] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Search and filter logic
  const filteredParticipants = useMemo(() => {
    return participants.filter(p => {
      const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (p.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterAttended === 'all' 
                            ? true 
                            : filterAttended === 'attended' 
                              ? p.attended === true 
                              : p.attended === false;
                              
      return matchesSearch && matchesFilter;
    });
  }, [participants, searchTerm, filterAttended]);

  // Reset pagination when filters change
  useMemo(() => setCurrentPage(1), [searchTerm, filterAttended]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredParticipants.length / itemsPerPage));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredParticipants.slice(start, start + itemsPerPage);
  }, [filteredParticipants, currentPage]);

  const handleExportCSV = () => {
    if (filteredParticipants.length === 0) return;
    
    const headers = ['Name', 'Email', 'Attended', 'Role'];
    const csvRows = [headers.join(',')];

    for (const p of filteredParticipants) {
      const values = [
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${(p.email || '').replace(/"/g, '""')}"`,
        p.attended ? 'Yes' : 'No',
        `"${(p.role || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute("href", url);
    link.setAttribute("download", `roster_${safeName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!participants || participants.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        No participants data available. Upload an Excel sheet or select an event with data.
      </div>
    );
  }

  return (
    <div>
      <div className="table-controls">
        <input 
          type="text" 
          placeholder="Search by name or email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select 
          value={filterAttended} 
          onChange={(e) => setFilterAttended(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Participants</option>
          <option value="attended">Attended</option>
          <option value="not_attended">Did Not Attend</option>
        </select>
        <button onClick={handleExportCSV} className="export-btn">
          Export CSV 📥
        </button>
      </div>

      <div className="table-responsive">
        <table className="participants-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((p, index) => (
                <tr key={p._id || index}>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td style={{ color: '#4b5563' }}>{p.email}</td>
                  <td>
                    <span className={`status-badge ${p.attended ? 'attended' : 'absent'}`}>
                      {p.attended ? 'Attended' : 'Absent'}
                    </span>
                  </td>
                  <td>{p.role || 'Participant'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                  No matches found for your search/filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button 
          className="page-btn" 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="page-info">
          Page {currentPage} of {totalPages}
        </span>
        <button 
          className="page-btn" 
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ParticipantsTable;
