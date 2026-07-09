const API_URL = "http://localhost:3000/notifications";

async function getNotifications() {

    const response = await fetch(API_URL);

    return await response.json();

}

async function addNotification(message, link = "") {

    await fetch(API_URL, {

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

    await fetch(`${API_URL}/read-all`, {

        method: "PUT"

    });

}

async function deleteNotification(id) {

    await fetch(`${API_URL}/${id}`, {

        method: "DELETE"

    });

}