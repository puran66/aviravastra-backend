require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Occasion = require('./src/models/Occasion');
const Collection = require('./src/models/Collection');
const Category = require('./src/models/Category');

// Using high-quality stock images from Unsplash (curated for Indian sarees)
const imageUrls = {
    products: {
        kanjeevaram_maroon: [
            'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
            'https://images.unsplash.com/photo-1583391733981-5acd1d5d4f88?w=800&q=80'
        ],
        paithani_purple: [
            'https://images.unsplash.com/photo-1583391733912-3f1d248b8981?w=800&q=80',
            'https://images.unsplash.com/photo-1621112904887-419379ce6824?w=800&q=80'
        ],
        gadwal_red: [
            'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80',
            'https://images.unsplash.com/photo-1610189012906-400147fc890c?w=800&q=80'
        ],
        banarasi_green: [
            'https://images.unsplash.com/photo-1610189012906-400147fc890c?w=800&q=80',
            'https://images.unsplash.com/photo-1583391733981-5acd1d5d4f88?w=800&q=80'
        ],
        pochampally_ikat: [
            'https://images.unsplash.com/photo-1621112904887-419379ce6824?w=800&q=80',
            'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80'
        ]
    },
    collections: {
        heritage_weaves: 'https://images.unsplash.com/photo-1621112904887-419379ce6824?w=1200&q=80',
        new_arrivals: 'https://images.unsplash.com/photo-1610189012906-400147fc890c?w=1200&q=80',
        signature_collection: 'https://images.unsplash.com/photo-1583391733912-3f1d248b8981?w=1200&q=80'
    },
    occasions: {
        wedding: 'https://images.unsplash.com/photo-1583391733981-5acd1d5d4f88?w=1200&q=80',
        puja: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1200&q=80',
        festive: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80'
    }
};

async function seedComplete() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🚀 AVIRAVASTRA - COMPLETE DATABASE SEEDING');
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

        // Create Occasions
        console.log('📍 Creating Occasions...');
        const occasions = [
            {
                title: 'Wedding Sarees',
                subtitle: 'Exquisite weaves blessed for your most auspicious muhurat. Each piece chosen to honor tradition and celebrate new beginnings.',
                slug: 'wedding-sarees',
                image: imageUrls.occasions.wedding,
                sortOrder: 1,
                isActive: true
            },
            {
                title: 'Puja & Religious Wear',
                subtitle: 'Sacred fabrics for Varalakshmi Vratam, Satyanarayan Puja, and daily temple visits. Woven with reverence for divine moments.',
                slug: 'puja-religious-wear',
                image: imageUrls.occasions.puja,
                sortOrder: 2,
                isActive: true
            },
            {
                title: 'Festive & Family Functions',
                subtitle: 'Radiant heritage for Diwali, Navratri, Grah Pravesh, and naming ceremonies. Celebrate life\'s milestones in timeless elegance.',
                slug: 'festive-family-functions',
                image: imageUrls.occasions.festive,
                sortOrder: 3,
                isActive: true
            }
        ];

        await Occasion.insertMany(occasions);
        console.log('   ✅ Created 3 Occasions\n');

        // Create Collections
        console.log('📚 Creating Collections...');
        const collections = [
            {
                title: 'Heritage Weaves',
                subtitle: 'Timeless Kanjeevarams, Paithanis, and Banarasis. Each saree carries centuries of weaving mastery from India\'s temple towns.',
                slug: 'heritage-weaves',
                image: imageUrls.collections.heritage_weaves,
                sortOrder: 1,
                isActive: true
            },
            {
                title: 'New Arrivals',
                subtitle: 'Fresh off the looms this season. Discover our latest heritage drops, each piece a conversation between tradition and grace.',
                slug: 'new-arrivals',
                image: imageUrls.collections.new_arrivals,
                sortOrder: 2,
                isActive: true
            },
            {
                title: 'Signature Collection',
                subtitle: 'One-of-a-kind masterpieces for extraordinary moments. Limited edition sarees that become family heirlooms.',
                slug: 'signature-collection',
                image: imageUrls.collections.signature_collection,
                sortOrder: 3,
                isActive: true
            }
        ];

        await Collection.insertMany(collections);
        console.log('   ✅ Created 3 Collections\n');

        // Create Products
        console.log('📦 Creating Products...');
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
                images: imageUrls.products.kanjeevaram_maroon,
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
                images: imageUrls.products.paithani_purple,
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
                images: imageUrls.products.gadwal_red,
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
                images: imageUrls.products.banarasi_green,
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
                images: imageUrls.products.pochampally_ikat,
                isActive: true
            }
        ];

        const createdProducts = await Product.insertMany(products);
        console.log('   ✅ Created 5 Products\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✨ SEEDING COMPLETED SUCCESSFULLY!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📦 Products: ${createdProducts.length}`);
        console.log(`🎯 Occasions: ${occasions.length}`);
        console.log(`📚 Collections: ${collections.length}`);
        console.log(`💰 Price Range: ₹14,999 - ₹32,999`);
        console.log(`📊 Total Stock: ${createdProducts.reduce((sum, p) => sum + p.stock, 0)} pieces`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('🎉 Your store is now ready!');
        console.log('🌐 Visit: http://localhost:5173');
        console.log('📱 Mobile: http://192.168.29.176:5173\n');

        console.log('📝 Next Steps:');
        console.log('   1. Refresh your browser');
        console.log('   2. Check the homepage - products should appear');
        console.log('   3. Browse collections and occasions');
        console.log('   4. Test adding products to cart\n');

        process.exit();
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

seedComplete();
