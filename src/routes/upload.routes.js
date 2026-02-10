const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const { protectAdmin } = require('../middlewares/auth.middleware');

router.post('/', protectAdmin, upload.single('image'), async (req, res) => {
    console.log('Upload Request Headers:', req.headers['content-type']);
    console.log('Received File:', req.file);

    if (!req.file) {
        return res.status(400).json({ message: 'No image file provided or invalid file type' });
    }


    try {
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'aviravastra/products',
        });

        // Remove file from local storage after upload to Cloudinary
        fs.unlinkSync(req.file.path);

        res.json({
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        // Ensure local file is removed even if Cloudinary fails
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: error.message || 'Upload failed' });
    }
});


module.exports = router;
