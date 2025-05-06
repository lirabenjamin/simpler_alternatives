import { useState, useEffect } from 'react';
import Papa from 'papaparse';  
import './App.css';

function App() {
  const [phrases, setPhrases] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
  // Papa Parse handles commas inside quotes for us
    Papa.parse('/phrases.csv', {
      download: true,
    header: true,         // use the first row as column names
    skipEmptyLines: true,
          complete: ({ data }) => {
            const rows = data.map((row) => ({
              word: (row['Word or phrase'] || '').trim(),
              replacement: (row['Replacement'] || '').trim(),
            }));
            setPhrases(rows);
          },
          error: (err) => console.error('Error loading CSV:', err),
        });
      }, []);

  const nextPhrase = () => {
    setIndex((prev) => (prev + 1) % phrases.length);
  };

  const prevPhrase = () => {
    setIndex((prev) => (prev - 1 + phrases.length) % phrases.length);
  };

  if (phrases.length === 0) {
    return (
      <div className="App" style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Loading…</h2>
      </div>
    );
  }

  const current = phrases[index];

  return (
    <div
      className="App"
      style={{
        textAlign: 'center',
        padding: '2rem',
        fontFamily: 'sans-serif',
      }}
    >
      <h1>Simpler Alternatives</h1>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'stretch',
          gap: '2rem',
          flexWrap: 'wrap',
          marginTop: '2rem',
        }}
      >
        {/* Bad / complex phrasing card */}
        <div
          style={{
            flex: '0 1 240px',
            border: '2px solid #e74c3c',
            background: '#fdecea',
            borderRadius: '8px',
            padding: '1rem',
          }}
        >
          <h3 style={{ margin: 0, color: '#c0392b' }}>Instead of</h3>
          <p style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>
            <strong>{current.word}</strong>
          </p>
        </div>

        {/* Good / simple phrasing card */}
        <div
          style={{
            flex: '0 1 240px',
            border: '2px solid #27ae60',
            background: '#e9f7ef',
            borderRadius: '8px',
            padding: '1rem',
          }}
        >
          <h3 style={{ margin: 0, color: '#1e8449' }}>Try</h3>
          <p style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>
            <strong>{current.replacement}</strong>
          </p>
        </div>
      </div>

      {/* Navigation buttons */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button
          onClick={prevPhrase}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Previous
        </button>
        <button
          onClick={nextPhrase}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
