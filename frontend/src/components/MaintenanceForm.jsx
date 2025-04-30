import React, { useState } from 'react';
import { apiService } from '../services/apiService';

const MaintenanceForm = ({ onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    panelId: '',
    technicianName: '',
    type: 'Routine Check',
    status: 'Pending',
    dc_power: '',
    ac_power: '',
    ambient_temperature: '',
    module_temperature: '',
    irradiation: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['panelId', 'technicianName', 'type', 'status'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill in the ${field} field`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.createMaintenanceRecord(formData);
      
      setSuccess(true);
      setFormData({
        panelId: '',
        technicianName: '',
        type: 'Routine Check',
        status: 'Pending',
        dc_power: '',
        ac_power: '',
        ambient_temperature: '',
        module_temperature: '',
        irradiation: '',
        notes: ''
      });

      if (onSubmitSuccess) {
        onSubmitSuccess(response);
      }

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create maintenance record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">New Maintenance Record</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          Maintenance record created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Panel ID *
            </label>
            <input
              type="text"
              name="panelId"
              value={formData.panelId}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Technician Name *
            </label>
            <input
              type="text"
              name="technicianName"
              value={formData.technicianName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maintenance Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="Routine Check">Routine Check</option>
              <option value="Repair">Repair</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Inspection">Inspection</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              DC Power (W)
            </label>
            <input
              type="number"
              name="dc_power"
              value={formData.dc_power}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AC Power (W)
            </label>
            <input
              type="number"
              name="ac_power"
              value={formData.ac_power}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ambient Temperature (°C)
            </label>
            <input
              type="number"
              name="ambient_temperature"
              value={formData.ambient_temperature}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module Temperature (°C)
            </label>
            <input
              type="number"
              name="module_temperature"
              value={formData.module_temperature}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Irradiation (W/m²)
            </label>
            <input
              type="number"
              name="irradiation"
              value={formData.irradiation}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="3"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${
              loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Saving...' : 'Save Maintenance Record'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceForm; 