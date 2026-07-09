/*==================================
FOODCHAIN
Restaurant Image Preview
==================================*/

const restaurantForm = document.getElementById("restaurantForm");

const logoInput = document.getElementById("restaurantLogo");
const logoPreview = document.getElementById("logoPreview");

const coverInput = document.getElementById("restaurantCover");
const coverPreview = document.getElementById("coverPreview");

let editIndex = -1;

/*==================================
IMAGE PREVIEW
==================================*/

if (logoInput) {

    logoInput.addEventListener("change", function () {

        const file = this.files[0];

        if (file) {

            logoPreview.src = URL.createObjectURL(file);

        }

    });

}

if (coverInput) {

    coverInput.addEventListener("change", function () {

        const file = this.files[0];

        if (file) {

            coverPreview.src = URL.createObjectURL(file);

        }

    });

}

/*==================================
CONVERT IMAGE TO BASE64
==================================*/

function convertToBase64(file, callback) {

    if (!file) {

        callback(null);

        return;

    }

    const reader = new FileReader();

    reader.onload = function () {

        callback(reader.result);

    };

    reader.readAsDataURL(file);

}


/*==================================
SAVE RESTAURANT (BACKEND)
==================================*/

restaurantForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const logoFile = document.getElementById("restaurantLogo").files[0];
    const coverFile = document.getElementById("restaurantCover").files[0];

    convertToBase64(logoFile, function (logoBase64) {

        convertToBase64(coverFile, async function (coverBase64) {

            const restaurant = {

                name: document.getElementById("restaurantName").value,

                category: document.getElementById("restaurantCategory").value.trim(),

                phone: document.getElementById("restaurantPhone").value,

                address: document.getElementById("restaurantAddress").value,

                website: document.getElementById("restaurantWebsite").value,

                deliveryFee: document.getElementById("deliveryFee").value,

                description: document.getElementById("restaurantDescription").value,

                rating: document.getElementById("rating").value || "New",

                deliveryTime: document.getElementById("deliveryTime").value || "-",

                logo: logoBase64 || (editIndex !== -1 ? restaurants[editIndex].logo : ""),

                coverImage: coverBase64 || (editIndex !== -1 ? restaurants[editIndex].coverImage : "assets/images/logo.png")

            };

            try {

                let response;

                if (editIndex === -1) {

                    response = await fetch("http://localhost:3000/restaurants", {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(restaurant)

                    });

                } else {

                    response = await fetch(`http://localhost:3000/restaurants/${restaurants[editIndex]._id}`, {

                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(restaurant)

                    });

                }

                const data = await response.json();

                alert(data.message);

                addNotification(
                    `Restaurant ${editIndex === -1 ? "added" : "updated"}: ${restaurant.name}`,
                    "restaurants.html"
                );

                loadNotifications();

                restaurantForm.reset();

                logoPreview.src = "";

                coverPreview.src = "";

                editIndex = -1;

                displayRestaurants();

                updateStats();

            } catch (error) {

                console.error(error);

                alert("Could not connect to server.");

            }

        });

    });

});

/*==================================
DISPLAY RESTAURANTS (BACKEND)
==================================*/

let restaurants = [];

async function displayRestaurants(searchText = "") {

    try {

        const response =
            await fetch("http://localhost:3000/restaurants");

        restaurants = await response.json();

        const tableBody =
            document.getElementById("restaurantTableBody");

        tableBody.innerHTML = "";

        restaurants.forEach((restaurant, index) => {

            if (
                !restaurant.name
                    .toLowerCase()
                    .includes(searchText.toLowerCase())
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
type="button"
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

    } catch (error) {

        console.error(error);

        alert("Could not load restaurants.");

    }

}

displayRestaurants();
updateStats();

/*==================================
DELETE RESTAURANT (BACKEND)
==================================*/

async function deleteRestaurant(index){

    const restaurant = restaurants[index];

    const confirmDelete = confirm(
        `Are you sure you want to delete "${restaurant.name}"?`
    );

    if(!confirmDelete){
        return;
    }

    try{

     const response = await fetch(`http://localhost:3000/restaurants/${restaurant._id}`, {
                method: "DELETE"
            }
        );

        const data = await response.json();

        alert(data.message);

        displayRestaurants();
        updateStats();

    }catch(error){

        console.error(error);

        alert("Could not delete restaurant.");

    }

}


/*==================================
EDIT RESTAURANT
==================================*/

function editRestaurant(index){

    const restaurant = restaurants[index];

    document.getElementById("restaurantName").value =
        restaurant.name;

    document.getElementById("restaurantCategory").value =
        restaurant.category;

    document.getElementById("restaurantPhone").value =
        restaurant.phone || "";

    document.getElementById("restaurantAddress").value =
        restaurant.address || "";

    document.getElementById("restaurantWebsite").value =
        restaurant.website || "";

    document.getElementById("deliveryFee").value =
        restaurant.deliveryFee || "";

    document.getElementById("deliveryTime").value =
        restaurant.deliveryTime;

    document.getElementById("rating").value =
        restaurant.rating;

    document.getElementById("restaurantDescription").value =
        restaurant.description;

    if(restaurant.logo){

        logoPreview.src = restaurant.logo;

    }

    if(restaurant.coverImage){

        coverPreview.src = restaurant.coverImage;

    }

    editIndex = index;

    restaurantForm.scrollIntoView({

        behavior:"smooth",

        block:"start"

    });

}

/*==================================
UPDATE STATS (BACKEND)
==================================*/

async function updateStats(){

    try{

        const response =
        await fetch("http://localhost:3000/restaurants");

        const restaurants =
        await response.json();

        const totalEl =
        document.getElementById("totalRestaurants");

        const avgEl =
        document.getElementById("avgRating");

        const categoryContainer =
        document.getElementById("categoryStats");

        if(!totalEl || !avgEl || !categoryContainer){
            return;
        }

        totalEl.textContent = restaurants.length;

        let totalRating = 0;

        let categoryCounts = {};

        restaurants.forEach(r=>{

            totalRating += parseFloat(r.rating) || 0;

            categoryCounts[r.category] =
            (categoryCounts[r.category] || 0) + 1;

        });

        avgEl.textContent =
        restaurants.length
        ? (totalRating/restaurants.length).toFixed(1)
        : 0;

        categoryContainer.innerHTML = "";

        for(let category in categoryCounts){

            categoryContainer.innerHTML += `

            <div class="stat-card">

                <h3>${categoryCounts[category]}</h3>

                <p>${category}</p>

            </div>

            `;

        }

    }catch(error){

        console.error(error);

    }

}


/*==================================
SEARCH
==================================*/

const searchInput =
document.getElementById("searchRestaurant");

if(searchInput){

    searchInput.addEventListener("input",function(){

        displayRestaurants(this.value);

    });

}


/*==================================
INITIALIZE
==================================*/

displayRestaurants().then(() => {
    updateStats();
});