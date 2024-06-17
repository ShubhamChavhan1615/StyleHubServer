import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET;

const jwtAuthMiddleware = (req, res, next) => {
  // Get the token from the authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Authorization header is missing or malformed" });
  }
  
  // Extract the token from the Authorization header
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Token not found" });
  }

  try {
    // Verify the token using the secret
    const decoded = jwt.verify(token, jwtSecret);

    // Attach the decoded user information to the request object
    req.user = decoded;

    // Call the next middleware
    next();
  } catch (error) {
    // Handle JWT verification errors
    console.error("JWT Verification Error:", error);
    res.status(401).json({ msg: "Invalid token" });
  }
};

export default jwtAuthMiddleware;
