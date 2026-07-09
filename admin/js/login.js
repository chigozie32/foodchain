/*==========================================
FOODCHAIN ADMIN LOGIN (MongoDB)
==========================================*/

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document
            .getElementById("email")
            .value
            .trim();

        const password = document
            .getElementById("password")
            .value
            .trim();

        try {

            const response = await fetch(
                "https://foodchain-api.onrender.com/admin/login",
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

            if (!data.success) {

                alert(data.message);

                return;

            }

            // Login successful
            localStorage.setItem(
                "adminLoggedIn",
                "true"
            );

            localStorage.setItem(
                "admin",
                JSON.stringify(data.admin)
            );

            alert("Login Successful!");

            window.location.href =
                "dashboard.html";

        }

        catch (error) {

            console.error(error);

            alert(
                "Could not connect to the server."
            );

        }

    });

}