import { useState } from 'react';
import Modal from '../shared/Modal';
import api from '../../api/axios';

const CreateTaskModal = ({ isOpen, onClose, projectId, members, onCreated }) => {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const payload = { ...form, assignedTo: form.assignedTo || null, dueDate: form.dueDate || null };
      const { data } = await api.post(`/tasks/project/${projectId}`, payload);
      onCreated(data);
      setForm({ title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '' });
      onClose();
    } catch (err) { setError(err.response?.data?.message || 'Failed to create task'); }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Task">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-400">*</span></label>
          <input name="title" value={form.title} onChange={handleChange} required placeholder="Task title"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Optional description"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
            <select name="priority" value={form.priority} onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
            <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
          <select name="assignedTo" value={form.assignedTo} onChange={handleChange}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Unassigned</option>
            {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg text-slate-600 hover:bg-slate-100 transition">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-60">
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
