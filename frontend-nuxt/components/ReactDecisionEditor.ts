import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DecisionGraph, GraphSimulator, JdmConfigProvider } from '@gorules/jdm-editor'
import type { DecisionGraphType, Simulation } from '@gorules/jdm-editor'

export interface DecisionEditorProps {
  value: DecisionGraphType
  onChange: (value: DecisionGraphType) => void
  disabled?: boolean
  decisionId: string
  onSimulationRun?: (payload: { graph: DecisionGraphType; context: unknown }) => Promise<Simulation>
  fetchSavedRequests: (id: string) => Promise<any[]>
  createSavedRequest: (id: string, name: string, context: any) => Promise<any>
  deleteSavedRequest: (id: string, reqId: string) => Promise<void>
  updateSavedRequest: (id: string, reqId: string, name: string, context: any) => Promise<void>
}

const h = React.createElement

function EventDetailView({
  event,
  onBack,
  onRun,
  onSave,
  running,
}: {
  event: { id?: string; name: string; context: any }
  onBack: () => void
  onRun: (context: any) => void
  onSave: (id: string | undefined, name: string, context: any) => void
  running: boolean
}) {
  const [name, setName] = useState(event.name)
  const [json, setJson] = useState(JSON.stringify(event.context, null, 2))
  const [jsonError, setJsonError] = useState<string | null>(null)

  const handleRun = () => {
    try {
      const parsed = JSON.parse(json)
      setJsonError(null)
      onRun(parsed)
    } catch {
      setJsonError('Invalid JSON')
    }
  }

  const handleSave = () => {
    try {
      const parsed = JSON.parse(json)
      setJsonError(null)
      onSave(event.id, name, parsed)
    } catch {
      setJsonError('Invalid JSON')
    }
  }

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', height: '100%' } },
    h(
      'div',
      {
        style: {
          padding: '8px 10px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        },
      },
      h(
        'button',
        {
          onClick: onBack,
          style: { border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', color: '#6b7280' },
        },
        '‹'
      ),
      h('input', {
        value: name,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value),
        style: { flex: 1, border: 'none', outline: 'none', fontSize: '13px', fontWeight: 600 },
      }),
      h(
        'button',
        {
          onClick: handleSave,
          style: { border: 'none', background: 'none', cursor: 'pointer', fontSize: '15px' },
        },
        '💾'
      ),
      h(
        'button',
        {
          onClick: handleRun,
          disabled: running,
          style: {
            border: 'none',
            background: 'none',
            cursor: running ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            color: running ? '#9ca3af' : '#2563eb',
          },
        },
        '▶'
      )
    ),
    h('textarea', {
      value: json,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setJson(e.target.value)
        setJsonError(null)
      },
      style: {
        width: '100%',
        flex: 1,
        border: 'none',
        outline: 'none',
        resize: 'none',
        fontFamily: 'monospace',
        fontSize: '12px',
        padding: '10px',
        backgroundColor: '#fafafa',
      },
    }),
    jsonError
      ? h(
          'div',
          {
            style: {
              padding: '6px 12px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              fontSize: '11px',
            },
          },
          jsonError
        )
      : null
  )
}

function TestEventsLeftPanel({
  decisionId,
  graph,
  onChange,
  onRun,
  loading,
  fetchSavedRequests,
  createSavedRequest,
  deleteSavedRequest,
  updateSavedRequest,
}: any) {
  const [savedRequests, setSavedRequests] = useState<any[]>([])
  const [activeEvent, setActiveEvent] = useState<any | null>(null)

  const loadRequests = useCallback(() => {
    fetchSavedRequests(decisionId).then(setSavedRequests).catch(console.error)
  }, [decisionId, fetchSavedRequests])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  const handleSaveEvent = async (id: string | undefined, name: string, context: any) => {
    if (id) {
      await updateSavedRequest(decisionId, id, name, context)
    } else {
      const saved = await createSavedRequest(decisionId, name, context)
      setActiveEvent({ id: saved.id, name: saved.name, context: saved.context })
    }
    loadRequests()
  }

  if (activeEvent) {
    return h(EventDetailView, {
      event: activeEvent,
      onBack: () => {
        setActiveEvent(null)
        loadRequests()
      },
      onRun: (ctx: any) => {
        onChange?.(JSON.stringify(ctx, null, 2))
        onRun?.({ graph, context: ctx })
      },
      onSave: handleSaveEvent,
      running: loading || false,
    })
  }

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', height: '100%' } },
    h(
      'div',
      {
        style: {
          padding: '8px 12px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
        },
      },
      h('span', { style: { fontSize: '13px', fontWeight: 600 } }, 'Test Events'),
      h(
        'button',
        {
          onClick: () => setActiveEvent({ name: 'New Event', context: {} }),
          style: { border: 'none', background: 'none', cursor: 'pointer' },
        },
        '+'
      )
    ),
    h(
      'div',
      { style: { flex: 1, overflow: 'auto' } },
      ...savedRequests.map((req) =>
        h(
          'div',
          {
            key: req.id,
            onClick: () => setActiveEvent({ id: req.id, name: req.name, context: req.context }),
            style: {
              padding: '8px 12px',
              borderBottom: '1px solid #f3f4f6',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            },
          },
          h('div', { style: { flex: 1, fontSize: '13px' } }, req.name),
          h(
            'button',
            {
              onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation()
                onChange?.(JSON.stringify(req.context, null, 2))
                onRun?.({ graph, context: req.context })
              },
              style: { border: 'none', background: 'none', color: '#2563eb' },
            },
            '▶'
          ),
          h(
            'button',
            {
              onClick: async (e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation()
                await deleteSavedRequest(decisionId, req.id)
                loadRequests()
              },
              style: { border: 'none', background: 'none', color: '#d1d5db' },
            },
            '×'
          )
        )
      )
    )
  )
}

export const ReactDecisionEditor: React.FC<DecisionEditorProps> = (props) => {
  const [simulate, setSimulate] = useState<Simulation | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const latestGraphRef = useRef(props.value)

  useEffect(() => {
    latestGraphRef.current = props.value
  }, [props.value])

  const handleRun = useCallback(
    async (payload: { graph: DecisionGraphType; context: unknown }) => {
      if (!props.onSimulationRun) return
      setLoading(true)
      try {
        const result = await props.onSimulationRun(payload)
        setSimulate(result)
      } catch (err) {
        setSimulate({
          error: {
            title: 'Simulation Error',
            message: err instanceof Error ? err.message : 'Unknown error',
            data: {},
          },
        })
      } finally {
        setLoading(false)
      }
    },
    [props.onSimulationRun]
  )

  const handleClear = useCallback(() => {
    setSimulate(undefined)
  }, [])

  const leftPanel = useCallback(
    (simulatorProps: any) =>
      h(TestEventsLeftPanel, {
        ...simulatorProps,
        decisionId: props.decisionId,
        graph: latestGraphRef.current,
        fetchSavedRequests: props.fetchSavedRequests,
        createSavedRequest: props.createSavedRequest,
        deleteSavedRequest: props.deleteSavedRequest,
        updateSavedRequest: props.updateSavedRequest,
      }),
    [
      props.decisionId,
      props.fetchSavedRequests,
      props.createSavedRequest,
      props.deleteSavedRequest,
      props.updateSavedRequest,
    ]
  )

  const renderSimulatorPanel = useCallback(
    () =>
      h(GraphSimulator, {
        onRun: handleRun,
        onClear: handleClear,
        loading,
        leftPanel,
      }),
    [handleRun, handleClear, loading, leftPanel]
  )

  const panels = useMemo(
    () =>
      props.onSimulationRun
        ? [
            {
              id: 'simulator',
              title: 'Simulator',
              icon: '🧪',
              renderPanel: renderSimulatorPanel,
            },
          ]
        : undefined,
    [props.onSimulationRun, renderSimulatorPanel]
  )

  return h(
    'div',
    { style: { height: '100%', width: '100%' } },
    h(
      JdmConfigProvider,
      null,
      h(DecisionGraph, {
        value: props.value,
        onChange: props.onChange,
        disabled: props.disabled,
        simulate,
        panels,
        defaultActivePanel: 'simulator',
      })
    )
  )
}
