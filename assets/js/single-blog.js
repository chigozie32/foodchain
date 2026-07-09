/*=========================================
FOODCHAIN SINGLE BLOG
=========================================*/

const singleBlog = document.getElementById("singleBlog");
const relatedBlogs = document.getElementById("relatedBlogs");

const params = new URLSearchParams(window.location.search);
const blogId = params.get("id");

let currentBlog = null;

/*=========================================
LOAD SINGLE BLOG
=========================================*/

async function loadBlog() {

    if (!blogId) {

        singleBlog.innerHTML = `
            <h2 style="text-align:center;padding:80px;">
                Blog not found.
            </h2>
        `;

        return;
    }

    try {

        // Load the selected blog
        const response = await fetch(
            `http://localhost:3000/blogs/${blogId}`
        );

        if (!response.ok) {

            throw new Error("Blog not found");

        }

        currentBlog = await response.json();

        displayBlog(currentBlog);

        loadRelatedBlogs(currentBlog);

    }

    catch (error) {

        console.error(error);

        singleBlog.innerHTML = `
            <h2 style="text-align:center;padding:80px;">
                Could not load blog.
            </h2>
        `;

    }

}

/*=========================================
DISPLAY BLOG
=========================================*/

function displayBlog(blog) {

    document.title = `${blog.title} | FoodChain`;

    singleBlog.innerHTML = `

        <div class="single-blog-image">

            <img
                src="${blog.image || "assets/images/image-placeholder.png"}"
                alt="${blog.title}">

        </div>

        <span class="article-category">

            ${blog.category}

        </span>

        <h1>

            ${blog.title}

        </h1>

        <div class="article-meta">

            <span>👤 ${blog.author || "FoodChain Team"}</span>

            <span>📅 ${blog.date || ""}</span>

            <span>⏱️ ${blog.readingTime || ""}</span>

        </div>

        <div class="single-description">

            ${blog.description || ""}

        </div>

        <div class="single-content">

            ${(blog.content || "").replace(/\n/g, "<br><br>")}

        </div>

    `;

}

/*=========================================
LOAD RELATED BLOGS
=========================================*/

async function loadRelatedBlogs(blog) {

    try {

        const response = await fetch(
            "http://localhost:3000/blogs"
        );

        const blogs = await response.json();

        const related = blogs
            .filter(item =>
                item._id !== blog._id &&
                item.category === blog.category
            )
            .slice(0, 3);

        if (!relatedBlogs) return;

        if (related.length === 0) {

            relatedBlogs.innerHTML = `
                <p style="text-align:center;padding:30px;">
                    No related articles available.
                </p>
            `;

            return;

        }

        relatedBlogs.innerHTML = "";

        related.forEach(blog => {

            relatedBlogs.innerHTML += `

            <article class="article-card">

                <div class="article-image">

                    <img
                        src="${blog.image || "assets/images/image-placeholder.png"}"
                        alt="${blog.title}">

                </div>

                <div class="article-content">

                    <span class="article-category">

                        ${blog.category}

                    </span>

                    <h3>

                        ${blog.title}

                    </h3>

                    <p>

                        ${blog.description || ""}

                    </p>

                    <div class="article-footer">

                        <span>

                            ${blog.date || ""} • ${blog.readingTime || ""}

                        </span>

                        <a href="single-blog.html?id=${blog._id}">

                            Read More →

                        </a>

                    </div>

                </div>

            </article>

            `;

        });

    }

    catch (error) {

        console.error(error);

    }

}

/*=========================================
SHARE BUTTONS
=========================================*/

const shareWhatsapp = document.getElementById("shareWhatsapp");
const shareFacebook = document.getElementById("shareFacebook");
const shareX = document.getElementById("shareX");

const currentUrl = window.location.href;

if (shareWhatsapp) {

    shareWhatsapp.addEventListener("click", () => {

        window.open(
            `https://wa.me/?text=${encodeURIComponent(document.title + " " + currentUrl)}`,
            "_blank"
        );

    });

}

if (shareFacebook) {

    shareFacebook.addEventListener("click", () => {

        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
            "_blank"
        );

    });

}

if (shareX) {

    shareX.addEventListener("click", () => {

        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(document.title)}&url=${encodeURIComponent(currentUrl)}`,
            "_blank"
        );

    });

}

/*=========================================
INITIALIZE
=========================================*/

document.addEventListener("DOMContentLoaded", () => {

    loadBlog();

});