import mongoose from "mongoose";

// Define the schema for the product collection
const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true // Ensure title is mandatory
    },
    description: {
        type: String,
        required: true // Ensure description is mandatory
    },
    price: {
        type: Number,
        required: true, // Ensure price is mandatory
        min: 0 // Ensure price is non-negative
    },
    discountPercentage: {
        type: Number,
        min: 0, // Ensure discountPercentage is non-negative
        max: 100 // Ensure discountPercentage doesn't exceed 100%
    },
    rating: {
        type: Number,
        min: 0, // Ensure rating is non-negative
        max: 5 // Ensure rating doesn't exceed 5
    },
    brand: {
        type: String,
        required: true // Ensure brand is mandatory
    },
    category: {
        type: String,
        required: true // Ensure category is mandatory
    },
    thumbnail: {
        type: String,
        required: true // Ensure thumbnail is mandatory
    },
    images: {
        type: [String], // Define images as an array of strings (URLs)
        validate: {
            validator: function(v) {
                return Array.isArray(v) && v.every(url => typeof url === 'string');
            },
            message: props => `${props.value} is not a valid array of URLs!`
        }
    },
    discountedPrice: {
        type: Number,
        min: 0 // Ensure discountedPrice is non-negative
    }
});

// Calculate discounted price before saving the document
productSchema.pre('save', function(next) {
    if (this.price && this.discountPercentage) {
        this.discountedPrice = this.price - (this.price * (this.discountPercentage / 100));
    } else {
        this.discountedPrice = this.price; // If no discount, discounted price is the same as original price
    }
    next();
});

// Create the model from the schema
const productModel = mongoose.model("Product", productSchema);

// Export the model
export default productModel;
