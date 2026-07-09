/*==================================================
FOODCHAIN
NEWSLETTER JAVASCRIPT
==================================================*/

const newsletterForm = document.getElementById("newsletterForm");

if (newsletterForm) {

    const emailInput = document.getElementById("newsletterEmail");

    // Restore saved email
    const savedEmail = localStorage.getItem("newsletterEmail");

    if (savedEmail) {
        emailInput.value = savedEmail;
    }

    // Save while typing
    emailInput.addEventListener("input", () => {

        localStorage.setItem(
            "newsletterEmail",
            emailInput.value
        );

    });

    // Submit
    newsletterForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const email = emailInput.value.trim();

        if (email === "") {

            alert("Please enter your email address.");

            return;

        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            alert("Please enter a valid email address.");

            return;

        }

        // Save subscriber
        let subscribers =
            JSON.parse(localStorage.getItem("subscribers")) || [];

        subscribers.push({

            email: email,

            date: new Date().toLocaleDateString()

        });

        localStorage.setItem(
            "subscribers",
            JSON.stringify(subscribers)
        );

        // Create notification
        addNotification(
            `New newsletter subscriber: ${email}`,
            "newsletter.html"
        );

        // Remove saved email
        localStorage.removeItem("newsletterEmail");

        // Submit to FormSubmit
        newsletterForm.submit();

    });

}