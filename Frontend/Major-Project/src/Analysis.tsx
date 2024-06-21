import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Legend,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
import { createClient } from '@supabase/supabase-js';

// Register Chart.js components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Legend,
  Tooltip
);

// Initialize Supabase client
const supabaseUrl = 'https://zqjtnzwmfxzeisrgqajb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxanRuendtZnh6ZWlzcmdxYWpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNDQ2MDM2NywiZXhwIjoyMDMwMDM2MzY3fQ.lihCvH_dScqULnK0rBhLM3m7YfWscqKWnP7sU4SJj1g';
const supabase = createClient(supabaseUrl, supabaseKey);

// Define the types for your data
interface SensorData {
  time: string;
  temperature: number;
  humidity: number;
}

const TemperatureHumidityChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData<'line'>>({
    labels: [],
    datasets: [
      {
        label: 'Temperature (°C)',
        data: [],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'Humidity (%)',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('sensor_data')
        .select('*');

      if (error) {
        console.error('Error fetching data from Supabase:', error.message);
        return;
      }

      const labels = data.map((item) => new Date(item.created_at).toLocaleString());
      const temperatureData = data.map((item) => item.temperature);
      const humidityData = data.map((item) => item.humidity);

      setChartData({
        datasets: [
          {
            ...chartData.datasets[0],
            data: temperatureData,
          },
          {
            ...chartData.datasets[1],
            data: humidityData,
          },
        ],
        labels,
      });
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs once after the initial render

  const options: ChartOptions<'line'> = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
 // Set the minimum value of the y-axis to 20
      },
    },
  };

  return (
    <div>
      <Line height="600px" width="1280px" data={chartData} options={options} />
      <h2>Temperature and Humidity Chart</h2>
    </div>
  );
};

export default TemperatureHumidityChart;