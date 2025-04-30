import React, { useState } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const SolarMaintenancePanel = ({ addMaintenanceRecord, setAdminStats }) => {
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [maintenanceAnalysis, setMaintenanceAnalysis] = useState({
    loading: false,
    result: null,
    error: null,
    formData: {
      panelId: '',
      panelLocation: '',
      technicianName: '',
      installationDate: '',
      lastMaintenanceDate: '',
      currentEfficiency: '',
      powerOutput: '',
      dc_power: '',
      ac_power: '',
      ambient_temperature: '',
      module_temperature: '',
      irradiation: '',
      temperature: '',
      dustLevel: 'low',
      weatherConditions: 'sunny',
      physicalDamage: 'none',
      description: '',
      image: null
    }
  });

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setMaintenanceAnalysis(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: type === 'file' ? files[0] : value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMaintenanceAnalysis(prev => ({
      ...prev,
      loading: true
    }));
    
    // Mock API call - replace with actual AI integration
    setTimeout(() => {
      setMaintenanceAnalysis(prev => ({
        ...prev,
        loading: false,
        error: null,
        result: {
          condition: "Good",
          efficiency: "85%",
          recommendations: [
            `Schedule cleaning due to ${prev.formData.dustLevel} dust levels`,
            `Check electrical connections - efficiency drop noted from ${prev.formData.currentEfficiency}%`,
            "Monitor temperature variations",
            `Plan next maintenance within ${prev.formData.powerOutput < 80 ? "15" : "30"} days`
          ],
          priority: prev.formData.currentEfficiency < 75 ? "High" : "Medium",
          nextCheck: "30 days",
          predictedIssues: [
            "Potential dust accumulation impact",
            "Minor efficiency degradation"
          ]
        }
      }));

      // Create a record to save to Firestore
      const recordData = {
        panelId: maintenanceAnalysis.formData.panelId,
        panelLocation: maintenanceAnalysis.formData.panelLocation,
        technicianName: maintenanceAnalysis.formData.technicianName,
        installationDate: maintenanceAnalysis.formData.installationDate,
        lastMaintenanceDate: maintenanceAnalysis.formData.lastMaintenanceDate,
        dc_power: maintenanceAnalysis.formData.dc_power,
        ac_power: maintenanceAnalysis.formData.ac_power,
        ambient_temperature: maintenanceAnalysis.formData.ambient_temperature,
        module_temperature: maintenanceAnalysis.formData.module_temperature,
        irradiation: maintenanceAnalysis.formData.irradiation,
        dustLevel: maintenanceAnalysis.formData.dustLevel,
        weatherConditions: maintenanceAnalysis.formData.weatherConditions,
        physicalDamage: maintenanceAnalysis.formData.physicalDamage,
        description: maintenanceAnalysis.formData.description,
        timestamp: new Date(),
        status: 'pending',
        efficiency: maintenanceAnalysis.formData.currentEfficiency || '85'
      };

      // Add to Firestore
      addDoc(collection(db, 'maintenance_records'), recordData)
        .then(docRef => {
          console.log('Document written with ID: ', docRef.id);
          
          // Add to local state
          addMaintenanceRecord({
            id: docRef.id,
            ...recordData
          });

          // Update dashboard stats
          setAdminStats(prev => ({
            ...prev,
            totalInspections: prev.totalInspections + 1,
            pendingTasks: prev.pendingTasks + 1
          }));

          // Show success message
          setSubmissionSuccess(true);
          setTimeout(() => {
            setSubmissionSuccess(false);
          }, 3000);
        })
        .catch(error => {
          console.error('Error adding document: ', error);
        });
    }, 2000);
  };

  return (
    <div className="solar-maintenance">
      <h2>AI Solar Panel Maintenance Check</h2>
      
      {submissionSuccess && (
        <div className="success-message">
          Maintenance check submitted successfully! The record has been added to maintenance history.
        </div>
      )}
      
      <div className="maintenance-form">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label style={{color: '#333'}}>Panel ID</label>
              <input
                type="text"
                name="panelId"
                value={maintenanceAnalysis.formData.panelId}
                onChange={handleInputChange}
                placeholder="e.g., P-1001"
                required
              />
            </div>

            <div className="form-group">
              <label style={{color: '#333'}}>Panel Location</label>
              <select
                name="panelLocation"
                value={maintenanceAnalysis.formData.panelLocation}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Location</option>
                <option value="north">North Site</option>
                <option value="south">South Site</option>
                <option value="east">East Site</option>
                <option value="west">West Site</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{color: '#333'}}>Technician Name</label>
              <input
                type="text"
                name="technicianName"
                value={maintenanceAnalysis.formData.technicianName}
                onChange={handleInputChange}
                placeholder="Full Name"
                required
              />
            </div>

            <div className="form-group">
              <label style={{color: '#333'}}>Installation Date</label>
              <input
                type="date"
                name="installationDate"
                value={maintenanceAnalysis.formData.installationDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label style={{color: '#333'}}>Last Maintenance Date</label>
              <input
                type="date"
                name="lastMaintenanceDate"
                value={maintenanceAnalysis.formData.lastMaintenanceDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label style={{color: '#333'}}>Current Efficiency <span className="unit-indicator">(%)</span></label>
              <div className="input-with-unit">
                <input
                  type="number"
                  name="currentEfficiency"
                  value={maintenanceAnalysis.formData.currentEfficiency}
                  onChange={handleInputChange}
                  placeholder="0-100"
                  min="0"
                  max="100"
                  required
                />
                <span className="unit-symbol">%</span>
              </div>
            </div>

            <div className="form-group">
              <label style={{color: '#333'}}>Power Output <span className="unit-indicator">(kWh)</span></label>
              <div className="input-with-unit">
                <input
                  type="number"
                  name="powerOutput"
                  value={maintenanceAnalysis.formData.powerOutput}
                  onChange={handleInputChange}
                  placeholder="e.g., 5.5"
                  min="0"
                  step="0.1"
                  required
                />
                <span className="unit-symbol">kWh</span>
              </div>
            </div>

            <div className="form-group">
              <label style={{color: '#333'}}>DC Power <span className="unit-indicator">(W)</span></label>
              <div className="input-with-unit">
                <input
                  type="number"
                  name="dc_power"
                  value={maintenanceAnalysis.formData.dc_power}
                  onChange={handleInputChange}
                  placeholder="e.g., 250"
                  min="0"
                  required
                />
                <span className="unit-symbol">W</span>
              </div>
            </div>

            <div className="form-group">
              <label style={{color: '#333'}}>AC Power <span className="unit-indicator">(W)</span></label>
              <div className="input-with-unit">
                <input
                  type="number"
                  name="ac_power"
                  value={maintenanceAnalysis.formData.ac_power}
                  onChange={handleInputChange}
                  placeholder="e.g., 235"
                  min="0"
                  required
                />
                <span className="unit-symbol">W</span>
              </div>
            </div>

            <div className="form-group">
              <label style={{color: '#333'}}>Ambient Temperature <span className="unit-indicator">(°C)</span></label>
              <div className="input-with-unit">
                <input
                  type="number"
                  name="ambient_temperature"
                  value={maintenanceAnalysis.formData.ambient_temperature}
                  onChange={handleInputChange}
                  placeholder="e.g., 25"
                  step="0.1"
                  required
                />
                <span className="unit-symbol">°C</span>
              </div>
            </div>

            <div className="form-group">
              <label style={{color: '#333'}}>Module Temperature <span className="unit-indicator">(°C)</span></label>
              <div className="input-with-unit">
                <input
                  type="number"
                  name="module_temperature"
                  value={maintenanceAnalysis.formData.module_temperature}
                  onChange={handleInputChange}
                  placeholder="e.g., 40"
                  step="0.1"
                  required
                />
                <span className="unit-symbol">°C</span>
              </div>
            </div>

            <div className="form-group">
              <label style={{color: '#333'}}>Irradiation <span className="unit-indicator">(W/m²)</span></label>
              <div className="input-with-unit">
                <input
                  type="number"
                  name="irradiation"
                  value={maintenanceAnalysis.formData.irradiation}
                  onChange={handleInputChange}
                  placeholder="e.g., 800"
                  min="0"
                  required
                />
                <span className="unit-symbol">W/m²</span>
              </div>
            </div>
            
            <div className="form-group">
              <label style={{color: '#333'}}>Dust Level</label>
              <select
                name="dustLevel"
                value={maintenanceAnalysis.formData.dustLevel}
                onChange={handleInputChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className="form-group">
              <label style={{color: '#333'}}>Weather Conditions</label>
              <select
                name="weatherConditions"
                value={maintenanceAnalysis.formData.weatherConditions}
                onChange={handleInputChange}
              >
                <option value="sunny">Sunny</option>
                <option value="cloudy">Cloudy</option>
                <option value="rainy">Rainy</option>
                <option value="windy">Windy</option>
              </select>
            </div>
            
            <div className="form-group">
              <label style={{color: '#333'}}>Physical Damage</label>
              <select
                name="physicalDamage"
                value={maintenanceAnalysis.formData.physicalDamage}
                onChange={handleInputChange}
              >
                <option value="none">None</option>
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label style={{color: '#333'}}>Upload Panel Image (Optional)</label>
            <div className="upload-area">
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleInputChange}
                className="file-input"
              />
              <p>Drag and drop an image or click to browse</p>
            </div>
          </div>

          <div className="form-group full-width">
            <label style={{color: '#333'}}>Additional Notes</label>
            <textarea
              name="description"
              value={maintenanceAnalysis.formData.description}
              onChange={handleInputChange}
              placeholder="Describe any specific issues or concerns..."
              rows="4"
            ></textarea>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="analyze-btn"
              disabled={maintenanceAnalysis.loading}
            >
              {maintenanceAnalysis.loading ? 'Analyzing...' : 'Analyze Maintenance Needs'}
            </button>
          </div>
        </form>

        {maintenanceAnalysis.result && (
          <div className="analysis-results">
            <h3>Analysis Results</h3>
            <div className="result-card">
              <div className="result-item">
                <strong>Current Condition:</strong>
                <span>{maintenanceAnalysis.result.condition}</span>
              </div>
              <div className="result-item">
                <strong>System Efficiency:</strong>
                <span>{maintenanceAnalysis.result.efficiency}</span>
              </div>
              <div className="result-item">
                <strong>Recommendations:</strong>
                <ul>
                  {maintenanceAnalysis.result.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
              <div className="result-item">
                <strong>Predicted Issues:</strong>
                <ul>
                  {maintenanceAnalysis.result.predictedIssues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
              <div className="result-item">
                <strong>Priority Level:</strong>
                <span className={`priority-badge ${maintenanceAnalysis.result.priority.toLowerCase()}`}>
                  {maintenanceAnalysis.result.priority}
                </span>
              </div>
              <div className="result-item">
                <strong>Next Check Recommended:</strong>
                <span>{maintenanceAnalysis.result.nextCheck}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolarMaintenancePanel; 