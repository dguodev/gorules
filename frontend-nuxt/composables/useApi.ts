export interface Decision {
  id: string;
  name: string;
  graph: any;
  createdAt: string;
  updatedAt: string;
}

export interface SavedRequest {
  id: string;
  name: string;
  context: any;
  createdAt: string;
}

export interface SimulationResult {
  result: any;
  performance: string;
  trace: any;
}

export const useApi = () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;

  const fetchDecisions = async (): Promise<Decision[]> => {
    const res = await fetch(`${apiBase}/api/decisions`);
    if (!res.ok) throw new Error('Failed to fetch decisions');
    return res.json();
  };

  const fetchDecision = async (id: string): Promise<Decision> => {
    const res = await fetch(`${apiBase}/api/decisions/${id}`);
    if (!res.ok) throw new Error('Failed to fetch decision');
    return res.json();
  };

  const createDecision = async (name: string): Promise<Decision> => {
    const res = await fetch(`${apiBase}/api/decisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Failed to create decision');
    return res.json();
  };

  const updateDecision = async (
    id: string,
    data: { name?: string; graph?: any }
  ): Promise<Decision> => {
    const res = await fetch(`${apiBase}/api/decisions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update decision');
    return res.json();
  };

  const deleteDecision = async (id: string): Promise<void> => {
    const res = await fetch(`${apiBase}/api/decisions/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete decision');
  };

  const simulateDecision = async (
    id: string,
    context: any
  ): Promise<SimulationResult> => {
    const res = await fetch(`${apiBase}/api/decisions/${id}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Simulation failed');
    }
    return res.json();
  };

  const fetchSavedRequests = async (decisionId: string): Promise<SavedRequest[]> => {
    const res = await fetch(`${apiBase}/api/decisions/${decisionId}/requests`);
    if (!res.ok) throw new Error('Failed to fetch saved requests');
    return res.json();
  };

  const createSavedRequest = async (
    decisionId: string,
    name: string,
    context: any
  ): Promise<SavedRequest> => {
    const res = await fetch(`${apiBase}/api/decisions/${decisionId}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, context }),
    });
    if (!res.ok) throw new Error('Failed to save request');
    return res.json();
  };

  const deleteSavedRequest = async (
    decisionId: string,
    requestId: string
  ): Promise<void> => {
    const res = await fetch(`${apiBase}/api/decisions/${decisionId}/requests/${requestId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete saved request');
  };

  return {
    fetchDecisions,
    fetchDecision,
    createDecision,
    updateDecision,
    deleteDecision,
    simulateDecision,
    fetchSavedRequests,
    createSavedRequest,
    deleteSavedRequest
  };
};
