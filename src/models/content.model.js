const mongoose = require('mongoose');

const contentSettingsSchema = new mongoose.Schema({
    // Hero Section
    heroImage: { type: String, default: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80' },
    heroTitle: { type: String, default: 'The Art of the Weave: Timeless Silks for the Modern Heirloom' },
    heroSubtitle: { type: String, default: 'For weddings, pujas at home, and the most auspicious moments in a family’s journey.' },

    // Trust Banner
    bannerText: { type: String, default: 'Secured Online Payments • Insured Pan-India Shipping • Personal Quality Check' },
    showBanner: { type: Boolean, default: true },

    // Footer
    footerAbout: { type: String, default: 'Every drape from Avira arrives at your door after being personally inspected by our family to ensure the purity of the weave.' },
    footerEmail: { type: String, default: 'care@aviravastra.com' },
    whatsappNumber: { type: String, default: '+918780055674' },
    instagramUrl: { type: String, default: 'https://instagram.com/aviravastra' },

    // Global Settings
    showFloatingWhatsapp: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ContentSettings', contentSettingsSchema);
