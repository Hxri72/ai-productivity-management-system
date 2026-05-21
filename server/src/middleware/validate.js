import ApiError from "../utils/ApiError.js";

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    // Zod v4 uses .issues, Zod v3 uses .errors — handle both
    const issues = result.error.issues || result.error.errors || [];
    const errors = issues.map((e) => ({
      field: (e.path || []).join("."),
      message: e.message,
    }));
    throw new ApiError(400, "Validation failed", errors);
  }

  req.body = result.data;
  next();
};

export default validate;
