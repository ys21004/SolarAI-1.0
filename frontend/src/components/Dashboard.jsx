import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { usePanels } from '../context/PanelsContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell
} from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { panels, loading: panelsLoading, error: panelsError } = usePanels();

  console.log('Dashboard render - Panels:', panels);
  console.log('Dashboard render - Loading:', loading, 'PanelsLoading:', panelsLoading);
  console.log('Dashboard render - Error:', error, 'PanelsError:', panelsError);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMaintenanceAnalytics();
      console.log('Analytics response:', response);
      setAnalytics(response.analytics);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading || panelsLoading) {
    console.log('Dashboard loading state');
    return <div className="p-4">Loading dashboard data...</div>;
  }

  if (error || panelsError) {
    console.log('Dashboard error state:', error || panelsError);
    return <div className="p-4 text-red-500">Error: {error || panelsError}</div>;
  }

  if (!analytics || !panels) {
    console.log('Dashboard no data state');
    return <div className="p-4">No data available</div>;
  }

  // Calculate panel statistics
  const activePanels = panels.filter(panel => panel.status === 'active').length;
  const maintenancePanels = panels.filter(panel => panel.status === 'maintenance').length;
  const faultPanels = panels.filter(panel => panel.status === 'fault').length;

  console.log('Panel statistics:', {
    total: panels.length,
    active: activePanels,
    maintenance: maintenancePanels,
    fault: faultPanels
  });

  const statusData = [
    { name: 'Active', value: activePanels },
    { name: 'Maintenance', value: maintenancePanels },
    { name: 'Fault', value: faultPanels }
  ];

  const typeData = Object.entries(analytics.type_counts).map(([name, value]) => ({
    name,
    value
  }));

  console.log('Chart data:', {
    statusData,
    typeData
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Maintenance Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Panels</h3>
          <p className="text-3xl font-bold">{panels.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Active Panels</h3>
          <p className="text-3xl font-bold">{activePanels}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Maintenance Required</h3>
          <p className="text-3xl font-bold">{maintenancePanels + faultPanels}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Panel Status Distribution */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Panel Status Distribution</h3>
          <PieChart width={400} height={300}>
            <Pie
              data={statusData}
              cx={200}
              cy={150}
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        {/* Maintenance Types */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Maintenance Types</h3>
          <BarChart width={400} height={300} data={typeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </div>
      </div>

      {/* Recent Records */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Maintenance Records</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Panel ID</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Technician</th>
              </tr>
            </thead>
            <tbody>
              {analytics.recent_records.map((record) => (
                <tr key={record.id} className="border-t">
                  <td className="px-4 py-2">
                    {format(new Date(record.timestamp), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-2">{record.panelId}</td>
                  <td className="px-4 py-2">{record.type}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      record.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      record.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      record.status === 'Critical' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{record.technicianName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 