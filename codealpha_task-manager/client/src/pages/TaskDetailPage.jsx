import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/shared/Navbar';
import Spinner from '../components/shared/Spinner';
import useAuth from '../hooks/useAuth';

const priorityStyles = {
  low:    'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  high:   'bg-red-100 text-red-700 border-red-200',
};

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    Promise.all([api.get(`/tasks/${id}`), api.get(`/comments/task/${id}`)])
      .then(([taskRes, commentsRes]) => {
        setTask(taskRes.data);
        setEditForm({
          title: taskRes.data.title,
          description: taskRes.data.description,
          priority: taskRes.data.priority,
          dueDate: taskRes.data.dueDate ? new Date(taskRes.data.dueDate).toISOString().split('T')[0] : '',
        });
        setComments(commentsRes.data);
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (e) => {
    try { const { data } = await api.put(`/tasks/${id}/status`, { status: e.target.value }); setTask(data); }
    catch (err) { console.error(err); }
  };

  const handleEditSave = async () => {
    try { const { data } = await api.put(`/tasks/${id}`, editForm); setTask(data); setEditing(false); }
    catch (err) { alert(err.response?.data?.message || 'Update failed'); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try { const { data } = await api.post(`/comments/task/${id}`, { text: commentText }); setComments((prev) => [...prev, data]); setCommentText(''); }
    catch (err) { alert(err.response?.data?.message || 'Failed to post comment'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteComment = async (commentId) => {
    try { await api.delete(`/comments/${commentId}`); setComments((prev) => prev.filter((c) => c._id !== commentId)); }
    catch (err) { alert(err.response?.data?.message || 'Failed to delete comment'); }
  };

  if (loading) return <div className="min-h-screen bg-slate-100"><Navbar /><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-blue-600 mb-4 flex items-center gap-1 transition">← Back to Board</button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
          {editing ? (
            <div className="flex flex-col gap-3">
              <input value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                className="text-lg font-bold border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <textarea value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                rows={3} placeholder="Description"
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Priority</label>
                  <select value={editForm.priority} onChange={(e) => setEditForm((p) => ({ ...p, priority: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Due Date</label>
                  <input type="date" value={editForm.dueDate} onChange={(e) => setEditForm((p) => ({ ...p, dueDate: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleEditSave} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">Save</button>
                <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-xl font-bold text-slate-800">{task.title}</h1>
                <button onClick={() => setEditing(true)} className="text-sm text-slate-400 hover:text-blue-600 transition flex-shrink-0">Edit</button>
              </div>
              {task.description && <p className="text-slate-600 text-sm mt-2">{task.description}</p>}
            </>
          )}

          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Status</label>
              <select value={task.status} onChange={handleStatusChange}
                className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Priority</label>
              <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border ${priorityStyles[task.priority]}`}>{task.priority}</span>
            </div>
            {task.assignedTo && (
              <div>
                <label className="text-xs text-slate-400 block mb-1">Assigned To</label>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                    {task.assignedTo.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-700">{task.assignedTo.name}</span>
                </div>
              </div>
            )}
            {task.dueDate && (
              <div>
                <label className="text-xs text-slate-400 block mb-1">Due Date</label>
                <span className="text-sm text-slate-700">{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Comments ({comments.length})</h2>
          <div className="flex flex-col gap-3 mb-4">
            {comments.length === 0 ? (
              <p className="text-sm text-slate-400">No comments yet. Be the first!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="flex gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-0.5">
                    {comment.author.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700">{comment.author.name}</span>
                      <span className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleString()}</span>
                      {comment.author._id === user._id && (
                        <button onClick={() => handleDeleteComment(comment._id)}
                          className="text-xs text-slate-300 hover:text-red-500 transition ml-auto opacity-0 group-hover:opacity-100">Delete</button>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-0.5">{comment.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment..."
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" disabled={submitting || !commentText.trim()}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50">
              {submitting ? '...' : 'Post'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
