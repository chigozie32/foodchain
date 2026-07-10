/*==========================================
FOODCHAIN NEWSLETTER (Render + MongoDB)
==========================================*/

const newsletterForm = document.getElementById("newsletterForm");

if (newsletterForm) {

    const emailInput = document.getElementById("newsletterEmail");

    newsletterForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = emailInput.value.trim();

        if (!email) {
            alert("Please enter your email.");
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

                    body: JSON.stringify({
                        email
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Could not subscribe.");
                return;
            }

            alert(data.message);

            await addNotification(
    `New newsletter subscriber: ${email}`,
    "newsletter.html"
);

            newsletterForm.reset();

        } catch (error) {

            console.error(error);

            alert("Could not connect to the server.");

        }

    });

}