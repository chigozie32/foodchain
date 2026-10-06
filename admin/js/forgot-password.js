/*==========================================
FOODCHAIN ADMIN - FORGOT PASSWORD
==========================================*/

const forgotPasswordForm = document.getElementById("forgotPasswordForm");

if (forgotPasswordForm) {

    forgotPasswordForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const btn = document.getElementById("sendResetBtn");

        btn.disabled = true;
        btn.textContent = "Sending...";

        try {

            const response = await fetch(
                "https://foodchain-api.onrender.com/admin/forgot-password",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                }
            );

            const data = await response.json();

            showToast(data.message || "If that email exists, a reset link has been sent.");

            window.location.href = "login.html";

        } catch (error) {

            console.error(error);
            showToast("Could not connect to the server.");

        } finally {

            btn.disabled = false;
            btn.textContent = "Send Reset Link";

        }

    });

}
