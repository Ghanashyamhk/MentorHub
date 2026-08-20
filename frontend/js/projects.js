const API_URL = "http://localhost:5000/api";


// ======================================================
// AUTO SELECT DOMAIN
// ======================================================

const domainSelect =
    document.getElementById("domain");

if (domainSelect) {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const selectedDomain =
        params.get("domain");

    if (selectedDomain) {
        domainSelect.value =
            selectedDomain;
    }
}


// ======================================================
// BACK BUTTON
// ======================================================

const backBtn =
    document.getElementById("backBtn");

if (backBtn) {

    backBtn.addEventListener(
        "click",
        () => {
            history.back();
        }
    );
}


// ======================================================
// ADD PROJECT - MENTOR
// ======================================================

const projectForm =
    document.getElementById("projectForm");

if (projectForm) {

    projectForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const user =
                JSON.parse(
                    localStorage.getItem(
                        "currentUser"
                    )
                );

            const token =
                localStorage.getItem(
                    "token"
                );


            // ---------------- LOGIN CHECK ----------------

            if (!user || !token) {

                alert(
                    "Please login first!"
                );

                return;
            }


            // ---------------- ROLE CHECK ----------------

            if (user.role !== "mentor") {

                alert(
                    "Only mentors can add projects."
                );

                return;
            }


            // ---------------- GET PROJECT TYPE ----------------

            const projectType =
                document.getElementById(
                    "projectType"
                ).value;


            let maxMembers =
                document.getElementById(
                    "maxMembers"
                ).value;


            // ---------------- PROJECT TYPE VALIDATION ----------------

            if (!projectType) {

                alert(
                    "Please select a project type."
                );

                return;
            }


            // ==================================================
            // INDIVIDUAL PROJECT
            // ==================================================

            if (
                projectType === "individual"
            ) {

                maxMembers = 1;
            }


            // ==================================================
            // GROUP PROJECT
            // ==================================================

            if (
                projectType === "group"
            ) {

                maxMembers =
                    Number(maxMembers);


                if (
                    !Number.isInteger(
                        maxMembers
                    ) ||
                    maxMembers < 2 ||
                    maxMembers > 10
                ) {

                    alert(
                        "Group projects must allow between 2 and 10 members."
                    );

                    return;
                }
            }


            // ==================================================
            // PROJECT OBJECT
            // ==================================================

            const project = {

                domain:
                    document.getElementById(
                        "domain"
                    ).value,

                title:
                    document.getElementById(
                        "title"
                    ).value.trim(),

                description:
                    document.getElementById(
                        "description"
                    ).value.trim(),

                difficulty:
                    document.getElementById(
                        "difficulty"
                    ).value,

                projectType:
                    projectType,

                maxMembers:
                    Number(maxMembers),

                contact:
                    document.getElementById(
                        "contact"
                    ).value.trim()
            };


            console.log(
                "Project being sent:",
                project
            );


            // ==================================================
            // SEND PROJECT TO BACKEND
            // ==================================================

            try {

                const res =
                    await fetch(
                        `${API_URL}/projects`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    "Bearer " +
                                    token
                            },

                            body:
                                JSON.stringify(
                                    project
                                )
                        }
                    );


                const data =
                    await res.json();


                console.log(
                    "Project response:",
                    data
                );


                if (!res.ok) {

                    alert(
                        data.message ||
                        "Failed to add project"
                    );

                    return;
                }


                alert(
                    "Project added successfully!"
                );


                projectForm.reset();


                // Hide max members box
                const maxMembersBox =
                    document.getElementById(
                        "maxMembersBox"
                    );


                if (maxMembersBox) {

                    maxMembersBox.style.display =
                        "none";
                }


            } catch (error) {

                console.error(
                    "Error adding project:",
                    error
                );


                alert(
                    "Unable to connect to backend."
                );
            }
        }
    );
}


// ======================================================
// SHOW PROJECTS - STUDENT
// ======================================================

const container =
    document.getElementById(
        "projectContainer"
    );


if (container) {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const domain =
        params.get("domain");


    const domainTitle =
        document.getElementById(
            "domainTitle"
        );


    if (
        domainTitle &&
        domain
    ) {

        domainTitle.innerText =
            "Projects in " +
            domain.toUpperCase();
    }


    loadProjects(domain);
}


// ======================================================
// LOAD PROJECTS
// ======================================================

async function loadProjects(domain) {

    const token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        container.innerHTML =
            "<p>Please login first.</p>";

        return;
    }


    try {

        const res =
            await fetch(
                `${API_URL}/projects`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            "Bearer " +
                            token
                    }
                }
            );


        const data =
            await res.json();


        if (!res.ok) {

            alert(
                data.message ||
                "Failed to load projects"
            );

            return;
        }


        let projects =
            data.projects || [];


        // ==================================================
        // FILTER BY DOMAIN
        // ==================================================

        if (domain) {

            projects =
                projects.filter(
                    project =>
                        project.domain ===
                        domain
                );
        }


        // ==================================================
        // NO PROJECTS
        // ==================================================

        if (
            projects.length === 0
        ) {

            container.innerHTML =
                "<p>No projects added yet.</p>";

            return;
        }


        container.innerHTML = "";


        // ==================================================
        // DISPLAY PROJECTS
        // ==================================================

        projects.forEach(
            project => {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "card";


                div.setAttribute(
                    "data-project-id",
                    project._id
                );


                // ==================================================
                // MENTOR INFORMATION
                // ==================================================

                const mentorName =
                    project.mentor?.name ||
                    "Unknown Mentor";


                const mentorEmail =
                    project.mentor?.email ||
                    project.contact ||
                    "";


                // ==================================================
                // PROJECT TYPE
                // ==================================================

                /*
                    New projects always have projectType.

                    Older projects created before the
                    Individual/Group feature may not have it.

                    We treat those old projects as Individual.
                */

                const projectType =
                    project.projectType ||
                    "individual";


                // ==================================================
                // MAX MEMBERS
                // ==================================================

                let maxMembers;


                if (
                    projectType ===
                    "group"
                ) {

                    maxMembers =
                        Number(
                            project.maxMembers
                        ) || 2;

                } else {

                    maxMembers = 1;
                }


                // ==================================================
                // ACCEPTED MEMBERS
                // ==================================================

                const acceptedMembers =
                    Number(
                        project.acceptedMembers
                    ) || 0;


                // ==================================================
                // PROJECT TYPE TEXT
                // ==================================================

                let projectTypeText;


                if (
                    projectType ===
                    "group"
                ) {

                    projectTypeText =
                        "Group";

                } else {

                    projectTypeText =
                        "Individual";
                }


                // ==================================================
                // MEMBER COUNT
                // ==================================================

                const memberCountText =
                    `${acceptedMembers} / ${maxMembers}`;


                // ==================================================
                // CHECK WHETHER PROJECT IS FULL
                // ==================================================

                const isFull =
                    acceptedMembers >=
                    maxMembers;


                // ==================================================
                // STATUS
                // ==================================================

                const statusText =
                    isFull
                        ? "FULL"
                        : "AVAILABLE";


                // ==================================================
                // REQUEST BUTTON
                // ==================================================

                let requestButton;


                if (isFull) {

                    requestButton = `
                        <button
                            class="btn"
                            disabled
                            style="opacity:0.6; cursor:not-allowed;"
                        >
                            Project Full
                        </button>
                    `;

                } else {

                    requestButton = `
                        <button
                            class="btn requestBtn"
                        >
                            Request Mentor
                        </button>
                    `;
                }


                // ==================================================
                // PROJECT CARD
                // ==================================================

                div.innerHTML = `

                    <h4
                        data-title="${project.title}"
                    >
                        <b>Title:</b>
                        ${project.title}
                    </h4>


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
                        <b>Members:</b>
                        ${memberCountText}
                    </p>


                    <p>
                        <b>Status:</b>

                        <span
                            style="
                                font-weight:bold;
                                color:${isFull
                                    ? "#dc2626"
                                    : "#16a34a"};
                            "
                        >
                            ${statusText}
                        </span>
                    </p>


                    <p>
                        <b>Mentor:</b>
                        ${mentorName}
                    </p>


                    <p>
                        <b>Mentor's Email:</b>

                        <a
                            href="mailto:${mentorEmail}"
                        >
                            ${mentorEmail}
                        </a>
                    </p>


                    ${requestButton}

                `;


                container.appendChild(
                    div
                );
            }
        );


    } catch (error) {

        console.error(
            "Error loading projects:",
            error
        );


        container.innerHTML =
            "<p>Unable to load projects from server.</p>";
    }
}


// ======================================================
// REQUEST MENTOR
// ======================================================

document.addEventListener(
    "click",
    async (e) => {


        // Only handle Request Mentor buttons
        if (
            !e.target.classList.contains(
                "requestBtn"
            )
        ) {

            return;
        }


        // ==================================================
        // GET USER
        // ==================================================

        const user =
            JSON.parse(
                localStorage.getItem(
                    "currentUser"
                )
            );


        const token =
            localStorage.getItem(
                "token"
            );


        // ==================================================
        // LOGIN CHECK
        // ==================================================

        if (
            !user ||
            !token
        ) {

            alert(
                "Please login first!"
            );

            return;
        }


        // ==================================================
        // STUDENT CHECK
        // ==================================================

        if (
            user.role !== "student"
        ) {

            alert(
                "Only students can request a mentor."
            );

            return;
        }


        // ==================================================
        // GET PROJECT CARD
        // ==================================================

        const card =
            e.target.closest(
                ".card"
            );


        if (!card) {

            alert(
                "Project information not found."
            );

            return;
        }


        // ==================================================
        // GET PROJECT ID
        // ==================================================

        const projectId =
            card.getAttribute(
                "data-project-id"
            );


        if (!projectId) {

            alert(
                "Project ID not found."
            );

            return;
        }


        // ==================================================
        // CHECK AVAILABILITY AGAIN
        // ==================================================

        /*
            This is an extra frontend protection.

            The backend is still the final authority.

            If the project is already full,
            don't send the request.
        */

        const statusElement =
            card.querySelector(
                "p:nth-of-type(5) span"
            );


        if (
            statusElement &&
            statusElement.innerText ===
                "FULL"
        ) {

            alert(
                "This project is already full."
            );

            return;
        }


        // ==================================================
        // PREVENT MULTIPLE CLICKS
        // ==================================================

        e.target.disabled =
            true;


        e.target.innerText =
            "Sending...";


        // ==================================================
        // SEND REQUEST
        // ==================================================

        try {

            const res =
                await fetch(
                    `${API_URL}/requests`,
                    {
                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            Authorization:
                                "Bearer " +
                                token
                        },

                        body:
                            JSON.stringify({
                                projectId:
                                    projectId
                            })
                    }
                );


            const data =
                await res.json();


            console.log(
                "Request response:",
                data
            );


            // ==================================================
            // REQUEST FAILED
            // ==================================================

            if (!res.ok) {

                alert(
                    data.message ||
                    "Failed to send request."
                );


                e.target.disabled =
                    false;


                e.target.innerText =
                    "Request Mentor";


                return;
            }


            // ==================================================
            // REQUEST SUCCESS
            // ==================================================

            alert(
                data.message ||
                "Request sent successfully to the mentor."
            );


            e.target.innerText =
                "Request Sent";


            e.target.disabled =
                true;


        } catch (error) {

            console.error(
                "Request mentor error:",
                error
            );


            alert(
                "Unable to connect to the server."
            );


            e.target.disabled =
                false;


            e.target.innerText =
                "Request Mentor";
        }

    }
);