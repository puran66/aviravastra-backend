require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');

const GENERATED_IMAGES_DIR = path.join(__dirname, 'generated-images');

// Placeholder images from Unsplash (high-quality stock photos)
const placeholderImages = {
    'signature_collection_banner.png': 'https://images.unsplash.com/photo-1583391733912-3f1d248b8981?w=1200&h=600&fit=crop&q=80',
    'wedding_occasion_banner.png': 'https://images.unsplash.com/photo-1583391733981-5acd1d5d4f88?w=1200&h=600&fit=crop&q=80',
    'puja_occasion_banner.png': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1200&h=600&fit=crop&q=80',
    'festive_occasion_banner.png': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&h=600&fit=crop&q=80'
};

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => { });
            reject(err);
        });
    });
}

async function createPlaceholders() {
    try {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🖼️  CREATING PLACEHOLDER IMAGES');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Create directory if it doesn't exist
        if (!fs.existsSync(GENERATED_IMAGES_DIR)) {
            fs.mkdirSync(GENERATED_IMAGES_DIR, { recursive: true });
            console.log(`✅ Created directory: ${GENERATED_IMAGES_DIR}\n`);
        }

        console.log('📥 Downloading high-quality placeholder images...\n');

        for (const [filename, url] of Object.entries(placeholderImages)) {
            const filepath = path.join(GENERATED_IMAGES_DIR, filename);

            // Skip if file already exists
            if (fs.existsSync(filepath)) {
                console.log(`⏭️  Skipped (already exists): ${filename}`);
                continue;
            }

            try {
                await downloadImage(url, filepath);
                console.log(`✅ Downloaded: ${filename}`);
            } catch (error) {
                console.log(`❌ Failed: ${filename} - ${error.message}`);
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✨ PLACEHOLDER IMAGES READY!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('📝 NOTE: These are temporary placeholder images.');
        console.log('   Replace them with AI-generated images later for best results.\n');
        console.log('🚀 You can now run: node refreshCloudinaryImages.js\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createPlaceholders();
