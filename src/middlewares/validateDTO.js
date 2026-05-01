export const validateDTO = (schema) => {
  return function(req, res, nextStep) {
    try {
      schema.parse(req.body);
      // Explicitly invoke the middleware chain
      return nextStep(); 
    } catch (error) {
      if (error.issues) {
        return res.status(400).json({ 
          errors: error.issues.map(e => ({
            field: e.path[0],
            message: e.message
          })) 
        });
      }
      return res.status(400).json({ message: "Validation error" });
    }
  };
};
