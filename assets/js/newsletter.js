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
    // Submit
newsletterForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = emailInput.value.trim();

    if (email === "") {

        alert("Please enter your email address.");
        return;

    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {

        alert("Please enter a valid email address.");
        return;

    }

    try {

        const response = await fetch(
            "https://foodchain-api.onrender.com/newsletter",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            }
        );

        const data = await response.json();

        alert(data.message);

        if (data.success) {

            localStorage.removeItem("newsletterEmail");

            newsletterForm.reset();

        }

    } catch (error) {

        console.error(error);

        alert("Could not subscribe.");

    }

});
}