require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./src/models/Admin');
const Category = require('./src/models/Category');
const slugify = require('slugify');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // 1. Create Default Admin
        const adminExists = await Admin.findOne({ email: 'admin@gmail.com' });
        if (!adminExists) {
            await Admin.create({
                email: 'admin@gmail.com',
                password: 'Admin@123', // Will be hashed by pre-save hook
            });
            console.log('Admin created: admin@gmail.com / Admin@123');
        }

        // 2. Create Predefined Categories
        const categories = [
            // Occasions
            { name: 'Wedding Sarees', type: 'OCCASION' },
            { name: 'Puja & Temple Sarees', type: 'OCCASION' },
            { name: 'Family Functions', type: 'OCCASION' },
            { name: 'Auspicious Gifting', type: 'OCCASION' },
            // Weaves
            { name: 'Kanjeevaram', type: 'WEAVE' },
            { name: 'Paithani', type: 'WEAVE' },
            { name: 'Banarasi', type: 'WEAVE' },
            { name: 'Gadwal', type: 'WEAVE' },
            { name: 'Pochampally', type: 'WEAVE' },
        ];

        for (const cat of categories) {
            const exists = await Category.findOne({ name: cat.name });
            if (!exists) {
                await Category.create({
                    ...cat,
                    slug: slugify(cat.name, { lower: true }),
                });
                console.log(`Category created: ${cat.name}`);
            }
        }

        console.log('Seeding completed!');
        process.exit();
    } catch (error) {
        console.error('Seeding error:', error.message);
        process.exit(1);
    }
};

seedData();
