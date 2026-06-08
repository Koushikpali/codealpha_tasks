const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Project = require('../models/Project');

const isProjectMember = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return false;
  return project.owner.toString() === userId.toString() ||
    project.members.some((m) => m.toString() === userId.toString());
};

const getCommentsByTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const allowed = await isProjectMember(task.project, req.user._id);
    if (!allowed) return res.status(403).json({ message: 'Access denied' });
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('author', 'name email avatar')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const allowed = await isProjectMember(task.project, req.user._id);
    if (!allowed) return res.status(403).json({ message: 'Access denied' });
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text is required' });
    const comment = await Comment.create({ text, task: req.params.taskId, author: req.user._id });
    await comment.populate('author', 'name email avatar');
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'You can only delete your own comments' });
    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCommentsByTask, addComment, deleteComment };
