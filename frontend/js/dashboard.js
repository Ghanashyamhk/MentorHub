const API_URL = "/api";


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


// ================= AUTH CHECK =================

if (!user || !token) {

    window.location.href =
        "../login.html";

}

if (user && user.role !== "student") {

    window.location.href =
        "../pages/mentor-dashboard.html";

}


// ================= SHOW NAME =================

if (welcomeText && user) {

    welcomeText.innerText =
        "Welcome, " + user.name;

}


// ================= LOGOUT =================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "currentUser"
            );

            window.location.href =
                "../login.html";

        }
    );

}


// =====================================================
// ================= NAVIGATION ========================
// =====================================================

function goToProjects(domain) {

    window.location.href =
        "/pages/project-list.html?domain=" +
        domain;

}

window.goToProjects =
    goToProjects;


// =====================================================
// ================= TAB SWITCH ========================
// =====================================================

function showTab(tabId, el) {

    document
        .querySelectorAll(".tabContent")
        .forEach(tab => {

            tab.style.display =
                "none";

        });


    document
        .querySelectorAll(".tab")
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });


    const selectedTab =
        document.getElementById(tabId);


    if (selectedTab) {

        selectedTab.style.display =
            "block";

    }


    if (el) {

        el.classList.add(
            "active"
        );

    }


    // ================= LOAD REQUESTS =================

    if (
        tabId ===
        "requestsTab"
    ) {

        loadStudentRequests();

    }


    // ================= LOAD NOTIFICATIONS =================

    if (
        tabId ===
        "notifyTab"
    ) {

        openNotifications();

    }

}

window.showTab =
    showTab;


// =====================================================
// ================= STUDENT REQUESTS ==================
// =====================================================

const requestBox =
    document.getElementById(
        "studentRequestBox"
    );


// =====================================================
// ================= LOAD STUDENT REQUESTS =============
// =====================================================

async function loadStudentRequests() {

    if (!requestBox || !token) {

        return;

    }


    requestBox.innerHTML =
        "<p>Loading requests...</p>";


    try {

        const response =
            await fetch(
                `${API_URL}/requests/student`,
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

            requestBox.innerHTML =
                `<p>${
                    data.message ||
                    "Failed to load requests."
                }</p>`;

            return;

        }


        const requests =
            data.requests || [];


        if (requests.length === 0) {

            requestBox.innerHTML =
                "<p>You haven't sent any mentor requests yet.</p>";

            return;

        }


        requestBox.innerHTML = "";


        requests.forEach(request => {

            const div =
                document.createElement("div");


            div.className =
                "card request-card";


            const project =
                request.project || {};


            const mentor =
                request.mentor || {};


            const projectType =
                project.projectType ||
                "individual";


            let projectTypeText;


            if (
                projectType ===
                "group"
            ) {

                projectTypeText =
                    `Group - Maximum ${
                        project.maxMembers || 0
                    } members`;

            } else {

                projectTypeText =
                    "Individual";

            }


            const status =
                request.status ||
                "pending";


            // ================= VIEW TEAM =================

            let teamButton = "";


            if (
                status ===
                "accepted"
            ) {

                teamButton = `

                    <button
                        class="btn viewTeamBtn"
                        data-project-id="${project._id}">
                        View Team
                    </button>

                    <div
                        class="teamContainer"
                        id="team-${project._id}"
                        style="display:none;">
                    </div>

                `;

            }


            div.innerHTML = `

                <h4>
                    ${
                        project.title ||
                        "Unknown Project"
                    }
                </h4>

                <p>
                    <b>Domain:</b>
                    ${
                        project.domain ||
                        "N/A"
                    }
                </p>

                <p>
                    <b>Mentor:</b>
                    ${
                        mentor.name ||
                        "Unknown Mentor"
                    }
                </p>

                <p>
                    <b>Mentor Email:</b>

                    <a
                        href="mailto:${
                            mentor.email || ""
                        }">

                        ${
                            mentor.email ||
                            "N/A"
                        }

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

                <p>
                    <b>Requested On:</b>

                    ${
                        request.createdAt
                            ? new Date(
                                request.createdAt
                              ).toLocaleString()
                            : "N/A"
                    }

                </p>

                ${teamButton}

            `;


            requestBox.appendChild(
                div
            );

        });


    } catch (error) {

        console.error(
            "Student requests error:",
            error
        );


        requestBox.innerHTML =
            "<p>Unable to load requests.</p>";

    }

}


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
    if (teamContainer.style.display === "block") {

        teamContainer.style.display = "none";

        return;
    }

    teamContainer.style.display = "block";

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
                `<p>${
                    data.message ||
                    "Unable to load team."
                }</p>`;

            return;
        }

        // ================= TEAM INFORMATION =================

        let html = `

            <div class="team-box">

                <h4>
                    Project Team
                </h4>

                <p>
                    <b>Project:</b>
                    ${data.project?.title || "N/A"}
                </p>

                <p>
                    <b>Team Size:</b>
                    ${data.members?.length || 0}
                    /
                    ${data.project?.maxMembers || 1}
                </p>

                <hr>

                <h4>
                    Mentor
                </h4>

                <p>
                    <b>
                        ${data.mentor?.name || "Unknown Mentor"}
                    </b>
                </p>

                <p>
                    <a
                        href="mailto:${data.mentor?.email || ""}">
                        ${data.mentor?.email || "N/A"}
                    </a>
                </p>

                <hr>

                <h4>
                    Accepted Students
                </h4>

        `;

        // ================= ACCEPTED MEMBERS =================

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
                            <a
                                href="mailto:${member.email}">
                                ${member.email}
                            </a>
                        </p>

                    </div>

                `;

            });

        }

        // ================= CONTACT TEAM BUTTON =================

        // Pass team data safely as Base64
        // to avoid problems with quotes in names/titles.

        const encodedTeamData =
            btoa(
                encodeURIComponent(
                    JSON.stringify(data)
                )
            );

        html += `

                <hr>

                <button
                    class="btn contactTeamBtn"
                    data-team="${encodedTeamData}">
                    Contact Team
                </button>

            </div>

        `;

        teamContainer.innerHTML =
            html;

    } catch (error) {

        console.error(
            "Load team error:",
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
    e => {

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

        loadProjectTeam(
            projectId
        );
    }
);

// =====================================================
// ================= CONTACT TEAM BUTTON ===============
// =====================================================

document.addEventListener(
    "click",
    e => {

        if (
            !e.target.classList.contains(
                "contactTeamBtn"
            )
        ) {
            return;
        }

        const encodedData =
            e.target.getAttribute(
                "data-team"
            );

        if (!encodedData) {

            alert(
                "Team information not available."
            );

            return;
        }

        try {

            const teamData =
                JSON.parse(
                    decodeURIComponent(
                        atob(encodedData)
                    )
                );

            contactTeam(teamData);

        } catch (error) {

            console.error(
                "Contact team data error:",
                error
            );

            alert(
                "Unable to prepare team email."
            );
        }
    }
);

// =====================================================
// ================= NOTIFICATIONS =====================
// =====================================================

const notifyBox =
    document.getElementById(
        "studentNotifyBox"
    );


const notifyCount =
    document.getElementById(
        "notifyCount"
    );


// =====================================================
// ================= LOAD NOTIFICATIONS ================
// =====================================================

async function loadNotifications() {

    if (!notifyBox || !token) {

        return;

    }


    notifyBox.innerHTML =
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


        if (!response.ok) {

            if (
                response.status ===
                401
            ) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "currentUser"
                );

                window.location.href =
                    "../login.html";

                return;

            }


            const errorData =
                await response.json();


            notifyBox.innerHTML =
                `<p>${
                    errorData.message ||
                    "Failed to load notifications."
                }</p>`;

            return;

        }


        const notifications =
            await response.json();


        if (
            !notifications ||
            notifications.length === 0
        ) {

            notifyBox.innerHTML =
                "<p>No notifications yet.</p>";

            return;

        }


        notifyBox.innerHTML = "";


        notifications.forEach(
            notification => {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "card notification-card";


                let notificationTitle =
                    "Notification";


                if (
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


                notifyBox.appendChild(
                    div
                );

            }
        );


    } catch (error) {

        console.error(
            "Notification error:",
            error
        );


        notifyBox.innerHTML =
            "<p>Unable to load notifications.</p>";

    }

}


// =====================================================
// ================= UNREAD COUNT ======================
// =====================================================

async function loadUnreadCount() {

    if (!notifyCount || !token) {

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


        if (
            data.unreadCount >
            0
        ) {

            notifyCount.innerText =
                ` (${data.unreadCount})`;

        } else {

            notifyCount.innerText =
                "";

        }


    } catch (error) {

        console.error(
            "Unread count error:",
            error
        );

    }

}


// =====================================================
// ============== OPEN NOTIFICATIONS ===================
// =====================================================

async function openNotifications() {

    if (!token) {

        return;

    }


    try {

        const response =
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


        if (!response.ok) {

            console.error(
                "Failed to mark notifications as read"
            );

        }


        await loadUnreadCount();

        await loadNotifications();


    } catch (error) {

        console.error(
            "Mark read error:",
            error
        );

    }

}


// =====================================================
// ================= LOAD THEME ========================
// =====================================================

if (
    localStorage.getItem("theme") ===
    "dark"
) {

    document.body.classList.add(
        "dark"
    );


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
// ================= CONTACT TEAM =======================
// =====================================================

function contactTeam(teamData) {

    if (!teamData) {
        alert("Team information is not available.");
        return;
    }

    const projectTitle =
        teamData.project?.title || "MentorHub Project";

    const emails = [];

    // Add mentor email
    if (teamData.mentor?.email) {
        emails.push(teamData.mentor.email);
    }

    // Add accepted student emails
    if (Array.isArray(teamData.members)) {

        teamData.members.forEach(member => {

            if (
                member.email &&
                !emails.includes(member.email)
            ) {
                emails.push(member.email);
            }

        });
    }

    if (emails.length === 0) {
        alert("No team email addresses available.");
        return;
    }

    const subject =
        `MentorHub - Project Team: ${projectTitle}`;

    const body =
        `Hello Team,

This email is regarding our MentorHub project "${projectTitle}".

Let's coordinate and discuss the project work here.

Regards,
MentorHub Team`;

    const mailto =
        `mailto:${emails.join(",")}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
}

window.contactTeam = contactTeam;


// =====================================================
// ================= INITIAL LOAD ======================
// =====================================================

loadUnreadCount();
loadNotifications();