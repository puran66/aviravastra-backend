require('dotenv').config();
const mongoose = require('mongoose');
const Occasion = require('./src/models/Occasion');
const Collection = require('./src/models/Collection');

const seedContent = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for content seeding...');

        // 1. Professional Occasions
        const occasions = [
            {
                title: 'Wedding Sarees',
                subtitle: 'Exquisite weaves for your most auspicious muhurat',
                slug: 'wedding-sarees',
                image: 'https://images.unsplash.com/photo-1583391733981-5acd1d5d4f88?w=800&q=80', // Replace with better if needed
                sortOrder: 1
            },
            {
                title: 'Festive & Celebration',
                subtitle: 'Radiant heritage for Diwali, Navratri and temple visits',
                slug: 'festive-wear',
                image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
                sortOrder: 2
            },
            {
                title: 'Puja & Rituals',
                subtitle: 'Sacred fabrics for Varalakshmi and Satyanarayan rituals',
                slug: 'puja-rituals',
                image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80',
                sortOrder: 3
            },
            {
                title: 'Family Functions',
                subtitle: 'Elegant weaves for Grah Pravesh, naming ceremonies and milestones',
                slug: 'family-functions',
                image: 'https://images.unsplash.com/photo-1621112904887-419379ce6824?w=800&q=80',
                sortOrder: 4
            },
            {
                title: 'Auspicious Gifting',
                subtitle: 'Thoughtful heritage for Haldi-kunku and bridal trousseaus',
                slug: 'gifting',
                image: 'https://images.unsplash.com/photo-1583391733912-3f1d248b8981?w=800&q=80',
                sortOrder: 5
            }

        ];

        // 2. Professional Collections
        const collections = [
            {
                title: 'New Arrivals',
                subtitle: 'Fresh off the looms - discover our latest heritage drops',
                slug: 'new-arrivals',
                image: 'https://images.unsplash.com/photo-1610189012906-400147fc890c?w=800&q=80',
                sortOrder: 1
            },
            {
                title: 'Heritage Weaves',
                subtitle: 'Timeless Kanjeevarams, Paithanis and Banarasis',
                slug: 'heritage-weaves',
                image: 'https://images.unsplash.com/photo-1583391733981-5acd1d5d4f88?w=800&q=80',
                sortOrder: 2
            },
            {
                title: 'Signature Collection',
                subtitle: 'One-of-a-kind masterpieces for extraordinary moments',
                slug: 'signature-series',
                image: 'https://images.unsplash.com/photo-1621112904887-419379ce6824?w=800&q=80',
                sortOrder: 3
            },
            {
                title: 'Best Sellers',
                subtitle: 'Loved by our patrons - the most coveted Avira weaves',
                slug: 'best-sellers',
                image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80',
                sortOrder: 4
            }
        ];

        // Clear existing to avoid duplicates during seed
        await Occasion.deleteMany({});
        await Collection.deleteMany({});

        await Occasion.insertMany(occasions);
        console.log('Processed Occasions');

        await Collection.insertMany(collections);
        console.log('Processed Collections');

        console.log('Professional content seeding completed!');
        process.exit();
    } catch (error) {
        console.error('Seeding error:', error.message);
        process.exit(1);
    }
};

seedContent();
