/*==========================================
PROTECT ADMIN PAGES
==========================================*/

const isLoggedIn = localStorage.getItem("adminLoggedIn");

if (isLoggedIn !== "true") {

    window.location.href = "login.html";

}


/*==========================================
FOODCHAIN ADMIN MENU
==========================================*/

document.addEventListener("DOMContentLoaded", () => {

    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.getElementById("sidebarOverlay");



// Load admin settings
fetch("https://foodchain-api.onrender.com/admin/profile")
    .then(res => res.json())
    .then(admin => {

        // Dark mode
        if (admin.darkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }

        // Profile image
        document.querySelectorAll(".profile-image").forEach(img => {
            if (admin.profileImage) {
                img.src = admin.profileImage;
            }
        });

    })
    .catch(err => console.error("Failed to load admin settings:", err));

  if (!menuToggle || !sidebar) return;

    // Open sidebar
    menuToggle.addEventListener("click", () => {

sidebar.classList.add("active");

if (overlay) {

    overlay.classList.add("active");

}

    });

    // Close sidebar
 function closeSidebar() {

    sidebar.classList.remove("active");

    if (overlay) {

        overlay.classList.remove("active");

    }

}

    // Tap outside to close
   if (overlay) {

    overlay.addEventListener("click", closeSidebar);

}

    // Close after clicking a menu link (mobile)
    document.querySelectorAll(".sidebar a").forEach(link => {

        link.addEventListener("click", closeSidebar);

    });

    // Close with ESC key
    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape") {

            closeSidebar();

        }

    });

});


/*==========================================
NOTIFICATION DROPDOWN
==========================================*/

const notificationBell = document.getElementById("notificationBell");
const notificationDropdown = document.getElementById("notificationDropdown");

if (notificationBell && notificationDropdown) {

    notificationBell.addEventListener("click", function (e) {

        e.stopPropagation();
        notificationDropdown.classList.toggle("active");

    });

    document.addEventListener("click", function () {

        notificationDropdown.classList.remove("active");

    });

    notificationDropdown.addEventListener("click", function (e) {

        e.stopPropagation();

    });

}


/*==========================================
NOTIFICATIONS (MongoDB)
==========================================*/

// const API_URL = "https://foodchain-api.onrender.com";

let currentFilter = "all";

/*------------------------------------------
LOAD NOTIFICATIONS
------------------------------------------*/

async function loadNotifications() {

    const list = document.getElementById("notificationList");
    const badge = document.getElementById("notificationCount");

    if (!list || !badge) return;

    try {

        const notifications = await getNotifications();

        list.innerHTML = "";

        if (notifications.length === 0) {

            badge.textContent = "0";
            list.innerHTML = "<li>No notifications yet.</li>";
            return;

        }

        const filtered = notifications.filter(notification => {

            if (currentFilter === "unread") {
                return !notification.read;
            }

            return true;

        });

        const unreadCount = notifications.filter(n => !n.read).length;

        badge.textContent = unreadCount;

        filtered.forEach(notification => {

            const li = document.createElement("li");

            if (!notification.read) {
                li.classList.add("unread");
            }

            li.innerHTML = `
                <div class="notification-item">
                    <div>
                        <strong>${notification.message}</strong><br>
                        <small>${timeAgo(notification.createdAt)}</small>
                    </div>

                    <button class="delete-notification">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            li.querySelector(".delete-notification").addEventListener("click", async (e) => {

    e.stopPropagation();

    await deleteNotification(notification._id);

    loadNotifications();

});

li.addEventListener("click", async () => {

    if (!notification.read) {

        await fetch(
            `https://foodchain-api.onrender.com/notifications/${notification._id}/read`,
            {
                method: "PUT"
            }
        );

        // Update local object immediately
        notification.read = true;

        // Remove highlight immediately
        li.classList.remove("unread");

        // Reduce badge immediately
        const badge = document.getElementById("notificationCount");

        let count = parseInt(badge.textContent) || 0;

        if (count > 0) {
            badge.textContent = count - 1;
        }

    }

    if (notification.link) {
        window.location.href = notification.link;
    }

});

            list.appendChild(li);

        });

    } catch (error) {

        console.error("Notification error:", error);

    }

}

/*------------------------------------------
TIME AGO
------------------------------------------*/

function timeAgo(dateString) {

    const now = new Date().getTime();
    const past = new Date(dateString).getTime();

    const diff = Math.floor((now - past) / 1000);

    if (diff < 60) return `${diff} seconds ago`;

    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;

}
/*------------------------------------------
EVENTS
------------------------------------------*/

document.addEventListener("DOMContentLoaded", () => {

    loadNotifications();

    const allBtn = document.getElementById("showAllBtn");
    const unreadBtn = document.getElementById("showUnreadBtn");
    const markAllReadBtn = document.getElementById("markAllReadBtn");

    if (allBtn) {

        allBtn.addEventListener("click", () => {

            currentFilter = "all";

            allBtn.classList.add("active");
            unreadBtn?.classList.remove("active");

            loadNotifications();

        });

    }

    if (unreadBtn) {

        unreadBtn.addEventListener("click", () => {

            currentFilter = "unread";

            unreadBtn.classList.add("active");
            allBtn?.classList.remove("active");

            loadNotifications();

        });

    }

    if (markAllReadBtn) {

        markAllReadBtn.addEventListener("click", async (e) => {

            e.preventDefault();

            await fetch("https://foodchain-api.onrender.com/notifications/read-all", {
                method: "PUT"
            });

            loadNotifications();

        });

    }

});

/*------------------------------------------
DELETE NOTIFICATION
------------------------------------------*/

async function deleteNotification(id) {

    try {

        await fetch(
            `https://foodchain-api.onrender.com/notifications/${id}`,
            {
                method: "DELETE"
            }
        );

    } catch (error) {

        console.error(error);

    }

}

/*------------------------------------------
GET NOTIFICATIONS
------------------------------------------*/

async function getNotifications() {
    const response = await fetch(
        "https://foodchain-api.onrender.com/notifications"
    );

    return await response.json();
}