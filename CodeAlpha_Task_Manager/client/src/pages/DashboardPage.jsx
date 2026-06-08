import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/shared/Navbar';
import Spinner from '../components/shared/Spinner';
import ProjectCard from '../components/board/ProjectCard';
import CreateProjectModal from '../components/board/CreateProjectModal';

const DashboardPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.get('/projects')
      .then(({ data }) => setProjects(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try { await api.delete(`/projects/${id}`); setProjects((prev) => prev.filter((p) => p._id !== id)); }
    catch (err) { alert(err.response?.data?.message || 'Failed to delete project'); }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Projects</h1>
            <p className="text-slate-500 text-sm mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition flex items-center gap-2">
            <span className="text-lg leading-none">+</span> New Project
          </button>
        </div>

        {loading ? <Spinner /> : projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-slate-700">No projects yet</h2>
            <p className="text-slate-500 text-sm mt-1">Create your first project to get started</p>
            <button onClick={() => setShowModal(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition">
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
      <CreateProjectModal isOpen={showModal} onClose={() => setShowModal(false)} onCreated={(p) => setProjects((prev) => [p, ...prev])} />
    </div>
  );
};

export default DashboardPage;
