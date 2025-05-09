import { useState, useEffect } from 'react';
import Papa from 'papaparse';  
import './App.css';

function App() {
  const [phrases, setPhrases] = useState([]);
  const [index, setIndex] = useState(0);
  const [showList, setShowList] = useState(false);

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

  // --- Text checker state & helpers ---
  const [inputText, setInputText] = useState('');
  const [highlightedHtml, setHighlightedHtml] = useState('');

  // Escape RegExp special chars
  const escapeRegExp = (str) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Break a "bad phrase" into variants (comma‑separated, strip parentheses)
  const getVariants = (phrase) => {
    if (!phrase) return [];
    // remove anything in parentheses, then split on commas
    const noParens = phrase.replace(/\([^)]*\)/g, '');
    return noParens
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  };

  // Highlight forbidden words in user‑supplied text
  const updateHighlight = (text, rows) => {
    if (!text) {
      setHighlightedHtml('');
      return;
    }

    let result = text;

    rows.forEach(({ word, replacement }) => {
      const variants = getVariants(word);
      variants.forEach((variant) => {
        if (!variant) return;
        const pattern = new RegExp(`\\b${escapeRegExp(variant)}\\b`, 'gi');
        result = result.replace(
          pattern,
          (match, offset, str) => {
            const lastLt  = str.lastIndexOf('<', offset);
            const lastGt  = str.lastIndexOf('>', offset);
            if (lastLt > lastGt) return match; // we’re inside a tag → skip

            return `<mark class="mark-tooltip"
                          data-replacement="${replacement.replace(/"/g, '&quot;')}"
                          style="background:#fdecea;color:#c0392b;cursor:pointer;position:relative;">${match}</mark>`;
          }
        );
      });
    });

    setHighlightedHtml(result);
  };

  // Attach click handlers to <mark> elements whenever the highlighted HTML updates
  useEffect(() => {
    const container = document.getElementById('preview');
    if (!container) return;

    const marks = Array.from(container.querySelectorAll('mark[data-replacement]'));

    const handlers = marks.map((mark) => {
      const handler = () => {
        const rep = mark.getAttribute('data-replacement');
        setInputText((prev) => {
          const next = prev.replace(mark.textContent, rep);
          updateHighlight(next, phrases);
          return next;
        });
      };
      mark.addEventListener('click', handler);
      return { mark, handler };
    });

    // cleanup
    return () => {
      handlers.forEach(({ mark, handler }) => mark.removeEventListener('click', handler));
    };
  }, [highlightedHtml, phrases]);

  // Navigation helpers
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
        <button
          onClick={() => setShowList(prev => !prev)}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          {showList ? 'Hide list' : 'Show list'}
        </button>
      </div>
      {showList && (
        <div style={{ marginTop: '1rem', overflowY: 'auto', maxHeight: '300px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0 auto' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '4px' }}>Instead of</th>
                <th style={{ border: '1px solid #ddd', padding: '4px' }}>Try</th>
              </tr>
            </thead>
            <tbody>
              {phrases.map((p, i) => (
                <tr key={i}>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>{p.word}</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>{p.replacement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Text checker */}
      <div style={{
            marginTop: '3rem',
            maxWidth: '600px',
            width: '100%',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
        <h2 style={{ textAlign: 'left' }}>Check your text</h2>
        <textarea
          value={inputText}
          onChange={(e) => {
            const val = e.target.value;
            setInputText(val);
            updateHighlight(val, phrases);
          }}
          rows={6}
          placeholder="Paste or type text here…"
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            borderRadius: '6px',
            border: '1px solid #ccc',
            boxSizing: 'border-box',
          }}
        />
        <div
          id="preview"
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: '#f7f7f7',
            borderRadius: '6px',
            minHeight: '5rem',
            whiteSpace: 'pre-wrap',
            textAlign: 'left',
            lineHeight: '1.5',
          }}
          dangerouslySetInnerHTML={{
            __html: highlightedHtml || inputText,
          }}
        />
      </div>
    </div>
  );
}

export default App;
