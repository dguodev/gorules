const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

export async function fetchDecisions(): Promise<Decision[]> {
  const res = await fetch(`${API_BASE}/api/decisions`);
  if (!res.ok) throw new Error('Failed to fetch decisions');
  return res.json();
}

export async function fetchDecision(id: string): Promise<Decision> {
  const res = await fetch(`${API_BASE}/api/decisions/${id}`);
  if (!res.ok) throw new Error('Failed to fetch decision');
  return res.json();
}

export async function createDecision(name: string): Promise<Decision> {
  const res = await fetch(`${API_BASE}/api/decisions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to create decision');
  return res.json();
}

export async function updateDecision(
  id: string,
  data: { name?: string; graph?: any }
): Promise<Decision> {
  const res = await fetch(`${API_BASE}/api/decisions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update decision');
  return res.json();
}

export async function deleteDecision(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/decisions/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete decision');
}

export async function simulateDecision(
  id: string,
  context: any
): Promise<SimulationResult> {
  const res = await fetch(`${API_BASE}/api/decisions/${id}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ context }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Simulation failed');
  }
  return res.json();
}

// Saved requests
export async function fetchSavedRequests(decisionId: string): Promise<SavedRequest[]> {
  const res = await fetch(`${API_BASE}/api/decisions/${decisionId}/requests`);
  if (!res.ok) throw new Error('Failed to fetch saved requests');
  return res.json();
}

export async function createSavedRequest(
  decisionId: string,
  name: string,
  context: any
): Promise<SavedRequest> {
  const res = await fetch(`${API_BASE}/api/decisions/${decisionId}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, context }),
  });
  if (!res.ok) throw new Error('Failed to save request');
  return res.json();
}

export async function deleteSavedRequest(
  decisionId: string,
  requestId: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/decisions/${decisionId}/requests/${requestId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete saved request');
}
