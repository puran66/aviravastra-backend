require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

const mapping = {
    'Wedding': 'wedding-sarees',
    'Festive': 'festive-wear',
    'Puja': 'puja-rituals',
    'Family Function': 'family-functions',
    'Gifting': 'gifting',
    'New Arrivals': 'new-arrivals',
    'Heritage Weaves': 'heritage-weaves',
    'Best Sellers': 'best-sellers',
    'Signature Collection': 'signature-series'
};

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for product migration...');

        const products = await Product.find({});
        console.log(`Checking ${products.length} products...`);

        let updatedCount = 0;

        for (const product of products) {
            let changed = false;

            if (product.occasions && product.occasions.length > 0) {
                const newOccasions = product.occasions.map(occ => mapping[occ] || occ);
                if (JSON.stringify(newOccasions) !== JSON.stringify(product.occasions)) {
                    product.occasions = newOccasions;
                    changed = true;
                }
            }

            if (product.collections && product.collections.length > 0) {
                const newCollections = product.collections.map(col => mapping[col] || col);
                if (JSON.stringify(newCollections) !== JSON.stringify(product.collections)) {
                    product.collections = newCollections;
                    changed = true;
                }
            }

            if (changed) {
                await product.save();
                updatedCount++;
            }
        }

        console.log(`Migration completed! Updated ${updatedCount} products.`);
        process.exit();
    } catch (error) {
        console.error('Migration error:', error.message);
        process.exit(1);
    }
};

migrate();
