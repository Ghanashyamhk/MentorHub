const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createProject,
    getAllProjects,
    getMyProjects,
    getProjectById,
    deleteProject
} = require("../controllers/projectController");


// Create project
router.post(
    "/",
    authMiddleware,
    createProject
);


// Get all projects
router.get(
    "/",
    authMiddleware,
    getAllProjects
);


// Get mentor's own projects
router.get(
    "/my-projects",
    authMiddleware,
    getMyProjects
);


// Get single project
router.get(
    "/:id",
    authMiddleware,
    getProjectById
);


// Delete project
router.delete(
    "/:id",
    authMiddleware,
    deleteProject
);


module.exports = router;