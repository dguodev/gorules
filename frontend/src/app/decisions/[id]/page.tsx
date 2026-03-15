'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { fetchDecision, updateDecision, simulateDecision } from '@/lib/api';
import type { Decision } from '@/lib/api';
import type { DecisionGraphType, Simulation } from '@gorules/jdm-editor';

const DecisionEditor = dynamic(() => import('@/components/DecisionEditor'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>
      Loading editor...
    </div>
  ),
});

export default function DecisionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDecision(id)
      .then(setDecision)
      .catch(() => setError('Decision not found'));
  }, [id]);

  const handleGraphChange = useCallback(
    (graph: any) => {
      if (decision) {
        setDecision({ ...decision, graph });
      }
    },
    [decision]
  );

  const handleSimulationRun = useCallback(
    async (payload: { graph: DecisionGraphType; context: unknown }): Promise<Simulation> => {
      // Save the latest graph before simulating
      if (decision) {
        await updateDecision(decision.id, { graph: payload.graph });
      }
      const res = await simulateDecision(id, payload.context);

      const traceMap: Record<string, any> = {};
      if (res.trace) {
        for (const [nodeId, traceData] of Object.entries(res.trace as Record<string, any>)) {
          traceMap[nodeId] = {
            id: nodeId,
            name: traceData?.name || '',
            input: traceData?.input ?? null,
            output: traceData?.output ?? null,
            performance: traceData?.performance ?? null,
            traceData: traceData?.traceData ?? null,
          };
        }
      }

      return {
        result: {
          performance: res.performance || '',
          result: res.result,
          trace: traceMap,
          snapshot: payload.graph,
        },
      };
    },
    [decision, id]
  );

  const handleSave = async () => {
    if (!decision) return;
    setSaving(true);
    try {
      const updated = await updateDecision(decision.id, {
        name: decision.name,
        graph: decision.graph,
      });
      setDecision(updated);
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => router.push('/')} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          ← Back
        </button>
      </div>
    );
  }

  if (!decision) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#888' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#fff' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#fafafa',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '4px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            ← Back
          </button>
          <input
            value={decision.name}
            onChange={(e) => setDecision({ ...decision, name: e.target.value })}
            style={{
              fontSize: '16px',
              fontWeight: 600,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              minWidth: '200px',
            }}
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '6px 14px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          {saving ? 'Saving...' : '💾 Save'}
        </button>
      </div>

      {/* Editor with built-in simulator panel */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <DecisionEditor
          value={decision.graph}
          onChange={handleGraphChange}
          decisionId={id}
          onSimulationRun={handleSimulationRun}
        />
      </div>
    </div>
  );
}
