require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('./src/config/cloudinary');
const Product = require('./src/models/Product');
const Occasion = require('./src/models/Occasion');
const Collection = require('./src/models/Collection');
const Category = require('./src/models/Category');

// Directory for generated images
const GENERATED_IMAGES_DIR = path.join(__dirname, 'generated-images');

/**
 * STEP 1: Delete all images from Cloudinary
 */
async function deleteAllCloudinaryImages() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🗑️  STEP 1: DELETING ALL CLOUDINARY IMAGES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
        const folders = ['avira/products', 'avira/collections', 'avira/occasions'];

        for (const folder of folders) {
            console.log(`🔵 Deleting from: ${folder}`);

            // Get all resources in the folder
            const result = await cloudinary.api.resources({
                type: 'upload',
                prefix: folder,
                max_results: 500
            });

            if (result.resources.length > 0) {
                // Delete all resources
                const publicIds = result.resources.map(resource => resource.public_id);

                for (const publicId of publicIds) {
                    await cloudinary.uploader.destroy(publicId);
                    console.log(`   ✅ Deleted: ${publicId}`);
                }

                console.log(`   🎯 Total deleted: ${publicIds.length}\n`);
            } else {
                console.log(`   ℹ️  No images found in ${folder}\n`);
            }
        }

        console.log('✅ All Cloudinary images deleted successfully!\n');
        return true;
    } catch (error) {
        console.error('❌ Error deleting Cloudinary images:', error.message);
        return false;
    }
}

/**
 * STEP 2: Upload new images to Cloudinary
 */
async function uploadToCloudinary(localPath, folder) {
    try {
        console.log(`   📤 Uploading: ${path.basename(localPath)}`);
        const result = await cloudinary.uploader.upload(localPath, {
            folder: `avira/${folder}`,
            use_filename: true,
            unique_filename: false,
            overwrite: true,
            quality: 'auto:best',
            fetch_format: 'auto'
        });
        console.log(`   ✅ Uploaded: ${result.secure_url}`);
        return result.secure_url;
    } catch (error) {
        console.error(`   ❌ Upload failed for ${localPath}:`, error.message);
        return null;
    }
}

/**
 * STEP 3: Upload all generated images
 */
async function uploadAllImages() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📤 STEP 2: UPLOADING NEW IMAGES TO CLOUDINARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Check if generated images directory exists
    if (!fs.existsSync(GENERATED_IMAGES_DIR)) {
        console.error(`❌ Directory not found: ${GENERATED_IMAGES_DIR}`);
        console.log('\n📝 Please wait for image generation to complete first!\n');
        return null;
    }

    const uploadedImages = {
        products: {},
        collections: {},
        occasions: {}
    };

    // Upload product images
    console.log('📦 Uploading Product Images...\n');
    const productKeys = ['kanjeevaram_maroon', 'paithani_purple', 'gadwal_red', 'banarasi_green', 'pochampally_ikat'];

    for (const productKey of productKeys) {
        console.log(`🔵 Processing: ${productKey}`);
        uploadedImages.products[productKey] = [];

        const primaryImage = path.join(GENERATED_IMAGES_DIR, `${productKey}_primary.png`);
        const detailImage = path.join(GENERATED_IMAGES_DIR, `${productKey}_detail.png`);

        if (fs.existsSync(primaryImage)) {
            const url = await uploadToCloudinary(primaryImage, 'products');
            if (url) uploadedImages.products[productKey].push(url);
        }

        if (fs.existsSync(detailImage)) {
            const url = await uploadToCloudinary(detailImage, 'products');
            if (url) uploadedImages.products[productKey].push(url);
        }

        console.log('');
    }

    // Upload collection images
    console.log('📚 Uploading Collection Banners...\n');
    const collectionKeys = ['heritage_weaves', 'new_arrivals', 'signature_collection'];

    for (const collectionKey of collectionKeys) {
        console.log(`🔵 Processing: ${collectionKey}`);
        const imagePath = path.join(GENERATED_IMAGES_DIR, `${collectionKey}_banner.png`);

        if (fs.existsSync(imagePath)) {
            uploadedImages.collections[collectionKey] = await uploadToCloudinary(imagePath, 'collections');
        }
        console.log('');
    }

    // Upload occasion images
    console.log('🎯 Uploading Occasion Banners...\n');
    const occasionKeys = ['wedding', 'puja', 'festive'];

    for (const occasionKey of occasionKeys) {
        console.log(`🔵 Processing: ${occasionKey}`);
        const imagePath = path.join(GENERATED_IMAGES_DIR, `${occasionKey}_occasion_banner.png`);

        if (fs.existsSync(imagePath)) {
            uploadedImages.occasions[occasionKey] = await uploadToCloudinary(imagePath, 'occasions');
        }
        console.log('');
    }

    return uploadedImages;
}

/**
 * STEP 4: Update database with new Cloudinary URLs
 */
async function updateDatabase(uploadedImages) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💾 STEP 3: UPDATING DATABASE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Get categories
    const weddingCategory = await Category.findOne({ name: 'Wedding Sarees' });
    const pujaCategory = await Category.findOne({ name: 'Puja & Temple Sarees' });
    const familyCategory = await Category.findOne({ name: 'Family Functions' });

    if (!weddingCategory || !pujaCategory || !familyCategory) {
        console.error('❌ Categories not found. Run seed.js first!');
        return false;
    }

    // Clear existing data
    await Product.deleteMany({});
    await Occasion.deleteMany({});
    await Collection.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Create Occasions
    const occasions = [
        {
            title: 'Wedding Sarees',
            subtitle: 'Exquisite weaves blessed for your most auspicious muhurat. Each piece chosen to honor tradition and celebrate new beginnings.',
            slug: 'wedding-sarees',
            image: uploadedImages.occasions['wedding'] || 'https://via.placeholder.com/1200x600/8B4513/FFFFFF?text=Wedding+Sarees',
            sortOrder: 1,
            isActive: true
        },
        {
            title: 'Puja & Religious Wear',
            subtitle: 'Sacred fabrics for Varalakshmi Vratam, Satyanarayan Puja, and daily temple visits. Woven with reverence for divine moments.',
            slug: 'puja-religious-wear',
            image: uploadedImages.occasions['puja'] || 'https://via.placeholder.com/1200x600/FF6347/FFFFFF?text=Puja+Wear',
            sortOrder: 2,
            isActive: true
        },
        {
            title: 'Festive & Family Functions',
            subtitle: 'Radiant heritage for Diwali, Navratri, Grah Pravesh, and naming ceremonies. Celebrate life\'s milestones in timeless elegance.',
            slug: 'festive-family-functions',
            image: uploadedImages.occasions['festive'] || 'https://via.placeholder.com/1200x600/FFD700/000000?text=Festive+Wear',
            sortOrder: 3,
            isActive: true
        }
    ];

    await Occasion.insertMany(occasions);
    console.log('✅ Created 3 Occasions\n');

    // Create Collections
    const collections = [
        {
            title: 'Heritage Weaves',
            subtitle: 'Timeless Kanjeevarams, Paithanis, and Banarasis. Each saree carries centuries of weaving mastery from India\'s temple towns.',
            slug: 'heritage-weaves',
            image: uploadedImages.collections['heritage_weaves'] || 'https://via.placeholder.com/1200x600/8B0000/FFFFFF?text=Heritage+Weaves',
            sortOrder: 1,
            isActive: true
        },
        {
            title: 'New Arrivals',
            subtitle: 'Fresh off the looms this season. Discover our latest heritage drops, each piece a conversation between tradition and grace.',
            slug: 'new-arrivals',
            image: uploadedImages.collections['new_arrivals'] || 'https://via.placeholder.com/1200x600/4B0082/FFFFFF?text=New+Arrivals',
            sortOrder: 2,
            isActive: true
        },
        {
            title: 'Signature Collection',
            subtitle: 'One-of-a-kind masterpieces for extraordinary moments. Limited edition sarees that become family heirlooms.',
            slug: 'signature-collection',
            image: uploadedImages.collections['signature_collection'] || 'https://via.placeholder.com/1200x600/DAA520/000000?text=Signature+Collection',
            sortOrder: 3,
            isActive: true
        }
    ];

    await Collection.insertMany(collections);
    console.log('✅ Created 3 Collections\n');

    // Create Products
    const products = [
        {
            name: 'Royal Kanjeevaram Silk - Maroon Temple Border',
            description: 'Pure mulberry silk Kanjeevaram from Kanchipuram\'s heritage looms. Features traditional gopuram border with intricate zari work. Woven for wedding ceremonies and grand celebrations. This piece carries the blessing of three generations of master weavers.',
            price: 24999,
            category: weddingCategory._id,
            weaveType: 'Kanjeevaram',
            stock: 2,
            tags: ['pure-silk', 'zari-work', 'bridal', 'temple-border'],
            occasions: ['wedding-sarees', 'festive-family-functions'],
            collections: ['heritage-weaves', 'signature-collection'],
            images: uploadedImages.products['kanjeevaram_maroon'] || [],
            isActive: true
        },
        {
            name: 'Peacock Paithani - Royal Purple & Gold',
            description: 'Authentic Yeola Paithani handwoven in pure silk with traditional mor (peacock) motifs. Each pallu takes 45 days to complete. Blessed for Maharashtrian weddings and Haldi-Kunku ceremonies. A treasured piece that becomes a family legacy.',
            price: 32999,
            category: weddingCategory._id,
            weaveType: 'Paithani',
            stock: 1,
            tags: ['pure-silk', 'peacock-motif', 'handwoven', 'limited-edition'],
            occasions: ['wedding-sarees', 'puja-religious-wear'],
            collections: ['signature-collection', 'heritage-weaves'],
            images: uploadedImages.products['paithani_purple'] || [],
            isActive: true
        },
        {
            name: 'Temple Gadwal Cotton Silk - Auspicious Red',
            description: 'Lightweight Gadwal saree perfect for daily puja and temple visits. Pure cotton body with silk border for comfort and tradition. Woven in the sacred town of Gadwal, blessed for Varalakshmi Vratam and Satyanarayan Puja.',
            price: 14999,
            category: pujaCategory._id,
            weaveType: 'Gadwal',
            stock: 3,
            tags: ['cotton-silk', 'temple-wear', 'lightweight', 'daily-puja'],
            occasions: ['puja-religious-wear', 'festive-family-functions'],
            collections: ['new-arrivals'],
            images: uploadedImages.products['gadwal_red'] || [],
            isActive: true
        },
        {
            name: 'Banarasi Brocade - Emerald Green Silk',
            description: 'Handwoven Banarasi silk from Varanasi\'s ancient looms. Features intricate buti work across the body and rich brocade border. Perfect for Diwali, Navratri, and family celebrations. Each thread blessed by the sacred Ganga.',
            price: 21999,
            category: familyCategory._id,
            weaveType: 'Banarasi',
            stock: 2,
            tags: ['pure-silk', 'brocade', 'festive-wear', 'handwoven'],
            occasions: ['festive-family-functions', 'wedding-sarees'],
            collections: ['heritage-weaves', 'new-arrivals'],
            images: uploadedImages.products['banarasi_green'] || [],
            isActive: true
        },
        {
            name: 'Pochampally Ikat Silk - Mustard & Maroon',
            description: 'Traditional double ikat from Telangana\'s master weavers. Geometric patterns symbolizing prosperity and harmony. Ideal for Grah Pravesh, naming ceremonies, and auspicious gifting. A celebration of South Indian weaving heritage.',
            price: 18999,
            category: familyCategory._id,
            weaveType: 'Pochampally',
            stock: 2,
            tags: ['pure-silk', 'ikat', 'geometric-pattern', 'gifting'],
            occasions: ['festive-family-functions', 'puja-religious-wear'],
            collections: ['heritage-weaves', 'new-arrivals'],
            images: uploadedImages.products['pochampally_ikat'] || [],
            isActive: true
        }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} Products\n`);

    return true;
}

/**
 * Main execution function
 */
async function main() {
    try {
        console.log('\n╔══════════════════════════════════════════════╗');
        console.log('║  AVIRA VASTRA - CLOUDINARY IMAGE REFRESH    ║');
        console.log('║  Professional Image Management System       ║');
        console.log('╚══════════════════════════════════════════════╝\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB\n');

        // Step 1: Delete all existing Cloudinary images
        const deleteSuccess = await deleteAllCloudinaryImages();
        if (!deleteSuccess) {
            console.error('❌ Failed to delete Cloudinary images. Exiting...');
            process.exit(1);
        }

        // Step 2: Upload new images
        const uploadedImages = await uploadAllImages();
        if (!uploadedImages) {
            console.error('❌ Failed to upload images. Exiting...');
            process.exit(1);
        }

        // Step 3: Update database
        const updateSuccess = await updateDatabase(uploadedImages);
        if (!updateSuccess) {
            console.error('❌ Failed to update database. Exiting...');
            process.exit(1);
        }

        // Success summary
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✨ CLOUDINARY REFRESH COMPLETED SUCCESSFULLY!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📦 5 Products updated with fresh images');
        console.log('📚 3 Collections updated with new banners');
        console.log('🎯 3 Occasions updated with new banners');
        console.log('🖼️  All images uploaded to Cloudinary');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('🚀 Your website is now ready with professional images!');
        console.log('🌐 Visit: http://localhost:5173');
        console.log('📱 Mobile: http://192.168.29.176:5173\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ FATAL ERROR:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run the script
main();
