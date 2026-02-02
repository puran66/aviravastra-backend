const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        // Strip unvalidated fields by replacing with parsed results
        req.body = parsed.body || req.body;
        req.query = parsed.query || req.query;
        req.params = parsed.params || req.params;

        next();

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: (error.issues || error.errors || []).map((err) => ({
                    path: err.path.join('.'),
                    message: err.message,
                })),
            });
        }
        // Non-zod errors (like coding bugs) go to global handler
        next(error);
    }

};

module.exports = validate;
