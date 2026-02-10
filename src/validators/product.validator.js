const { z } = require('zod');

const productSchema = z.object({
    body: z.object({
        name: z.string().min(3, "Name must be at least 3 characters"),
        description: z.string().min(10, "Description must be at least 10 characters"),
        price: z.number().positive("Price must be positive"),
        discountedPrice: z.number().nonnegative().optional(),
        category: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID"),
        weaveType: z.string().optional(),
        stock: z.number().int().nonnegative("Stock cannot be negative").default(1),
        tags: z.union([z.array(z.string()), z.string()]).optional(),
        images: z.array(z.string().url()).optional(),
    })
});

module.exports = { productSchema };
