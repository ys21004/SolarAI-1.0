import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import styles from './PanelCharts.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Panel {
  id: string;
  name: string;
  location: string;
  status: string;
  lastMaintenance: string;
  power_output: number[];
  temperature_readings: number[];
}

interface PanelChartsProps {
  panels: Panel[];
}

const PanelCharts: React.FC<PanelChartsProps> = ({ panels }) => {
  // Return early if no panels exist
  if (!panels || panels.length === 0) {
    return (
      <div className={styles.noPanels}>
        <h3>No panel data available</h3>
        <p>Please ensure your panels are properly configured in Firebase.</p>
      </div>
    );
  }

  // Aggregate power data for all panels
  const aggregatePowerData = {
    labels: panels.map(panel => panel.name),
    datasets: [
      {
        label: 'Average Power Output (W)',
        data: panels.map(panel => {
          // Calculate average if power_output exists and has values
          if (panel.power_output && panel.power_output.length > 0) {
            return panel.power_output.reduce((sum, val) => sum + val, 0) / panel.power_output.length;
          }
          return 0;
        }),
        backgroundColor: 'rgba(76, 175, 80, 0.6)',
        borderColor: '#4CAF50',
        borderWidth: 1,
      },
    ],
  };

  // Aggregate temperature data for all panels
  const aggregateTemperatureData = {
    labels: panels.map(panel => panel.name),
    datasets: [
      {
        label: 'Average Temperature (°C)',
        data: panels.map(panel => {
          // Calculate average if temperature_readings exists and has values
          if (panel.temperature_readings && panel.temperature_readings.length > 0) {
            return panel.temperature_readings.reduce((sum, val) => sum + val, 0) / panel.temperature_readings.length;
          }
          return 0;
        }),
        backgroundColor: 'rgba(255, 152, 0, 0.6)',
        borderColor: '#FF9800',
        borderWidth: 1,
      },
    ],
  };

  // Status distribution data
  const statusCounts = panels.reduce((acc, panel) => {
    acc[panel.status] = (acc[panel.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: 'Panel Status',
        data: Object.values(statusCounts),
        backgroundColor: [
          'rgba(76, 175, 80, 0.6)',  // Green for Operational
          'rgba(255, 152, 0, 0.6)',  // Orange for Maintenance Required
          'rgba(244, 67, 54, 0.6)',  // Red for other statuses
        ],
        borderColor: [
          '#4CAF50',
          '#FF9800',
          '#F44336',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Panel Performance Metrics',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className={styles.chartsContainer}>
      <h2>Panel Dashboard Analytics</h2>
      
      <div className={styles.chartGrid}>
        <div className={styles.chartWrapper}>
          <h3>Power Output by Panel</h3>
          <Bar data={aggregatePowerData} options={options} />
        </div>
        
        <div className={styles.chartWrapper}>
          <h3>Temperature by Panel</h3>
          <Bar data={aggregateTemperatureData} options={options} />
        </div>
        
        <div className={styles.chartWrapper}>
          <h3>Panel Status Distribution</h3>
          <Bar data={statusData} options={options} />
        </div>
      </div>
      
      <div className={styles.panelStats}>
        <div className={styles.statBox}>
          <h4>Total Panels</h4>
          <p>{panels.length}</p>
        </div>
        <div className={styles.statBox}>
          <h4>Operational</h4>
          <p>{panels.filter(p => p.status === 'Operational').length}</p>
        </div>
        <div className={styles.statBox}>
          <h4>Maintenance Required</h4>
          <p>{panels.filter(p => p.status === 'Maintenance Required').length}</p>
        </div>
      </div>
    </div>
  );
};

export default PanelCharts; 