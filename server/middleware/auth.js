import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  try {
    // Check if the Authorization header exists
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    const token = req.headers.authorization.split(" ")[1];
    
    // Google tokens are usually longer than 500 chars, Custom tokens are shorter
    const isCustomAuth = token.length < 500;

    let decodedData;

    if (token && isCustomAuth) {
      // Logic for Custom Login (using the secret "test" from your controller)
      decodedData = jwt.verify(token, "test");
      req.userId = decodedData?.id;
    } else {
      // Logic for Google Login
      decodedData = jwt.decode(token);
      req.userId = decodedData?.sub; // 'sub' is Google's specific ID for a user
    }

    next();
  } catch (error) {
    console.log("Auth Middleware Error:", error);
    res.status(401).json({ message: "Unauthenticated" });
  }
};

export default auth;