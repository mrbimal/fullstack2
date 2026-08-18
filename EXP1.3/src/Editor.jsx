import { useEffect, useState } from 'react';

function Editor() {
  const API_BASE = 'http://localhost:4000/api';
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/editor`)
      .then((r) => r.json())
      .then((data) => setContent(data?.content || ''))
      .catch(() => setContent(''));
  }, []);

  useEffect(() => {
    // keep placeholder for potential future autosave or syncing
  }, []);

  const handleSave = () => {
    fetch(`${API_BASE}/editor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    })
      .then(() => {
        // eslint-disable-next-line no-alert
        alert('Editor content saved to server.');
      })
      .catch(() => {
        // eslint-disable-next-line no-alert
        alert('Unable to save content to server.');
      });
  };

  const handleLoad = () => {
    fetch(`${API_BASE}/editor`)
      .then((r) => r.json())
      .then((data) => setContent(data?.content || ''))
      .catch(() => setContent(''));
  };

  const handleClear = () => {
    setContent('');
    fetch(`${API_BASE}/editor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '' })
    }).catch(() => {});
  };

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exp1_3-editor-content.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="panel editor-panel">
      <h2>Experiment Editor</h2>
      <p className="muted">A lightweight editor specific to this experiment. Content is stored in localStorage.</p>

      <div className="editor-grid">
        <textarea
          className="editor-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing your experiment notes, code, or content..."
        />

        <div className="editor-preview">
          <h3>Preview</h3>
          {content ? <pre>{content}</pre> : <p className="empty-state">Nothing to preview.</p>}
        </div>
      </div>

      <div className="editor-actions">
        <button type="button" className="primary" onClick={handleSave}>Save</button>
        <button type="button" onClick={handleLoad}>Load</button>
        <button type="button" onClick={handleClear}>Clear</button>
        <button type="button" onClick={handleExport}>Export</button>
      </div>
    </section>
  );
}

export default Editor;
