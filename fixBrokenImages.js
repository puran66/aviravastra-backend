require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('./src/config/cloudinary');
const Occasion = require('./src/models/Occasion');
const Collection = require('./src/models/Collection');
const path = require('path');
const fs = require('fs');

async function uploadAndFix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('\n🔗 Connected to MongoDB\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔧 FIXING BROKEN IMAGES');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const IMAGES_DIR = path.join(__dirname, 'generated-images');

        // 1. Fix Wedding Occasion
        console.log('📸 1. Wedding Sarees Occasion Banner\n');

        const weddingPath = path.join(IMAGES_DIR, 'wedding_occasion_banner.png');
        let weddingUrl;

        if (fs.existsSync(weddingPath) && fs.statSync(weddingPath).size > 1000) {
            console.log('   📤 Uploading local file to Cloudinary...');
            const result = await cloudinary.uploader.upload(weddingPath, {
                folder: 'avira/occasions',
                public_id: 'wedding_occasion_banner',
                overwrite: true
            });
            weddingUrl = result.secure_url;
            console.log('   ✅ Uploaded:', weddingUrl);
        } else {
            // Use existing good image from products as fallback
            console.log('   ⚠️  Local file not found, using existing product image...');
            weddingUrl = 'https://res.cloudinary.com/dywonchlj/image/upload/v1738504870/avira/products/kanjeevaram_maroon_primary.png';
            console.log('   ✅ Using:', weddingUrl);
        }

        await Occasion.findOneAndUpdate(
            { slug: 'wedding-sarees' },
            { image: weddingUrl }
        );
        console.log('   ✅ Database updated\n');

        // 2. Fix Signature Collection
        console.log('📸 2. Signature Collection Banner\n');

        const signaturePath = path.join(IMAGES_DIR, 'signature_collection_banner.png');
        let signatureUrl;

        if (fs.existsSync(signaturePath) && fs.statSync(signaturePath).size > 1000) {
            console.log('   📤 Uploading local file to Cloudinary...');
            const result = await cloudinary.uploader.upload(signaturePath, {
                folder: 'avira/collections',
                public_id: 'signature_collection_banner',
                overwrite: true
            });
            signatureUrl = result.secure_url;
            console.log('   ✅ Uploaded:', signatureUrl);
        } else {
            // Use existing good image from products as fallback
            console.log('   ⚠️  Local file not found, using existing product image...');
            signatureUrl = 'https://res.cloudinary.com/dywonchlj/image/upload/v1738504905/avira/products/paithani_purple_primary.png';
            console.log('   ✅ Using:', signatureUrl);
        }

        await Collection.findOneAndUpdate(
            { slug: 'signature-collection' },
            { image: signatureUrl }
        );
        console.log('   ✅ Database updated\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✨ IMAGES FIXED SUCCESSFULLY!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📦 Wedding Sarees: ✅');
        console.log('📚 Signature Collection: ✅');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('🌐 Refresh your website now!');
        console.log('   http://localhost:5173\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

uploadAndFix();
