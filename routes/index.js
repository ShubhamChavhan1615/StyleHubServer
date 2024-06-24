import express from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

import registerModel from "../models/registerUser.js";
import productModel from "../models/products.js";
import contactUsModel from "../models/contactUs.js";
import generateToken from "../middlewares/jwtToken.js";
import jwtAuthMiddleware from "../middlewares/jwtAuthMiddleware.js";

const router = express.Router();

router.use(cors());
router.use(cookieParser());

router.get("/", (req, res) => {
    res.send("hello");
});

// Registration route
router.post("/register/home", async (req, res) => {
    try {
        const { name, phone, password } = req.body;

        if (!name || !phone || !password) {
            return res.status(400).json({ msg: "Please fill all fields" });
        }

        const existingUser = await registerModel.findOne({ phone });
        if (existingUser) {
            return res.status(409).json({ msg: "User with this phone number already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new registerModel({
            name,
            phone,
            password: hashedPassword,
        });

        await newUser.save();
        const token = generateToken(newUser.id);
        res.cookie("token", token, { httpOnly: true });

        res.status(201).json({ user: newUser, token });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// Login route
router.post("/login/home", async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ msg: "Please fill all fields" });
        }

        const user = await registerModel.findOne({ phone });
        if (!user) {
            return res.status(401).json({ msg: "Unauthorized user" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ msg: "Password or phone number incorrect" });
        }

        const token = generateToken(user.id);
        res.cookie("token", token, { httpOnly: true });

        res.status(200).json({ user, token });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// Route to show user profile
router.get("/user/profile", jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await registerModel.findById(userId);

        if (!user) {
            return res.status(401).json({ msg: "Unauthorized user" });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// Route to edit user profile
router.put("/edit/user/profile/:id", jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await registerModel.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        const dataToUpdate = { ...req.body };

        if (dataToUpdate.password) {
            const salt = await bcrypt.genSalt(10);
            dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, salt);
        }

        const updatedUser = await registerModel.findByIdAndUpdate(userId, dataToUpdate, { new: true });
        res.status(200).json({ updatedUser });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// Update user location
router.put("/user/updateLocation", jwtAuthMiddleware, async (req, res) => {
    try {
        const { city, state, postalCode } = req.body;
        const userId = req.user.id;

        if (!city || !state || !postalCode) {
            return res.status(400).json({ error: "All address fields are required" });
        }

        const dataToUpdate = {
            address: { city, state, postalCode }
        };

        const updatedUser = await registerModel.findByIdAndUpdate(userId, dataToUpdate, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ updatedUser });
    } catch (error) {
        console.error("Failed to update location:", error);
        res.status(500).json({ error: "Failed to update location" });
    }
});

// Update user password
router.post("/resetPassword", jwtAuthMiddleware, async (req, res) => {
    try {
        const { phone, newPassword } = req.body;
        const user = await registerModel.findOne({ phone });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Route to store products
router.post("/save-products", async (req, res) => {
    try {
        const products = req.body.map(product => product);

        const savedProducts = await productModel.insertMany(products);
        res.status(201).json(savedProducts);
    } catch (error) {
        console.error("Failed to save products:", error);
        res.status(500).json({ message: "Failed to save products", error });
    }
});

// Route to get all products
router.get("/products", async (req, res) => {
    try {
        const allProducts = await productModel.find();

        if (!allProducts || allProducts.length === 0) {
            return res.status(404).json({ msg: "No products found" });
        }

        res.status(200).json(allProducts);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// Route to save contactUs data
router.post("/contactUs", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ msg: "Please fill all fields" });
        }

        const newContactUs = new contactUsModel({ name, email, message });
        await newContactUs.save();

        res.status(201).json({ msg: "Data saved" });
    } catch (error) {
        console.error("Error saving contact us data:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// Route to get a product for user
router.get("/products/:id", jwtAuthMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ msg: "No product found" });
        }

        const user = await registerModel.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        user.products.push(id);
        await user.save();

        res.status(200).json({ msg: "Product added to user's list", user });
    } catch (error) {
        console.error("Error adding product to user's list:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// Route to show user added products
router.get("/user/products", jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await registerModel.findById(userId);

        if (!user) {
            return res.status(401).json({ msg: "Unauthorized user" });
        }

        const userProductIds = user.products;
        if (!userProductIds || userProductIds.length === 0) {
            return res.status(404).json({ msg: "Products not found" });
        }

        const productCountMap = userProductIds.reduce((acc, productId) => {
            acc[productId] = (acc[productId] || 0) + 1;
            return acc;
        }, {});

        const uniqueProductIds = Object.keys(productCountMap);
        const products = await productModel.find({ _id: { $in: uniqueProductIds } });

        const userProducts = products.map(product => ({
            ...product.toObject(),
            quantity: productCountMap[product._id.toString()]
        }));

        res.status(200).json({ msg: "User products", products: userProducts, productsLength: user.products.length });
    } catch (error) {
        console.error("Error fetching user products:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// Route to show more info about product
router.get("/product/desc/:pid", jwtAuthMiddleware, async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productModel.findById(pid);

        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }

        const category = product.category;
        const relatedProducts = await productModel.find({ category, _id: { $ne: pid } });

        res.status(200).json({ product, relatedProducts });
    } catch (error) {
        console.error("Error fetching product details:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// Route to remove cart product
router.delete("/product/cart/remove/:id", jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.id;
        const user = await registerModel.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        user.products = user.products.filter(product => product._id.toString() !== productId);
        await user.save();

        res.status(200).json({ user });
    } catch (error) {
        console.error("Error removing product from cart:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// Route to decrease product cart
router.delete("/products/:id", jwtAuthMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ msg: "No product found" });
        }

        const user = await registerModel.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        const index = user.products.indexOf(id);
        if (index > -1) {
            user.products.splice(index, 1);
        } else {
            return res.status(404).json({ msg: "Product not found in user's list" });
        }

        await user.save();
        res.status(200).json({ msg: "Product removed from user's list", user });
    } catch (error) {
        console.error("Error decreasing product cart:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

export default router;
