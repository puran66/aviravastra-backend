require('dotenv').config();
const mongoose = require('mongoose');
const Occasion = require('./src/models/Occasion');
const Collection = require('./src/models/Collection');

async function checkImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('\n🔗 Connected to MongoDB\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔍 CHECKING CURRENT IMAGE URLS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Check Wedding Occasion
        const wedding = await Occasion.findOne({ slug: 'wedding-sarees' });
        console.log('📸 Wedding Sarees Occasion:');
        console.log('   Slug:', wedding?.slug);
        console.log('   Title:', wedding?.title);
        console.log('   Image URL:', wedding?.image || 'NOT SET');
        console.log('');

        // Check Signature Collection
        const signature = await Collection.findOne({ slug: 'signature-collection' });
        console.log('📸 Signature Collection:');
        console.log('   Slug:', signature?.slug);
        console.log('   Title:', signature?.title);
        console.log('   Image URL:', signature?.image || 'NOT SET');
        console.log('');

        // Check all occasions
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 ALL OCCASIONS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        const allOccasions = await Occasion.find({});
        allOccasions.forEach(occ => {
            console.log(`   ${occ.title} (${occ.slug})`);
            console.log(`   Image: ${occ.image}`);
            console.log('');
        });

        // Check all collections
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 ALL COLLECTIONS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        const allCollections = await Collection.find({});
        allCollections.forEach(col => {
            console.log(`   ${col.title} (${col.slug})`);
            console.log(`   Image: ${col.image}`);
            console.log('');
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkImages();
