import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';


const socket = io('http://localhost:3000');

function Spreadsheet() {
  const [cells, setCells] = useState({});

  useEffect(() => {
    // Load existing data from the server
    socket.on('load-data', (data) => {
      setCells(data);
    });

    // Update cell data when another user makes a change
    socket.on('update-cell', ({ cellId, value }) => {
      setCells((prev) => ({
        ...prev,
        [cellId]: value,
      }));
    });

    return () => {
      socket.off('load-data');
      socket.off('update-cell');
    };
  }, []);

  const handleChange = (cellId, value) => {
    // Update the local state immediately for a responsive UI
    setCells((prev) => ({
      ...prev,
      [cellId]: value,
    }));

    // Send the updated value to the server
    socket.emit('update-cell', { cellId, value });
  };

  const renderCell = (cellId) => (
    <input
      key={cellId}
      type="text"
      value={cells[cellId] || ''}
      onChange={(e) => handleChange(cellId, e.target.value)}
      className="border p-2"
    />
  );

  return (
    <div className="grid grid-cols-4 gap-2 p-4">
      {Array.from({ length: 16 }, (_, i) => renderCell(`cell-${i + 1}`))}
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <h1 className="text-2xl font-bold p-4">SocialCalc</h1>
      <Spreadsheet />
    </div>
  );
}

export default App;
