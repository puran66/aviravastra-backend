require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Category = require('./src/models/Category');

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for product seeding...');

        // Get category IDs
        const weddingCategory = await Category.findOne({ name: 'Wedding Sarees' });
        const pujaCategory = await Category.findOne({ name: 'Puja & Temple Sarees' });

        if (!weddingCategory || !pujaCategory) {
            console.error('Categories not found. Run seed.js first!');
            process.exit(1);
        }

        const sampleProducts = [
            {
                name: 'Royal Kanjeevaram Silk - Maroon & Gold',
                description: 'Exquisite pure silk Kanjeevaram saree with traditional temple border and rich zari work. Perfect for weddings and auspicious occasions.',
                price: 18500,
                discountedPrice: 16500,
                category: weddingCategory._id,
                weaveType: 'Kanjeevaram',
                stock: 3,
                tags: ['pure-silk', 'zari', 'bridal'],
                occasions: ['wedding', 'festive'],
                collections: ['heritage-weaves', 'signature-series'],
                images: [
                    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
                    'https://images.unsplash.com/photo-1583391733981-5acd1d5d4f88?w=800&q=80'
                ],
                isActive: true
            },
            {
                name: 'Classic Banarasi - Emerald Green',
                description: 'Handwoven Banarasi silk saree with intricate buti work and golden border. A timeless piece from the holy city of Varanasi.',
                price: 22000,
                discountedPrice: 19500,
                category: weddingCategory._id,
                weaveType: 'Banarasi',
                stock: 2,
                tags: ['pure-silk', 'handwoven', 'traditional'],
                occasions: ['wedding', 'puja'],
                collections: ['heritage-weaves', 'best-sellers'],
                images: [
                    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80',
                    'https://images.unsplash.com/photo-1621112904887-419379ce6824?w=800&q=80'
                ],
                isActive: true
            },
            {
                name: 'Temple Border Paithani - Peacock Blue',
                description: 'Authentic Paithani saree with traditional peacock motifs and pure gold zari. Handcrafted by master weavers from Maharashtra.',
                price: 28000,
                category: pujaCategory._id,
                weaveType: 'Paithani',
                stock: 1,
                tags: ['pure-silk', 'peacock-motif', 'limited-edition'],
                occasions: ['puja', 'family-functions'],
                collections: ['signature-series', 'new-arrivals'],
                images: [
                    'https://images.unsplash.com/photo-1583391733912-3f1d248b8981?w=800&q=80',
                    'https://images.unsplash.com/photo-1610189012906-400147fc890c?w=800&q=80'
                ],
                isActive: true
            },
            {
                name: 'Gadwal Cotton Silk - Mustard Yellow',
                description: 'Lightweight Gadwal saree perfect for daily puja and temple visits. Features traditional checks and contrast border.',
                price: 8500,
                discountedPrice: 7500,
                category: pujaCategory._id,
                weaveType: 'Gadwal',
                stock: 5,
                tags: ['cotton-silk', 'lightweight', 'daily-wear'],
                occasions: ['puja', 'festive'],
                collections: ['new-arrivals'],
                images: [
                    'https://images.unsplash.com/photo-1621112904887-419379ce6824?w=800&q=80'
                ],
                isActive: true
            }
        ];

        // Clear existing products (optional - remove if you want to keep existing)
        await Product.deleteMany({});
        console.log('Cleared existing products');

        // Insert sample products
        const createdProducts = await Product.insertMany(sampleProducts);
        console.log(`✅ Created ${createdProducts.length} sample products`);

        console.log('\nSample Products:');
        createdProducts.forEach(p => {
            console.log(`- ${p.name} (₹${p.discountedPrice || p.price}) - Stock: ${p.stock}`);
        });

        console.log('\n✨ Product seeding completed!');
        process.exit();
    } catch (error) {
        console.error('Product seeding error:', error.message);
        process.exit(1);
    }
};

seedProducts();
