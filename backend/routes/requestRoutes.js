const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    createRequest,
    getStudentRequests,
    getMentorRequests,
    acceptRequest,
    rejectRequest,
    getProjectTeamMembers
} = require("../controllers/requestController");


// ================= SEND REQUEST =================

router.post(
    "/",
    authMiddleware,
    createRequest
);


// ================= STUDENT REQUESTS =================

router.get(
    "/student",
    authMiddleware,
    getStudentRequests
);


// ================= MENTOR REQUESTS =================

router.get(
    "/mentor",
    authMiddleware,
    getMentorRequests
);


// ================= ACCEPT REQUEST =================

router.put(
    "/:id/accept",
    authMiddleware,
    acceptRequest
);


// ================= REJECT REQUEST =================

router.put(
    "/:id/reject",
    authMiddleware,
    rejectRequest
);


// ================= PROJECT TEAM =================

router.get(
    "/project/:projectId/members",
    authMiddleware,
    getProjectTeamMembers
);


module.exports = router;