'use client';

import React, { useState } from 'react';
import { simulateDecision } from '@/lib/api';

interface SimulationPanelProps {
  decisionId: string;
  onSimulationResult?: (result: any) => void;
}

export default function SimulationPanel({ decisionId, onSimulationResult }: SimulationPanelProps) {
  const [input, setInput] = useState(
    JSON.stringify(
      {
        customer: { tier: 'gold' },
        cart: { total: 500 },
      },
      null,
      2
    )
  );
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const context = JSON.parse(input);
      const res = await simulateDecision(decisionId, context);
      setResult(res);
      onSimulationResult?.(res);
    } catch (err: any) {
      setError(err.message || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#374151' }}>
        Simulation
      </h3>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>
          Input Context (JSON)
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            minHeight: '120px',
            fontFamily: 'monospace',
            fontSize: '12px',
            padding: '8px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            resize: 'vertical',
            backgroundColor: '#f9fafb',
          }}
        />
        <button
          onClick={handleSimulate}
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: loading ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 500,
            fontSize: '13px',
          }}
        >
          {loading ? 'Running...' : '▶ Run Simulation'}
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            borderRadius: '6px',
            fontSize: '12px',
            border: '1px solid #fecaca',
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>
            Result
          </label>
          <pre
            style={{
              padding: '8px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: 'monospace',
              overflow: 'auto',
              maxHeight: '200px',
              margin: 0,
            }}
          >
            {JSON.stringify(result.result, null, 2)}
          </pre>
          {result.performance && (
            <div style={{ fontSize: '11px', color: '#6b7280' }}>
              ⏱ Performance: {result.performance}
            </div>
          )}
          {result.trace && (
            <details>
              <summary style={{ fontSize: '12px', color: '#6b7280', cursor: 'pointer' }}>
                Trace Details
              </summary>
              <pre
                style={{
                  padding: '8px',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  overflow: 'auto',
                  maxHeight: '300px',
                  margin: '4px 0 0 0',
                }}
              >
                {JSON.stringify(result.trace, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
