import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import api from '../api';

type User = {
  _id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
  teamId?: string;
}

type Project = {
  _id: string;
  name: string;
  description?: string;
}

export default function Dashboard(){
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    async function load(){
      try{
        const [uRes, pRes] = await Promise.all([
          api.get('/users/me'),
          api.get('/projects')
        ]);
        setUser(uRes.data);
        setProjects(pRes.data || []);
      }catch(err){
        console.error('Failed to load dashboard data', err);
      }finally{ setLoading(false); }
    }
    load();
  }, []);

  async function createProject(e: React.FormEvent){
    e.preventDefault();
    if (!name.trim()) return alert('Name required');
    setCreating(true);
    try{
      const res = await api.post('/projects', { name, description });
      setProjects(p => [res.data, ...p]);
      setName(''); setDescription('');
    }catch(err){
      console.error(err);
  // @ts-expect-error - err may be an AxiosError with response
  alert(err?.response?.data?.message || 'Create failed');
    }finally{ setCreating(false); }
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

        {loading && <p>Loading...</p>}

        {!loading && user && (
          <div className="mb-6">
            <p>Signed in as <strong>{user.name}</strong> ({user.role})</p>
          </div>
        )}

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Projects</h2>
          {projects.length === 0 && <p className="text-sm text-muted-foreground">No projects yet.</p>}
          <ul className="space-y-2">
            {projects.map(p => (
              <li key={p._id} className="p-3 border rounded">
                {editingId === p._id ? (
                  <form onSubmit={e=>{e.preventDefault(); saveEdit(p._id);}} className="space-y-2">
                    <input value={editName} onChange={e=>setEditName(e.target.value)} className="w-full p-2 border" />
                    <textarea value={editDescription} onChange={e=>setEditDescription(e.target.value)} className="w-full p-2 border" />
                    <div className="flex gap-2">
                      <button type="submit" className="px-3 py-1 bg-green-600 text-white">Save</button>
                      <button type="button" onClick={()=>cancelEdit()} className="px-3 py-1 border">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{p.name}</div>
                      {p.description && <div className="text-sm text-gray-500">{p.description}</div>}
                    </div>
                    <div className="flex gap-2">
                      {(user && (user.role === 'ADMIN' || user.role === 'MANAGER')) && (
                        <button onClick={()=>startEdit(p)} className="px-2 py-1 border">Edit</button>
                      )}
                      {(user && user.role === 'ADMIN') && (
                        <button onClick={()=>deleteProject(p._id)} className="px-2 py-1 bg-red-600 text-white">Delete</button>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Create project form - visible to ADMIN and MANAGER */}
        {user && (user.role === 'ADMIN' || user.role === 'MANAGER') && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Create Project</h2>
            <form onSubmit={createProject} className="space-y-3 max-w-md">
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Project name" className="w-full p-2 border" />
              <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description (optional)" className="w-full p-2 border" />
              <div>
                <button disabled={creating} className="px-4 py-2 bg-blue-600 text-white">{creating ? 'Creating...' : 'Create Project'}</button>
              </div>
            </form>
          </section>
        )}

      </main>
    </div>
  );
}
