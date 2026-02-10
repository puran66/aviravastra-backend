require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Occasion = require('./src/models/Occasion');
const Collection = require('./src/models/Collection');

// Using picsum.photos - guaranteed to work, beautiful placeholder images
const reliableImages = {
    products: {
        kanjeevaram_maroon: [
            'https://picsum.photos/seed/saree1/800/1000',
            'https://picsum.photos/seed/saree1detail/800/1000'
        ],
        paithani_purple: [
            'https://picsum.photos/seed/saree2/800/1000',
            'https://picsum.photos/seed/saree2detail/800/1000'
        ],
        gadwal_red: [
            'https://picsum.photos/seed/saree3/800/1000',
            'https://picsum.photos/seed/saree3detail/800/1000'
        ],
        banarasi_green: [
            'https://picsum.photos/seed/saree4/800/1000',
            'https://picsum.photos/seed/saree4detail/800/1000'
        ],
        pochampally_ikat: [
            'https://picsum.photos/seed/saree5/800/1000',
            'https://picsum.photos/seed/saree5detail/800/1000'
        ]
    },
    collections: {
        heritage_weaves: 'https://picsum.photos/seed/heritage/1200/600',
        new_arrivals: 'https://picsum.photos/seed/newarrivals/1200/600',
        signature_collection: 'https://picsum.photos/seed/signature/1200/600'
    },
    occasions: {
        wedding: 'https://picsum.photos/seed/wedding/1200/600',
        puja: 'https://picsum.photos/seed/puja/1200/600',
        festive: 'https://picsum.photos/seed/festive/1200/600'
    }
};

async function updateWithReliableImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎨 UPDATING WITH 100% RELIABLE PLACEHOLDER IMAGES');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Update products
        console.log('📦 Updating Product Images...\n');

        const productMapping = {
            'Royal Kanjeevaram Silk - Maroon Temple Border': reliableImages.products.kanjeevaram_maroon,
            'Peacock Paithani - Royal Purple & Gold': reliableImages.products.paithani_purple,
            'Temple Gadwal Cotton Silk - Auspicious Red': reliableImages.products.gadwal_red,
            'Banarasi Brocade - Emerald Green Silk': reliableImages.products.banarasi_green,
            'Pochampally Ikat Silk - Mustard & Maroon': reliableImages.products.pochampally_ikat
        };

        for (const [productName, images] of Object.entries(productMapping)) {
            const result = await Product.findOneAndUpdate(
                { name: productName },
                { images: images },
                { new: true }
            );

            if (result) {
                console.log(`   ✅ ${productName}`);
                console.log(`      ${images[0]}`);
                console.log(`      ${images[1]}\n`);
            }
        }

        // Update collections
        console.log('📚 Updating Collection Banners...\n');

        await Collection.findOneAndUpdate(
            { slug: 'heritage-weaves' },
            { image: reliableImages.collections.heritage_weaves }
        );
        console.log(`   ✅ Heritage Weaves`);
        console.log(`      ${reliableImages.collections.heritage_weaves}\n`);

        await Collection.findOneAndUpdate(
            { slug: 'new-arrivals' },
            { image: reliableImages.collections.new_arrivals }
        );
        console.log(`   ✅ New Arrivals`);
        console.log(`      ${reliableImages.collections.new_arrivals}\n`);

        await Collection.findOneAndUpdate(
            { slug: 'signature-collection' },
            { image: reliableImages.collections.signature_collection }
        );
        console.log(`   ✅ Signature Collection`);
        console.log(`      ${reliableImages.collections.signature_collection}\n`);

        // Update occasions
        console.log('🎯 Updating Occasion Banners...\n');

        await Occasion.findOneAndUpdate(
            { slug: 'wedding-sarees' },
            { image: reliableImages.occasions.wedding }
        );
        console.log(`   ✅ Wedding Sarees`);
        console.log(`      ${reliableImages.occasions.wedding}\n`);

        await Occasion.findOneAndUpdate(
            { slug: 'puja-religious-wear' },
            { image: reliableImages.occasions.puja }
        );
        console.log(`   ✅ Puja & Religious Wear`);
        console.log(`      ${reliableImages.occasions.puja}\n`);

        await Occasion.findOneAndUpdate(
            { slug: 'festive-family-functions' },
            { image: reliableImages.occasions.festive }
        );
        console.log(`   ✅ Festive & Family Functions`);
        console.log(`      ${reliableImages.occasions.festive}\n`);

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✨ SUCCESS! ALL IMAGES UPDATED!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('📝 NOTE: These are placeholder images from picsum.photos');
        console.log('   They will ALWAYS load and display correctly.');
        console.log('   Replace them later with actual product photos.\n');
        console.log('🌐 Refresh browser: http://localhost:5173\n');

        process.exit();
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

updateWithReliableImages();
