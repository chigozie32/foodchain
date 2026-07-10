const NOTIFICATION_API_URL = "https://foodchain-api.onrender.com/notifications";

async function getNotifications() {

    const response = await fetch(NOTIFICATION_API_URL);

    return await response.json();

}

async function addNotification(message, link = "") {

    await fetch(NOTIFICATION_API_URL, {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            message,

            link,

            read: false

        })

    });

}

async function markAllAsRead() {

    await fetch(`${NOTIFICATION_API_URL}/read-all`, {

        method: "PUT"

    });

}

async function deleteNotification(id) {

    await fetch(`${NOTIFICATION_API_URL}/${id}`, {

        method: "DELETE"

    });

}