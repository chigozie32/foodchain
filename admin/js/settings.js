/*==========================================
FOODCHAIN SETTINGS (MongoDB)
==========================================*/

document.addEventListener("DOMContentLoaded", () => {

    const adminName = document.getElementById("adminName");
    const adminEmail = document.getElementById("adminEmail");
    const adminPhone = document.getElementById("adminPhone");

    const currentPassword =
        document.getElementById("currentPassword");

    const newPassword =
        document.getElementById("newPassword");

    const confirmPassword =
        document.getElementById("confirmPassword");

    const darkMode =
        document.getElementById("darkMode");

    const emailNotifications =
        document.getElementById("emailNotifications");

    const saveBtn =
        document.getElementById("saveSettings");

    const resetBtn =
        document.getElementById("resetSettings");

    const profileImage =
        document.getElementById("profileImage");

    const profilePreview =
        document.getElementById("profilePreview");

    const passwordStrength =
        document.getElementById("passwordStrength");

    let profileBase64 = "";


    /*==========================================
    LOAD PROFILE FROM DATABASE
    ==========================================*/

    async function loadProfile() {

        try {

            const response =
                await fetch("https://foodchain-api.onrender.com/admin/profile");

            const admin =
                await response.json();

            adminName.value =
                admin.fullName || "";

            adminEmail.value =
                admin.email || "";

            adminPhone.value =
                admin.phone || "";

            darkMode.checked =
                admin.darkMode || false;

            emailNotifications.checked =
                admin.emailNotifications || false;

            profileBase64 =
                admin.profileImage || "";

            if (profileBase64) {

                profilePreview.src =
                    profileBase64;

            }

            document.body.classList.toggle(
                "dark-mode",
                darkMode.checked
            );

        }

        catch (error) {

            console.error(error);

        }

    }

    loadProfile();


    /*==========================================
    PROFILE IMAGE
    ==========================================*/

    profileImage.addEventListener("change", function () {

        const file =
            this.files[0];

        if (!file) return;

        const reader =
            new FileReader();

        reader.onload = function (e) {

            profilePreview.src =
                e.target.result;

            profileBase64 =
                e.target.result;

        };

        reader.readAsDataURL(file);

    });


    /*==========================================
    PASSWORD STRENGTH
    ==========================================*/

    newPassword.addEventListener("input", () => {

        const value =
            newPassword.value;

        if (value.length === 0) {

            passwordStrength.textContent =
                "Password Strength";

            passwordStrength.style.color =
                "#666";

        }

        else if (value.length < 6) {

            passwordStrength.textContent =
                "Weak";

            passwordStrength.style.color =
                "red";

        }

        else if (value.length < 10) {

            passwordStrength.textContent =
                "Medium";

            passwordStrength.style.color =
                "orange";

        }

        else {

            passwordStrength.textContent =
                "Strong";

            passwordStrength.style.color =
                "green";

        }

    });

    /*==========================================
    SAVE PROFILE
    ==========================================*/

    saveBtn.addEventListener("click", async () => {

        try {

            // Update profile

            const profileResponse = await fetch(

                "https://foodchain-api.onrender.com/admin/profile",

                {

                    method: "PUT",

                    headers: {

                        "Content-Type": "application/json"

                    },

                    body: JSON.stringify({

                        fullName: adminName.value.trim(),

                        email: adminEmail.value.trim(),

                        phone: adminPhone.value.trim(),

                        profileImage: profileBase64,

                        darkMode: darkMode.checked,

                        emailNotifications:
                            emailNotifications.checked

                    })

                }

            );

            const profileData =
                await profileResponse.json();

            if (!profileData.success) {

                alert(profileData.message);

                return;

            }

            // Change password if filled

            if (

                currentPassword.value !== "" ||

                newPassword.value !== "" ||

                confirmPassword.value !== ""

            ) {

                if (

                    newPassword.value !==

                    confirmPassword.value

                ) {

                    alert("Passwords do not match.");

                    return;

                }

                const passwordResponse = await fetch(

                    "https://foodchain-api.onrender.com/admin/password",

                    {

                        method: "PUT",

                        headers: {

                            "Content-Type": "application/json"

                        },

                        body: JSON.stringify({

                            currentPassword:
                                currentPassword.value,

                            newPassword:
                                newPassword.value

                        })

                    }

                );

                const passwordData =
                    await passwordResponse.json();

                if (!passwordData.success) {

                    alert(passwordData.message);

                    return;

                }

            }

            alert("Settings updated successfully!");

            currentPassword.value = "";

            newPassword.value = "";

            confirmPassword.value = "";

        }

        catch (error) {

            console.error(error);

            alert("Could not update settings.");

        }

    });


    /*==========================================
    RESET FORM
    ==========================================*/

    resetBtn.addEventListener("click", () => {

        if (

            confirm(

                "Reset unsaved changes?"

            )

        ) {

            loadProfile();

            currentPassword.value = "";

            newPassword.value = "";

            confirmPassword.value = "";

        }

    });


    /*==========================================
    DARK MODE
    ==========================================*/

    darkMode.addEventListener("change", () => {

        document.body.classList.toggle(

            "dark-mode",

            darkMode.checked

        );

    });

});


/*==========================================
LOGOUT
==========================================*/

const logoutBtn =
document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", () => {

        if (

            confirm(

                "Are you sure you want to logout?"

            )

        ) {

            localStorage.removeItem(

                "adminLoggedIn"

            );

            localStorage.removeItem(

                "admin"

            );

            window.location.href =
                "login.html";

        }

    });

}