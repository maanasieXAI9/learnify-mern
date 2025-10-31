const TryCatch = (handler) => {
  return async (req, res, next) => {  // Corrected here: `res` instead of `resizeBy`
    try {
      await handler(req, res, next);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };
};

export default TryCatch;
