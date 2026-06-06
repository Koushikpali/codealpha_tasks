const express = require('express');
const router = express.Router();
const { getProjects, createProject, getProjectById, updateProject, deleteProject, addMember, removeMember } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getProjects).post(createProject);
router.route('/:id').get(getProjectById).put(updateProject).delete(deleteProject);
router.route('/:id/members').post(addMember);
router.route('/:id/members/:userId').delete(removeMember);

module.exports = router;
