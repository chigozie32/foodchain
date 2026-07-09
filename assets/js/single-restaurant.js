/*=========================================
FOODCHAIN SINGLE RESTAURANT
PART 1
=========================================*/

const singleRestaurant =
document.getElementById("singleRestaurant");

const relatedRestaurants =
document.getElementById("relatedRestaurants");

/*=========================================
GET RESTAURANT ID FROM URL
=========================================*/

const params =
new URLSearchParams(window.location.search);

const restaurantId = params.get("id");

let restaurants = [];
let currentRestaurant = null;

/*=========================================
LOAD RESTAURANTS FROM BACKEND
=========================================*/

async function loadRestaurant() {

    try {

        const response =
        await fetch("https://foodchain-api.onrender.com/restaurants");

        restaurants = await response.json();

        currentRestaurant =
restaurants.find(item => item._id === restaurantId);

        if (!currentRestaurant) {

            singleRestaurant.innerHTML = `

            <div class="empty-restaurants">

                <h2>Restaurant Not Found</h2>

                <p>
                    The restaurant you are looking for
                    does not exist or has been removed.
                </p>

            </div>

            `;

            return;

        }

        displayRestaurant(currentRestaurant);

        displayRelatedRestaurants();

    }

    catch (error) {

        console.error(error);

        singleRestaurant.innerHTML = `

        <div class="empty-restaurants">

            <h2>Unable To Load Restaurant</h2>

            <p>
                Please check your internet connection
                or try again later.
            </p>

        </div>

        `;

    }

}

/*=========================================
DISPLAY RESTAURANT DETAILS
=========================================*/

function displayRestaurant(restaurant) {

    singleRestaurant.innerHTML = `

    <div class="single-layout">

        <div class="restaurant-cover-wrapper">

            <img

                src="${restaurant.coverImage || "assets/images/logo.png"}"

                alt="${restaurant.name}"

                class="restaurant-cover">

        </div>

        <div class="restaurant-content">

            <span class="restaurant-category">

                ${restaurant.category}

            </span>

            <h1>

                ${restaurant.name}

            </h1>

            <div class="restaurant-meta">

                <span>⭐ ${restaurant.rating}</span>

                <span>🚚 ${restaurant.deliveryTime}</span>

                <span>📍 ${restaurant.address}</span>

            </div>

            <p class="restaurant-description">

                ${restaurant.description}

            </p>

            <div class="info-grid">

                <div class="info-card">

                    <h4>Phone</h4>

                    <p>${restaurant.phone || "Not Available"}</p>

                </div>

                <div class="info-card">

                    <h4>Category</h4>

                    <p>${restaurant.category}</p>

                </div>

                <div class="info-card">

                    <h4>Delivery Time</h4>

                    <p>${restaurant.deliveryTime}</p>

                </div>

                <div class="info-card">

                    <h4>Address</h4>

                    <p>${restaurant.address}</p>

                </div>

            </div>

            <div class="restaurant-actions">

                <a href="#"

                class="btn btn-primary">

                    Order Now

                </a>

            </div>

        </div>

    </div>

    `;

}

/*=========================================
DISPLAY RELATED RESTAURANTS
=========================================*/

function displayRelatedRestaurants() {

    if (!relatedRestaurants) return;

    relatedRestaurants.innerHTML = "";

    const related = restaurants
        .filter(item =>
            item._id !== currentRestaurant._id &&
            item.category === currentRestaurant.category
        )
        .slice(0, 3);

    if (related.length === 0) {

        relatedRestaurants.innerHTML = `

        <div class="empty-restaurants">

            <h3>No Related Restaurants Found</h3>

        </div>

        `;

        return;

    }

    related.forEach(item => {

        relatedRestaurants.innerHTML += `

        <article class="restaurant-card">

            <div class="restaurant-image">

                <img

                src="${item.coverImage || 'assets/images/logo.png'}"

                alt="${item.name}">

            </div>

            <div class="restaurant-content">

                <span class="restaurant-category">

                    ${item.category}

                </span>

                <h3>

                    ${item.name}

                </h3>

                <p>

                    ${item.description}

                </p>

                <div class="restaurant-meta">

                    <span>

                        ⭐ ${item.rating}

                    </span>

                    <span>

                        🚚 ${item.deliveryTime}

                    </span>

                </div>

                <a

                href="single-restaurant.html?id=${item._id}"

                class="restaurant-btn">

                    View Restaurant →

                </a>

            </div>

        </article>

        `;

    });

}

/*=========================================
SHARE RESTAURANT
=========================================*/

document.addEventListener("click", () => {

    const url = window.location.href;
    const title = document.title;

    const whatsapp =
    document.getElementById("shareWhatsapp");

    const facebook =
    document.getElementById("shareFacebook");

    const x =
    document.getElementById("shareX");

    if (whatsapp) {

        whatsapp.onclick = () => {

            window.open(

                `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,

                "_blank"

            );

        };

    }

    if (facebook) {

        facebook.onclick = () => {

            window.open(

                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,

                "_blank"

            );

        };

    }

    if (x) {

        x.onclick = () => {

            window.open(

                `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,

                "_blank"

            );

        };

    }

});

/*=========================================
INITIALIZE PAGE
=========================================*/

document.addEventListener("DOMContentLoaded", () => {

    loadRestaurant();

});