const express = require('express');
const router = express.Router();
const { getTasksByProject, createTask, getTaskById, updateTask, updateTaskStatus, assignTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/project/:projectId').get(getTasksByProject).post(createTask);
router.route('/:id').get(getTaskById).put(updateTask).delete(deleteTask);
router.route('/:id/status').put(updateTaskStatus);
router.route('/:id/assign').put(assignTask);

module.exports = router;
