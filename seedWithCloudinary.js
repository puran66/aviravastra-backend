require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('./src/config/cloudinary');
const Product = require('./src/models/Product');
const Occasion = require('./src/models/Occasion');
const Collection = require('./src/models/Collection');
const Category = require('./src/models/Category');

// Image mapping - Update these paths to where you save the generated images
const GENERATED_IMAGES_DIR = path.join(__dirname, 'generated-images');

const imageMapping = {
    products: {
        'kanjeevaram_maroon': {
            primary: 'kanjeevaram_maroon_primary.png',
            detail: 'kanjeevaram_maroon_detail.png'
        },
        'paithani_purple': {
            primary: 'paithani_purple_primary.png',
            detail: 'paithani_purple_detail.png'
        },
        'gadwal_red': {
            primary: 'gadwal_red_primary.png',
            detail: 'gadwal_red_detail.png'
        },
        'banarasi_green': {
            primary: 'banarasi_green_primary.png',
            detail: 'banarasi_green_detail.png'
        },
        'pochampally_ikat': {
            primary: 'pochampally_ikat_primary.png',
            detail: 'pochampally_ikat_detail.png'
        }
    },
    collections: {
        'heritage_weaves': 'heritage_weaves_banner.png',
        'new_arrivals': 'new_arrivals_banner.png',
        'signature_collection': 'signature_collection_banner.png'
    },
    occasions: {
        'wedding': 'wedding_occasion_banner.png',
        'puja': 'puja_occasion_banner.png',
        'festive': 'festive_occasion_banner.png'
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

// Main seeding function
async function seedWithImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB\n');

        // Check if generated images directory exists
        if (!fs.existsSync(GENERATED_IMAGES_DIR)) {
            console.error(`❌ Directory not found: ${GENERATED_IMAGES_DIR}`);
            console.log('\n📝 INSTRUCTIONS:');
            console.log('1. Create a folder: backend/generated-images');
            console.log('2. Save all generated images to that folder');
            console.log('3. Run this script again\n');
            process.exit(1);
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📦 STEP 1: UPLOADING PRODUCT IMAGES');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const productImages = {};

        for (const [productKey, images] of Object.entries(imageMapping.products)) {
            console.log(`🔵 Processing: ${productKey}`);
            productImages[productKey] = [];

            for (const [type, filename] of Object.entries(images)) {
                const localPath = path.join(GENERATED_IMAGES_DIR, filename);

                if (fs.existsSync(localPath)) {
                    const url = await uploadToCloudinary(localPath, 'products');
                    if (url) productImages[productKey].push(url);
                } else {
                    console.log(`   ⚠️  File not found: ${filename}`);
                }
            }
            console.log('');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📚 STEP 2: UPLOADING COLLECTION BANNERS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const collectionImages = {};

        for (const [collectionKey, filename] of Object.entries(imageMapping.collections)) {
            console.log(`🔵 Processing: ${collectionKey}`);
            const localPath = path.join(GENERATED_IMAGES_DIR, filename);

            if (fs.existsSync(localPath)) {
                collectionImages[collectionKey] = await uploadToCloudinary(localPath, 'collections');
            } else {
                console.log(`   ⚠️  File not found: ${filename}`);
            }
            console.log('');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎯 STEP 3: UPLOADING OCCASION BANNERS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const occasionImages = {};

        for (const [occasionKey, filename] of Object.entries(imageMapping.occasions)) {
            console.log(`🔵 Processing: ${occasionKey}`);
            const localPath = path.join(GENERATED_IMAGES_DIR, filename);

            if (fs.existsSync(localPath)) {
                occasionImages[occasionKey] = await uploadToCloudinary(localPath, 'occasions');
            } else {
                console.log(`   ⚠️  File not found: ${filename}`);
            }
            console.log('');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('💾 STEP 4: UPDATING DATABASE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Get categories
        const weddingCategory = await Category.findOne({ name: 'Wedding Sarees' });
        const pujaCategory = await Category.findOne({ name: 'Puja & Temple Sarees' });
        const familyCategory = await Category.findOne({ name: 'Family Functions' });

        if (!weddingCategory || !pujaCategory || !familyCategory) {
            console.error('❌ Categories not found. Run seed.js first!');
            process.exit(1);
        }

        // Clear existing data
        await Product.deleteMany({});
        await Occasion.deleteMany({});
        await Collection.deleteMany({});
        console.log('✅ Cleared existing data\n');

        // Create Occasions with uploaded images
        const occasions = [
            {
                title: 'Wedding Sarees',
                subtitle: 'Exquisite weaves blessed for your most auspicious muhurat. Each piece chosen to honor tradition and celebrate new beginnings.',
                slug: 'wedding-sarees',
                image: occasionImages['wedding'] || 'https://images.unsplash.com/photo-1583391733981-5acd1d5d4f88?w=1200&q=80',
                sortOrder: 1,
                isActive: true
            },
            {
                title: 'Puja & Religious Wear',
                subtitle: 'Sacred fabrics for Varalakshmi Vratam, Satyanarayan Puja, and daily temple visits. Woven with reverence for divine moments.',
                slug: 'puja-religious-wear',
                image: occasionImages['puja'] || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1200&q=80',
                sortOrder: 2,
                isActive: true
            },
            {
                title: 'Festive & Family Functions',
                subtitle: 'Radiant heritage for Diwali, Navratri, Grah Pravesh, and naming ceremonies. Celebrate life\'s milestones in timeless elegance.',
                slug: 'festive-family-functions',
                image: occasionImages['festive'] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80',
                sortOrder: 3,
                isActive: true
            }
        ];

        await Occasion.insertMany(occasions);
        console.log('✅ Created 3 Occasions with uploaded images\n');

        // Create Collections with uploaded images
        const collections = [
            {
                title: 'Heritage Weaves',
                subtitle: 'Timeless Kanjeevarams, Paithanis, and Banarasis. Each saree carries centuries of weaving mastery from India\'s temple towns.',
                slug: 'heritage-weaves',
                image: collectionImages['heritage_weaves'] || 'https://images.unsplash.com/photo-1621112904887-419379ce6824?w=1200&q=80',
                sortOrder: 1,
                isActive: true
            },
            {
                title: 'New Arrivals',
                subtitle: 'Fresh off the looms this season. Discover our latest heritage drops, each piece a conversation between tradition and grace.',
                slug: 'new-arrivals',
                image: collectionImages['new_arrivals'] || 'https://images.unsplash.com/photo-1610189012906-400147fc890c?w=1200&q=80',
                sortOrder: 2,
                isActive: true
            },
            {
                title: 'Signature Collection',
                subtitle: 'One-of-a-kind masterpieces for extraordinary moments. Limited edition sarees that become family heirlooms.',
                slug: 'signature-collection',
                image: collectionImages['signature_collection'] || 'https://images.unsplash.com/photo-1583391733912-3f1d248b8981?w=1200&q=80',
                sortOrder: 3,
                isActive: true
            }
        ];

        await Collection.insertMany(collections);
        console.log('✅ Created 3 Collections with uploaded images\n');

        // Create Products with uploaded images
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
                images: productImages['kanjeevaram_maroon'] || [],
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
                images: productImages['paithani_purple'] || [],
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
                images: productImages['gadwal_red'] || [],
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
                images: productImages['banarasi_green'] || [],
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
                images: productImages['pochampally_ikat'] || [],
                isActive: true
            }
        ];

        const createdProducts = await Product.insertMany(products);
        console.log('✅ Created 5 Products with uploaded images\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✨ SEEDING COMPLETED SUCCESSFULLY!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📦 Products: ${createdProducts.length}`);
        console.log(`🎯 Occasions: ${occasions.length}`);
        console.log(`📚 Collections: ${collections.length}`);
        console.log(`🖼️  Images uploaded to Cloudinary`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('🚀 Your website is now ready with professional images!');
        console.log('🌐 Visit: http://localhost:5173\n');

        process.exit();
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

seedWithImages();
