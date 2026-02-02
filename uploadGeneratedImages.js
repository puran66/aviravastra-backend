require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('./src/config/cloudinary');
const Product = require('./src/models/Product');
const Occasion = require('./src/models/Occasion');
const Collection = require('./src/models/Collection');

// Path to generated images
const ARTIFACTS_DIR = 'C:/Users/vishw/.gemini/antigravity/brain/d2bf4752-e261-4aa2-8e19-75ed40a71ba0';

// Image mapping
const imageFiles = {
    products: {
        kanjeevaram_maroon: {
            primary: 'kanjeevaram_maroon_primary_1769877874262.png',
            detail: 'kanjeevaram_maroon_detail_1769877891802.png'
        },
        paithani_purple: {
            primary: 'paithani_purple_primary_1769877908104.png',
            detail: 'paithani_purple_detail_1769877925408.png'
        },
        gadwal_red: {
            primary: 'gadwal_red_primary_1769877943272.png',
            detail: 'gadwal_red_detail_1769877965260.png'
        },
        banarasi_green: {
            primary: 'banarasi_green_primary_1769877982177.png',
            detail: 'banarasi_green_detail_1769878000585.png'
        },
        pochampally_ikat: {
            primary: 'pochampally_ikat_primary_1769878029873.png',
            detail: 'pochampally_ikat_detail_1769878046079.png'
        }
    },
    collections: {
        heritage_weaves: 'heritage_weaves_banner_1769878156455.png',
        new_arrivals: 'new_arrivals_banner_1769878062839.png',
        signature_collection: 'signature_collection_banner_1769878078887.png'
    },
    occasions: {
        wedding: 'wedding_occasion_banner_1769878094588.png',
        puja: 'puja_occasion_banner_1769878110130.png',
        festive: 'festive_occasion_banner_1769878127667.png'
    }
};

// Upload image to Cloudinary
async function uploadToCloudinary(localPath, folder) {
    try {
        console.log(`   📤 Uploading: ${path.basename(localPath)}`);
        const result = await cloudinary.uploader.upload(localPath, {
            folder: `avira/${folder}`,
            use_filename: true,
            unique_filename: false,
            overwrite: true
        });
        console.log(`   ✅ Uploaded: ${result.secure_url}`);
        return result.secure_url;
    } catch (error) {
        console.error(`   ❌ Upload failed for ${localPath}:`, error.message);
        return null;
    }
}

async function uploadAndUpdate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📸 UPLOADING AI-GENERATED IMAGES');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Upload product images
        console.log('📦 STEP 1: Uploading Product Images\n');
        const productImageUrls = {};

        for (const [productKey, images] of Object.entries(imageFiles.products)) {
            console.log(`🔵 Processing: ${productKey}`);
            productImageUrls[productKey] = [];

            for (const [type, filename] of Object.entries(images)) {
                const localPath = path.join(ARTIFACTS_DIR, filename);

                if (fs.existsSync(localPath)) {
                    const url = await uploadToCloudinary(localPath, 'products');
                    if (url) productImageUrls[productKey].push(url);
                } else {
                    console.log(`   ⚠️  File not found: ${filename}`);
                }
            }
            console.log('');
        }

        // Upload collection banners
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📚 STEP 2: Uploading Collection Banners\n');
        const collectionImageUrls = {};

        for (const [collectionKey, filename] of Object.entries(imageFiles.collections)) {
            console.log(`🔵 Processing: ${collectionKey}`);
            const localPath = path.join(ARTIFACTS_DIR, filename);

            if (fs.existsSync(localPath)) {
                collectionImageUrls[collectionKey] = await uploadToCloudinary(localPath, 'collections');
            } else {
                console.log(`   ⚠️  File not found: ${filename}`);
            }
            console.log('');
        }

        // Upload occasion banners
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎯 STEP 3: Uploading Occasion Banners\n');
        const occasionImageUrls = {};

        for (const [occasionKey, filename] of Object.entries(imageFiles.occasions)) {
            console.log(`🔵 Processing: ${occasionKey}`);
            const localPath = path.join(ARTIFACTS_DIR, filename);

            if (fs.existsSync(localPath)) {
                occasionImageUrls[occasionKey] = await uploadToCloudinary(localPath, 'occasions');
            } else {
                console.log(`   ⚠️  File not found: ${filename}`);
            }
            console.log('');
        }

        // Update database
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('💾 STEP 4: Updating Database\n');

        // Update products
        const productUpdates = [
            { name: 'Royal Kanjeevaram Silk - Maroon Temple Border', images: productImageUrls.kanjeevaram_maroon },
            { name: 'Peacock Paithani - Royal Purple & Gold', images: productImageUrls.paithani_purple },
            { name: 'Temple Gadwal Cotton Silk - Auspicious Red', images: productImageUrls.gadwal_red },
            { name: 'Banarasi Brocade - Emerald Green Silk', images: productImageUrls.banarasi_green },
            { name: 'Pochampally Ikat Silk - Mustard & Maroon', images: productImageUrls.pochampally_ikat }
        ];

        for (const update of productUpdates) {
            if (update.images && update.images.length > 0) {
                await Product.findOneAndUpdate(
                    { name: update.name },
                    { images: update.images }
                );
                console.log(`   ✅ Updated: ${update.name}`);
            }
        }

        // Update collections
        const collectionUpdates = [
            { slug: 'heritage-weaves', image: collectionImageUrls.heritage_weaves },
            { slug: 'new-arrivals', image: collectionImageUrls.new_arrivals },
            { slug: 'signature-collection', image: collectionImageUrls.signature_collection }
        ];

        for (const update of collectionUpdates) {
            if (update.image) {
                await Collection.findOneAndUpdate(
                    { slug: update.slug },
                    { image: update.image }
                );
                console.log(`   ✅ Updated collection: ${update.slug}`);
            }
        }

        // Update occasions
        const occasionUpdates = [
            { slug: 'wedding-sarees', image: occasionImageUrls.wedding },
            { slug: 'puja-religious-wear', image: occasionImageUrls.puja },
            { slug: 'festive-family-functions', image: occasionImageUrls.festive }
        ];

        for (const update of occasionUpdates) {
            if (update.image) {
                await Occasion.findOneAndUpdate(
                    { slug: update.slug },
                    { image: update.image }
                );
                console.log(`   ✅ Updated occasion: ${update.slug}`);
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✨ ALL IMAGES UPLOADED & DATABASE UPDATED!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 Your website now has professional AI-generated images!');
        console.log('🌐 Refresh your browser to see the new images!\n');

        process.exit();
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

uploadAndUpdate();
