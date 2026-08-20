const API_URL = "http://localhost:5000/api";

// ================= LOAD USER =================

const user =
    JSON.parse(localStorage.getItem("currentUser"));

const token =
    localStorage.getItem("token");

const welcomeText =
    document.getElementById("welcome");

const logoutBtn =
    document.getElementById("logoutBtn");

const toggle =
    document.getElementById("themeToggle");

const mentorNotifyCount =
    document.getElementById("mentorNotifyCount");


// ================= AUTH CHECK =================

if (!user || !token) {

    window.location.href = "../login.html";

}

if (user && user.role !== "mentor") {

    window.location.href =
        "../pages/student-dashboard.html";

}


// ================= SHOW NAME =================

if (user && welcomeText) {

    welcomeText.innerText =
        "Welcome, " + user.name;

}


// ================= LOGOUT =================

if (logoutBtn) {

    logoutBtn.addEventListener("click", () => {

        localStorage.removeItem("currentUser");
        localStorage.removeItem("token");

        window.location.href =
            "../login.html";

    });

}


// =====================================================
// ================= ADD PROJECT =======================
// =====================================================

function goToAddProject(domain) {

    window.location.href =
        "add-project.html?domain=" + domain;

}

window.goToAddProject =
    goToAddProject;


// =====================================================
// ================= TAB SWITCH ========================
// =====================================================

function showTab(tabId, el) {

    document
        .querySelectorAll(".tabContent")
        .forEach(tab => {

            tab.style.display = "none";

        });


    document
        .querySelectorAll(".tab")
        .forEach(button => {

            button.classList.remove("active");

        });


    const selectedTab =
        document.getElementById(tabId);

    if (selectedTab) {

        selectedTab.style.display =
            "block";

    }


    if (el) {

        el.classList.add("active");

    }


    // ================= LOAD TAB DATA =================

    if (tabId === "myProjectsTab") {

        loadMyProjects();

    }


    if (tabId === "requestsTab") {

        loadMentorRequests();

    }


    if (tabId === "notifyTab") {

        openMentorNotifications();

    }

}

window.showTab =
    showTab;


// =====================================================
// ================= MY PROJECTS =======================
// =====================================================

async function loadMyProjects() {

    const container =
        document.getElementById(
            "myProjectsContainer"
        );


    if (!container) {

        return;

    }


    if (!user || !token) {

        container.innerHTML =
            "<p>Please login first.</p>";

        return;

    }


    if (user.role !== "mentor") {

        container.innerHTML =
            "<p>Only mentors can view their projects.</p>";

        return;

    }


    container.innerHTML =
        "<p>Loading projects...</p>";


    try {

        const response =
            await fetch(
                `${API_URL}/projects/my-projects`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            "Bearer " + token
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            container.innerHTML =
                `<p>${data.message || "Failed to load projects."}</p>`;

            return;

        }


        const projects =
            data.projects || [];


        if (projects.length === 0) {

            container.innerHTML =
                "<p>You haven't added any projects yet.</p>";

            return;

        }


        container.innerHTML = "";


        projects.forEach(project => {

            const div =
                document.createElement("div");


            div.className =
                "card my-project-card";


            let projectTypeText;


            if (project.projectType === "group") {

                projectTypeText =
                    `Group - Maximum ${project.maxMembers} members`;

            } else {

                projectTypeText =
                    "Individual";

            }


            const acceptedMembers =
                project.acceptedMembers || 0;


            div.innerHTML = `

                <h4>
                    ${project.title}
                </h4>

                <p>
                    <b>Domain:</b>
                    ${project.domain}
                </p>

                <p>
                    <b>Description:</b>
                    ${project.description}
                </p>

                <p>
                    <b>Difficulty:</b>
                    ${project.difficulty}
                </p>

                <p>
                    <b>Project Type:</b>
                    ${projectTypeText}
                </p>

                <p>
                    <b>Accepted Members:</b>
                    ${acceptedMembers}
                    /
                    ${project.maxMembers}
                </p>

                <p>
                    <b>Contact:</b>
                    <a href="mailto:${project.contact}">
                        ${project.contact}
                    </a>
                </p>

                <p>
                    <b>Created:</b>
                    ${
                        project.createdAt
                            ? new Date(
                                project.createdAt
                              ).toLocaleDateString()
                            : "N/A"
                    }
                </p>

                <div class="project-actions">

                    <button
                        class="btn viewTeamBtn"
                        data-project-id="${project._id}">
                        View Team
                    </button>

                    <button
                        class="btn deleteProjectBtn"
                        data-project-id="${project._id}">
                        Delete
                    </button>

                </div>

                <div
                    class="teamContainer"
                    id="team-${project._id}"
                    style="display:none;">
                </div>

            `;


            container.appendChild(div);

        });


    } catch (error) {

        console.error(
            "Error loading mentor projects:",
            error
        );


        container.innerHTML =
            "<p>Unable to connect to server.</p>";

    }

}


// =====================================================
// ================= DELETE PROJECT ====================
// =====================================================

document.addEventListener(
    "click",
    async (e) => {

        if (
            !e.target.classList.contains(
                "deleteProjectBtn"
            )
        ) {

            return;

        }


        const projectId =
            e.target.getAttribute(
                "data-project-id"
            );


        if (!projectId) {

            alert(
                "Project ID not found."
            );

            return;

        }


        const confirmDelete =
            confirm(
                "Are you sure you want to delete this project?"
            );


        if (!confirmDelete) {

            return;

        }


        e.target.disabled = true;

        e.target.innerText =
            "Deleting...";


        try {

            const response =
                await fetch(
                    `${API_URL}/projects/${projectId}`,
                    {
                        method: "DELETE",

                        headers: {
                            Authorization:
                                "Bearer " + token
                        }
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "Failed to delete project."
                );


                e.target.disabled = false;

                e.target.innerText =
                    "Delete";

                return;

            }


            alert(
                "Project deleted successfully!"
            );


            loadMyProjects();


        } catch (error) {

            console.error(
                "Delete project error:",
                error
            );


            alert(
                "Unable to connect to server."
            );


            e.target.disabled = false;

            e.target.innerText =
                "Delete";

        }

    }
);


// =====================================================
// ================= LOAD PROJECT TEAM =================
// =====================================================

async function loadProjectTeam(projectId) {

    const teamContainer =
        document.getElementById(
            `team-${projectId}`
        );


    if (!teamContainer) {

        return;

    }


    // Toggle team visibility

    if (
        teamContainer.style.display ===
        "block"
    ) {

        teamContainer.style.display =
            "none";

        return;

    }


    teamContainer.style.display =
        "block";


    teamContainer.innerHTML =
        "<p>Loading team members...</p>";


    try {

        const response =
            await fetch(
                `${API_URL}/requests/project/${projectId}/members`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            "Bearer " + token
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            teamContainer.innerHTML =
                `<p>${data.message || "Unable to load team."}</p>`;

            return;

        }


        let html = `

            <div class="team-box">

                <h4>
                    Project Team
                </h4>

                <p>
                    <b>Project:</b>
                    ${data.project.title}
                </p>

                <p>
                    <b>Team Size:</b>
                    ${data.members.length}
                    /
                    ${data.project.maxMembers}
                </p>

                <hr>

                <h4>
                    Mentor
                </h4>

                <p>
                    <b>
                        ${data.mentor.name}
                    </b>
                </p>

                <p>
                    <a href="mailto:${data.mentor.email}">
                        ${data.mentor.email}
                    </a>
                </p>

                <hr>

                <h4>
                    Accepted Students
                </h4>

        `;


        if (
            !data.members ||
            data.members.length === 0
        ) {

            html += `

                <p>
                    No accepted students yet.
                </p>

            `;

        } else {

            data.members.forEach(member => {

                html += `

                    <div class="team-member">

                        <p>
                            <b>
                                ${member.name}
                            </b>
                        </p>

                        <p>
                            <a href="mailto:${member.email}">
                                ${member.email}
                            </a>
                        </p>

                    </div>

                `;

            });

        }


        html += `

            </div>

        `;


        teamContainer.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Load project team error:",
            error
        );


        teamContainer.innerHTML =
            "<p>Unable to connect to server.</p>";

    }

}


// =====================================================
// ================= VIEW TEAM BUTTON ==================
// =====================================================

document.addEventListener(
    "click",
    (e) => {

        if (
            !e.target.classList.contains(
                "viewTeamBtn"
            )
        ) {

            return;

        }


        const projectId =
            e.target.getAttribute(
                "data-project-id"
            );


        if (!projectId) {

            alert(
                "Project ID not found."
            );

            return;

        }


        loadProjectTeam(projectId);

    }
);


// =====================================================
// ================= MENTOR REQUESTS ===================
// =====================================================

async function loadMentorRequests() {

    const container =
        document.getElementById(
            "requestContainer"
        );


    if (!container) {

        return;

    }


    if (!user || !token) {

        container.innerHTML =
            "<p>Please login first.</p>";

        return;

    }


    if (user.role !== "mentor") {

        container.innerHTML =
            "<p>Only mentors can view requests.</p>";

        return;

    }


    container.innerHTML =
        "<p>Loading requests...</p>";


    try {

        const response =
            await fetch(
                `${API_URL}/requests/mentor`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            "Bearer " + token
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            container.innerHTML =
                `<p>${data.message || "Failed to load requests."}</p>`;

            return;

        }


        const requests =
            data.requests || [];


        if (requests.length === 0) {

            container.innerHTML =
                "<p>No student requests yet.</p>";

            return;

        }


        container.innerHTML = "";


        requests.forEach(request => {

            const div =
                document.createElement("div");


            div.className =
                "card request-card";


            const studentName =
                request.student?.name ||
                "Unknown Student";


            const studentEmail =
                request.student?.email ||
                "";


            const projectTitle =
                request.project?.title ||
                "Unknown Project";


            const projectType =
                request.project?.projectType ||
                "individual";


            let projectTypeText;


            if (projectType === "group") {

                projectTypeText =
                    `Group - Maximum ${
                        request.project?.maxMembers || 0
                    } members`;

            } else {

                projectTypeText =
                    "Individual";

            }


            const status =
                request.status ||
                "pending";


            let buttons = "";


            if (status === "pending") {

                buttons = `

                    <div class="request-actions">

                        <button
                            class="btn accept acceptRequestBtn"
                            data-request-id="${request._id}">
                            Accept
                        </button>

                        <button
                            class="btn reject rejectRequestBtn"
                            data-request-id="${request._id}">
                            Reject
                        </button>

                    </div>

                `;

            }


            div.innerHTML = `

                <h4>
                    ${projectTitle}
                </h4>

                <p>
                    <b>Student:</b>
                    ${studentName}
                </p>

                <p>
                    <b>Student Email:</b>
                    <a href="mailto:${studentEmail}">
                        ${studentEmail || "N/A"}
                    </a>
                </p>

                <p>
                    <b>Project Type:</b>
                    ${projectTypeText}
                </p>

                <p>
                    <b>Status:</b>
                    ${status.toUpperCase()}
                </p>

                ${buttons}

            `;


            container.appendChild(div);

        });


    } catch (error) {

        console.error(
            "Load mentor requests error:",
            error
        );


        container.innerHTML =
            "<p>Unable to connect to server.</p>";

    }

}


// =====================================================
// ================= ACCEPT REQUEST ====================
// =====================================================

document.addEventListener(
    "click",
    async (e) => {

        if (
            !e.target.classList.contains(
                "acceptRequestBtn"
            )
        ) {

            return;

        }


        const requestId =
            e.target.getAttribute(
                "data-request-id"
            );


        if (!requestId) {

            alert(
                "Request ID not found."
            );

            return;

        }


        const confirmAccept =
            confirm(
                "Are you sure you want to accept this request?"
            );


        if (!confirmAccept) {

            return;

        }


        e.target.disabled = true;

        e.target.innerText =
            "Accepting...";


        try {

            const response =
                await fetch(
                    `${API_URL}/requests/${requestId}/accept`,
                    {
                        method: "PUT",

                        headers: {
                            Authorization:
                                "Bearer " + token
                        }
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "Failed to accept request."
                );


                e.target.disabled = false;

                e.target.innerText =
                    "Accept";

                return;

            }


            alert(
                data.message ||
                "Request accepted successfully."
            );


            loadMentorRequests();

            loadMyProjects();

            await loadMentorUnreadCount();


        } catch (error) {

            console.error(
                "Accept request error:",
                error
            );


            alert(
                "Unable to connect to server."
            );


            e.target.disabled = false;

            e.target.innerText =
                "Accept";

        }

    }
);


// =====================================================
// ================= REJECT REQUEST ====================
// =====================================================

document.addEventListener(
    "click",
    async (e) => {

        if (
            !e.target.classList.contains(
                "rejectRequestBtn"
            )
        ) {

            return;

        }


        const requestId =
            e.target.getAttribute(
                "data-request-id"
            );


        if (!requestId) {

            alert(
                "Request ID not found."
            );

            return;

        }


        const confirmReject =
            confirm(
                "Are you sure you want to reject this request?"
            );


        if (!confirmReject) {

            return;

        }


        e.target.disabled = true;

        e.target.innerText =
            "Rejecting...";


        try {

            const response =
                await fetch(
                    `${API_URL}/requests/${requestId}/reject`,
                    {
                        method: "PUT",

                        headers: {
                            Authorization:
                                "Bearer " + token
                        }
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "Failed to reject request."
                );


                e.target.disabled = false;

                e.target.innerText =
                    "Reject";

                return;

            }


            alert(
                data.message ||
                "Request rejected successfully."
            );


            loadMentorRequests();

            await loadMentorUnreadCount();


        } catch (error) {

            console.error(
                "Reject request error:",
                error
            );


            alert(
                "Unable to connect to server."
            );


            e.target.disabled = false;

            e.target.innerText =
                "Reject";

        }

    }
);


// =====================================================
// =============== MENTOR NOTIFICATIONS ===============
// =====================================================

async function loadMentorNotifications() {

    const mentorNotifyBox =
        document.getElementById(
            "mentorNotifyBox"
        );


    if (!mentorNotifyBox) {

        return;

    }


    if (!user || !token) {

        mentorNotifyBox.innerHTML =
            "<p>Please login first.</p>";

        return;

    }


    if (user.role !== "mentor") {

        mentorNotifyBox.innerHTML =
            "<p>Only mentors can view notifications.</p>";

        return;

    }


    mentorNotifyBox.innerHTML =
        "<p>Loading notifications...</p>";


    try {

        const response =
            await fetch(
                `${API_URL}/notifications`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            "Bearer " + token
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            mentorNotifyBox.innerHTML =
                `<p>${
                    data.message ||
                    "Failed to load notifications."
                }</p>`;

            return;

        }


        if (
            !data ||
            data.length === 0
        ) {

            mentorNotifyBox.innerHTML =
                "<p>No notifications yet.</p>";

            return;

        }


        mentorNotifyBox.innerHTML = "";


        data.forEach(notification => {

            const div =
                document.createElement("div");


            div.className =
                "card notification-card";


            let notificationTitle =
                "Notification";


            if (
                notification.type ===
                "mentor_request"
            ) {

                notificationTitle =
                    "New Mentor Request";

            } else if (
                notification.type ===
                "request_accepted"
            ) {

                notificationTitle =
                    "Request Accepted";

            } else if (
                notification.type ===
                "request_rejected"
            ) {

                notificationTitle =
                    "Request Rejected";

            }


            div.innerHTML = `

                <h4>
                    ${notificationTitle}
                </h4>

                <p>
                    ${notification.message}
                </p>

                <small>
                    ${
                        notification.createdAt
                            ? new Date(
                                notification.createdAt
                              ).toLocaleString()
                            : ""
                    }
                </small>

            `;


            mentorNotifyBox.appendChild(div);

        });


    } catch (error) {

        console.error(
            "Mentor notification error:",
            error
        );


        mentorNotifyBox.innerHTML =
            "<p>Unable to load notifications.</p>";

    }

}


// =====================================================
// ============== MENTOR UNREAD COUNT ==================
// =====================================================

async function loadMentorUnreadCount() {

    if (!mentorNotifyCount || !token) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/notifications/unread-count`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            "Bearer " + token
                    }
                }
            );


        if (!response.ok) {

            return;

        }


        const data =
            await response.json();


        if (data.unreadCount > 0) {

            mentorNotifyCount.innerText =
                ` (${data.unreadCount})`;

        } else {

            mentorNotifyCount.innerText =
                "";

        }


    } catch (error) {

        console.error(
            "Mentor unread count error:",
            error
        );

    }

}


// =====================================================
// ============ OPEN MENTOR NOTIFICATIONS ==============
// =====================================================

async function openMentorNotifications() {

    if (!token) {

        return;

    }


    try {

        await fetch(
            `${API_URL}/notifications/mark-read`,
            {
                method: "PUT",

                headers: {
                    Authorization:
                        "Bearer " + token
                }
            }
        );


        await loadMentorUnreadCount();

        await loadMentorNotifications();


    } catch (error) {

        console.error(
            "Open mentor notifications error:",
            error
        );

    }

}


// =====================================================
// ================= LOAD THEME ========================
// =====================================================

if (
    localStorage.getItem("theme") === "dark"
) {

    document.body.classList.add("dark");


    if (toggle) {

        toggle.innerText =
            "☀";

    }

}


// =====================================================
// ================= TOGGLE THEME ======================
// =====================================================

if (toggle) {

    toggle.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "dark"
            );


            if (
                document.body.classList.contains(
                    "dark"
                )
            ) {

                localStorage.setItem(
                    "theme",
                    "dark"
                );


                toggle.innerText =
                    "☀";

            } else {

                localStorage.setItem(
                    "theme",
                    "light"
                );


                toggle.innerText =
                    "🌙";

            }

        }
    );

}


// =====================================================
// ================= INITIAL LOAD ======================
// =====================================================

loadMentorUnreadCount();