// NavBar.tsx

import React from 'react';

const NavBar: React.FC<{ onSelect: (selected: 'predict' | 'analysis' | 'history') => void }> = ({ onSelect }) => {
  return (
    <nav className="bg-gray-200 p-4 flex justify-between items-center">
      <button onClick={() => onSelect('predict')} className="text-white font-semibold">
        Predict
      </button>
      <button onClick={() => onSelect('analysis')} className="text-white font-semibold">
        Analysis
      </button>
      <button onClick={() => onSelect('history')} className="text-white font-semibold">
        Sensor's History
      </button>
    </nav>
  );
};

export default NavBar;
