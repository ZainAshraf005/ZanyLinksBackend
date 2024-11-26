const validator = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync(req.body);
    next();
  } catch (err) {
    const status = 422;
    const message = err.errors[0].message;
    const error = new Error(message);
    error.status = status;
    next(error);
  }
};

export default validator;
