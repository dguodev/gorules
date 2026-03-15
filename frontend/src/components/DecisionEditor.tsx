'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { DecisionGraphType, Simulation } from '@gorules/jdm-editor';
import '@gorules/jdm-editor/dist/style.css';
import {
  fetchSavedRequests,
  createSavedRequest,
  deleteSavedRequest,
} from '@/lib/api';
import type { SavedRequest } from '@/lib/api';

let DecisionGraph: any = null;
let JdmConfigProvider: any = null;
let GraphSimulator: any = null;

interface DecisionEditorProps {
  value: DecisionGraphType;
  onChange: (value: DecisionGraphType) => void;
  disabled?: boolean;
  decisionId: string;
  onSimulationRun?: (payload: { graph: DecisionGraphType; context: unknown }) => Promise<Simulation>;
}

// ---------- Event Detail View (JSON editor + Save/Run/Back) ----------
function EventDetailView({
  event,
  onBack,
  onRun,
  onSave,
  running,
}: {
  event: { id?: string; name: string; context: any };
  onBack: () => void;
  onRun: (context: any) => void;
  onSave: (id: string | undefined, name: string, context: any) => void;
  running: boolean;
}) {
  const [name, setName] = useState(event.name);
  const [json, setJson] = useState(JSON.stringify(event.context, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleRun = () => {
    try {
      const parsed = JSON.parse(json);
      setJsonError(null);
      onRun(parsed);
    } catch {
      setJsonError('Invalid JSON');
    }
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(json);
      setJsonError(null);
      onSave(event.id, name, parsed);
    } catch {
      setJsonError('Invalid JSON');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div
        style={{
          padding: '8px 10px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <button
          onClick={onBack}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#6b7280',
            padding: '2px 4px',
          }}
          title="Back to list"
        >
          ‹
        </button>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '13px',
            fontWeight: 600,
            color: '#111827',
            background: 'transparent',
            minWidth: 0,
          }}
        />
        <button
          onClick={handleSave}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '15px',
            color: '#6b7280',
            padding: '2px 6px',
          }}
          title="Save"
        >
          💾
        </button>
        <button
          onClick={handleRun}
          disabled={running}
          style={{
            border: 'none',
            background: 'none',
            cursor: running ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            color: running ? '#9ca3af' : '#2563eb',
            padding: '2px 6px',
          }}
          title="Run"
        >
          ▶
        </button>
      </div>

      {/* JSON Editor */}
      <div style={{ flex: 1, position: 'relative' }}>
        <textarea
          value={json}
          onChange={(e) => {
            setJson(e.target.value);
            setJsonError(null);
          }}
          spellCheck={false}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
            fontSize: '12px',
            lineHeight: '1.5',
            padding: '10px 12px',
            backgroundColor: '#fafafa',
            color: '#1f2937',
          }}
        />
      </div>

      {jsonError && (
        <div
          style={{
            padding: '6px 12px',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            fontSize: '11px',
            borderTop: '1px solid #fecaca',
          }}
        >
          {jsonError}
        </div>
      )}
    </div>
  );
}

// ---------- Test Events Left Panel (injected into GraphSimulator) ----------
function TestEventsLeftPanel({
  decisionId,
  graph,
  onChange,
  onRun,
  loading,
}: {
  decisionId: string;
  graph: DecisionGraphType;
  onChange?: (contextJson: string) => void;
  onRun?: (payload: { graph: DecisionGraphType; context: unknown }) => void;
  loading?: boolean;
  hasInputNode?: boolean;
  defaultRequest?: string;
}) {
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([]);
  const [activeEvent, setActiveEvent] = useState<{
    id?: string;
    name: string;
    context: any;
  } | null>(null);

  const loadRequests = useCallback(() => {
    fetchSavedRequests(decisionId).then(setSavedRequests).catch(console.error);
  }, [decisionId]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleNew = () => {
    setActiveEvent({ name: 'New Event', context: {} });
  };

  const handleOpen = (req: SavedRequest) => {
    setActiveEvent({ id: req.id, name: req.name, context: req.context });
  };

  const handleRunFromList = (req: SavedRequest, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(JSON.stringify(req.context, null, 2));
    onRun?.({ graph, context: req.context });
  };

  const handleDelete = async (reqId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteSavedRequest(decisionId, reqId);
    loadRequests();
  };

  const handleSaveEvent = async (id: string | undefined, name: string, context: any) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    if (id) {
      await fetch(`${API_BASE}/api/decisions/${decisionId}/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, context }),
      });
    } else {
      const saved = await createSavedRequest(decisionId, name, context);
      setActiveEvent({ id: saved.id, name: saved.name, context: saved.context });
    }
    loadRequests();
  };

  // ---------- Detail View ----------
  if (activeEvent) {
    return (
      <EventDetailView
        event={activeEvent}
        onBack={() => { setActiveEvent(null); loadRequests(); }}
        onRun={(ctx) => {
          onChange?.(JSON.stringify(ctx, null, 2));
          onRun?.({ graph, context: ctx });
        }}
        onSave={handleSaveEvent}
        running={loading || false}
      />
    );
  }

  // ---------- List View ----------
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
          Test Events
        </span>
        <button
          onClick={handleNew}
          style={{
            fontSize: '18px',
            lineHeight: 1,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '0 4px',
          }}
          title="New event"
        >
          +
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {savedRequests.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>📋</div>
            <div style={{ fontSize: '12px' }}>No test events yet</div>
            <button
              onClick={handleNew}
              style={{
                marginTop: '12px',
                fontSize: '12px',
                padding: '4px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
                color: '#2563eb',
              }}
            >
              + Create first event
            </button>
          </div>
        ) : (
          savedRequests.map((req) => (
            <div
              key={req.id}
              onClick={() => handleOpen(req)}
              style={{
                padding: '8px 12px',
                borderBottom: '1px solid #f3f4f6',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                transition: 'background-color 0.1s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f9fafb'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 500,
                    color: '#374151',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {req.name}
                </div>
              </div>
              <button
                onClick={(e) => handleRunFromList(req, e)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#2563eb',
                  fontSize: '12px',
                  padding: '2px 6px',
                  flexShrink: 0,
                }}
                title="Load into simulator"
              >
                ▶
              </button>
              <button
                onClick={(e) => handleDelete(req.id, e)}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#d1d5db',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '2px 4px',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#dc2626'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#d1d5db'; }}
                title="Delete"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---------- Main Editor ----------
function DecisionEditorInner({ value, onChange, disabled, decisionId, onSimulationRun }: DecisionEditorProps) {
  const [simulate, setSimulate] = useState<Simulation | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleRun = useCallback(
    async (payload: { graph: DecisionGraphType; context: unknown }) => {
      if (!onSimulationRun) return;
      setLoading(true);
      try {
        const result = await onSimulationRun(payload);
        setSimulate(result);
      } catch (err) {
        setSimulate({
          error: {
            title: 'Simulation Error',
            message: err instanceof Error ? err.message : 'Unknown error',
            data: {},
          },
        });
      } finally {
        setLoading(false);
      }
    },
    [onSimulationRun]
  );

  const panels = onSimulationRun
    ? [
        {
          id: 'simulator',
          title: 'Simulator',
          icon: '🧪',
          renderPanel: () => (
            <GraphSimulator
              onRun={handleRun}
              onClear={() => setSimulate(undefined)}
              loading={loading}
              defaultRequest={JSON.stringify(
                { customer: { tier: 'gold' }, cart: { total: 500 } },
                null,
                2
              )}
              leftPanel={(props: any) => (
                <TestEventsLeftPanel
                  decisionId={decisionId}
                  graph={value}
                  onChange={props.onChange}
                  onRun={props.onRun}
                  loading={props.loading}
                />
              )}
            />
          ),
        },
      ]
    : undefined;

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <JdmConfigProvider>
        <DecisionGraph
          value={value}
          onChange={onChange}
          disabled={disabled}
          simulate={simulate}
          panels={panels}
          defaultActivePanel="simulator"
        />
      </JdmConfigProvider>
    </div>
  );
}

export default function DecisionEditor(props: DecisionEditorProps) {
  const [loaded, setLoaded] = useState(false);

  React.useEffect(() => {
    import('@gorules/jdm-editor').then((mod) => {
      DecisionGraph = mod.DecisionGraph;
      JdmConfigProvider = mod.JdmConfigProvider;
      GraphSimulator = mod.GraphSimulator;
      setLoaded(true);
    });
  }, []);

  if (!loaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>
        Loading Decision Editor...
      </div>
    );
  }

  return <DecisionEditorInner {...props} />;
}
