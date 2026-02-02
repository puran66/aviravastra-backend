require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Category = require('./src/models/Category');
const Occasion = require('./src/models/Occasion');
const Collection = require('./src/models/Collection');

const seedProfessionalContent = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB for professional content seeding...\n');

        // ============================================
        // STEP 1: CLEAR EXISTING CONTENT
        // ============================================
        await Occasion.deleteMany({});
        await Collection.deleteMany({});
        await Product.deleteMany({});
        console.log('✅ Cleared existing content\n');

        // ============================================
        // STEP 2: CREATE OCCASIONS
        // ============================================
        const occasions = [
            {
                title: 'Wedding Sarees',
                subtitle: 'Exquisite weaves blessed for your most auspicious muhurat. Each piece chosen to honor tradition and celebrate new beginnings.',
                slug: 'wedding-sarees',
                image: 'https://images.unsplash.com/photo-1583391733981-5acd1d5d4f88?w=1200&q=80',
                sortOrder: 1,
                isActive: true
            },
            {
                title: 'Puja & Religious Wear',
                subtitle: 'Sacred fabrics for Varalakshmi Vratam, Satyanarayan Puja, and daily temple visits. Woven with reverence for divine moments.',
                slug: 'puja-religious-wear',
                image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1200&q=80',
                sortOrder: 2,
                isActive: true
            },
            {
                title: 'Festive & Family Functions',
                subtitle: 'Radiant heritage for Diwali, Navratri, Grah Pravesh, and naming ceremonies. Celebrate life\'s milestones in timeless elegance.',
                slug: 'festive-family-functions',
                image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80',
                sortOrder: 3,
                isActive: true
            }
        ];

        const createdOccasions = await Occasion.insertMany(occasions);
        console.log('✅ Created 3 Occasions:');
        createdOccasions.forEach(o => console.log(`   - ${o.title}`));
        console.log('');

        // ============================================
        // STEP 3: CREATE COLLECTIONS
        // ============================================
        const collections = [
            {
                title: 'Heritage Weaves',
                subtitle: 'Timeless Kanjeevarams, Paithanis, and Banarasis. Each saree carries centuries of weaving mastery from India\'s temple towns.',
                slug: 'heritage-weaves',
                image: 'https://images.unsplash.com/photo-1621112904887-419379ce6824?w=1200&q=80',
                sortOrder: 1,
                isActive: true
            },
            {
                title: 'New Arrivals',
                subtitle: 'Fresh off the looms this season. Discover our latest heritage drops, each piece a conversation between tradition and grace.',
                slug: 'new-arrivals',
                image: 'https://images.unsplash.com/photo-1610189012906-400147fc890c?w=1200&q=80',
                sortOrder: 2,
                isActive: true
            },
            {
                title: 'Signature Collection',
                subtitle: 'One-of-a-kind masterpieces for extraordinary moments. Limited edition sarees that become family heirlooms.',
                slug: 'signature-collection',
                image: 'https://images.unsplash.com/photo-1583391733912-3f1d248b8981?w=1200&q=80',
                sortOrder: 3,
                isActive: true
            }
        ];

        const createdCollections = await Collection.insertMany(collections);
        console.log('✅ Created 3 Collections:');
        createdCollections.forEach(c => console.log(`   - ${c.title}`));
        console.log('');

        // ============================================
        // STEP 4: GET CATEGORY IDS
        // ============================================
        const weddingCategory = await Category.findOne({ name: 'Wedding Sarees' });
        const pujaCategory = await Category.findOne({ name: 'Puja & Temple Sarees' });
        const familyCategory = await Category.findOne({ name: 'Family Functions' });

        if (!weddingCategory || !pujaCategory || !familyCategory) {
            console.error('❌ Categories not found. Run seed.js first!');
            process.exit(1);
        }

        // ============================================
        // STEP 5: CREATE PROFESSIONAL PRODUCTS
        // ============================================
        const products = [
            // Product 1: Wedding Kanjeevaram
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
                images: [
                    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
                    'https://images.unsplash.com/photo-1583391733981-5acd1d5d4f88?w=800&q=80'
                ],
                isActive: true
            },
            // Product 2: Wedding Paithani
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
                images: [
                    'https://images.unsplash.com/photo-1583391733912-3f1d248b8981?w=800&q=80',
                    'https://images.unsplash.com/photo-1621112904887-419379ce6824?w=800&q=80'
                ],
                isActive: true
            },
            // Product 3: Puja Gadwal
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
                images: [
                    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80'
                ],
                isActive: true
            },
            // Product 4: Festive Banarasi
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
                images: [
                    'https://images.unsplash.com/photo-1610189012906-400147fc890c?w=800&q=80',
                    'https://images.unsplash.com/photo-1583391733981-5acd1d5d4f88?w=800&q=80'
                ],
                isActive: true
            },
            // Product 5: Heritage Pochampally
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
                images: [
                    'https://images.unsplash.com/photo-1621112904887-419379ce6824?w=800&q=80'
                ],
                isActive: true
            }
        ];

        const createdProducts = await Product.insertMany(products);
        console.log('✅ Created 5 Professional Products:');
        createdProducts.forEach(p => {
            console.log(`   - ${p.name}`);
            console.log(`     ₹${p.price.toLocaleString('en-IN')} | Stock: ${p.stock} | ${p.weaveType}`);
        });
        console.log('');

        // ============================================
        // SUMMARY
        // ============================================
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✨ PROFESSIONAL CONTENT SEEDING COMPLETED');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📦 Total Products: ${createdProducts.length}`);
        console.log(`🎯 Total Occasions: ${createdOccasions.length}`);
        console.log(`📚 Total Collections: ${createdCollections.length}`);
        console.log(`💰 Price Range: ₹14,999 - ₹32,999`);
        console.log(`📊 Total Stock: ${createdProducts.reduce((sum, p) => sum + p.stock, 0)} pieces`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('🚀 Your store is now ready with professional content!');
        console.log('🌐 Visit: http://localhost:5173\n');

        process.exit();
    } catch (error) {
        console.error('❌ Seeding error:', error.message);
        console.error(error);
        process.exit(1);
    }
};

seedProfessionalContent();
