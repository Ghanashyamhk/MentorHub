// ======================================================
// API
// ======================================================

const API_URL = "/api/auth";


// ======================================================
// SIGNUP
// ======================================================

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const role =
            document.getElementById("role").value;


        try {

            const response = await fetch(
                `${API_URL}/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name,
                        email,
                        password,
                        role
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                alert(data.message || "Registration failed.");

                return;
            }


            alert(
                "Registration successful!\n\n" +
                "Please verify your email before logging in."
            );


            window.location.href = "login.html";


        } catch (error) {

            console.error("Registration error:", error);

            alert(
                "Cannot connect to backend."
            );
        }
    });
}



// ======================================================
// NORMAL LOGIN
// ======================================================

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();


        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;


        try {

            const response = await fetch(
                `${API_URL}/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                alert(data.message || "Login failed.");

                return;
            }


            // Save JWT
            localStorage.setItem(
                "token",
                data.token
            );


            // Save user
            localStorage.setItem(
                "currentUser",
                JSON.stringify(data.user)
            );


            alert("Login successful!");


            redirectUser(data.user);


        } catch (error) {

            console.error("Login error:", error);

            alert(
                "Unable to connect to server."
            );
        }
    });
}



// ======================================================
// GOOGLE LOGIN
// ======================================================

let googleCredential = null;


// Google calls this after successful authentication
async function handleGoogleLogin(response) {

    console.log("Google authentication successful");

    googleCredential = response.credential;

    // Show role selection
    const roleBox =
        document.getElementById("googleRoleBox");

    if (roleBox) {
        roleBox.style.display = "block";
    }
}


// Make callback available globally
window.handleGoogleLogin = handleGoogleLogin;

// ======================================================
// GOOGLE ROLE SELECTION
// ======================================================

const googleStudentBtn =
    document.getElementById("googleStudentBtn");

const googleMentorBtn =
    document.getElementById("googleMentorBtn");


if (googleStudentBtn) {

    googleStudentBtn.addEventListener(
        "click",
        () => {

            completeGoogleLogin("student");

        }
    );
}


if (googleMentorBtn) {

    googleMentorBtn.addEventListener(
        "click",
        () => {

            completeGoogleLogin("mentor");

        }
    );
}


// ======================================================
// COMPLETE GOOGLE LOGIN
// ======================================================

async function completeGoogleLogin(role) {

    if (!googleCredential) {

        alert("Google authentication was not completed.");

        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/google`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    credential: googleCredential,

                    role: role

                })
            }
        );


        const data = await response.json();

        console.log(
            "Google backend response:",
            data
        );


        if (!response.ok) {

            alert(
                data.message ||
                "Google login failed."
            );

            return;
        }


        // Save JWT
        localStorage.setItem(
            "token",
            data.token
        );


        // Save user
        localStorage.setItem(
            "currentUser",
            JSON.stringify(data.user)
        );


        alert("Google login successful!");


        redirectUser(data.user);


    } catch (error) {

        console.error(
            "Google login error:",
            error
        );

        alert(
            "Unable to connect to backend."
        );
    }
}


// ======================================================
// ROLE BASED REDIRECT
// ======================================================

function redirectUser(user) {

    if (user.role === "student") {

        window.location.href =
            "pages/student-dashboard.html";

    }

    else if (user.role === "mentor") {

        window.location.href =
            "pages/mentor-dashboard.html";

    }

    else {

        alert("Unknown user role.");
    }
}


// Make callback available to Google
window.handleGoogleLogin = handleGoogleLogin;