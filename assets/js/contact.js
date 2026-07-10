/*==================================================
FOODCHAIN CONTACT PAGE
==================================================*/

const contactForm = document.getElementById("contactForm");

if (contactForm) {

    const fields = [
        "fullName",
        "email",
        "phone",
        "subject",
        "message"
    ];

    /*==============================================
    RESTORE SAVED DRAFT
    ==============================================*/

    fields.forEach(id => {

        const input = document.getElementById(id);

        if (input) {

            const saved = localStorage.getItem(id);

            if (saved !== null) {

                input.value = saved;

            }

        }

    });

    /*==============================================
    AUTO SAVE DRAFT
    ==============================================*/

    fields.forEach(id => {

        const input = document.getElementById(id);

        if (input) {

            input.addEventListener("input", () => {

                localStorage.setItem(id, input.value);

            });

            input.addEventListener("change", () => {

                localStorage.setItem(id, input.value);

            });

        }

    });

    /*==============================================
    SUBMIT CONTACT FORM
    ==============================================*/

   contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const subject = document.getElementById("subject").value;
    const message = document.getElementById("message").value.trim();

    // 1. Validation Checks
    if (fullName === "" || email === "" || subject === "" || message === "") {
        alert("Please fill in all required fields.");
        return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    // Define the form field IDs array for localStorage clearing
    const fields = ["fullName", "email", "phone", "subject", "message"];

    // 2. Network Request (Updated to the correct '/messages' route)
  fetch("https://foodchain-api.onrender.com/contact", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: fullName,
            email: email,
            phone: phone,
            subject: subject,
            message: message
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Server error occurred");
        }
        return response.json();
    })
    .then(data => {
        // 3. Execution Only Happens on Verified Network Success
        if (typeof addNotification === "function") {

    await addNotification(
        `New contact message from ${fullName}`,
        "messages.html"
    );

}

        fields.forEach(id => {
            localStorage.removeItem(id);
        });

        alert(data.message || "Your message has been sent successfully!");
        contactForm.reset();
    })
    .catch(error => {
        console.error("Submission error:", error);
        alert("Could not send message. Please try again later.");
    });
});
}