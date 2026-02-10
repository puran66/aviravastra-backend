const ContentSettings = require('../models/content.model');

const getContent = async (req, res) => {
    try {
        let content = await ContentSettings.findOne();
        if (!content) {
            // Create default if not exists
            content = await ContentSettings.create({});
        }
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
