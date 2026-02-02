const axios = require('axios');

/**
 * Basic WhatsApp helper. 
 * In a real production apps, you might use Twilio or a local Indian gateway like Interakt/Wati.
 * This is a placeholder function to show where the logic goes.
 */
const sendWhatsAppNotification = async (order) => {
    try {
        const message = `*New Order Prepared!* \n\n` +
            `Order ID: ${order.orderId}\n` +
            `Customer: ${order.customerName}\n` +
            `Status: ${order.orderStatus}\n` +
            `Method: ${order.paymentMethod}\n` +
            `Amount: ₹${order.totalAmount}\n\n` +
            `Check admin panel for details.`;

        console.log('--- WHATSAPP NOTIFICATION ---');
        console.log(`To Admin: ${process.env.WHATSAPP_NUMBER}`);
        console.log(message);
        console.log('-----------------------------');

        // Example API call (commented out)
        /*
        await axios.post('THIRD_PARTY_API_URL', {
          phone: process.env.WHATSAPP_NUMBER,
          message: message,
          apikey: process.env.WHATSAPP_API_KEY
        });
        */
    } catch (error) {
        console.error('WhatsApp notification error:', error.message);
    }
};

module.exports = { sendWhatsAppNotification };
