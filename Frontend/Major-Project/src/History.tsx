// History.tsx

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zqjtnzwmfxzeisrgqajb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxanRuendtZnh6ZWlzcmdxYWpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNDQ2MDM2NywiZXhwIjoyMDMwMDM2MzY3fQ.lihCvH_dScqULnK0rBhLM3m7YfWscqKWnP7sU4SJj1g';
const supabase = createClient(supabaseUrl, supabaseKey);

const History: React.FC = () => {
  const [sensorData, setSensorData] = useState<any[]>([]);

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const { data, error } = await supabase.from('sensor_data').select('*');
        if (error) {
          throw error;
        }
        setSensorData(data);
      } catch (error: any) {
        console.error('Error fetching sensor data:', error.message);
      }
    };

    fetchSensorData();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-black">Sensor's History</h2>
      <table className="w-full border-collapse border border-gray-400">
        <thead>
          <tr className="bg-gray-200 text-black">
            <th className="border border-gray-400 px-4 py-2">  TimeStamp </th>
            <th className="border border-gray-400 px-4 py-2">Temperature (°C)</th>
            <th className="border border-gray-400 px-4 py-2">Humidity (%)</th>
          </tr>
        </thead>
        <tbody>
          {sensorData.map((data, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
              <td className="border border-gray-400 px-4 py-2 text-black">{new Date(data.created_at).toLocaleString()}</td>
              <td className="border border-gray-400 px-4 py-2 text-black">{data.temperature}</td>
              <td className="border border-gray-400 px-4 py-2 text-black">{data.humidity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default History;
