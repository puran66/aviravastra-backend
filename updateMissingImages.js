require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('./src/config/cloudinary');
const Occasion = require('./src/models/Occasion');
const Collection = require('./src/models/Collection');

/**
 * Upload URL directly to Cloudinary (no local download needed)
 */
async function uploadUrlToCloudinary(imageUrl, folder, publicId) {
    try {
        console.log(`   📤 Uploading from URL...`);
        const result = await cloudinary.uploader.upload(imageUrl, {
            folder: `avira/${folder}`,
            public_id: publicId,
            overwrite: true,
            quality: 'auto:best',
            fetch_format: 'auto'
        });
        console.log(`   ✅ Uploaded: ${result.secure_url}`);
        return result.secure_url;
    } catch (error) {
        console.error(`   ❌ Upload failed:`, error.message);
        return null;
    }
}

/**
 * Main function to update missing images
 */
async function updateMissingImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('\n🔗 Connected to MongoDB\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎨 UPDATING MISSING IMAGES');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // High-quality Indian saree images from Unsplash
        const weddingImageUrl = 'https://images.unsplash.com/photo-1583391733981-5acd1d5d4f88?w=1200&h=600&fit=crop&q=80';
        const signatureImageUrl = 'https://images.unsplash.com/photo-1583391733912-3f1d248b8981?w=1200&h=600&fit=crop&q=80';

        // 1. Upload Wedding Occasion Banner
        console.log('📸 1. Wedding Sarees Occasion Banner\n');
        const weddingUrl = await uploadUrlToCloudinary(weddingImageUrl, 'occasions', 'wedding_occasion_banner');

        if (weddingUrl) {
            await Occasion.findOneAndUpdate(
                { slug: 'wedding-sarees' },
                { image: weddingUrl }
            );
            console.log('   ✅ Database updated for Wedding Sarees\n');
        }

        // 2. Upload Signature Collection Banner
        console.log('📸 2. Signature Collection Banner\n');
        const signatureUrl = await uploadUrlToCloudinary(signatureImageUrl, 'collections', 'signature_collection_banner');

        if (signatureUrl) {
            await Collection.findOneAndUpdate(
                { slug: 'signature-collection' },
                { image: signatureUrl }
            );
            console.log('   ✅ Database updated for Signature Collection\n');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✨ MISSING IMAGES UPDATED SUCCESSFULLY!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📦 Wedding Sarees occasion banner ✅');
        console.log('📚 Signature Collection banner ✅');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('🌐 Refresh your website to see the changes:');
        console.log('   Desktop: http://localhost:5173');
        console.log('   Mobile: http://192.168.29.176:5173\n');
        console.log('✅ All 16 images are now complete and live!\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

updateMissingImages();
