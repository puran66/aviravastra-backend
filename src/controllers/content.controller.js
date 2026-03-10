const ContentSettings = require('../models/content.model');

const getContent = async (req, res) => {
    try {
        let content = await ContentSettings.findOne().select('-__v').lean();
        if (!content) {
            // Create default if not exists and return
            content = await ContentSettings.create({});
        }

        // Homepage content is public + rarely changes — cache for 60 s
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');
        res.json(content);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching content settings' });
    }
};

const updateContent = async (req, res) => {
    try {
        let content = await ContentSettings.findOne();
        if (!content) {
            content = new ContentSettings(req.body);
        } else {
            Object.assign(content, req.body);
        }
        await content.save();
        res.json(content);
    } catch (err) {
        res.status(500).json({ message: 'Error updating content settings' });
    }
};

module.exports = {
    getContent,
    updateContent
};
