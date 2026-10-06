/*==================================
DISPLAY RESTAURANTS
==================================*/

function displayRestaurants(search = "") {

    const tableBody =
        document.getElementById("restaurantTableBody");

    if (!tableBody) return;

    const restaurants =
        JSON.parse(localStorage.getItem("restaurants")) || [];

    tableBody.innerHTML = "";

    restaurants.forEach((restaurant, index) => {

        if (
            !restaurant.name
                .toLowerCase()
                .includes(search.toLowerCase())
        ) {
            return;
        }

        tableBody.innerHTML += `

        <tr>

            <td>${restaurant.name}</td>

            <td>${restaurant.category}</td>

            <td>⭐ ${restaurant.rating}</td>

            <td>${restaurant.deliveryTime}</td>

            <td>

                <button
                    class="action-btn edit-btn"
                    onclick="editRestaurant(${index})">

                    Edit

                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteRestaurant(${index})">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

}


/*==================================
DELETE RESTAURANT
==================================*/

function deleteRestaurant(index) {

    let restaurants =
        JSON.parse(localStorage.getItem("restaurants")) || [];

    if (!confirm("Delete this restaurant?")) return;

    restaurants.splice(index, 1);

    localStorage.setItem(
        "restaurants",
        JSON.stringify(restaurants)
    );

    displayRestaurants();

    updateStats();

}


/*==================================
EDIT RESTAURANT
==================================*/

function editRestaurant(index) {

    const restaurants =
        JSON.parse(localStorage.getItem("restaurants")) || [];

    const restaurant = restaurants[index];

    document.getElementById("restaurantName").value =
        restaurant.name;

    document.getElementById("restaurantCategory").value =
        restaurant.category;

    document.getElementById("deliveryTime").value =
        restaurant.deliveryTime;

    document.getElementById("rating").value =
        restaurant.rating;

    document.getElementById("restaurantAddress").value =
        restaurant.address;

    document.getElementById("restaurantPhone").value =
        restaurant.phone;

    document.getElementById("restaurantWebsite").value =
        restaurant.website;

    // document.getElementById("deliveryFee").value =
    //     restaurant.deliveryFee;

    document.getElementById("restaurantDescription").value =
        restaurant.description;

    if (restaurant.logo) {

        logoPreview.src = restaurant.logo;

    }

    if (restaurant.coverImage) {

        coverPreview.src = restaurant.coverImage;

    }

    editIndex = index;

}

/*==================================
UPDATE STATISTICS
==================================*/

function updateStats() {

    const totalRestaurants =
        document.getElementById("totalRestaurants");

    const avgRating =
        document.getElementById("avgRating");

    const categoryStats =
        document.getElementById("categoryStats");

    if (!totalRestaurants || !avgRating || !categoryStats) return;

    const restaurants =
        JSON.parse(localStorage.getItem("restaurants")) || [];

    totalRestaurants.textContent = restaurants.length;

    let total = 0;

    let categories = {};

    restaurants.forEach((restaurant) => {

        total += Number(restaurant.rating) || 0;

        categories[restaurant.category] =
            (categories[restaurant.category] || 0) + 1;

    });

    avgRating.textContent =
        restaurants.length
            ? (total / restaurants.length).toFixed(1)
            : "0";

    categoryStats.innerHTML = `

        <div class="stat-card">

            <h3 id="totalRestaurants">${restaurants.length}</h3>

            <p>Total Restaurants</p>

        </div>

        <div class="stat-card">

            <h3 id="avgRating">
                ${
                    restaurants.length
                    ? (total / restaurants.length).toFixed(1)
                    : "0"
                }
            </h3>

            <p>Average Rating</p>

        </div>

    `;

    Object.keys(categories).forEach((category) => {

        categoryStats.innerHTML += `

            <div class="stat-card">

                <h3>${categories[category]}</h3>

                <p>${category}</p>

            </div>

        `;

    });

}


/*==================================
KEEP IMAGES WHEN EDITING
==================================*/

restaurantForm.addEventListener("submit", async function () {

    if (editIndex === -1) return;

    let restaurants =
        JSON.parse(localStorage.getItem("restaurants")) || [];

    if (!logoInput.files[0]) {

        restaurants[editIndex].logo =
            restaurants[editIndex].logo;

    }

    if (!coverInput.files[0]) {

        restaurants[editIndex].coverImage =
            restaurants[editIndex].coverImage;

    }

});


/*==================================
INITIALIZE
==================================*/

displayRestaurants();

updateStats();