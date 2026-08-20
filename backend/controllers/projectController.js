const Project = require("../models/Project");
const Request = require("../models/Request");

// ======================================================
// CREATE PROJECT
// ======================================================

const createProject = async (req, res) => {
    try {
        const {
            domain,
            title,
            description,
            difficulty,
            projectType,
            maxMembers,
            contact
        } = req.body;

        // ---------------- VALIDATION ----------------

        if (
            !domain ||
            !title ||
            !description ||
            !difficulty ||
            !projectType ||
            !contact
        ) {
            return res.status(400).json({
                message: "All project fields are required"
            });
        }

        // Individual project
        if (projectType === "individual") {
            if (Number(maxMembers) !== 1) {
                return res.status(400).json({
                    message:
                        "Individual projects can have only 1 member"
                });
            }
        }

        // Group project
        if (projectType === "group") {
            if (
                !maxMembers ||
                Number(maxMembers) < 2 ||
                Number(maxMembers) > 10
            ) {
                return res.status(400).json({
                    message:
                        "Group projects must allow between 2 and 10 members"
                });
            }
        }

        // ---------------- CREATE PROJECT ----------------

        const project = await Project.create({
            domain,
            title: title.trim(),
            description: description.trim(),
            difficulty,
            projectType,
            maxMembers: Number(maxMembers),
            contact: contact.trim(),
            mentor: req.user.userId
        });

        return res.status(201).json({
            message: "Project created successfully",
            project
        });

    } catch (error) {

        console.error(
            "Create project error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


// ======================================================
// GET ALL PROJECTS
// ======================================================

const getAllProjects = async (req, res) => {
    try {

        const projects = await Project.find()
            .populate(
                "mentor",
                "name email"
            )
            .sort({
                createdAt: -1
            });

        // Calculate accepted members
        const projectsWithMembers = await Promise.all(

            projects.map(async (project) => {

                const acceptedMembers =
                    await Request.countDocuments({
                        project: project._id,
                        status: "accepted"
                    });

                return {
                    ...project.toObject(),

                    acceptedMembers
                };
            })
        );

        return res.status(200).json({
            projects: projectsWithMembers
        });

    } catch (error) {

        console.error(
            "Get projects error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


// ======================================================
// GET MY PROJECTS
// ======================================================

const getMyProjects = async (req, res) => {
    try {

        const projects = await Project.find({
            mentor: req.user.userId
        })
            .sort({
                createdAt: -1
            });

        // Calculate accepted members
        const projectsWithMembers = await Promise.all(

            projects.map(async (project) => {

                const acceptedMembers =
                    await Request.countDocuments({
                        project: project._id,
                        status: "accepted"
                    });

                return {
                    ...project.toObject(),

                    acceptedMembers
                };
            })
        );

        return res.status(200).json({
            projects: projectsWithMembers
        });

    } catch (error) {

        console.error(
            "Get my projects error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


// ======================================================
// GET SINGLE PROJECT
// ======================================================

const getProjectById = async (req, res) => {
    try {

        const project =
            await Project.findById(
                req.params.id
            )
            .populate(
                "mentor",
                "name email"
            );

        if (!project) {

            return res.status(404).json({
                message: "Project not found"
            });
        }

        // Calculate accepted members
        const acceptedMembers =
            await Request.countDocuments({
                project: project._id,
                status: "accepted"
            });

        return res.status(200).json({

            project: {
                ...project.toObject(),

                acceptedMembers
            }

        });

    } catch (error) {

        console.error(
            "Get project error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


// ======================================================
// DELETE PROJECT
// ======================================================

const deleteProject = async (req, res) => {
    try {

        const project =
            await Project.findById(
                req.params.id
            );

        if (!project) {

            return res.status(404).json({
                message: "Project not found"
            });
        }

        // Only project owner can delete
        if (
            project.mentor.toString() !==
            req.user.userId.toString()
        ) {

            return res.status(403).json({
                message:
                    "You can only delete your own projects"
            });
        }

        // Delete project
        await Project.findByIdAndDelete(
            req.params.id
        );

        // Also remove related requests
        await Request.deleteMany({
            project: req.params.id
        });

        return res.status(200).json({
            message:
                "Project deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete project error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    createProject,
    getAllProjects,
    getMyProjects,
    getProjectById,
    deleteProject
};