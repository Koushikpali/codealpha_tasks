const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ $or: [{ owner: req.user._id }, { members: req.user._id }] })
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: 'Project title is required' });
    const project = await Project.create({ title, description, owner: req.user._id, members: [req.user._id] });
    await project.populate('owner', 'name email avatar');
    await project.populate('members', 'name email avatar');
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const isMember = project.owner._id.toString() === req.user._id.toString() ||
      project.members.some((m) => m._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access denied' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the owner can update this project' });
    const { title, description } = req.body;
    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    const updated = await project.save();
    await updated.populate('owner', 'name email avatar');
    await updated.populate('members', 'name email avatar');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the owner can delete this project' });
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the owner can add members' });
    const { email } = req.body;
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ message: 'User not found' });
    const alreadyMember = project.members.some((m) => m.toString() === userToAdd._id.toString());
    if (alreadyMember) return res.status(400).json({ message: 'User is already a member' });
    project.members.push(userToAdd._id);
    await project.save();
    await project.populate('owner', 'name email avatar');
    await project.populate('members', 'name email avatar');
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the owner can remove members' });
    if (req.params.userId === project.owner.toString())
      return res.status(400).json({ message: 'Cannot remove the project owner' });
    project.members = project.members.filter((m) => m.toString() !== req.params.userId);
    await project.save();
    await project.populate('owner', 'name email avatar');
    await project.populate('members', 'name email avatar');
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProjects, createProject, getProjectById, updateProject, deleteProject, addMember, removeMember };
