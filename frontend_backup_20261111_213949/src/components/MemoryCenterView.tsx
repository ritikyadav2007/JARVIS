import React, { useState, useEffect, useCallback } from 'react';
import { MemoryItem, fetchMemories, searchMemories, createMemory, deleteMemory } from '../api';

export const MemoryCenterView: React.FC = () => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Memory Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'preference' | 'project' | 'goal' | 'fact' | 'other'>('preference');
  const [confirmedAdd, setConfirmedAdd] = useState(false);

  // Load memories from backend
  const loadMemories = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (searchQuery.trim()) {
        const results = await searchMemories(searchQuery.trim());
        setMemories(results);
      } else {
        const categoryParam = selectedCategory === 'all' ? undefined : selectedCategory;
        const results = await fetchMemories(categoryParam);
        setMemories(results);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to retrieve memories from local SQLite.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  // Handle Add Memory with user confirmation
  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    if (!confirmedAdd) {
      setErrorMsg('Please confirm that you approve storing this preference in persistent local memory.');
      return;
    }

    try {
      await createMemory(newContent.trim(), newCategory, true);
      setNewContent('');
      setIsAdding(false);
      setConfirmedAdd(false);
      setErrorMsg(null);
      await loadMemories();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save memory.');
    }
  };

  // Handle Delete with browser confirm
  const handleDelete = async (id: string, text: string) => {
    if (!window.confirm(`Permanently remove this memory?\n\n"${text}"`)) {
      return;
    }
    try {
      await deleteMemory(id);
      await loadMemories();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to delete memory.');
    }
  };

  return (
    <div className="jarvis-card memory-center-card">
      {/* Header */}
      <div className="memory-header">
        <div>
          <h3 className="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2">
              <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
            </svg>
            PERSISTENT LOCAL MEMORY CENTER
          </h3>
          <p className="card-subtitle">
            User-approved preferences, goals, and facts stored locally in SQLite (`backend/data/jarvis.db`).
          </p>
        </div>

        <button
          className="hud-button"
          onClick={() => {
            setIsAdding(!isAdding);
            setErrorMsg(null);
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          {isAdding ? 'Cancel' : 'New Approved Memory'}
        </button>
      </div>

      {/* Error notification banner */}
      {errorMsg && (
        <div className="hud-alert-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Add Memory Modal/Panel */}
      {isAdding && (
        <form onSubmit={handleAddMemory} className="memory-add-form">
          <h4 className="form-title">STORE AN APPROVED LOCAL MEMORY</h4>
          <p className="form-hint">
            JARVIS retrieves approved memories to provide personalized context during conversations. Secrets and credentials are automatically rejected.
          </p>

          <div className="form-row">
            <label className="form-label">Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="hud-select"
            >
              <option value="preference">Preference (Coding style, responses, UI)</option>
              <option value="project">Active Project (JARVIS, tasks, repos)</option>
              <option value="goal">Goal (Deadlines, objectives)</option>
              <option value="fact">Fact (Mac hardware, local environments)</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-row">
            <label className="form-label">Memory Content</label>
            <textarea
              rows={3}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="e.g. User prefers concise code explanations in TypeScript and Python."
              className="hud-textarea"
              required
            />
          </div>

          <div className="form-checkbox-row">
            <input
              type="checkbox"
              id="confirm-add"
              checked={confirmedAdd}
              onChange={(e) => setConfirmedAdd(e.target.checked)}
              className="hud-checkbox"
            />
            <label htmlFor="confirm-add" className="checkbox-label">
              I explicitly approve saving this non-sensitive preference to local SQLite storage.
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="hud-button" disabled={!confirmedAdd || !newContent.trim()}>
              Save to Local Database
            </button>
            <button
              type="button"
              className="hud-button-subtle"
              onClick={() => {
                setIsAdding(false);
                setNewContent('');
                setConfirmedAdd(false);
              }}
            >
              Discard
            </button>
          </div>
        </form>
      )}

      {/* Search & Category Filter Bar */}
      <div className="memory-filters-bar">
        <div className="search-input-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stored memories by keyword..."
            className="hud-search-input"
          />
        </div>

        <div className="category-chips">
          {['all', 'preference', 'project', 'goal', 'fact'].map((cat) => (
            <button
              key={cat}
              className={`chip-button ${selectedCategory === cat ? 'chip-active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="memory-cards-grid">
        {isLoading ? (
          <div className="memory-loading">
            <span className="proc-dot"></span>
            <span className="proc-dot"></span>
            <span className="proc-dot"></span>
            <p>Scanning SQLite records...</p>
          </div>
        ) : memories.length === 0 ? (
          <div className="empty-memories">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5">
              <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
            </svg>
            <p>No memories match your query.</p>
            <span>Click &ldquo;New Approved Memory&rdquo; to add a preference.</span>
          </div>
        ) : (
          memories.map((mem) => (
            <div key={mem.id} className="memory-card-item">
              <div className="memory-card-top">
                <span className={`memory-cat-pill cat-${mem.category}`}>
                  {mem.category.toUpperCase()}
                </span>
                <span className="memory-date">
                  {new Date(mem.created_at).toLocaleDateString()}
                </span>
              </div>

              <p className="memory-content-text">{mem.content}</p>

              <div className="memory-card-bottom">
                <span className="memory-source-tag">Source: {mem.source}</span>
                <button
                  className="memory-del-btn"
                  onClick={() => handleDelete(mem.id, mem.content)}
                  title="Delete memory"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
