/*==========================================
FOODCHAIN DASHBOARD
PART 1 - LOAD DATA FROM BACKEND
==========================================*/

let restaurants = [];
let partnerships = [];
let messages = [];
let subscribers = [];

/*==========================================
LOAD ALL DASHBOARD DATA
==========================================*/

async function loadDashboard(){

    try{

        const [
            restaurantsResponse,
            partnershipsResponse,
            messagesResponse,
            subscribersResponse

        ] = await Promise.all([

            fetch("https://foodchain-api.onrender.com/restaurants"),

            fetch("https://foodchain-api.onrender.com/partnership"),

            fetch("https://foodchain-api.onrender.com/contact"),

            fetch("https://foodchain-api.onrender.com/newsletter")

        ]);

        restaurants = await restaurantsResponse.json();

        partnerships = await partnershipsResponse.json();

        messages = await messagesResponse.json();

        subscribers = await subscribersResponse.json();

        updateCounters();

        buildRecentActivities();

    }

 catch(error){

    console.error("Dashboard Error:", error);

    showToast(error);

}
}

/*==========================================
UPDATE DASHBOARD COUNTERS
==========================================*/

function updateCounters(){

    const restaurantCount =
    document.getElementById("restaurantCount");

    const partnershipCount =
    document.getElementById("partnershipCount");

    const messageCount =
    document.getElementById("messageCount");

    const subscriberCount =
    document.getElementById("subscriberCount");

    if(restaurantCount){

        restaurantCount.textContent =
        restaurants.length;

    }

    if(partnershipCount){

        partnershipCount.textContent =
        partnerships.length;

    }

    if(messageCount){

        messageCount.textContent =
        messages.length;

    }

    if(subscriberCount){

        subscriberCount.textContent =
        subscribers.length;

    }

}

/*==========================================
BUILD RECENT ACTIVITIES
==========================================*/

function buildRecentActivities(){

    const activityBody =
    document.getElementById("recentActivityBody");

    if(!activityBody) return;

    let activities = [];

    // Resolves a display date from whichever timestamp field the
    // item actually has (models aren't all consistent), plus a raw
    // Date object for correct chronological sorting below.
    function resolveDate(item){

        const raw = item.createdAt || item.date || null;
        const parsed = raw ? new Date(raw) : null;
        const valid = parsed && !isNaN(parsed.getTime());

        return {
            display: valid ? parsed.toLocaleDateString() : "-",
            raw: valid ? parsed : new Date(0)
        };

    }

    // Restaurants
    restaurants.forEach(item=>{

        const { display, raw } = resolveDate(item);

        activities.push({

            activity: item.name + " added",

            category: "Restaurant",

            date: display,
            rawDate: raw,

            status: "Published"

        });

    });

    // Partnership Requests
    partnerships.forEach(item=>{

        const { display, raw } = resolveDate(item);

        activities.push({

            activity: item.restaurant + " requested partnership",

            category: "Partnership",

            date: display,
            rawDate: raw,

            status: item.status || "Pending"

        });

    });

    // Contact Messages
    messages.forEach(item=>{

        const { display, raw } = resolveDate(item);

        activities.push({

            activity: "Message from " + item.name,

            category: "Support",

            date: display,
            rawDate: raw,

            status: item.status || "Unread"

        });

    });

    // Newsletter
    subscribers.forEach(item=>{

        const { display, raw } = resolveDate(item);

        activities.push({

            activity: item.email + " subscribed",

            category: "Newsletter",

            date: display,
            rawDate: raw,

            status: "Subscribed"

        });

    });

    // Latest first
    activities.sort((a,b)=>{

        return b.rawDate - a.rawDate;

    });

    activityBody.innerHTML = "";

    activities.slice(0,8).forEach(item=>{

        activityBody.innerHTML += `

        <tr>

            <td>${item.activity}</td>

            <td>${item.category}</td>

            <td>${item.date}</td>

            <td>

                <span class="status">

                    ${item.status}

                </span>

            </td>

        </tr>

        `;

    });

}

/*==========================================
LOGOUT
==========================================*/

const logoutBtn =
document.getElementById("logoutBtn");

if(logoutBtn){

    logoutBtn.addEventListener("click",()=>{

        showConfirm("Are you sure you want to logout?", () => {

            localStorage.removeItem("adminLoggedIn");
            localStorage.removeItem("adminToken");
            localStorage.removeItem("admin");

            window.location.href="login.html";

        }, { title: "Log Out", confirmText: "Log Out" });

    });

}

/*==========================================
START DASHBOARD
==========================================*/

document.addEventListener("DOMContentLoaded",()=>{

    loadDashboard();

});
