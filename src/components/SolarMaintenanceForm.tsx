import React, { useState, useEffect } from 'react';
import { Panel, firebaseService } from '../services/firebaseService';
import styles from './SolarMaintenanceForm.module.css';

interface SolarMaintenanceFormProps {
  panels: Panel[];
  selectedPanel: Panel | null;
  onPanelSelect: (panel: Panel | null) => void;
}

const SolarMaintenanceForm: React.FC<SolarMaintenanceFormProps> = ({
  panels,
  selectedPanel,
  onPanelSelect
}) => {
  const [formData, setFormData] = useState({
    inspectionType: 'Routine Check',
    notes: '',
    dc_power: '',
    ac_power: '',
    ambient_temperature: '',
    module_temperature: '',
    irradiation: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingSamples, setIsCreatingSamples] = useState(false);

  useEffect(() => {
    // Log panels when they change
    console.log('Current panels in form:', panels);
  }, [panels]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateSamplePanels = async () => {
    try {
      setIsCreatingSamples(true);
      setError(null);
      await firebaseService.createSamplePanels();
    } catch (error) {
      console.error('Error creating sample panels:', error);
      setError('Failed to create sample panels. Please try again.');
    } finally {
      setIsCreatingSamples(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPanel) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Update the panel data in Firebase
      const updatedData = {
        lastMaintenance: new Date().toISOString(),
        status: formData.inspectionType,
        power_output: [...(selectedPanel.power_output || []), Number(formData.dc_power)],
        temperature_readings: [...(selectedPanel.temperature_readings || []), Number(formData.module_temperature)],
        // Add any other fields you want to update
      };

      await firebaseService.updatePanel(selectedPanel.id, updatedData);

      // Reset form after successful submission
      setFormData({
        inspectionType: 'Routine Check',
        notes: '',
        dc_power: '',
        ac_power: '',
        ambient_temperature: '',
        module_temperature: '',
        irradiation: ''
      });

      // Show success message or handle success state
    } catch (error) {
      console.error('Error submitting maintenance data:', error);
      setError('Failed to submit maintenance data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.maintenanceForm}>
      <h2>Solar Panel Maintenance</h2>
      
      <div className={styles.panelSelector}>
        <label>Select Panel</label>
        <div className={styles.panelSelectorContent}>
          <select
            value={selectedPanel?.id || ''}
            onChange={(e) => {
              const panel = panels.find(p => p.id === e.target.value);
              console.log('Selected panel:', panel);
              onPanelSelect(panel || null);
            }}
            className={styles.panelSelect}
          >
            <option value="">Select a Panel</option>
            {panels.map(panel => (
              <option key={panel.id} value={panel.id}>
                {panel.name} - {panel.location}
              </option>
            ))}
          </select>
          
          {panels.length === 0 && (
            <button
              onClick={handleCreateSamplePanels}
              disabled={isCreatingSamples}
              className={styles.createSamplesButton}
            >
              {isCreatingSamples ? 'Creating Sample Panels...' : 'Create Sample Panels'}
            </button>
          )}
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {selectedPanel && (
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Inspection Type</label>
              <select
                name="inspectionType"
                value={formData.inspectionType}
                onChange={handleInputChange}
                required
              >
                <option value="Routine Check">Routine Check</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Repair">Repair</option>
                <option value="Emergency Service">Emergency Service</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>DC Power (W)</label>
              <input
                type="number"
                name="dc_power"
                value={formData.dc_power}
                onChange={handleInputChange}
                placeholder="Enter DC Power"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>AC Power (W)</label>
              <input
                type="number"
                name="ac_power"
                value={formData.ac_power}
                onChange={handleInputChange}
                placeholder="Enter AC Power"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Ambient Temperature (°C)</label>
              <input
                type="number"
                name="ambient_temperature"
                value={formData.ambient_temperature}
                onChange={handleInputChange}
                placeholder="Enter Ambient Temperature"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Module Temperature (°C)</label>
              <input
                type="number"
                name="module_temperature"
                value={formData.module_temperature}
                onChange={handleInputChange}
                placeholder="Enter Module Temperature"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Irradiation (W/m²)</label>
              <input
                type="number"
                name="irradiation"
                value={formData.irradiation}
                onChange={handleInputChange}
                placeholder="Enter Irradiation"
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Enter maintenance notes..."
              rows={4}
              required
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Maintenance Check'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SolarMaintenanceForm; 