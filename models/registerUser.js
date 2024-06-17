import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    unique: true
  },
  phone: {
    type: String,
    required: false,
    trim: true,
    unique: true // Added unique constraint
  },
  password: {
    type: String,
    required: true
  },
  wishList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  address: {
    city:
    {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    }
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }
  ]
}, { timestamps: true });

const userModel = mongoose.model("User", userSchema);

export default userModel;
