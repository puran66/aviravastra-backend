const nodemailer = require('nodemailer');

const sendOrderEmail = async (order) => {
    if (process.env.ENABLE_EMAIL !== 'true') return;

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const itemsHtml = order.items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
            </tr>
        `).join('');

        const mailOptions = {
            from: `"AVIRAVASTRA" <${process.env.SMTP_USER}>`,
            to: order.email,
            subject: `Your AVIRAVASTRA Order is Confirmed - ${order.orderId}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #800000; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">AVIRAVASTRA</h1>
                        <p style="margin: 5px 0 0; opacity: 0.8;">Boutique Saree House</p>
                    </div>
                    <div style="padding: 30px; color: #333;">
                        <h2 style="color: #800000; margin-top: 0;">Order Confirmed!</h2>
                        <p>Hello ${order.customerName},</p>
                        <p>Thank you for choosing AVIRAVASTRA. Your order has been successfully placed and is being personally processed by our team.</p>
                        
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
                            <p style="margin: 0;"><strong>Order ID:</strong> ${order.orderId}</p>
                            <p style="margin: 5px 0 0;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>

                        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                            <thead>
                                <tr style="background-color: #f2f2f2;">
                                    <th style="padding: 10px; text-align: left;">Item</th>
                                    <th style="padding: 10px; text-align: center;">Qty</th>
                                    <th style="padding: 10px; text-align: right;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total Paid:</td>
                                    <td style="padding: 10px; text-align: right; font-weight: bold; color: #800000;">₹${order.totalAmount}</td>
                                </tr>
                            </tfoot>
                        </table>

                        <div style="margin: 20px 0;">
                            <h3 style="font-size: 16px; border-bottom: 2px solid #800000; padding-bottom: 5px; display: inline-block;">Shipping Address</h3>
                            <p style="margin: 10px 0; line-height: 1.5;">
                                ${order.address}<br>
                                ${order.city}, ${order.state} - ${order.pincode}
                            </p>
                        </div>

                        <div style="text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                            <p style="font-size: 14px; color: #666;">For any assistance, please reach us on WhatsApp</p>
                            <a href="https://wa.me/${process.env.WHATSAPP_NUMBER}" style="display: inline-block; background-color: #25D366; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Contact Support</a>
                        </div>
                    </div>
                    <div style="background-color: #f8f8f8; padding: 15px; text-align: center; font-size: 12px; color: #999;">
                        &copy; ${new Date().getFullYear()} AVIRAVASTRA. All rights reserved.
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Email sending failed:', error);
        // We do not throw error here to avoid blocking the order flow
    }
};

module.exports = { sendOrderEmail };
