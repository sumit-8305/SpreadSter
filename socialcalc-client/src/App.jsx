import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

function Spreadsheet() {
  const [data, setData] = useState({});
  const [rows, setRows] = useState(20); // Initial rows
  const [cols, setCols] = useState(10); // Initial columns
  const containerRef = useRef(null);

  useEffect(() => {
    socket.on('load-data', (loadedData) => {
      setData(loadedData);
    });

    socket.on('update-cell', ({ cellId, value }) => {
      setData((prevData) => ({
        ...prevData,
        [cellId]: value,
      }));
    });

    return () => {
      socket.off('load-data');
      socket.off('update-cell');
    };
  }, []);

  const handleChange = (row, col, value) => {
    const cellId = `${row}-${col}`;
    setData((prevData) => ({
      ...prevData,
      [cellId]: value,
    }));
    socket.emit('update-cell', { cellId, value });
  };

  const renderCell = (row, col) => {
    const cellId = `${row}-${col}`;
    return (
      <input
        key={cellId}
        type="text"
        value={data[cellId] || ''}
        onChange={(e) => handleChange(row, col, e.target.value)}
        className="border p-2"
      />
    );
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        setRows((prevRows) => prevRows + 20);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="overflow-auto h-screen"
      style={{ maxHeight: '100vh' }}
    >
      <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, 150px)` }}>
        {Array.from({ length: rows }).map((_, rowIndex) =>
          Array.from({ length: cols }).map((_, colIndex) =>
            renderCell(rowIndex, colIndex)
          )
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <h1 className="text-2xl font-bold p-4">Infinite Spreadsheet</h1>
      <Spreadsheet />
    </div>
  );
}

export default App;
