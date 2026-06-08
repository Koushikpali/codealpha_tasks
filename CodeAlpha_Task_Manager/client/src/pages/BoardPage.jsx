import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/shared/Navbar';
import Spinner from '../components/shared/Spinner';
import KanbanColumn from '../components/board/KanbanColumn';
import CreateTaskModal from '../components/task/CreateTaskModal';
import AddMemberModal from '../components/board/AddMemberModal';
import useAuth from '../hooks/useAuth';

const STATUSES = ['todo', 'in_progress', 'done'];

const BoardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState('todo');

  useEffect(() => {
    Promise.all([api.get(`/projects/${id}`), api.get(`/tasks/project/${id}`)])
      .then(([projRes, tasksRes]) => { setProject(projRes.data); setTasks(tasksRes.data); })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try { await api.delete(`/tasks/${taskId}`); setTasks((prev) => prev.filter((t) => t._id !== taskId)); }
    catch (err) { alert(err.response?.data?.message || 'Failed to delete task'); }
  };

  const handleStatusChange = async (taskId, status) => {
    try { const { data } = await api.put(`/tasks/${taskId}/status`, { status }); setTasks((prev) => prev.map((t) => (t._id === taskId ? data : t))); }
    catch (err) { console.error(err); }
  };

  if (loading) return <div className="min-h-screen bg-slate-100"><Navbar /><Spinner size="lg" /></div>;

  const isOwner = project?.owner._id === user._id;

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <button onClick={() => navigate('/')} className="text-sm text-slate-500 hover:text-blue-600 mb-1 flex items-center gap-1 transition">← Dashboard</button>
            <h1 className="text-xl font-bold text-slate-800">{project?.title}</h1>
            {project?.description && <p className="text-sm text-slate-500 mt-0.5">{project.description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {project?.members.map((m) => (
                <div key={m._id} className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-semibold" title={m.name}>
                  {m.name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            {isOwner && (
              <button onClick={() => setShowMemberModal(true)}
                className="text-sm text-slate-600 hover:text-blue-600 border border-slate-300 hover:border-blue-400 px-3 py-1.5 rounded-lg transition">
                + Member
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATUSES.map((status) => (
            <KanbanColumn key={status} status={status}
              tasks={tasks.filter((t) => t.status === status)}
              onAddTask={() => { setDefaultStatus(status); setShowTaskModal(true); }}
              onDeleteTask={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      </div>

      <CreateTaskModal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)}
        projectId={id} members={project?.members || []}
        onCreated={(task) => setTasks((prev) => [task, ...prev])} />
      <AddMemberModal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)}
        projectId={id} onMemberAdded={(updated) => setProject(updated)} />
    </div>
  );
};

export default BoardPage;
