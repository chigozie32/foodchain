/*==========================================
FOODCHAIN ADMIN — PASSWORD SHOW/HIDE TOGGLE

Automatically adds an eye icon to every
password field on the page, so admins can
confirm what they typed before submitting.

No HTML changes needed per page beyond
including this script.
==========================================*/

document.addEventListener("DOMContentLoaded", function () {

    const passwordInputs = document.querySelectorAll('input[type="password"]');

    passwordInputs.forEach(function (input) {

        // Wrap the input in a positioning container
        const wrapper = document.createElement("div");
        wrapper.className = "pw-toggle-wrap";

        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        input.classList.add("pw-toggle-input");

        // Build the eye button
        const toggleBtn = document.createElement("button");
        toggleBtn.type = "button";
        toggleBtn.className = "pw-toggle-btn";
        toggleBtn.setAttribute("aria-label", "Show password");
        toggleBtn.innerHTML = '<i class="fa-solid fa-eye"></i>';

        toggleBtn.addEventListener("click", function () {

            const showing = input.type === "text";

            input.type = showing ? "password" : "text";

            toggleBtn.innerHTML = showing
                ? '<i class="fa-solid fa-eye"></i>'
                : '<i class="fa-solid fa-eye-slash"></i>';

            toggleBtn.setAttribute(
                "aria-label",
                showing ? "Show password" : "Hide password"
            );

        });

        wrapper.appendChild(toggleBtn);

    });

});