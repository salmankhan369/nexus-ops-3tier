import React, { useState, useEffect } from 'react';

function App() {
  const [health, setHealth] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [servingPod, setServingPod] = useState('Loading...');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchSystemData = async () => {
    try {
      const healthRes = await fetch('/api/health');
      const healthData = await healthRes.json();
      setHealth(healthData);

      const tasksRes = await fetch('/api/tasks');
      const tasksData = await tasksRes.json();
      setTasks(tasksData.data || []);
      setServingPod(tasksData.pod || healthData.pod);
    } catch (err) {
      setHealth({ status: 'DOWN', database: 'Unreachable' });
    }
  };

  useEffect(() => {
    fetchSystemData();
    const interval = setInterval(fetchSystemData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, environment: 'EKS-Prod' })
      });
      setTitle('');
      await fetchSystemData();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    await fetchSystemData();
  };

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>Nexus-Ops 3-Tier Platform</h1>
          <small style={{ color: '#94a3b8' }}>
            AWS EKS + ArgoCD GitOps + Private RDS MySQL
          </small>
        </div>
        <span className="badge">GitOps Synced</span>
      </div>

      <div className="status-grid">
        <div className="card">
          <h3>API & Cluster Health</h3>
          <p className={health?.status === 'UP' ? 'status-up' : 'status-down'}>
            {health?.status || 'Checking...'}
          </p>
        </div>
        <div className="card">
          <h3>Active Backend Pod</h3>
          <p>{servingPod}</p>
        </div>
        <div className="card">
          <h3>Database Tier (Port 3306)</h3>
          <p className={health?.status === 'UP' ? 'status-up' : 'status-down'}>
            {health?.database || 'Connecting...'}
          </p>
        </div>
      </div>

      <form className="form-box" onSubmit={handleAddTask}>
        <input
          type="text"
          placeholder="Add deployment note or task to RDS MySQL..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save to RDS'}
        </button>
      </form>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className="task-item">
            <div>
              <strong>{task.title}</strong>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                ID: #{task.id} | Env: {task.environment} |{' '}
                {new Date(task.created_at).toLocaleString()}
              </div>
            </div>
            <button className="delete-btn" onClick={() => handleDelete(task.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;