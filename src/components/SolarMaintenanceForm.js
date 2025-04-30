import React, { useState } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { apiService } from '../services/apiService';

const SolarMaintenanceForm = ({ addMaintenanceRecord, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    panelId: '',
    technicianName: '',
    installationDate: '',
    lastMaintenanceDate: '',
    dc_power: '',
    ac_power: '',
    ambient_temperature: '',
    module_temperature: '',
    irradiation: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare the record data
      const recordData = {
        ...formData,
        timestamp: new Date().toISOString(),
        status: 'pending',
        efficiency: calculateEfficiency(formData),
        recommendations: generateRecommendations(formData),
        date: new Date().toISOString().split('T')[0] // Add date field for history display
      };

      // Save to Firebase
      const docRef = await addDoc(collection(db, 'maintenance_records'), {
        ...recordData,
        timestamp: serverTimestamp()
      });

      // Save to backend API
      await apiService.createMaintenanceRecord(recordData);

      console.log('Document written with ID: ', docRef.id);

      // Add the new record to the local state
      addMaintenanceRecord({
        id: docRef.id,
        ...recordData
      });

      // Reset form
      setFormData({
        panelId: '',
        technicianName: '',
        installationDate: '',
        lastMaintenanceDate: '',
        dc_power: '',
        ac_power: '',
        ambient_temperature: '',
        module_temperature: '',
        irradiation: '',
        description: '',
      });

      // Call the success callback
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

    } catch (error) {
      console.error('Error submitting maintenance check:', error);
      setError('Failed to submit maintenance check. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateEfficiency = (data) => {
    // Simple efficiency calculation based on power values
    if (data.dc_power && data.ac_power) {
      return ((parseFloat(data.ac_power) / parseFloat(data.dc_power)) * 100).toFixed(2);
    }
    return 'N/A';
  };

  const generateRecommendations = (data) => {
    const recommendations = [];
    
    // Check temperature differences
    if (data.module_temperature && data.ambient_temperature) {
      const tempDiff = parseFloat(data.module_temperature) - parseFloat(data.ambient_temperature);
      if (tempDiff > 25) {
        recommendations.push('High temperature difference detected. Check for proper ventilation.');
      }
    }

    // Check power efficiency
    const efficiency = calculateEfficiency(data);
    if (efficiency !== 'N/A' && parseFloat(efficiency) < 90) {
      recommendations.push(`Low efficiency detected (${efficiency}%). Check for potential issues.`);
    }

    // Check irradiation levels
    if (data.irradiation) {
      const irradiation = parseFloat(data.irradiation);
      if (irradiation < 500) {
        recommendations.push('Low irradiation levels detected. Check for shading or weather conditions.');
      }
    }

    return recommendations;
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="maintenance-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="panelId">Panel ID</label>
        <input
          type="text"
          id="panelId"
          value={formData.panelId}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="technicianName">Technician Name</label>
        <input
          type="text"
          id="technicianName"
          value={formData.technicianName}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="installationDate">Installation Date</label>
        <input
          type="date"
          id="installationDate"
          value={formData.installationDate}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="lastMaintenanceDate">Last Maintenance Date</label>
        <input
          type="date"
          id="lastMaintenanceDate"
          value={formData.lastMaintenanceDate}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="dc_power">DC Power (W)</label>
        <input
          type="number"
          id="dc_power"
          value={formData.dc_power}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="ac_power">AC Power (W)</label>
        <input
          type="number"
          id="ac_power"
          value={formData.ac_power}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="ambient_temperature">Ambient Temperature (°C)</label>
        <input
          type="number"
          id="ambient_temperature"
          value={formData.ambient_temperature}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="module_temperature">Module Temperature (°C)</label>
        <input
          type="number"
          id="module_temperature"
          value={formData.module_temperature}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="irradiation">Irradiation (W/m²)</label>
        <input
          type="number"
          id="irradiation"
          value={formData.irradiation}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="4"
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Maintenance Check'}
      </button>
    </form>
  );
};

export default SolarMaintenanceForm;
