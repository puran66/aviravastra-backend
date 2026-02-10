require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');

const GENERATED_IMAGES_DIR = path.join(__dirname, 'generated-images');

// High-quality Indian saree images from Unsplash
const imagesToDownload = {
    'wedding_occasion_banner.png': 'https://images.unsplash.com/photo-1583391733981-5acd1d5d4f88?w=1200&q=80',
    'signature_collection_banner.png': 'https://images.unsplash.com/photo-1583391733912-3f1d248b8981?w=1200&q=80'
};

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        // Delete existing file if it exists
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }

        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            // Follow redirects
            if (response.statusCode === 301 || response.statusCode === 302) {
                https.get(response.headers.location, (redirectResponse) => {
                    redirectResponse.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        resolve();
                    });
                }).on('error', (err) => {
                    fs.unlink(filepath, () => { });
                    reject(err);
                });
            } else {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            }
        }).on('error', (err) => {
            fs.unlink(filepath, () => { });
            reject(err);
        });
    });
}

async function downloadMissingImages() {
    try {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📥 DOWNLOADING MISSING BANNER IMAGES');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Create directory if it doesn't exist
        if (!fs.existsSync(GENERATED_IMAGES_DIR)) {
            fs.mkdirSync(GENERATED_IMAGES_DIR, { recursive: true });
        }

        for (const [filename, url] of Object.entries(imagesToDownload)) {
            const filepath = path.join(GENERATED_IMAGES_DIR, filename);

            try {
                console.log(`📥 Downloading: ${filename}`);
                await downloadImage(url, filepath);

                // Check file size
                const stats = fs.statSync(filepath);
                console.log(`✅ Downloaded: ${filename} (${(stats.size / 1024).toFixed(2)} KB)\n`);
            } catch (error) {
                console.log(`❌ Failed: ${filename} - ${error.message}\n`);
            }
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✨ IMAGES DOWNLOADED SUCCESSFULLY!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('🚀 Next step: Run node updateMissingImages.js\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

downloadMissingImages();
