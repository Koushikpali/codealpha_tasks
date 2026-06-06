const Task = require('../models/Task');
const Project = require('../models/Project');
const Comment = require('../models/Comment');

const isProjectMember = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return false;
  return project.owner.toString() === userId.toString() ||
    project.members.some((m) => m.toString() === userId.toString());
};

const getTasksByProject = async (req, res) => {
  try {
    const allowed = await isProjectMember(req.params.projectId, req.user._id);
    if (!allowed) return res.status(403).json({ message: 'Access denied' });
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const allowed = await isProjectMember(req.params.projectId, req.user._id);
    if (!allowed) return res.status(403).json({ message: 'Access denied' });
    const { title, description, priority, assignedTo, dueDate } = req.body;
    if (!title) return res.status(400).json({ message: 'Task title is required' });
    const task = await Task.create({ title, description, priority, assignedTo: assignedTo || null, dueDate: dueDate || null, project: req.params.projectId });
    await task.populate('assignedTo', 'name email avatar');
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('project', 'title');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const allowed = await isProjectMember(task.project._id, req.user._id);
    if (!allowed) return res.status(403).json({ message: 'Access denied' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const allowed = await isProjectMember(task.project, req.user._id);
    if (!allowed) return res.status(403).json({ message: 'Access denied' });
    const { title, description, priority, assignedTo, dueDate } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (dueDate !== undefined) task.dueDate = dueDate;
    const updated = await task.save();
    await updated.populate('assignedTo', 'name email avatar');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const allowed = await isProjectMember(task.project, req.user._id);
    if (!allowed) return res.status(403).json({ message: 'Access denied' });
    const { status } = req.body;
    if (!['todo', 'in_progress', 'done'].includes(status))
      return res.status(400).json({ message: 'Invalid status value' });
    task.status = status;
    const updated = await task.save();
    await updated.populate('assignedTo', 'name email avatar');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const assignTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const allowed = await isProjectMember(task.project, req.user._id);
    if (!allowed) return res.status(403).json({ message: 'Access denied' });
    task.assignedTo = req.body.assignedTo || null;
    const updated = await task.save();
    await updated.populate('assignedTo', 'name email avatar');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const allowed = await isProjectMember(task.project, req.user._id);
    if (!allowed) return res.status(403).json({ message: 'Access denied' });
    await Comment.deleteMany({ task: task._id });
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTasksByProject, createTask, getTaskById, updateTask, updateTaskStatus, assignTask, deleteTask };
