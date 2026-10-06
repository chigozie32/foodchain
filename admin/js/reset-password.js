/*==========================================
FOODCHAIN ADMIN - RESET PASSWORD
==========================================*/

const resetPasswordForm = document.getElementById("resetPasswordForm");

if (resetPasswordForm) {

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");

    if (!token || !email) {

        showToast("This reset link is invalid or incomplete. Please request a new one.");
        window.location.href = "forgot-password.html";

    }

    resetPasswordForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const btn = document.getElementById("resetBtn");

        if (newPassword !== confirmPassword) {
            showToast("Passwords do not match.");
            return;
        }

        if (newPassword.length < 6) {
            showToast("Password must be at least 6 characters.");
            return;
        }

        btn.disabled = true;
        btn.textContent = "Resetting...";

        try {

            const response = await fetch(
                "https://foodchain-api.onrender.com/admin/reset-password",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, token, newPassword })
                }
            );

            const data = await response.json();

            showToast(data.message);

            if (data.success) {
                window.location.href = "login.html";
            }

        } catch (error) {

            console.error(error);
            showToast("Could not connect to the server.");

        } finally {

            btn.disabled = false;
            btn.textContent = "Reset Password";

        }

    });

}
