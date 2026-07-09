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


    // Apply saved dark mode
if (localStorage.getItem("darkMode") === "true") {

    document.body.classList.add("dark-mode");

}

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


let currentFilter = "all";

/*==========================================
NOTIFICATION STORAGE
==========================================*/

function getNotifications() {

    const notifications = localStorage.getItem("notifications");

    return notifications ? JSON.parse(notifications) : [];

}

function saveNotifications(notifications) {

    localStorage.setItem(
        "notifications",
        JSON.stringify(notifications)
    );

}

function addNotification(message, link = "#") {

    const notifications = getNotifications();

    notifications.unshift({

        message,
        link,
        read: false,
        date: new Date().toISOString()

    });

    saveNotifications(notifications);

}

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