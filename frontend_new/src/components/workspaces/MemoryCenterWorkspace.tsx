import React, { useState, useEffect, useCallback } from 'react';
import type { MemoryItem } from '../../types';
import { fetchMemories, searchMemories, createMemory, deleteMemory } from '../../services/api';

export const MemoryCenterWorkspace: React.FC = () => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'preference' | 'project' | 'goal' | 'fact' | 'other'>('preference');
  const [confirmedAdd, setConfirmedAdd] = useState(false);

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
      setErrorMsg(err?.message || 'Failed to retrieve memories from local SQLite database.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    if (!confirmedAdd) {
      setErrorMsg('Please confirm that you approve storing this memory in local SQLite persistent storage.');
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

  const handleDelete = async (id: string, text: string) => {
    if (!window.confirm(`Permanently remove this memory from local SQLite storage?\n\n"${text}"`)) {
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
    <div className="modular-workspace-container" aria-label="Persistent Memory Vault">
      <div className="workspace-card">
        <div className="workspace-card-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
          </svg>
          LOCAL PERSISTENT MEMORY &bull; SQLITE VAULT
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
          Approved long-term user memories persisted in <code>backend/data/jarvis.db</code>.
          These memories are automatically injected into Gemini system instructions for personalized recall.
        </p>

        {errorMsg && (
          <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--red)', borderRadius: '6px', color: '#fca5a5', fontSize: '12px', marginBottom: '14px' }}>
            {errorMsg}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
          <input
            type="text"
            className="chat-text-input"
            placeholder="Search stored memories by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: '380px' }}
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="chat-text-input"
            style={{ maxWidth: '160px', cursor: 'pointer' }}
          >
            <option value="all">All Categories</option>
            <option value="preference">Preference</option>
            <option value="project">Project</option>
            <option value="goal">Goal</option>
            <option value="fact">Fact</option>
            <option value="other">Other</option>
          </select>

          <button
            className="chat-send-btn"
            style={{ width: 'auto', padding: '0 16px', fontSize: '12px', fontWeight: 600 }}
            onClick={() => setIsAdding(!isAdding)}
          >
            {isAdding ? 'Cancel' : '+ Add Memory'}
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleAddMemory} style={{ background: 'rgba(5, 27, 51, 0.7)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--cyan)', marginBottom: '8px', fontSize: '14px' }}>
              RECORD NEW USER DIRECTIVE OR PREFERENCE
            </h4>
            <textarea
              className="chat-text-input"
              rows={3}
              placeholder="e.g. Always format code responses in TypeScript, or Prefer concise technical answers..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              style={{ width: '100%', marginBottom: '10px', resize: 'vertical' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Category:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="chat-text-input"
                  style={{ width: '130px' }}
                >
                  <option value="preference">Preference</option>
                  <option value="project">Project</option>
                  <option value="goal">Goal</option>
                  <option value="fact">Fact</option>
                  <option value="other">Other</option>
                </select>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={confirmedAdd}
                    onChange={(e) => setConfirmedAdd(e.target.checked)}
                  />
                  Explicit User Approval
                </label>
              </div>

              <button
                type="submit"
                className="chat-send-btn"
                style={{ width: 'auto', padding: '0 18px', fontSize: '12px' }}
                disabled={!newContent.trim()}
              >
                Save to SQLite
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div style={{ color: 'var(--cyan-light)', fontStyle: 'italic', padding: '12px 0' }}>
            Retrieving entries from backend/data/jarvis.db...
          </div>
        ) : memories.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', padding: '24px 0', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '8px' }}>
            No memories match query. Create your first memory directive above.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
            {memories.map((m) => (
              <div
                key={m.id}
                style={{
                  background: 'rgba(3, 17, 35, 0.8)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(0, 240, 255, 0.15)', color: 'var(--cyan)', textTransform: 'uppercase' }}>
                      {m.category}
                    </span>
                    <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(m.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#e2e8f0', lineHeight: 1.4 }}>{m.content}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button
                    onClick={() => handleDelete(m.id, m.content)}
                    style={{ background: 'transparent', border: 'none', color: '#f87171', fontSize: '11px', cursor: 'pointer', padding: '2px 6px' }}
                    title="Delete Memory"
                  >
                    Delete &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
