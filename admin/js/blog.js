/*=========================================
FOODCHAIN BLOG MANAGEMENT
=========================================*/

const blogForm = document.getElementById("blogForm");
const blogImage = document.getElementById("blogImage");
const blogPreview = document.getElementById("blogPreview");
const blogTableBody = document.getElementById("blogTableBody");
const searchBlog = document.getElementById("searchBlog");

let blogs = [];
let editId = null;

/*=========================================
IMAGE PREVIEW
=========================================*/

if (blogImage) {

    blogImage.addEventListener("change", function () {

        const file = this.files[0];

        if (file) {

            blogPreview.src = URL.createObjectURL(file);

        }

    });

}

/*=========================================
CONVERT IMAGE TO BASE64
=========================================*/

function convertToBase64(file) {

    return new Promise((resolve) => {

        if (!file) {

            resolve(null);

            return;

        }

        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);

        reader.readAsDataURL(file);

    });

}

/*=========================================
SAVE / UPDATE BLOG
=========================================*/

if (blogForm) {

    blogForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        try {

            const imageFile = blogImage.files[0];

            const imageBase64 = await convertToBase64(imageFile);

            const oldBlog = blogs.find(blog => blog._id === editId);

            const blog = {

                title: document.getElementById("blogTitle").value.trim(),

                category: document.getElementById("blogCategory").value,

                author: document.getElementById("blogAuthor").value.trim(),

                readingTime: document.getElementById("readingTime").value.trim(),

                description: document.getElementById("blogDescription").value.trim(),

                content: document.getElementById("blogContent").value.trim(),

                image: imageBase64 || oldBlog?.image || ""

            };

            let response;

            if (editId) {

                response = await fetch(

                    `http://localhost:3000/blogs/${editId}`,

                    {

                        method: "PUT",

                        headers: {

                            "Content-Type": "application/json"

                        },

                        body: JSON.stringify(blog)

                    }

                );

            } else {

                response = await fetch(

                    "http://localhost:3000/blogs",

                    {

                        method: "POST",

                        headers: {

                            "Content-Type": "application/json"

                        },

                        body: JSON.stringify(blog)

                    }

                );

            }

            const data = await response.json();

            alert(data.message);

addNotification(
    `${editId ? "Updated" : "Published"} blog: ${blog.title}`,
    "blog.html"
);

loadNotifications();

            blogForm.reset();

            blogPreview.src = "../assets/images/image-placeholder.png";

            editId = null;

            await displayBlogs();

            await updateStats();

        } catch (error) {

            console.error(error);

            // alert("Could not save blog.");

        }

    });

}

/*=========================================
DISPLAY BLOGS
=========================================*/

async function displayBlogs(searchText = "") {

    if (!blogTableBody) return;

    try {

        const response = await fetch("http://localhost:3000/blogs");

        blogs = await response.json();

        blogTableBody.innerHTML = "";

        blogs.forEach(blog => {

            if (
                !blog.title.toLowerCase().includes(searchText.toLowerCase())
            ) {
                return;
            }

            blogTableBody.innerHTML += `

<tr>

<td>

<img
src="${blog.image || "../assets/images/image-placeholder.png"}"
class="table-image"
alt="${blog.title}">

</td>

<td>${blog.title}</td>

<td>${blog.category}</td>

<td>${blog.author}</td>

<td>${blog.readingTime}</td>

<td>

<button
class="edit-btn"
onclick="editBlog('${blog._id}')">

Edit

</button>

<button
onclick="toggleFeatured('${blog._id}')">

${blog.featured ? "❌ Remove Feature" : "⭐ Feature"}

</button>

<button
class="delete-btn"
onclick="deleteBlog('${blog._id}')">

Delete

</button>

</td>

</tr>

`;

        });

    } catch (error) {

        console.error(error);

        alert("Could not load blogs.");

    }

}

/*=========================================
EDIT BLOG
=========================================*/

function editBlog(id) {

    const blog = blogs.find(b => b._id === id);

    if (!blog) return;

    document.getElementById("blogTitle").value = blog.title;
    document.getElementById("blogCategory").value = blog.category;
    document.getElementById("blogAuthor").value = blog.author;
    document.getElementById("readingTime").value = blog.readingTime;
    document.getElementById("blogDescription").value = blog.description;
    document.getElementById("blogContent").value = blog.content;

    blogPreview.src = blog.image || "../assets/images/image-placeholder.png";

    editId = blog._id;

    blogForm.scrollIntoView({

        behavior: "smooth",
        block: "start"

    });

}

/*=========================================
DELETE BLOG
=========================================*/

async function deleteBlog(id) {

    const blog = blogs.find(b => b._id === id);

    if (!blog) return;

    if (!confirm(`Delete "${blog.title}"?`)) return;

    try {

        const response = await fetch(

            `http://localhost:3000/blogs/${id}`,

            {

                method: "DELETE"

            }

        );

        const data = await response.json();

        alert(data.message);

        await displayBlogs();

        await updateStats();

    } catch (error) {

        console.error(error);

        alert("Could not delete blog.");

    }

}

/*=========================================
FEATURE / UNFEATURE BLOG
=========================================*/

async function toggleFeatured(id) {

    try {

        const blog = blogs.find(b => b._id === id);

        if (!blog) return;

        let response;

        if (blog.featured) {

            response = await fetch(

                `http://localhost:3000/blogs/${id}/unfeature`,

                {

                    method: "PUT"

                }

            );

        } else {

            response = await fetch(

                `http://localhost:3000/blogs/${id}/feature`,

                {

                    method: "PUT"

                }

            );

        }

        const data = await response.json();

        alert(data.message);

        await displayBlogs(searchBlog ? searchBlog.value : "");

    } catch (error) {

        console.error(error);

        alert("Could not update featured blog.");

    }

}

/*=========================================
UPDATE STATISTICS
=========================================*/

async function updateStats() {

    try {

        const response =
            await fetch("http://localhost:3000/blogs");

        const blogs =
            await response.json();

        const totalBlogs =
            document.getElementById("totalBlogs");

        const publishedBlogs =
            document.getElementById("publishedBlogs");

        const totalCategories =
            document.getElementById("totalCategories");

        if (!totalBlogs || !publishedBlogs || !totalCategories) {
            return;
        }

        totalBlogs.textContent = blogs.length;

        publishedBlogs.textContent = blogs.length;

        const categories = [...new Set(

            blogs.map(blog => blog.category)

        )];

        totalCategories.textContent = categories.length;

    } catch (error) {

        console.error(error);

    }

}

/*=========================================
SEARCH
=========================================*/

if (searchBlog) {

    searchBlog.addEventListener("input", function () {

        displayBlogs(this.value);

    });

}

/*=========================================
INITIALIZE
=========================================*/

(async function () {

    await displayBlogs();

    await updateStats();

})();