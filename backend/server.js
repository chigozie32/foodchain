require("dotenv").config();

const express = require("express");
const cors = require("cors");

const mongoose = require("mongoose");

const Restaurant = require("./models/Restaurant");

const Newsletter = require("./models/Newsletter");

const Partnership = require("./models/Partnership");

const Message = require("./models/Message");

const Notification = require("./models/Notification");

const Blog = require("./models/Blog");

const Admin = require("./models/Admin");

const app = express();

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("MongoDB connected successfully ✅");
})
.catch(error => {
    console.log("MongoDB connection failed ❌", error);
});

app.use(cors());

app.use(express.json({
    limit: "50mb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "50mb"
}));

/*==========================================
HOME
==========================================*/

app.get("/", (req, res) => {
    res.send("FoodChain Backend is running 🚀");
});

/*==========================================
NEWSLETTER
==========================================*/

// Subscribe
app.post("/newsletter", async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {

            return res.status(400).json({
                success: false,
                message: "Email is required"
            });

        }

        const existing = await Newsletter.findOne({ email });

        if (existing) {

            return res.status(400).json({
                success: false,
                message: "This email is already subscribed."
            });

        }

        await Newsletter.create({
            email
        });

        await Notification.create({
    message: `New newsletter subscriber: ${email}`,
    link: "newsletter.html",
    read: false
});

        res.json({
            success: true,
            message: "Subscribed successfully!"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not subscribe."
        });

    }

});

// Get Subscribers
app.get("/newsletter", async (req, res) => {

    try {

        const subscribers = await Newsletter.find().sort({
            _id: -1
        });

        res.json(subscribers);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false
        });

    }

});

// Delete Subscriber
app.delete("/newsletter/:id", async (req, res) => {

    try {

        const subscriber = await Newsletter.findByIdAndDelete(req.params.id);

        if (!subscriber) {

            return res.status(404).json({
                success: false,
                message: "Subscriber not found."
            });

        }

        res.json({
            success: true,
            message: "Subscriber deleted successfully!"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not delete subscriber."
        });

    }

});

/*==========================================
CONTACT (MongoDB)
==========================================*/

// Save Contact Message
app.post("/contact", async (req, res) => {

    try {

        const message = await Message.create(req.body);

        await Notification.create({
    message: `New contact message from ${message.name}`,
    link: "messages.html",
    read: false
});

        res.json({
            success: true,
            message: "Message sent successfully!",
            data: message
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not send message."
        });

    }

});

// Get All Messages
app.get("/contact", async (req, res) => {

    try {

        const messages = await Message.find().sort({
            createdAt: -1
        });

        res.json(messages);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not load messages."
        });

    }

});

// Mark Message as Read
app.put("/contact/:id", async (req, res) => {

    try {

        const message = await Message.findByIdAndUpdate(

            req.params.id,

            {
                status: "Read"
            },

            {
                new: true
            }

        );

        if (!message) {

            return res.status(404).json({
                success: false,
                message: "Message not found."
            });

        }

        res.json({
            success: true,
            message: "Message marked as read."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not update message."
        });

    }

});

// Delete Message
app.delete("/contact/:id", async (req, res) => {

    try {

        const message = await Message.findByIdAndDelete(req.params.id);

        if (!message) {

            return res.status(404).json({
                success: false,
                message: "Message not found."
            });

        }

        res.json({
            success: true,
            message: "Message deleted successfully!"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not delete message."
        });

    }

});


/*==========================================
PARTNERSHIP ROUTES (MongoDB)
==========================================*/

// Submit Partnership Request
app.post("/partnership", async (req, res) => {

    try {

        const partner = await Partnership.create(req.body);
        await Notification.create({
    message: `New partnership request from ${partner.businessName}`,
    link: "partnership.html",
    read: false
});

        res.json({
            success: true,
            message: "Application submitted successfully!",
            partner
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not submit application."
        });

    }

});

// Get All Partnership Requests
app.get("/partnership", async (req, res) => {

    try {

        const requests = await Partnership.find().sort({
            createdAt: -1
        });

        res.json(requests);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not load partnership requests."
        });

    }

});

// Approve Request
app.put("/partnership/:id/approve", async (req, res) => {

    try {

        const request = await Partnership.findByIdAndUpdate(

            req.params.id,

            { status: "Approved" },

            { new: true }

        );

        if (!request) {

            return res.status(404).json({
                success: false,
                message: "Request not found."
            });

        }

        res.json({
            success: true,
            message: "Partnership approved successfully!"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not approve partnership."
        });

    }

});

// Reject Request
app.put("/partnership/:id/reject", async (req, res) => {

    try {

        const request = await Partnership.findByIdAndUpdate(

            req.params.id,

            { status: "Rejected" },

            { new: true }

        );

        if (!request) {

            return res.status(404).json({
                success: false,
                message: "Request not found."
            });

        }

        res.json({
            success: true,
            message: "Partnership rejected successfully!"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not reject partnership."
        });

    }

});

// Delete Request
app.delete("/partnership/:id", async (req, res) => {

    try {

        const request = await Partnership.findByIdAndDelete(req.params.id);

        if (!request) {

            return res.status(404).json({
                success: false,
                message: "Request not found."
            });

        }

        res.json({
            success: true,
            message: "Partnership request deleted successfully!"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not delete partnership request."
        });

    }

});

/*==========================================
RESTAURANTS
==========================================*/

app.post("/restaurants", async (req, res) => {

    try {

        const restaurant = await Restaurant.create(req.body);

        res.json({
            success: true,
            message: "Restaurant saved successfully!",
            restaurant
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not save restaurant."
        });

    }

});

app.get("/restaurants", async (req, res) => {

    try {

        const restaurants = await Restaurant.find().sort({
            createdAt: -1
        });

        res.json(restaurants);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not load restaurants."
        });

    }

});

app.put("/restaurants/:id", async (req, res) => {

    try {

        const restaurant = await Restaurant.findByIdAndUpdate(

            req.params.id,

            req.body,

            {
                new: true,
                runValidators: true
            }

        );

        if (!restaurant) {

            return res.status(404).json({

                success: false,

                message: "Restaurant not found."

            });

        }

        res.json({

            success: true,

            message: "Restaurant updated successfully!",

            restaurant

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Could not update restaurant."

        });

    }

});

app.delete("/restaurants/:id", async (req, res) => {

    try {

        const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

        if (!restaurant) {

            return res.status(404).json({
                success: false,
                message: "Restaurant not found."
            });

        }

        res.json({
            success: true,
            message: "Restaurant deleted successfully!"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not delete restaurant."
        });

    }

});


/*==========================================
BLOG (MongoDB)
==========================================*/

// Create Blog
app.post("/blogs", async (req, res) => {

    try {

        console.log(req.body);

        const blog = await Blog.create(req.body);

        res.json({
            success: true,
            message: "Blog saved successfully!",
            blog
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});

// Get All Blogs
app.get("/blogs", async (req, res) => {

    try {

        const blogs = await Blog.find().sort({
            createdAt: -1
        });

        res.json(blogs);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false
        });

    }

});

// Get Single Blog
app.get("/blogs/:id", async (req, res) => {

    try {

        const blog = await Blog.findById(req.params.id);

        if (!blog) {

            return res.status(404).json({
                success: false,
                message: "Blog not found."
            });

        }

        res.json(blog);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false
        });

    }

});

// Update Blog
app.put("/blogs/:id", async (req, res) => {

    try {

        const blog = await Blog.findByIdAndUpdate(

            req.params.id,

            req.body,

            {
                new: true,
                runValidators: true
            }

        );

        if (!blog) {

            return res.status(404).json({
                success: false,
                message: "Blog not found."
            });

        }

        res.json({
            success: true,
            message: "Blog updated successfully!",
            blog
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false
        });

    }

});

// Delete Blog
app.delete("/blogs/:id", async (req, res) => {

    try {

        const blog = await Blog.findByIdAndDelete(req.params.id);

        if (!blog) {

            return res.status(404).json({
                success: false,
                message: "Blog not found."
            });

        }

        res.json({
            success: true,
            message: "Blog deleted successfully!"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false
        });

    }

});

// Feature Blog
app.put("/blogs/:id/feature", async (req, res) => {

    try {

        await Blog.updateMany({}, {
            featured: false
        });

        const blog = await Blog.findByIdAndUpdate(

            req.params.id,

            {
                featured: true
            },

            {
                new: true
            }

        );

        if (!blog) {

            return res.status(404).json({
                success: false,
                message: "Blog not found."
            });

        }

        res.json({
            success: true,
            message: "Blog featured successfully!"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false
        });

    }

});

// Remove Featured Blog
app.put("/blogs/:id/unfeature", async (req, res) => {

    try {

        const blog = await Blog.findByIdAndUpdate(

            req.params.id,

            {
                featured: false
            },

            {
                new: true
            }

        );

        if (!blog) {

            return res.status(404).json({
                success: false,
                message: "Blog not found."
            });

        }

        res.json({
            success: true,
            message: "Featured blog removed."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false
        });

    }

});

/*==========================================
NOTIFICATIONS (MongoDB)
==========================================*/

// Get notifications
app.get("/notifications", async (req, res) => {

    try {

        const notifications = await Notification.find().sort({
            createdAt: -1
        });

        res.json(notifications);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false
        });

    }

});

// Create notification
app.post("/notifications", async (req, res) => {

    try {

        const notification = await Notification.create(req.body);

        res.json({
            success: true,
            notification
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false
        });

    }

});

// Mark all notifications as read
app.put("/notifications/read-all", async (req, res) => {

    try {

        await Notification.updateMany(
            {},
            {
                read: true
            }
        );

        res.json({
            success: true
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false
        });

    }

});

// Delete notification
app.delete("/notifications/:id", async (req, res) => {

    try {

        await Notification.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Notification deleted."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false
        });

    }

});


/*==========================================
ADMIN AUTH & SETTINGS
==========================================*/

// Create default admin automatically
async function createDefaultAdmin() {

    try {

        const existingAdmin = await Admin.findOne();

        if (!existingAdmin) {

            await Admin.create({

                fullName: "",

                email: "",

                password: "",

                phone: "",

                profileImage: "",

                darkMode: false,

                emailNotifications: true

            });

            console.log("Default Admin Created ✅");

        }

    } catch (error) {

        console.error(error);

    }

}

createDefaultAdmin();

/*==========================================
ADMIN LOGIN
==========================================*/

app.post("/admin/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });

        if (!admin) {

            return res.status(401).json({

                success: false,

                message: "Invalid email or password."

            });

        }

        if (admin.password !== password) {

            return res.status(401).json({

                success: false,

                message: "Invalid email or password."

            });

        }

        res.json({

            success: true,

            message: "Login Successful!",

            admin

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Login failed."

        });

    }

});

/*==========================================
GET ADMIN PROFILE
==========================================*/

app.get("/admin/profile", async (req, res) => {

    try {

        const admin = await Admin.findOne();

        if (!admin) {

            return res.status(404).json({

                success: false,

                message: "Admin not found."

            });

        }

        res.json(admin);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false

        });

    }

});

/*==========================================
UPDATE ADMIN PROFILE
==========================================*/

app.put("/admin/profile", async (req, res) => {

    try {

        const admin = await Admin.findOne();

        if (!admin) {

            return res.status(404).json({

                success: false,

                message: "Admin not found."

            });

        }

        admin.fullName = req.body.fullName;

        admin.email = req.body.email;

        admin.phone = req.body.phone;

        admin.profileImage = req.body.profileImage;

        admin.darkMode = req.body.darkMode;

        admin.emailNotifications = req.body.emailNotifications;

        await admin.save();

        res.json({

            success: true,

            message: "Settings updated successfully.",

            admin

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Could not update settings."

        });

    }

});

/*==========================================
CHANGE PASSWORD
==========================================*/

app.put("/admin/password", async (req, res) => {

    try {

        const { currentPassword, newPassword } = req.body;

        const admin = await Admin.findOne();

        if (!admin) {

            return res.status(404).json({

                success: false,

                message: "Admin not found."

            });

        }

        if (admin.password !== currentPassword) {

            return res.status(400).json({

                success: false,

                message: "Current password is incorrect."

            });

        }

        admin.password = newPassword;

        await admin.save();

        res.json({

            success: true,

            message: "Password updated successfully."

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Could not update password."

        });

    }

});

/*==========================================
SERVER
==========================================*/

app.listen(3000,()=>{

    console.log("Server running on https://foodchain-api.onrender.com");

});