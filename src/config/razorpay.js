const Razorpay = require('razorpay');

// Lazy singleton — instantiated on first use, after dotenv.config() has run
let _instance;
const razorpay = new Proxy({}, {
    get(_, prop) {
        if (!_instance) {
            _instance = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
            });
        }
        return _instance[prop];
    }
});

module.exports = razorpay;

