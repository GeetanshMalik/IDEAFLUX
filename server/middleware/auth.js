import jwt from "jsonwebtoken";
import User from "../model/user.js";

const auth = async (req, res, next) => {
  try {
    // Check if the Authorization header exists
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Access token required. Please log in." });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Invalid token format. Use 'Bearer <token>'" });
    }

    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "No token provided." });
    }
    
    // Google tokens are usually longer than 500 chars, Custom tokens are shorter
    const isCustomAuth = token.length < 500;

    let decodedData;
    let userId;

    if (isCustomAuth) {
      // Logic for Custom Login
      try {
        decodedData = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key");
        userId = decodedData?.id;
      } catch (jwtError) {
        if (jwtError.name === 'TokenExpiredError') {
          return res.status(401).json({ message: "Token expired. Please log in again." });
        }
        if (jwtError.name === 'JsonWebTokenError') {
          return res.status(401).json({ message: "Invalid token. Please log in again." });
        }
        throw jwtError;
      }
    } else {
      // Logic for Google Login
      decodedData = jwt.decode(token);
      userId = decodedData?.sub; // 'sub' is Google's specific ID for a user
      
      // For Google tokens, we should verify with Google (optional enhancement)
      if (!userId) {
        return res.status(401).json({ message: "Invalid Google token." });
      }
    }

    // Verify user still exists in database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists. Please log in again." });
    }

    req.userId = userId;
    req.user = user; // Attach user object for convenience
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(401).json({ message: "Authentication failed. Please log in again." });
  }
};

// Optional middleware for routes that don't require auth but can use it
export const optionalAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      await auth(req, res, next);
    } else {
      req.userId = null;
      req.user = null;
      next();
    }
  } catch (error) {
    // If auth fails, continue without user
    req.userId = null;
    req.user = null;
    next();
  }
};

export default auth;