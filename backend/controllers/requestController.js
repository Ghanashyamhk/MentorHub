const Request = require("../models/Request");
const Project = require("../models/Project");
const Notification = require("../models/Notification");

// ================= CREATE REQUEST =================

const createRequest = async (req, res) => {
    try {
        const { projectId } = req.body;

        if (!projectId) {
            return res.status(400).json({
                message: "Project ID is required"
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        // Prevent mentor from requesting their own project
        if (
            project.mentor.toString() ===
            req.user.userId.toString()
        ) {
            return res.status(403).json({
                message: "You cannot request your own project"
            });
        }

        // Check duplicate request
        const existingRequest = await Request.findOne({
            student: req.user.userId,
            project: projectId
        });

        if (existingRequest) {
            return res.status(400).json({
                message: "You have already requested this project"
            });
        }

        // Count only accepted students
        // Pending requests do NOT occupy a slot
        const acceptedCount = await Request.countDocuments({
            project: projectId,
            status: "accepted"
        });

        // ================= INDIVIDUAL PROJECT =================

        if (
            project.projectType === "individual" &&
            acceptedCount >= 1
        ) {
            return res.status(400).json({
                message: "This individual project already has a student"
            });
        }

        // ================= GROUP PROJECT =================

        if (
            project.projectType === "group" &&
            acceptedCount >= project.maxMembers
        ) {
            return res.status(400).json({
                message: "This project group is already full"
            });
        }

        // ================= CREATE REQUEST =================

        const request = await Request.create({
            student: req.user.userId,
            project: projectId,
            mentor: project.mentor,
            status: "pending"
        });

        // ================= NOTIFY MENTOR =================

        await Notification.create({
            recipient: project.mentor,
            message:
                `A student has requested to join your project "${project.title}".`,
            type: "new_request",
            request: request._id,
            isRead: false
        });

        return res.status(201).json({
            message: "Request sent successfully to the mentor",
            request
        });

    } catch (error) {
        console.error("Create request error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

// ================= GET STUDENT REQUESTS =================

const getStudentRequests = async (req, res) => {
    try {
        const requests = await Request.find({
            student: req.user.userId
        })
            .populate(
                "project",
                "title domain description difficulty projectType maxMembers"
            )
            .populate(
                "mentor",
                "name email"
            )
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            requests
        });

    } catch (error) {
        console.error(
            "Get student requests error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

// ================= GET MENTOR REQUESTS =================

const getMentorRequests = async (req, res) => {
    try {
        const requests = await Request.find({
            mentor: req.user.userId
        })
            .populate(
                "student",
                "name email"
            )
            .populate(
                "project",
                "title domain description difficulty projectType maxMembers"
            )
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            requests
        });

    } catch (error) {
        console.error(
            "Get mentor requests error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

// ================= ACCEPT REQUEST =================

const acceptRequest = async (req, res) => {
    try {
        const request = await Request.findById(
            req.params.id
        );

        if (!request) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        // Only project's mentor can accept
        if (
            request.mentor.toString() !==
            req.user.userId.toString()
        ) {
            return res.status(403).json({
                message:
                    "You can only manage requests for your projects"
            });
        }

        // Request must still be pending
        if (request.status !== "pending") {
            return res.status(400).json({
                message:
                    "This request has already been processed"
            });
        }

        const project = await Project.findById(
            request.project
        );

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        // Count accepted members
        const acceptedCount =
            await Request.countDocuments({
                project: project._id,
                status: "accepted"
            });

        // ================= INDIVIDUAL =================

        if (
            project.projectType === "individual" &&
            acceptedCount >= 1
        ) {
            return res.status(400).json({
                message:
                    "This individual project already has a student"
            });
        }

        // ================= GROUP =================

        if (
            project.projectType === "group" &&
            acceptedCount >= project.maxMembers
        ) {
            return res.status(400).json({
                message:
                    "This project group is already full"
            });
        }

        // ================= ACCEPT REQUEST =================

        request.status = "accepted";

        await request.save();

        // ================= NOTIFY STUDENT =================

        await Notification.create({
            recipient: request.student,
            message:
                `Your request for "${project.title}" has been accepted by the mentor.`,
            type: "request_accepted",
            request: request._id,
            isRead: false
        });

        // ================= INDIVIDUAL CLEANUP =================

        if (
            project.projectType === "individual"
        ) {

            const pendingRequests =
                await Request.find({
                    project: project._id,
                    _id: {
                        $ne: request._id
                    },
                    status: "pending"
                });

            for (
                const pendingRequest
                of pendingRequests
            ) {

                pendingRequest.status =
                    "rejected";

                await pendingRequest.save();

                await Notification.create({
                    recipient:
                        pendingRequest.student,

                    message:
                        `Your request for "${project.title}" was not accepted because another student has already been selected for this individual project.`,

                    type:
                        "request_rejected",

                    request:
                        pendingRequest._id,

                    isRead: false
                });
            }
        }

        // ================= GROUP CLEANUP =================

        if (
            project.projectType === "group" &&
            acceptedCount + 1 >= project.maxMembers
        ) {

            const pendingRequests =
                await Request.find({
                    project: project._id,
                    _id: {
                        $ne: request._id
                    },
                    status: "pending"
                });

            for (
                const pendingRequest
                of pendingRequests
            ) {

                pendingRequest.status =
                    "rejected";

                await pendingRequest.save();

                await Notification.create({
                    recipient:
                        pendingRequest.student,

                    message:
                        `Your request for "${project.title}" was not accepted because the project group has reached its maximum capacity.`,

                    type:
                        "request_rejected",

                    request:
                        pendingRequest._id,

                    isRead: false
                });
            }
        }

        return res.status(200).json({
            message:
                "Request accepted successfully",
            request
        });

    } catch (error) {
        console.error(
            "Accept request error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

// ================= REJECT REQUEST =================

const rejectRequest = async (req, res) => {
    try {
        const request = await Request.findById(
            req.params.id
        );

        if (!request) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        // Only project's mentor can reject
        if (
            request.mentor.toString() !==
            req.user.userId.toString()
        ) {
            return res.status(403).json({
                message:
                    "You can only manage requests for your projects"
            });
        }

        // Request must still be pending
        if (request.status !== "pending") {
            return res.status(400).json({
                message:
                    "This request has already been processed"
            });
        }

        const project = await Project.findById(
            request.project
        );

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        // ================= REJECT REQUEST =================

        request.status = "rejected";

        await request.save();

        // ================= NOTIFY STUDENT =================

        await Notification.create({
            recipient: request.student,

            message:
                `Your request for "${project.title}" has been rejected by the mentor.`,

            type:
                "request_rejected",

            request:
                request._id,

            isRead: false
        });

        return res.status(200).json({
            message:
                "Request rejected successfully",
            request
        });

    } catch (error) {
        console.error(
            "Reject request error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

// ================= GET PROJECT TEAM MEMBERS =================

const getProjectTeamMembers = async (req, res) => {
    try {
        const { projectId } = req.params;

        if (!projectId) {
            return res.status(400).json({
                message: "Project ID is required"
            });
        }

        const project = await Project.findById(projectId)
            .populate("mentor", "name email");

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const userId = req.user.userId.toString();

        // ================= CHECK ACCESS =================

        // Mentor can always see the team
        const isMentor =
            project.mentor._id.toString() === userId;

        // Check whether current user is an accepted member
        const acceptedMembership = await Request.findOne({
            project: projectId,
            student: userId,
            status: "accepted"
        });

        const isAcceptedStudent =
            !!acceptedMembership;

        // Only mentor or accepted student can view team
        if (!isMentor && !isAcceptedStudent) {
            return res.status(403).json({
                message:
                    "Only the mentor and accepted students can view the project team"
            });
        }

        // ================= GET ACCEPTED STUDENTS =================

        const acceptedRequests = await Request.find({
            project: projectId,
            status: "accepted"
        })
            .populate("student", "name email")
            .sort({
                createdAt: 1
            });

        const members = acceptedRequests.map(request => ({
            id: request.student._id,
            name: request.student.name,
            email: request.student.email
        }));

        return res.status(200).json({
            project: {
                id: project._id,
                title: project.title,
                projectType: project.projectType,
                maxMembers: project.maxMembers
            },

            mentor: {
                id: project.mentor._id,
                name: project.mentor.name,
                email: project.mentor.email
            },

            members
        });

    } catch (error) {

        console.error(
            "Get project team error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

// ================= EXPORT =================

module.exports = {
    createRequest,
    getProjectTeamMembers,
    getStudentRequests,
    getMentorRequests,
    acceptRequest,
    rejectRequest
};