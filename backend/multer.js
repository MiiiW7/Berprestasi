import multer from "multer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if running on Vercel
const isVercel = process.env.VERCEL === '1';

// Konfigurasi storage berdasarkan environment
let postStorage, profileStorage;

if (isVercel) {
    // Use memory storage for Vercel (files won't be persisted)
    console.log('Running on Vercel, using memory storage');
    postStorage = multer.memoryStorage();
    profileStorage = multer.memoryStorage();
} else {
    // Use disk storage for local development
    console.log('Running locally, using disk storage');
    
    // Storage untuk foto lomba
    postStorage = multer.diskStorage({
        destination: function (req, file, cb) {
            const uploadDir = join(__dirname, "uploads", "posts");
            // Pastikan direktori ada
            fs.mkdirSync(uploadDir, { recursive: true });
            cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + "-" + file.originalname);
        },
    });

    // Storage untuk foto profil
    profileStorage = multer.diskStorage({
        destination: function (req, file, cb) {
            const uploadDir = join(__dirname, "uploads", "profiles");
            // Pastikan direktori ada
            try {
                fs.mkdirSync(uploadDir, { recursive: true });
                cb(null, uploadDir);
            } catch (err) {
                console.error("Error creating upload directory:", err);
                cb(new Error('Could not create upload directory'), null);
            }
        },
        filename: function (req, file, cb) {
            try {
                // For registration, req.user won't exist yet
                const userPrefix = req.user ? req.user.id : 'new';
                const timestamp = Date.now();
                const fileExt = path.extname(file.originalname);
                const fileName = `profile-${userPrefix}-${timestamp}${fileExt}`;
                cb(null, fileName);
            } catch (err) {
                console.error("Error generating filename:", err);
                cb(new Error('Could not generate filename'), null);
            }
        },
    });
}

// Konfigurasi filter file (opsional tapi disarankan)
const imageFilter = (req, file, cb) => {
    try {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    } catch (err) {
        console.error("Error in file filter:", err);
        cb(new Error('Error processing file'), false);
    }
};

// Upload untuk post
const uploadPost = multer({ 
    storage: postStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Upload untuk profile
const uploadProfile = multer({ 
    storage: profileStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB untuk profil
});

export { uploadPost, uploadProfile };