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

const { sendMail, templates, notifyAdmin } = require("./utils/mailer");
const { signAdminToken, verifyAdminToken } = require("./utils/auth");

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

        const welcome = templates.newsletterWelcome(email);
        sendMail({ to: email, ...welcome });

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
app.get("/newsletter", verifyAdminToken, async (req, res) => {

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
app.delete("/newsletter/:id", verifyAdminToken, async (req, res) => {

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
NEWSLETTER - BULK ACTIONS & BROADCAST
==========================================*/

// Bulk delete subscribers
app.delete("/newsletter/bulk", verifyAdminToken, async (req, res) => {

    try {

        const { ids } = req.body;

        if (!Array.isArray(ids) || !ids.length) {
            return res.status(400).json({ success: false, message: "No subscribers selected." });
        }

        await Newsletter.deleteMany({ _id: { $in: ids } });

        res.json({ success: true, message: `${ids.length} subscriber(s) deleted.` });

    } catch (error) {

        console.error(error);
        res.status(500).json({ success: false, message: "Could not delete subscribers." });

    }

});

// Broadcast an email to selected (or all) subscribers
app.post("/newsletter/broadcast", verifyAdminToken, async (req, res) => {

    try {

        const { ids, subject, message } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ success: false, message: "Subject and message are required." });
        }

        const query = Array.isArray(ids) && ids.length ? { _id: { $in: ids } } : {};
        const subscribers = await Newsletter.find(query);

        let sent = 0;

        for (const sub of subscribers) {

            const result = await sendMail({
                to: sub.email,
                subject,
                title: subject,
                bodyHtml: `<p style="white-space:pre-line;">${message}</p>`
            });

            if (result.sent) sent++;

        }

        res.json({ success: true, message: `Email sent to ${sent} of ${subscribers.length} subscriber(s).` });

    } catch (error) {

        console.error(error);
        res.status(500).json({ success: false, message: "Could not send broadcast." });

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

        const ack = templates.contactAck(message.name);
        sendMail({ to: message.email, ...ack });

        notifyAdmin(
            "New contact message received",
            `<p><strong>${message.name}</strong> (${message.email}) sent a message:</p><p>"${message.message}"</p>`
        );

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
app.get("/contact", verifyAdminToken, async (req, res) => {

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
app.put("/contact/:id", verifyAdminToken, async (req, res) => {

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
app.delete("/contact/:id", verifyAdminToken, async (req, res) => {

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
CONTACT - REPLY & BULK ACTIONS
==========================================*/

// Reply to a single message (sends a real email to the sender)
app.post("/contact/:id/reply", verifyAdminToken, async (req, res) => {

    try {

        const { replyMessage } = req.body;

        if (!replyMessage || !replyMessage.trim()) {
            return res.status(400).json({ success: false, message: "Reply message is required." });
        }

        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found." });
        }

        const email = templates.contactReply(replyMessage);
        const result = await sendMail({ to: message.email, ...email, replyTo: process.env.SMTP_FROM_EMAIL });

        message.status = "Responded";
        message.replyMessage = replyMessage;
        message.repliedAt = new Date();
        await message.save();

        res.json({
            success: true,
            message: result.sent ? "Reply sent successfully!" : "Saved, but the email could not be sent (check SMTP settings).",
            data: message
        });

    } catch (error) {

        console.error(error);
        res.status(500).json({ success: false, message: "Could not send reply." });

    }

});

// Reply to many messages at once with the same text
app.post("/contact/bulk-reply", verifyAdminToken, async (req, res) => {

    try {

        const { ids, replyMessage } = req.body;

        if (!Array.isArray(ids) || !ids.length) {
            return res.status(400).json({ success: false, message: "No messages selected." });
        }

        if (!replyMessage || !replyMessage.trim()) {
            return res.status(400).json({ success: false, message: "Reply message is required." });
        }

        const messages = await Message.find({ _id: { $in: ids } });

        let sent = 0;

        for (const message of messages) {

            const email = templates.contactReply(replyMessage);
            const result = await sendMail({ to: message.email, ...email, replyTo: process.env.SMTP_FROM_EMAIL });

            if (result.sent) sent++;

            message.status = "Responded";
            message.replyMessage = replyMessage;
            message.repliedAt = new Date();
            await message.save();

        }

        res.json({ success: true, message: `Replied to ${sent} of ${messages.length} message(s).` });

    } catch (error) {

        console.error(error);
        res.status(500).json({ success: false, message: "Could not send bulk reply." });

    }

});

// Bulk update status (e.g. mark many as Read)
app.put("/contact/bulk-status", verifyAdminToken, async (req, res) => {

    try {

        const { ids, status } = req.body;

        if (!Array.isArray(ids) || !ids.length || !status) {
            return res.status(400).json({ success: false, message: "Selection and status are required." });
        }

        await Message.updateMany({ _id: { $in: ids } }, { status });

        res.json({ success: true, message: `${ids.length} message(s) updated.` });

    } catch (error) {

        console.error(error);
        res.status(500).json({ success: false, message: "Could not update messages." });

    }

});

// Bulk delete messages
app.delete("/contact/bulk", verifyAdminToken, async (req, res) => {

    try {

        const { ids } = req.body;

        if (!Array.isArray(ids) || !ids.length) {
            return res.status(400).json({ success: false, message: "No messages selected." });
        }

        await Message.deleteMany({ _id: { $in: ids } });

        res.json({ success: true, message: `${ids.length} message(s) deleted.` });

    } catch (error) {

        console.error(error);
        res.status(500).json({ success: false, message: "Could not delete messages." });

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
    message: `New partnership request from ${partner.restaurant}`,
    link: "partnerships.html",
    read: false
});

        const ack = templates.partnershipAck(partner.owner, partner.restaurant);
        sendMail({ to: partner.email, ...ack });

        notifyAdmin(
            "New partnership request received",
            `<p><strong>${partner.restaurant}</strong> (owner: ${partner.owner}, ${partner.email}) requested to partner with FoodChain.</p>`
        );

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
app.get("/partnership", verifyAdminToken, async (req, res) => {

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
app.put("/partnership/:id/approve", verifyAdminToken, async (req, res) => {

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
app.put("/partnership/:id/reject", verifyAdminToken, async (req, res) => {

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
app.delete("/partnership/:id", verifyAdminToken, async (req, res) => {

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
PARTNERSHIP - REPLY & BULK ACTIONS
==========================================*/

// Reply to a single partnership request (sends a real email to the applicant)
app.post("/partnership/:id/reply", verifyAdminToken, async (req, res) => {

    try {

        const { replyMessage } = req.body;

        if (!replyMessage || !replyMessage.trim()) {
            return res.status(400).json({ success: false, message: "Reply message is required." });
        }

        const partner = await Partnership.findById(req.params.id);

        if (!partner) {
            return res.status(404).json({ success: false, message: "Request not found." });
        }

        const email = templates.partnershipReply(replyMessage);
        const result = await sendMail({ to: partner.email, ...email, replyTo: process.env.SMTP_FROM_EMAIL });

        partner.replyMessage = replyMessage;
        partner.repliedAt = new Date();
        if (partner.status === "Pending") partner.status = "Responded";
        await partner.save();

        res.json({
            success: true,
            message: result.sent ? "Reply sent successfully!" : "Saved, but the email could not be sent (check SMTP settings).",
            data: partner
        });

    } catch (error) {

        console.error(error);
        res.status(500).json({ success: false, message: "Could not send reply." });

    }

});

// Reply to many partnership requests at once with the same text
app.post("/partnership/bulk-reply", verifyAdminToken, async (req, res) => {

    try {

        const { ids, replyMessage } = req.body;

        if (!Array.isArray(ids) || !ids.length) {
            return res.status(400).json({ success: false, message: "No requests selected." });
        }

        if (!replyMessage || !replyMessage.trim()) {
            return res.status(400).json({ success: false, message: "Reply message is required." });
        }

        const partners = await Partnership.find({ _id: { $in: ids } });

        let sent = 0;

        for (const partner of partners) {

            const email = templates.partnershipReply(replyMessage);
            const result = await sendMail({ to: partner.email, ...email, replyTo: process.env.SMTP_FROM_EMAIL });

            if (result.sent) sent++;

            partner.replyMessage = replyMessage;
            partner.repliedAt = new Date();
            if (partner.status === "Pending") partner.status = "Responded";
            await partner.save();

        }

        res.json({ success: true, message: `Replied to ${sent} of ${partners.length} request(s).` });

    } catch (error) {

        console.error(error);
        res.status(500).json({ success: false, message: "Could not send bulk reply." });

    }

});

// Bulk update status (e.g. Approve/Reject many at once)
app.put("/partnership/bulk-status", verifyAdminToken, async (req, res) => {

    try {

        const { ids, status } = req.body;

        if (!Array.isArray(ids) || !ids.length || !status) {
            return res.status(400).json({ success: false, message: "Selection and status are required." });
        }

        await Partnership.updateMany({ _id: { $in: ids } }, { status });

        res.json({ success: true, message: `${ids.length} request(s) updated.` });

    } catch (error) {

        console.error(error);
        res.status(500).json({ success: false, message: "Could not update requests." });

    }

});

// Bulk delete partnership requests
app.delete("/partnership/bulk", verifyAdminToken, async (req, res) => {

    try {

        const { ids } = req.body;

        if (!Array.isArray(ids) || !ids.length) {
            return res.status(400).json({ success: false, message: "No requests selected." });
        }

        await Partnership.deleteMany({ _id: { $in: ids } });

        res.json({ success: true, message: `${ids.length} request(s) deleted.` });

    } catch (error) {

        console.error(error);
        res.status(500).json({ success: false, message: "Could not delete requests." });

    }

});

/*==========================================
RESTAURANTS
==========================================*/

app.post("/restaurants", verifyAdminToken, async (req, res) => {

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

app.put("/restaurants/:id", verifyAdminToken, async (req, res) => {

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

app.delete("/restaurants/:id", verifyAdminToken, async (req, res) => {

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
app.post("/blogs", verifyAdminToken, async (req, res) => {

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
app.put("/blogs/:id", verifyAdminToken, async (req, res) => {

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
app.delete("/blogs/:id", verifyAdminToken, async (req, res) => {

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
app.put("/blogs/:id/feature", verifyAdminToken, async (req, res) => {

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
app.put("/blogs/:id/unfeature", verifyAdminToken, async (req, res) => {

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
app.get("/notifications", verifyAdminToken, async (req, res) => {

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
app.post("/notifications", verifyAdminToken, async (req, res) => {

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
app.put("/notifications/read-all", verifyAdminToken, async (req, res) => {

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
app.delete("/notifications/:id", verifyAdminToken, async (req, res) => {

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

// Mark one notification as read
app.put("/notifications/:id/read", verifyAdminToken, async (req, res) => {

    try {

        await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true }
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

/*==========================================
ADMIN AUTH & SETTINGS
==========================================*/

// Create default admin automatically — and self-heal a broken
// (blank/plaintext password) admin record left over from before
// this app had real password hashing, with no manual database
// editing required.
async function createDefaultAdmin() {

    try {

        const existingAdmin = await Admin.findOne();

        const email = process.env.DEFAULT_ADMIN_EMAIL || "admin@foodchain.com";

        let password = process.env.DEFAULT_ADMIN_PASSWORD;

        let generated = false;

        if (!password) {
            const crypto = require("crypto");
            password = crypto.randomBytes(6).toString("hex"); // e.g. 12-char temp password
            generated = true;
        }

        // A properly hashed bcrypt password always starts with "$2" and is 60 characters.
        // Anything else (blank, plaintext, missing) means this record is broken/unusable.
        const isBroken =
            existingAdmin &&
            (!existingAdmin.password ||
                !(existingAdmin.password.startsWith("$2") && existingAdmin.password.length === 60));

        if (!existingAdmin) {

            await Admin.create({
                fullName: "FoodChain Administrator",
                email,
                password, // hashed automatically by the pre-save hook
                phone: "",
                profileImage: "",
                darkMode: false,
                emailNotifications: true
            });

            console.log("Default Admin Created ✅");
            console.log(`   Login email: ${email}`);

            if (generated) {
                console.log(`   Temporary password: ${password}`);
                console.log("   ⚠️  Log in and change this password right away (Settings → Change Password).");
            }

        } else if (isBroken) {

            existingAdmin.email = email;
            existingAdmin.password = password; // hashed automatically by the pre-save hook
            existingAdmin.fullName = existingAdmin.fullName || "FoodChain Administrator";
            await existingAdmin.save();

            console.log("Existing admin record had no usable password — repaired it automatically ✅");
            console.log(`   Login email: ${email}`);

            if (generated) {
                console.log(`   Temporary password: ${password}`);
                console.log("   ⚠️  Log in and change this password right away (Settings → Change Password).");
            }

        }
        // else: a valid admin already exists — leave it completely alone.

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

        const match = await admin.comparePassword(password);

        if (!match) {

            return res.status(401).json({

                success: false,

                message: "Invalid email or password."

            });

        }

        const token = signAdminToken(admin);

        res.json({

            success: true,

            message: "Login Successful!",

            token,

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
FORGOT PASSWORD
==========================================*/

app.post("/admin/forgot-password", async (req, res) => {

    try {

        const { email } = req.body;

        const admin = await Admin.findOne({ email });

        // Always respond the same way, whether or not the email matched,
        // so outsiders can't use this to guess valid admin emails.
        const genericResponse = {
            success: true,
            message: "If that email exists, a reset link has been sent."
        };

        if (!admin) return res.json(genericResponse);

        const crypto = require("crypto");
        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

        admin.resetPasswordToken = hashedToken;
        admin.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        await admin.save();

        const panelUrl = process.env.ADMIN_PANEL_URL || "";
        const resetUrl = `${panelUrl}/reset-password.html?token=${rawToken}&email=${encodeURIComponent(email)}`;

        const emailContent = templates.passwordReset(resetUrl);
        await sendMail({ to: admin.email, ...emailContent });

        res.json(genericResponse);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not process password reset request."
        });

    }

});

/*==========================================
RESET PASSWORD
==========================================*/

app.post("/admin/reset-password", async (req, res) => {

    try {

        const { email, token, newPassword } = req.body;

        if (!email || !token || !newPassword) {

            return res.status(400).json({
                success: false,
                message: "Email, token and new password are required."
            });

        }

        const crypto = require("crypto");
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const admin = await Admin.findOne({
            email,
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!admin) {

            return res.status(400).json({
                success: false,
                message: "This reset link is invalid or has expired."
            });

        }

        admin.password = newPassword; // hashed automatically by the pre-save hook
        admin.resetPasswordToken = null;
        admin.resetPasswordExpires = null;
        await admin.save();

        const emailContent = templates.passwordChanged();
        sendMail({ to: admin.email, ...emailContent });

        res.json({
            success: true,
            message: "Password reset successfully! You can now log in."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not reset password."
        });

    }

});

/*==========================================
GET ADMIN PROFILE
==========================================*/

app.get("/admin/profile", verifyAdminToken, async (req, res) => {

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

app.put("/admin/profile", verifyAdminToken, async (req, res) => {

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

app.put("/admin/password", verifyAdminToken, async (req, res) => {

    try {

        const { currentPassword, newPassword } = req.body;

        const admin = await Admin.findOne();

        if (!admin) {

            return res.status(404).json({

                success: false,

                message: "Admin not found."

            });

        }

        const match = await admin.comparePassword(currentPassword);

        if (!match) {

            return res.status(400).json({

                success: false,

                message: "Current password is incorrect."

            });

        }

        admin.password = newPassword; // re-hashed automatically by the pre-save hook

        await admin.save();

        const emailContent = templates.passwordChanged();
        sendMail({ to: admin.email, ...emailContent });

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
DYNAMIC SITEMAP
Lists every individual restaurant and blog post
page so Google can discover and index them —
the static sitemap.xml only covers the fixed
marketing pages (home, about, etc.).
==========================================*/

app.get("/sitemap-dynamic.xml", async (req, res) => {

    try {

        const SITE_URL = process.env.SITE_URL || "https://foodchain.com.ng";

        const [restaurants, blogs] = await Promise.all([
            Restaurant.find({}, "_id updatedAt"),
            Blog.find({}, "_id updatedAt")
        ]);

        const urls = [];

        restaurants.forEach((r) => {
            urls.push(`
  <url>
    <loc>${SITE_URL}/single-restaurant.html?id=${r._id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
        });

        blogs.forEach((b) => {
            urls.push(`
  <url>
    <loc>${SITE_URL}/single-blog.html?id=${b._id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
        });

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}
</urlset>`;

        res.header("Content-Type", "application/xml");
        res.send(xml);

    } catch (error) {

        console.error(error);
        res.status(500).send("Could not generate sitemap.");

    }

});



/*==========================================
SERVER
==========================================*/

app.listen(3000,()=>{

    console.log("Server running on https://foodchain-api.onrender.com");

});