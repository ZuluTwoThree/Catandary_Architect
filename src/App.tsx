import { useState, useCallback } from 'react';
import { useModelStore } from './store/model-store';
import { OpdCanvas } from './canvas/OpdCanvas';
import { OplPanel } from './opl/OplPanel';
import type { OpdDiagram } from './model/types';
import './App.css';

function collectOpdList(opd: OpdDiagram, depth: number = 0): Array<{ opd: OpdDiagram; depth: number }> {
  const result: Array<{ opd: OpdDiagram; depth: number }> = [{ opd, depth }];
  for (const child of opd.inZoomedChildren) {
    result.push(...collectOpdList(child, depth + 1));
  }
  for (const child of opd.unfoldedChildren) {
    result.push(...collectOpdList(child, depth + 1));
  }
  return result;
}

function App() {
  const { model, isLoading, error, loadFromBuffer, clear } = useModelStore();
  const [selectedOpdId, setSelectedOpdId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      const buffer = await file.arrayBuffer();
      loadFromBuffer(buffer);
      setSelectedOpdId(null);
    },
    [loadFromBuffer],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith('.opz') || file.name.endsWith('.opx'))) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragging(false), []);

  const onFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  // Determine which OPD to display
  const activeOpd = model
    ? (selectedOpdId !== null ? model.visual.allOpds.get(selectedOpdId) : model.visual.rootOpd) ?? model.visual.rootOpd
    : null;

  const opdList = model ? collectOpdList(model.visual.rootOpd) : [];

  // ─── No model loaded: show drop zone ────────────────────────────────
  if (!model) {
    return (
      <div className="app-welcome" onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}>
        <div className={`drop-zone ${isDragging ? 'dragging' : ''}`}>
          <div className="drop-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <h1>Catandary Architect</h1>
          <p className="subtitle">OPM Modeling Tool (ISO 19450)</p>
          <p className="instruction">
            Drop an <strong>.opz</strong> or <strong>.opx</strong> file here
          </p>
          <div className="or-divider">or</div>
          <label className="file-button">
            Browse files
            <input type="file" accept=".opz,.opx" onChange={onFileInput} hidden />
          </label>
          {isLoading && <p className="status loading">Loading...</p>}
          {error && <p className="status error">{error}</p>}
        </div>
      </div>
    );
  }

  // ─── Model loaded: show canvas ──────────────────────────────────────
  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>{model.name}</h2>
          <span className="meta">{model.author}</span>
        </div>

        <div className="sidebar-section">
          <h3>OPD Hierarchy</h3>
          <ul className="opd-tree">
            {opdList.map(({ opd, depth }) => (
              <li key={opd.id}>
                <button
                  className={`opd-item ${activeOpd?.id === opd.id ? 'active' : ''}`}
                  style={{ paddingLeft: 12 + depth * 16 }}
                  onClick={() => setSelectedOpdId(opd.id)}
                >
                  <span className="opd-icon">{depth === 0 ? 'SD' : `${opd.name.startsWith('SD') ? '' : 'SD'}${opd.name}`}</span>
                  <span className="opd-name">{opd.name}</span>
                  <span className="opd-count">
                    {opd.things.length}T {opd.links.length}L
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="sidebar-section sidebar-stats">
          <h3>Model Stats</h3>
          <div className="stat">Objects: {model.logical.objects.size}</div>
          <div className="stat">Processes: {model.logical.processes.size}</div>
          <div className="stat">Relations: {model.logical.relations.size}</div>
          <div className="stat">Links: {model.logical.links.size}</div>
          <div className="stat">OPDs: {model.visual.allOpds.size}</div>
        </div>

        <div className="sidebar-footer">
          <button className="close-btn" onClick={clear}>
            Close model
          </button>
        </div>
      </aside>

      {/* Main canvas area */}
      <main className="canvas-area" onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}>
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span className="breadcrumb-model">{model.name}</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-opd">{activeOpd?.name ?? 'SD'}</span>
        </div>

        {activeOpd && (
          <OpdCanvas opd={activeOpd} logical={model.logical} />
        )}

        {/* OPL Panel */}
        {activeOpd && (
          <OplPanel opd={activeOpd} logical={model.logical} />
        )}

        {isDragging && (
          <div className="drop-overlay">Drop .opz/.opx to replace model</div>
        )}
      </main>
    </div>
  );
}

export default App;
