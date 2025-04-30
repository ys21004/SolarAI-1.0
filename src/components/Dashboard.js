import React from 'react';

const Dashboard = ({ panels, maintenanceHistory = [] }) => {
  // Calculate summary statistics
  const totalPanels = panels ? panels.length : 0;
  const operationalPanels = panels ? panels.filter(panel => panel.status === 'Operational').length : 0;
  const maintenanceRequired = panels ? panels.filter(panel => panel.status === 'Maintenance Required').length : 0;
  
  return (
    <div className="dashboard">
      {/* Panel Summary */}
      <section className="panel-summary">
        <h2>Solar Panel Summary</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Panels</h3>
            <p className="summary-value">{totalPanels}</p>
          </div>
          <div className="summary-card">
            <h3>Operational</h3>
            <p className="summary-value">{operationalPanels}</p>
          </div>
          <div className="summary-card">
            <h3>Maintenance Required</h3>
            <p className="summary-value">{maintenanceRequired}</p>
          </div>
        </div>
      </section>
      
      {/* Panel List */}
      <section className="panel-list">
        <h2>Installed Panels</h2>
        {!panels || panels.length === 0 ? (
          <p className="no-data">No panels found in database.</p>
        ) : (
          <div className="panels-grid">
            {panels.map((panel) => (
              <div key={panel.id} className={`panel-card ${panel.status.replace(/\s+/g, '-').toLowerCase()}`}>
                <h3>{panel.name}</h3>
                <div className="panel-details">
                  <p><strong>Location:</strong> {panel.location}</p>
                  <p><strong>Status:</strong> {panel.status}</p>
                  <p><strong>Last Maintenance:</strong> {new Date(panel.lastMaintenance).toLocaleDateString()}</p>
                  <p><strong>Avg Power:</strong> {panel.power_output && panel.power_output.length > 0 ? 
                    Math.round(panel.power_output.reduce((a, b) => a + b, 0) / panel.power_output.length) + 'W' : 
                    'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* Maintenance History */}
      <section className="maintenance-history-section">
      <h2>Recent Inspections</h2>
      <div className="maintenance-history">
        {maintenanceHistory.length === 0 ? (
            <p className="no-data">No maintenance records found.</p>
        ) : (
          <ul>
            {maintenanceHistory.map((record, index) => (
              <li key={index} className="maintenance-record">
                <div className="record-header">
                  <span className="date">{record.date}</span>
                  <span className={`status ${record.status.toLowerCase()}`}>
                    {record.status}
                  </span>
                </div>
                <div className="record-details">
                  <span>Panel ID: {record.panelId}</span>
                  <span>Technician: {record.technician}</span>
                  <span>Type: {record.type}</span>
                  {record.dc_power && <span>DC Power: {record.dc_power}W</span>}
                  {record.ac_power && <span>AC Power: {record.ac_power}W</span>}
                  {record.ambient_temperature && (
                    <span>Ambient Temp: {record.ambient_temperature}°C</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      </section>
    </div>
  );
};

export default Dashboard; 