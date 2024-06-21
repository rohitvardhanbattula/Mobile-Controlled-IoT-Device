// App.tsx

import React, { useState } from 'react';
import './App.css';
import TemperatureHumidityChart from './Analysis';
import History from './History';
import NavBar from './NavBar';

function capitalizeFirstLetter(string: string): string {
  return string.replace(/\b\w/g, char => char.toUpperCase());
}

const App: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [imageKey, setImageKey] = useState(0);
  const [showChart, setShowChart] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [details, setDetails] = useState({
    disease_name: '',
    description: '',
    possible_steps: '',
    image_url: '',
    supplement_name: '',
    supplement_image: '',
    buy_link: ''
  });

  const handleCaptureClick = async () => {
    try {
      const response = await fetch('http://localhost:8000/get_image');
      if (!response.ok) {
        throw new Error('Failed to fetch image data');
      }
      const data = await response.json();
      setDetails(data);
      setShowDetails(true);
      setImageKey(prevKey => prevKey + 1);
      console.log("Image updated:", data);
    } catch (error) {
      console.error('Error fetching image data:', error);
    }
  };

  return (
    <div className=" bg-gray-100 flex flex-col">
      <h1 className="text-black text-5xl font-bold text-center mt-4 mb-8">GreenGlobe</h1>
      <NavBar onSelect={(selected) => {
        setShowAnalysis(selected === 'analysis');
        setShowHistory(selected === 'history');
      }} />
      {showAnalysis ? (
        <div className="m-8 p-6 bg-white shadow-md rounded-lg">
          <TemperatureHumidityChart />
        </div>
      ) : showHistory ? (
        <div className="m-8 p-6 bg-white shadow-md rounded-lg">
          <History />
        </div>
      ) : (
        <div className="m-8 p-6 bg-white shadow-md rounded-lg flex flex-col items-center">
          <div className="flex items-center">
            <img src="http://192.168.0.3:9090/video" className="h-[500px] rounded-lg" alt="Initial Image" />
          </div>
          <div className="card mt-6 p-4 bg-gray-200 rounded-lg">
            <button onClick={handleCaptureClick} className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600">
              Capture
            </button>
          </div>
          {showDetails && (
            <div className="flex items-center justify-start mt-4">
              <img src={`image.jpeg?${imageKey}`} className="h-[500px] rounded-lg" alt="Captured Image" key={imageKey} />
            </div>
          )}
          {showDetails && (
            <div className="details mt-8 p-4 bg-gray-200 rounded-lg border border-gray-300">
                <div className="flex border-b border-gray-300 py-2">
                  <div className="w-1/3 pr-4 text-gray-800 font-semibold">{"Image Url"}</div>
                  <img className='h-[200px]' src={details.image_url}/>
                </div>
                <div className="flex border-b border-gray-300 py-2">
                  <div className="w-1/3 pr-4 text-gray-800 font-semibold">{"Disease Name"}</div>
                  <div className="w-1/2 text-gray-700">{details.disease_name}</div>
                </div>
                <div className="flex border-b border-gray-300 py-2">
                  <div className="w-1/3 pr-4 text-gray-800 font-semibold">{"Description"}</div>
                  <div className="w-1/2 text-gray-700">{details.description}</div>
                </div>
                <div className="flex border-b border-gray-300 py-2">
                  <div className="w-1/3 pr-4 text-gray-800 font-semibold">{"Possible Steps"}</div>
                  <div className="w-1/2 text-gray-700">{details.possible_steps}</div>
                </div>
                {details.disease_name !== "Background Without Leaves" && <div>
                  <div className="flex border-b border-gray-300 py-2">
                    <div className="w-1/3 pr-4 text-gray-800 font-semibold">{"Supplement Name"}</div>
                    <div className="w-1/2 text-gray-700">{details.supplement_name}</div>
                  </div>
                  <div className="flex border-b border-gray-300 py-2">
                    <div className="w-1/3 pr-4 text-gray-800 font-semibold">{"Supplement Image"}</div>
                    <img className='h-[200px]' src={details.supplement_image}/>
                  </div>
                  <div className="flex border-b border-gray-300 py-2">
                    <div className="w-1/3 pr-4 text-gray-800 font-semibold">{"Buy Link"}</div>
                    <button onClick={() => window.open(details.buy_link, '_blank')} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow-md">
                      Buy
                    </button>
                  </div>
                </div>}
            </div>
          )}
          {showChart && (
            <div className="mt-8">
              <TemperatureHumidityChart />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
