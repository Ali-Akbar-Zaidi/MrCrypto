const validate = (schema) => async (req, res, next) => {
    try {
        const parseBody = await schema.parseAsync(req.body);
        req.body = parseBody;
        next();
    } catch (err) {
        const errors = err.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
        }));
        return res.status(400).json({
            message: "Validation failed",
            errors,
        });
    }
};

module.exports = validate;
