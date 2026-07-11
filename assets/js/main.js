/*==================================================
  FOODCHAIN JAVASCRIPT
  PART 1 - MOBILE MENU
==================================================*/

const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".navigation");

if (menuButton && navigation) {

    menuButton.addEventListener("click", () => {

        navigation.classList.toggle("active");

    });

}

/*==================================================
  PART 2 - SCROLL ANIMATION
==================================================*/

const animatedElements = document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right, .reveal-zoom"
);

function handleScrollAnimation() {

    const windowHeight = window.innerHeight;

    animatedElements.forEach((el) => {

        const elementTop = el.getBoundingClientRect().top;

        if (elementTop < windowHeight - 120) {

            el.classList.add("active");

        }

    });

}

window.addEventListener("scroll", handleScrollAnimation);
window.addEventListener("load", handleScrollAnimation);

/*==================================================
  PART 3 - STICKY HEADER
==================================================*/

const header = document.querySelector(".header");

if (header) {

    window.addEventListener("scroll", () => {

        header.classList.toggle("scrolled", window.scrollY > 50);

    });

}

/*==================================================
  PART 4 - ACTIVE NAVIGATION
==================================================*/

const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".navigation a");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 120;

        if (window.pageYOffset >= sectionTop) {

            current = section.id;

        }

    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {

            link.classList.add("active");

        }

    });

});

/*==================================================
  NEWSLETTER
==================================================*/

const newsletterForm = document.getElementById("newsletterForm");

if (newsletterForm) {

    newsletterForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = document.getElementById("newsletterEmail").value;

        try {

            const response = await fetch("https://foodchain-api.onrender.com/newsletter", {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({ email })

            });

            const data = await response.json();

            // if (typeof addNotification === "function") {

            //     addNotification(
            //         `New newsletter subscriber: ${email}`,
            //         "newsletter.html"
            //     );

            // }

            alert(data.message);

            newsletterForm.reset();

        } catch (err) {

            console.error(err);

            alert("Could not connect to the server.");

        }

    });

}

/*==================================================
  LOAD RESTAURANTS
==================================================*/

document.addEventListener("DOMContentLoaded", async () => {

    const restaurantsGrid =
        document.getElementById("restaurantsGrid");

    if (!restaurantsGrid) return;

    let restaurants = [];

    async function loadRestaurants() {

        try {

            const response =
                await fetch("https://foodchain-api.onrender.com/restaurants");

            restaurants = await response.json();

            displayRestaurants(restaurants);

        }

        catch (error) {

            console.error(error);

            restaurantsGrid.innerHTML = `

                <div class="empty-restaurants">

                    <h2>Could not load restaurants.</h2>

                    <p>Please check your server.</p>

                </div>

            `;

        }

    }

    function displayRestaurants(list) {

        restaurantsGrid.innerHTML = "";

        if (!list.length) {

            restaurantsGrid.innerHTML = `

                <div class="empty-restaurants">

                    <h2>No restaurants available.</h2>

                </div>

            `;

            return;

        }

        list.forEach((restaurant) => {

            const card = document.createElement("article");

            card.className = "restaurant-card";

            card.innerHTML = `

                <img
                    src="${restaurant.coverImage || "assets/images/logo.png"}"
                    alt="${restaurant.name}">

                <div class="restaurant-content">

                    <span class="restaurant-category">

                        ${restaurant.category}

                    </span>

                    <h3>${restaurant.name}</h3>

                    <p>${restaurant.description}</p>

                    <div class="restaurant-meta">

                        <span>⭐ ${restaurant.rating}</span>

                        <span>${restaurant.deliveryTime}</span>

                    </div>

                    <a
                    href="single-restaurant.html?id=${restaurant._id}"

                        View Details

                    </a>

                </div>

            `;

            restaurantsGrid.appendChild(card);

        });

    }

    const searchInput =
        document.getElementById("restaurantSearch");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const searchButton =
        document.getElementById("searchButton");

    function filterRestaurants() {

        const keyword =
            searchInput.value.toLowerCase().trim();

        const category =
            categoryFilter.value;

        const filtered = restaurants.filter((restaurant) => {

            const matchesName =
                restaurant.name.toLowerCase().includes(keyword);

            const matchesCategory =
                category === "All" ||
                restaurant.category === category;

            return matchesName && matchesCategory;

        });

        displayRestaurants(filtered);

    }

    if (searchButton)
        searchButton.addEventListener("click", filterRestaurants);

    if (searchInput)
        searchInput.addEventListener("input", filterRestaurants);

    if (categoryFilter)
        categoryFilter.addEventListener("change", filterRestaurants);

    await loadRestaurants();

});

/*==========================================
PARTNER REGISTRATION
==========================================*/

const partnerForm = document.getElementById("partnerForm");

if (partnerForm) {

    const draftInputs =
        partnerForm.querySelectorAll("input, select, textarea");

    // Restore Draft
    const draft =
        JSON.parse(localStorage.getItem("partnerDraft"));

    if (draft) {

        draftInputs[0].value = draft.restaurant || "";
        draftInputs[1].value = draft.owner || "";
        draftInputs[2].value = draft.email || "";
        draftInputs[3].value = draft.phone || "";
        draftInputs[4].value = draft.category || "";
        draftInputs[5].value = draft.city || "";
        draftInputs[6].value = draft.description || "";

    }

    // Auto Save Draft
    draftInputs.forEach(input => {

        input.addEventListener("input", savePartnerDraft);
        input.addEventListener("change", savePartnerDraft);

    });

    function savePartnerDraft() {

        const draft = {

            restaurant: draftInputs[0].value,

            owner: draftInputs[1].value,

            email: draftInputs[2].value,

            phone: draftInputs[3].value,

            category: draftInputs[4].value,

            city: draftInputs[5].value,

            description: draftInputs[6].value

        };

        localStorage.setItem(
            "partnerDraft",
            JSON.stringify(draft)
        );

    }

    partnerForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const partner = {

            restaurant: draftInputs[0].value.trim(),

            owner: draftInputs[1].value.trim(),

            email: draftInputs[2].value.trim(),

            phone: draftInputs[3].value.trim(),

            category: draftInputs[4].value,

            city: draftInputs[5].value.trim(),

            description: draftInputs[6].value.trim(),

            date: new Date().toLocaleDateString(),

            status: "Pending"

        };

        try {

            const response = await fetch(

                "https://foodchain-api.onrender.com/partnership",

                {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json"

                    },

                    body: JSON.stringify(partner)

                }

            );

//             const data = await response.json();

//             if (typeof addNotification === "function") {

//     await addNotification(

//         `New partnership request from ${partner.restaurant}`,

//         "partnerships.html"

//     );

// }

            localStorage.removeItem("partnerDraft");

            alert(data.message || "Application submitted successfully!");

            partnerForm.reset();

        }

        catch (error) {

            console.error(error);

            alert("Could not connect to server.");

        }

    });

}

/*==========================================
HOME PAGE RESTAURANTS
==========================================*/

document.addEventListener("DOMContentLoaded", async () => {

    const homeGrid = document.getElementById("homeRestaurantsGrid");

    if (!homeGrid) return;

    const partnerCard = homeGrid.querySelector(".restaurant-card");

    homeGrid.innerHTML = "";

    try {

        const response = await fetch("https://foodchain-api.onrender.com/restaurants");

        const restaurants = await response.json();

        restaurants.slice(0, 3).forEach((restaurant) => {

            homeGrid.innerHTML += `

            <article class="restaurant-card">

                <img
                    src="${restaurant.coverImage || "assets/images/logo.png"}"
                    alt="${restaurant.name}">

                <div class="restaurant-content">

                    <span class="restaurant-category">

                        ${restaurant.category}

                    </span>

                    <h3>${restaurant.name}</h3>

                    <p>${restaurant.description}</p>

                    <div class="restaurant-meta">

                        <span>⭐ ${restaurant.rating}</span>

                        <span>${restaurant.deliveryTime}</span>

                    </div>

                    <a
                        href="single-restaurant.html?id=${restaurant._id}"
                        class="restaurant-btn">

                        View Restaurant →

                    </a>

                </div>

            </article>

            `;

        });

        if (partnerCard) {

            homeGrid.appendChild(partnerCard);

        }

    }

    catch (error) {

        console.error(error);

        homeGrid.innerHTML = `

            <div class="empty-restaurants">

                <h2>Could not load restaurants.</h2>

            </div>

        `;

    }

});

/*=========================================
FAQ ACCORDION
=========================================*/

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach(item => {

    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {

        faqItems.forEach(other => {

            if (other !== item) {

                other.classList.remove("active");

            }

        });

        item.classList.toggle("active");

    });

});

/*=========================================
CLICK OUTSIDE FAQ
=========================================*/

document.addEventListener("click", (e) => {

    const isFAQ = e.target.closest(".faq-item");

    if (!isFAQ) {

        document.querySelectorAll(".faq-item").forEach(item => {

            item.classList.remove("active");

        });

    }

});

/*==========================================
FAQ SEARCH
==========================================*/

const faqSearch = document.getElementById("faqSearch");

if (faqSearch) {

    faqSearch.addEventListener("input", function () {

        const keyword = this.value.toLowerCase();

        document.querySelectorAll(".faq-item").forEach(item => {

            const question = item.querySelector(".faq-question")
                .textContent.toLowerCase();

            const answer = item.querySelector(".faq-answer")
                .textContent.toLowerCase();

            item.style.display =
                question.includes(keyword) || answer.includes(keyword)
                    ? ""
                    : "none";

        });

    });

}