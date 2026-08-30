const API_BASE = '/api';

export const fetchHealth = async () => {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
};

export const fetchSampleQueries = async () => {
  const res = await fetch(`${API_BASE}/sample-queries`);
  if (!res.ok) throw new Error('Failed to load sample queries');
  return res.json();
};

export const submitClinicalQuery = async (query, mode = 'adaptive') => {
  const res = await fetch(`${API_BASE}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, mode })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Query execution failed');
  }
  return res.json();
};

export const fetchKgStats = async () => {
  const res = await fetch(`${API_BASE}/kg/stats`);
  if (!res.ok) throw new Error('Failed to fetch KG stats');
  return res.json();
};

export const fetchKgGraph = async (entities = '') => {
  const url = entities ? `${API_BASE}/kg/graph?entities=${encodeURIComponent(entities)}` : `${API_BASE}/kg/graph`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch KG graph');
  return res.json();
};

export const runBenchmarkSuite = async () => {
  const res = await fetch(`${API_BASE}/benchmark/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Benchmark execution failed');
  }
  return res.json();
};
