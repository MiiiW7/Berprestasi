import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      require: false,
      default: '' // Default bisa berupa path ke gambar default
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    nomor: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["pendaftar", "penyelenggara", "admin"],
      default: "pendaftar",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save middleware untuk generate ID
function generateCustomId() {
  const timestamp = new Date().getTime();
  // Ambil 4 digit terakhir dari timestamp
  const lastFourDigits = timestamp.toString().slice(-4);
  // Generate 2 karakter random
  const randomChars = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `U${lastFourDigits}${randomChars}`;
}

// Pre-save middleware untuk generate ID
userSchema.pre("save", function (next) {
  if (this.isNew && !this.id) {
    this.id = generateCustomId();
  }
  next();
});

const User = mongoose.model("User", userSchema);

export { User };