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
fetch("https://foodchain-api.onrender.com/api/admin/settings")
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

const notificationBell =
    document.getElementById("notificationBell");

const notificationDropdown =
    document.getElementById("notificationDropdown");

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

let currentFilter = "all";

async function loadNotifications() {

    const list = document.getElementById("notificationList");
    const badge = document.getElementById("notificationCount");

    if (!list || !badge) return;

    try {

        let notifications = await getNotifications();

        list.innerHTML = "";

        if (!notifications.length) {

            list.innerHTML = "<li>No notifications yet.</li>";
            badge.textContent = "0";
            return;

        }

        let unread = 0;

        notifications
        .filter(notification => {

            if (currentFilter === "unread") {

                return !notification.read;

            }

            return true;

        })
        .forEach(notification => {

            if (!notification.read) unread++;

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

            li.querySelector(".delete-notification")
            .addEventListener("click", async (e) => {

                e.stopPropagation();

                await deleteNotification(notification._id);

                loadNotifications();

            });

            li.addEventListener("click", async () => {

                await fetch("https://foodchain-api.onrender.com/notifications/read-all", {

                    method: "PUT"

                });

                loadNotifications();

                if (notification.link) {

                    window.location.href = notification.link;

                }

            });

            list.appendChild(li);

        });

        badge.textContent = unread;

    }

    catch (error) {

        console.error(error);

    }

}

function timeAgo(dateString) {

    const now = new Date();

    const past = new Date(dateString);

    const diff = Math.floor((now - past) / 1000);

    if (diff < 60) return `${diff} seconds ago`;

    const minutes = Math.floor(diff / 60);

    if (minutes < 60) return `${minutes} minutes ago`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `${hours} hours ago`;

    const days = Math.floor(hours / 24);

    return `${days} days ago`;

}

document.addEventListener("DOMContentLoaded", () => {

    loadNotifications();

    const markAllReadBtn = document.getElementById("markAllReadBtn");

    if (markAllReadBtn) {

        markAllReadBtn.addEventListener("click", async (e) => {

            e.preventDefault();

            await markAllAsRead();

            loadNotifications();

        });

    }

    const allBtn = document.getElementById("showAllBtn");

    const unreadBtn = document.getElementById("showUnreadBtn");

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

});

/*==========================================
LOAD NOTIFICATIONS
==========================================*/

function loadNotifications() {

    const list =
        document.getElementById("notificationList");

    const badge =
        document.getElementById("notificationCount");

    if (!list || !badge) return;

    const notifications = getNotifications();

    list.innerHTML = "";

    if (notifications.length === 0) {

        list.innerHTML =
            "<li>No notifications yet.</li>";

        badge.textContent = "0";

        return;

    }

    let unread = 0;

notifications
.filter(notification => {
    if (currentFilter === "unread") {
        return !notification.read;
    }
    return true;
})
.forEach(notification => {

        if (!notification.read) unread++;

        const li = document.createElement("li");

        if (!notification.read) {
    li.classList.add("unread");
}

li.innerHTML = `
    <div class="notification-item">

        <div>

            <strong>${notification.message}</strong><br>

            <small>${timeAgo(notification.date)}</small>

        </div>

        <button class="delete-notification">

            <i class="fas fa-trash"></i>

        </button>

    </div>
`;

const deleteButton = li.querySelector(".delete-notification");

deleteButton.addEventListener('click', (e) => {

    e.stopPropagation();

    // 1. Get full list
    let notifications = getNotifications();

    // 2. Find index properly
    const index = notifications.indexOf(notification);

    // 3. Remove from array
    notifications.splice(index, 1);

    // 4. SAVE UPDATED ARRAY (MOST IMPORTANT STEP)
    saveNotifications(notifications);

    // 5. Reload UI
    loadNotifications();
    
});

li.addEventListener("click", () => {

    notification.read = true;

    saveNotifications(notifications);

    loadNotifications();

    window.location.href = notification.link;

});

        list.appendChild(li);

    });

    badge.textContent = unread;

}

document.addEventListener("DOMContentLoaded", loadNotifications);


function markAllAsRead() {

    const notifications = getNotifications();

    notifications.forEach(notification => {

        notification.read = true;

    });

    saveNotifications(notifications);

    loadNotifications();

}

document.addEventListener("DOMContentLoaded", () => {

    const showAllBtn = document.getElementById("showAllBtn");
const showUnreadBtn = document.getElementById("showUnreadBtn");

if (showAllBtn) {
    showAllBtn.addEventListener("click", () => {
        currentFilter = "all";
        loadNotifications();
    });
}

if (showUnreadBtn) {
    showUnreadBtn.addEventListener("click", () => {
        currentFilter = "unread";
        loadNotifications();
    });
}

    const markAllReadBtn =
        document.getElementById("markAllReadBtn");

    if (markAllReadBtn) {

        markAllReadBtn.addEventListener("click", (e) => {

            e.preventDefault();

            markAllAsRead();

        });

    }

});


function timeAgo(dateString) {

    const now = new Date();
    const past = new Date(dateString);

    const diff = Math.floor((now - past) / 1000);

    if (diff < 60) return `${diff} seconds ago`;

    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `${minutes} minutes ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;

    const days = Math.floor(hours / 24);
    return `${days} days ago`;
}

document.addEventListener("DOMContentLoaded", () => {

    const allBtn = document.getElementById("showAllBtn");
    const unreadBtn = document.getElementById("showUnreadBtn");

    if (!allBtn || !unreadBtn) return;

    allBtn.addEventListener("click", () => {

        allBtn.classList.add("active");
        unreadBtn.classList.remove("active");

        currentFilter = "all";
        loadNotifications();

    });

    unreadBtn.addEventListener("click", () => {

        unreadBtn.classList.add("active");
        allBtn.classList.remove("active");

        currentFilter = "unread";
        loadNotifications();

    });

});