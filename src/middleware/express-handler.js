import statusCodes from "../statusCodes.js";
import { ProblemDetailsError } from "../problem-details-error.js";

export function problemDetailsHandler() {
  return (err, req, res, next) => {
    if (err instanceof ProblemDetailsError) {
      const response = err.toJSON();
      response.instance = req.originalUrl;
      res.status(err.status).json(response);
    }

    return res.status(500).json({
      type: "about:blank",
      title: "Internal Server Error",
      status: statusCodes.INTERNAL_SERVER_ERROR,
      detail: err.message,
      instance: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  };
}
