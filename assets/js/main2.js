/*==================================================
  FOODCHAIN JAVASCRIPT
  PART 1 - MOBILE MENU
==================================================*/

// Select elements
// Select elements
const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".navigation");

// Toggle menu on click
if (menuButton && navigation) {

    menuButton.addEventListener("click", () => {

        navigation.classList.toggle("active");

    });

}
/*==================================================
  FOODCHAIN JAVASCRIPT
  PART 2 - SCROLL ANIMATION
==================================================*/

// Select all elements with animation classes
const animatedElements = document.querySelectorAll(
  ".reveal, .reveal-left, .reveal-right, .reveal-zoom"
);

// Function to check scroll position
function handleScrollAnimation() {

    const windowHeight = window.innerHeight;

    animatedElements.forEach((el) => {

        const elementTop = el.getBoundingClientRect().top;

        const triggerPoint = 120;

        if (elementTop < windowHeight - triggerPoint) {

            el.classList.add("active");

        }

    });

}

// Run on scroll
window.addEventListener("scroll", handleScrollAnimation);

// Run once on load (important)
window.addEventListener("load", handleScrollAnimation);

/*==================================================
  PART 3 - STICKY HEADER SCROLL EFFECT
==================================================*/
const header = document.querySelector(".header");

if (header) {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 50) {

            header.classList.add("scrolled");

        } else {

            header.classList.remove("scrolled");

        }

    });

}


/*==================================================
  PART 4 - ACTIVE NAVIGATION ON SCROLL
==================================================*/

// Get all sections that have an ID
const sections = document.querySelectorAll("section[id]");

// Get all nav links
const navLinks = document.querySelectorAll(".navigation a");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.clientHeight;

        if (pageYOffset >= sectionTop) {
            current = section.getAttribute("id");
        }

    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {
            link.classList.add("active");
        }

    });

});

/*==========================================
NEWSLETTER
==========================================*/

const newsletterForm = document.getElementById("newsletterForm");

if (newsletterForm) {

    newsletterForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const email = document.getElementById("newsletterEmail").value;

        let subscribers =
            JSON.parse(localStorage.getItem("subscribers")) || [];

      
        if (subscribers.some(sub => sub.email === email)) {

            alert("This email is already subscribed!");

            return;

        }



        fetch("https://foodchain-api.onrender.com/newsletter", {

    method: "POST",

    headers: {

        "Content-Type": "application/json"

    },

    body: JSON.stringify({

        email: email

    })

})
.then(response => response.json())
.then(data => {

    console.log(data);

    alert(data.message);

    newsletterForm.reset();

})
.catch(error => {

    console.error(error);

    alert("Could not connect to the server.");

});

        // Create admin notification
if (typeof addNotification === "function") {
    addNotification(
        `New newsletter subscriber: ${email}`,
        "newsletter.html"
    );
}

        alert("Thank you for subscribing!");

        newsletterForm.reset();

    });

}

/*==========================================
LOAD RESTAURANTS FROM ADMIN
==========================================*/

document.addEventListener("DOMContentLoaded", () => {

    const restaurantsGrid = document.getElementById("restaurantsGrid");

    if (!restaurantsGrid) return;

let restaurants = [];

async function loadRestaurants() {

    try {

        const response =
            await fetch("https://foodchain-api.onrender.com/restaurants");

        restaurants = await response.json();

        displayRestaurants(restaurants);

    } catch (error) {

        console.error(error);

        restaurantsGrid.innerHTML = `
            <div class="empty-restaurants">
                <h2>Could not load restaurants.</h2>
            </div>
        `;

    }

}

    restaurantsGrid.innerHTML = "";

    if (restaurants.length === 0) {

        restaurantsGrid.innerHTML = `
            <div class="empty-restaurants">
                <h2>No restaurants available.</h2>
                <p>Restaurants added from the Admin Portal will appear here.</p>
            </div>
        `;

        return;
    }

    function displayRestaurants(filteredRestaurants){

    restaurantsGrid.innerHTML = "";

    if(filteredRestaurants.length === 0){

        restaurantsGrid.innerHTML = `
            <div class="empty-restaurants">
                <h2>No restaurants found.</h2>
            </div>
        `;

        return;
    }

    filteredRestaurants.forEach((restaurant)=>{

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
            href="single-restaurant.html?id=${restaurant.id}"
            class="btn btn-primary">

            View Details

            </a>

        </div>

        `;

        restaurantsGrid.appendChild(card);

    });

}

displayRestaurants(restaurants);


/*==========================================
SEARCH & FILTER
==========================================*/

const searchInput =
document.getElementById("restaurantSearch");

const categoryFilter =
document.getElementById("categoryFilter");

const searchButton =
document.getElementById("searchButton");

function filterRestaurants(){

    const keyword =
    searchInput.value.toLowerCase().trim();

    const category =
    categoryFilter.value;

    const filtered =
    restaurants.filter((restaurant)=>{

        const matchesName =
        restaurant.name.toLowerCase().includes(keyword);

        const matchesCategory =
        category === "All" ||
        restaurant.category === category;

        return matchesName && matchesCategory;

    });

    displayRestaurants(filtered);

}

searchButton.addEventListener("click", filterRestaurants);

searchInput.addEventListener("input", filterRestaurants);

categoryFilter.addEventListener("change", filterRestaurants);
});




/*==========================================
PARTNER REGISTRATION
==========================================*/

const partnerForm = document.getElementById("partnerForm");

if (partnerForm) {
    /*==========================================
RESTORE SAVED DRAFT
==========================================*/

const savedDraft =
JSON.parse(localStorage.getItem("partnerDraft"));

if (savedDraft) {

    const inputs = partnerForm.querySelectorAll("input, select, textarea");

    inputs.forEach(field => {

        const key = field.placeholder || field.name || field.type;

        if (savedDraft[key]) {

            field.value = savedDraft[key];

        }

    });

}






/*==========================================
PARTNER DRAFT AUTO SAVE
==========================================*/

const draftInputs = partnerForm.querySelectorAll("input, select, textarea");

// Restore draft
const draft = JSON.parse(localStorage.getItem("partnerDraft"));

if (draft) {

    draftInputs[0].value = draft.restaurant || "";
    draftInputs[1].value = draft.owner || "";
    draftInputs[2].value = draft.email || "";
    draftInputs[3].value = draft.phone || "";
    draftInputs[4].value = draft.category || "";
    draftInputs[5].value = draft.city || "";
    draftInputs[6].value = draft.description || "";

}

// Save draft whenever user types
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

    localStorage.setItem("partnerDraft", JSON.stringify(draft));

}
    partnerForm.addEventListener("submit", function (e) {

        e.preventDefault();

        // Save draft while typing
const inputs = partnerForm.querySelectorAll("input, select, textarea");

inputs.forEach(input => {

    input.addEventListener("input", () => {

        const draft = {};

        inputs.forEach(field => {

            draft[field.placeholder || field.name || field.type] = field.value;

        });

        localStorage.setItem("partnerDraft", JSON.stringify(draft));

    });

});

        const partner = {

            restaurant: inputs[0].value.trim(),

            owner: inputs[1].value.trim(),

            email: inputs[2].value.trim(),

            phone: inputs[3].value.trim(),

            category: inputs[4].value,

            city: inputs[5].value.trim(),

            description: inputs[6].value.trim(),

            date: new Date().toLocaleDateString(),

            status: "Pending"

        };

fetch("https://foodchain-api.onrender.com/partnership", {

    method: "POST",

    headers: {

        "Content-Type":"application/json"

    },

    body: JSON.stringify(partner)

})

.then(data => {

    addNotification(
        `New partnership request from ${partner.restaurant}`,
        "partnerships.html"
    );

    localStorage.removeItem("partnerDraft");

    alert("Application submitted successfully!");

    partnerForm.reset();

})

.catch(error => {

    console.error(error);

    alert("Could not connect to server.");

});
        
    });

}



/*==========================================
HOME PAGE RESTAURANTS
==========================================*/

document.addEventListener("DOMContentLoaded", () => {

    const homeGrid =
    document.getElementById("homeRestaurantsGrid");

    if(!homeGrid) return;

    const partnerCard =
    homeGrid.querySelector(".restaurant-card");

 let restaurants = [];

async function loadRestaurants() {

    try {

        const response =
            await fetch("https://foodchain-api.onrender.com/restaurants");

        restaurants = await response.json();

     loadRestaurants()
    } catch (error) {

        console.error(error);

        restaurantsGrid.innerHTML = `
            <div class="empty-restaurants">
                <h2>Could not load restaurants.</h2>
            </div>
        `;

    }

}

    // Remove all cards except the Partner card
    homeGrid.innerHTML = "";

    restaurants.slice(0,3).forEach((restaurant)=>{

        homeGrid.innerHTML += `

        <article class="restaurant-card">

            <img
            src="${restaurant.coverImage || "assets/images/logo.png"}"
            alt="${restaurant.name}">

            <div class="restaurant-content">

                <span class="restaurant-category">

                    ${restaurant.category}

                </span>

                <h3>

                    ${restaurant.name}

                </h3>

                <p>

                    ${restaurant.description}

                </p>

                <div class="restaurant-meta">

                    <span>⭐ ${restaurant.rating}</span>

                    <span>${restaurant.deliveryTime}</span>

                </div>

<a
href="single-restaurant.html?id=${restaurant.id}"
class="restaurant-btn">

    View Restaurant →

</a>

            </div>

        </article>

        `;

    });

    // Add the Partner card back
    if(partnerCard){

        homeGrid.appendChild(partnerCard);

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

            if(other !== item){

                other.classList.remove("active");

            }

        });

        item.classList.toggle("active");

    });

});

/*=========================================
Closes the opened FAQ when clicking outside
=========================================*/

document.addEventListener("click", (e) => {

    const isFAQ = e.target.closest(".faq-item");

    if(!isFAQ){

        document.querySelectorAll(".faq-item")
        .forEach(item => item.classList.remove("active"));

    }

});

/*==========================================
FAQ SEARCH
==========================================*/

const faqSearch =
document.getElementById("faqSearch");

if(faqSearch){

    faqSearch.addEventListener("input", function(){

        const keyword =
        this.value.toLowerCase();

        const faqItems =
        document.querySelectorAll(".faq-item");

        faqItems.forEach(item=>{

            const question =
            item.querySelector(".faq-question")
            .textContent
            .toLowerCase();

            const answer =
            item.querySelector(".faq-answer")
            .textContent
            .toLowerCase();

            if(question.includes(keyword) || answer.includes(keyword)){

                item.style.display = "";

            }else{

                item.style.display = "none";

            }

        });

    });

}

