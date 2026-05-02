// export const validateDTO = (schema) => {
//   return function(req, res, nextStep) {
//     try {
//       schema.parse(req.body);
//       // Explicitly invoke the middleware chain
//       return nextStep(); 
//     } catch (error) {
//       if (error.issues) {
//         return res.status(400).json({ 
//           errors: error.issues.map(e => ({
//             field: e.path[0],
//             message: e.message
//           })) 
//         });
//       }
//       return res.status(400).json({ message: "Validation error" });
//     }
//   };
// };

export const validateDTO = (schema) => {
  return function (req, res, next) {
    try {
      // req.body is populated by express.json() for JSON
      // or by multer for multipart/form-data — multer MUST run before this
      const result = schema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          errors: result.error.issues.map(e => ({
            field:   e.path[0],
            message: e.message,
          })),
        });
      }

      next();
    } catch (error) {
      return res.status(400).json({ error: 'Validation error' });
    }
  };
};
