const fs = require('fs');
const path = require('path');

// Source directory where images are currently generated
const SOURCE_DIR = 'C:/Users/vishw/.gemini/antigravity/brain/537d204b-0552-4ad8-9069-a0052ebce8a2';

// Target directory for the backend script
const TARGET_DIR = path.join(__dirname, 'generated-images');

// Image mapping - files that have been generated
const generatedImages = [
    { source: 'kanjeevaram_maroon_primary_1770044254104.png', target: 'kanjeevaram_maroon_primary.png' },
    { source: 'kanjeevaram_maroon_detail_1770044276127.png', target: 'kanjeevaram_maroon_detail.png' },
    { source: 'paithani_purple_primary_1770044303525.png', target: 'paithani_purple_primary.png' },
    { source: 'paithani_purple_detail_1770044405084.png', target: 'paithani_purple_detail.png' },
    { source: 'gadwal_red_primary_1770044430549.png', target: 'gadwal_red_primary.png' },
    { source: 'gadwal_red_detail_1770044450127.png', target: 'gadwal_red_detail.png' },
    { source: 'banarasi_green_primary_1770044474643.png', target: 'banarasi_green_primary.png' },
    { source: 'banarasi_green_detail_1770044542948.png', target: 'banarasi_green_detail.png' },
    { source: 'pochampally_ikat_primary_1770044655326.png', target: 'pochampally_ikat_primary.png' },
    { source: 'pochampally_ikat_detail_1770044675347.png', target: 'pochampally_ikat_detail.png' },
    { source: 'heritage_weaves_banner_1770044695893.png', target: 'heritage_weaves_banner.png' },
    { source: 'new_arrivals_banner_1770044721590.png', target: 'new_arrivals_banner.png' }
];

async function copyGeneratedImages() {
    try {
        // Create target directory if it doesn't exist
        if (!fs.existsSync(TARGET_DIR)) {
            fs.mkdirSync(TARGET_DIR, { recursive: true });
            console.log(`✅ Created directory: ${TARGET_DIR}\n`);
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 COPYING GENERATED IMAGES');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        let copiedCount = 0;
        let skippedCount = 0;

        for (const image of generatedImages) {
            const sourcePath = path.join(SOURCE_DIR, image.source);
            const targetPath = path.join(TARGET_DIR, image.target);

            if (fs.existsSync(sourcePath)) {
                fs.copyFileSync(sourcePath, targetPath);
                console.log(`✅ Copied: ${image.target}`);
                copiedCount++;
            } else {
                console.log(`⚠️  Not found: ${image.source}`);
                skippedCount++;
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 COPY SUMMARY');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ Copied: ${copiedCount} images`);
        console.log(`⚠️  Skipped: ${skippedCount} images`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // List remaining images to generate
        console.log('📝 REMAINING IMAGES TO GENERATE:');
        console.log('─────────────────────────────────────────\n');
        console.log('Collection Banners:');
        console.log('  • signature_collection_banner.png\n');
        console.log('Occasion Banners:');
        console.log('  • wedding_occasion_banner.png');
        console.log('  • puja_occasion_banner.png');
        console.log('  • festive_occasion_banner.png\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('📖 See IMAGE_GENERATION_GUIDE.md for prompts');
        console.log('🎨 Generate these images and save them to:');
        console.log(`   ${TARGET_DIR}\n`);
        console.log('✅ 12 out of 16 images completed (75%)');
        console.log('⏳ 4 images remaining\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

copyGeneratedImages();
