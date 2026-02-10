const { z } = require('zod');

const orderSchema = z.object({
    body: z.object({
        items: z.array(z.object({
            product: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),
            name: z.string(),
            price: z.number().positive(),
            quantity: z.number().int().positive("Quantity must be at least 1")
        })).min(1, "Order must contain at least one item"),
        shippingAddress: z.object({
            address: z.string().min(5),
            city: z.string().min(2),
            state: z.string().min(2),
            pincode: z.string().length(6, "Pincode must be 6 digits")
        }),
        paymentMethod: z.enum(['ONLINE']),
        totalAmount: z.number().positive(),
        phone: z.string().regex(/^[0-9+]{10,15}$/, "Invalid phone number"),
        customerName: z.string().min(2),
        email: z.string().email("Please provide a valid email address for order confirmation")
    })
});


const updateStatusSchema = z.object({
    body: z.object({
        status: z.enum(['AWAITING_PAYMENT', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
    })
});

module.exports = { orderSchema, updateStatusSchema };
