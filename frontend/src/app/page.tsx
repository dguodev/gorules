'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchDecisions, createDecision, deleteDecision } from '@/lib/api';
import type { Decision } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const loadDecisions = async () => {
    try {
      const data = await fetchDecisions();
      setDecisions(data);
    } catch (err) {
      console.error('Failed to load decisions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDecisions();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const decision = await createDecision(newName.trim());
      setNewName('');
      router.push(`/decisions/${decision.id}`);
    } catch (err) {
      console.error('Failed to create:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this decision?')) return;
    try {
      await deleteDecision(id);
      setDecisions(decisions.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
          🎯 GoRules Decision Manager
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Create, edit, and simulate business rules using GoRules JDM Editor
        </p>
      </div>

      {/* Create new decision */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
        }}
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New decision name..."
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <button
          onClick={handleCreate}
          disabled={creating || !newName.trim()}
          style={{
            padding: '8px 20px',
            backgroundColor: !newName.trim() ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: !newName.trim() ? 'not-allowed' : 'pointer',
            fontWeight: 500,
            fontSize: '14px',
            whiteSpace: 'nowrap',
          }}
        >
          + Create Decision
        </button>
      </div>

      {/* Decisions list */}
      {loading ? (
        <p style={{ color: '#888', textAlign: 'center' }}>Loading...</p>
      ) : decisions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
          <p style={{ fontSize: '16px' }}>No decisions yet</p>
          <p style={{ fontSize: '13px' }}>Create your first decision above</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {decisions.map((decision) => (
            <div
              key={decision.id}
              onClick={() => router.push(`/decisions/${decision.id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s',
                backgroundColor: 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(37,99,235,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>
                  {decision.name}
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                  Updated {new Date(decision.updatedAt).toLocaleString()}
                </div>
              </div>
              <button
                onClick={(e) => handleDelete(decision.id, e)}
                style={{
                  padding: '4px 10px',
                  border: '1px solid #fecaca',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  color: '#dc2626',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
