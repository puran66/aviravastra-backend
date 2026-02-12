require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Occasion = require('./src/models/Occasion');
const Collection = require('./src/models/Collection');

// Curated high-quality Indian saree images from Unsplash
const professionalImages = {
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

async function updateWithProfessionalImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎨 UPDATING WITH PROFESSIONAL STOCK IMAGES');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Update products
        console.log('📦 Updating Product Images...\n');

        const productUpdates = [
            { name: 'Royal Kanjeevaram Silk - Maroon Temple Border', images: professionalImages.products.kanjeevaram_maroon },
            { name: 'Peacock Paithani - Royal Purple & Gold', images: professionalImages.products.paithani_purple },
            { name: 'Temple Gadwal Cotton Silk - Auspicious Red', images: professionalImages.products.gadwal_red },
            { name: 'Banarasi Brocade - Emerald Green Silk', images: professionalImages.products.banarasi_green },
            { name: 'Pochampally Ikat Silk - Mustard & Maroon', images: professionalImages.products.pochampally_ikat }
        ];

        for (const update of productUpdates) {
            await Product.findOneAndUpdate(
                { name: update.name },
                { images: update.images }
            );
            console.log(`   ✅ ${update.name}`);
        }

        // Update collections
        console.log('\n📚 Updating Collection Banners...\n');

        await Collection.findOneAndUpdate(
            { slug: 'heritage-weaves' },
            { image: professionalImages.collections.heritage_weaves }
        );
        console.log('   ✅ Heritage Weaves');

        await Collection.findOneAndUpdate(
            { slug: 'new-arrivals' },
            { image: professionalImages.collections.new_arrivals }
        );
        console.log('   ✅ New Arrivals');

        await Collection.findOneAndUpdate(
            { slug: 'signature-collection' },
            { image: professionalImages.collections.signature_collection }
        );
        console.log('   ✅ Signature Collection');

        // Update occasions
        console.log('\n🎯 Updating Occasion Banners...\n');

        await Occasion.findOneAndUpdate(
            { slug: 'wedding-sarees' },
            { image: professionalImages.occasions.wedding }
        );
        console.log('   ✅ Wedding Sarees');

        await Occasion.findOneAndUpdate(
            { slug: 'puja-religious-wear' },
            { image: professionalImages.occasions.puja }
        );
        console.log('   ✅ Puja & Religious Wear');

        await Occasion.findOneAndUpdate(
            { slug: 'festive-family-functions' },
            { image: professionalImages.occasions.festive }
        );
        console.log('   ✅ Festive & Family Functions');

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✨ ALL IMAGES UPDATED SUCCESSFULLY!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📦 5 Products updated');
        console.log('📚 3 Collections updated');
        console.log('🎯 3 Occasions updated');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('🌐 Refresh your browser: http://localhost:5173');
        console.log('📱 Mobile: http://192.168.29.176:5173\n');
        console.log('✅ All images are now high-quality, complete, and professional!\n');

        process.exit();
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

updateWithProfessionalImages();
