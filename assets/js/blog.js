/*=========================================
FOODCHAIN PUBLIC BLOG
PART 1
=========================================*/

/*=========================================
SELECT ELEMENTS
=========================================*/

const blogContainer = document.getElementById("blogContainer");
const featuredContainer = document.getElementById("featuredBlog");
const blogSearch = document.getElementById("blogSearch");

let blogs = [];

/*=========================================
LOAD BLOGS
=========================================*/

async function loadBlogs() {

    try {

        const response = await fetch("https://foodchain-api.onrender.com/blogs");

        blogs = await response.json();

        displayFeaturedBlog();
        displayBlogs();

    } catch (error) {

        console.error(error);

        if (blogContainer) {

            blogContainer.innerHTML = `
                <h2 style="text-align:center;padding:50px;">
                    Could not load blog posts.
                </h2>
            `;

        }

    }

}

/*=========================================
DISPLAY FEATURED BLOG
=========================================*/

function displayFeaturedBlog() {

    if (!featuredContainer) return;

    const featuredBlog = blogs.find(blog => blog.featured === true);

    if (!featuredBlog) {

        featuredContainer.innerHTML = `
            <div class="featured-content">

                <span class="featured-badge">
                    FEATURED STORY
                </span>

                <h2>No Featured Article Yet</h2>

                <p>
                    Publish a blog and mark it as Featured
                    from the Admin Dashboard.
                </p>

            </div>
        `;

        return;

    }

    featuredContainer.innerHTML = `

        <div class="featured-image">

            <img
                src="${featuredBlog.image || 'assets/images/image-placeholder.png'}"
                alt="${featuredBlog.title}">

        </div>

        <div class="featured-content">

            <span class="featured-badge">
                FEATURED STORY
            </span>

            <h2>${featuredBlog.title}</h2>

            <p>${featuredBlog.description}</p>

            <div class="article-meta">

                <span>
                    📅 ${featuredBlog.date || ""}
                </span>

                <span>
                    ⏱️ ${featuredBlog.readingTime || ""}
                </span>

            </div>

            <a
                href="single-blog.html?id=${featuredBlog._id}"
                class="btn btn-primary">

                Read Full Article

            </a>

        </div>

    `;

}

/*=========================================
DISPLAY ALL BLOGS
=========================================*/

function displayBlogs(blogList = blogs) {

    if (!blogContainer) return;

    blogContainer.innerHTML = "";

    if (blogList.length === 0) {

        blogContainer.innerHTML = `
            <h2 style="text-align:center;padding:50px;">
                No blog posts available.
            </h2>
        `;

        return;
    }

    blogList.forEach(blog => {

        blogContainer.innerHTML += `

        <article class="article-card">

            <div class="article-image">
                <img
                    src="${blog.image || 'assets/images/image-placeholder.png'}"
                    alt="${blog.title}">
            </div>

            <div class="article-content">

                <span class="article-category">
                    ${blog.category}
                </span>

                <h3>${blog.title}</h3>

                <p>${blog.description}</p>

                <div class="article-footer">

                    <span>
                        📅 ${blog.date || ""} • ${blog.readingTime || ""}
                    </span>

                    <a href="single-blog.html?id=${blog._id}">
                        Read More →
                    </a>

                </div>

            </div>

        </article>

        `;

    });

    animateBlogCards();

}

/*=========================================
SEARCH BLOGS
=========================================*/

if (blogSearch) {

    blogSearch.addEventListener("input", function () {

        const keyword = this.value.toLowerCase().trim();

        const filteredBlogs = blogs.filter(blog => {

            return (

                blog.title.toLowerCase().includes(keyword) ||

                blog.description.toLowerCase().includes(keyword) ||

                blog.category.toLowerCase().includes(keyword)

            );

        });

        displayBlogs(filteredBlogs);

    });

}

/*=========================================
CATEGORY FILTER
=========================================*/

const categoryButtons =
document.querySelectorAll(".blog-category-btn");

if (categoryButtons.length > 0) {

    categoryButtons.forEach(button => {

        button.addEventListener("click", () => {

            const category = button.dataset.category;

            if (category === "all") {

                displayBlogs();

                return;

            }

            const filteredBlogs = blogs.filter(blog =>

                blog.category === category

            );

            displayBlogs(filteredBlogs);

        });

    });

}

/*=========================================
ANIMATION
=========================================*/

function animateBlogCards() {

    const cards = document.querySelectorAll(".article-card");

    cards.forEach((card, index) => {

        card.style.animationDelay = `${index * 0.1}s`;

        card.classList.add("show");

    });

}

/*=========================================
INITIALIZE
=========================================*/

document.addEventListener("DOMContentLoaded", () => {

    loadBlogs();

});
