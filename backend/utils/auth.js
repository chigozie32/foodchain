const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "foodchain_dev_secret_change_me";

function signAdminToken(admin) {

    return jwt.sign(
        { id: admin._id, email: admin.email },
        JWT_SECRET,
        { expiresIn: "7d" }
    );

}

// Protects admin-only routes.
// Expects header: Authorization: Bearer <token>
function verifyAdminToken(req, res, next) {

    const header = req.headers.authorization || "";

    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {

        return res.status(401).json({
            success: false,
            message: "Not authenticated. Please log in again."
        });

    }

    try {

        const decoded = jwt.verify(token, JWT_SECRET);

        req.admin = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Session expired. Please log in again."
        });

    }

}

module.exports = { signAdminToken, verifyAdminToken, JWT_SECRET };
