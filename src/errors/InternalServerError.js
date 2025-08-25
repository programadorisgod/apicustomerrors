import statusCodes from "../statusCodes.js";
import { ProblemDetailsError } from "../problem-details-error.js";

export class INTERNAL_SERVER_ERROR extends ProblemDetailsError {
  constructor({ type, title, detail, extra }) {
    super({
      type: type || "https://httpstatuses.io/500",
      title: type || "Internal Server Error",
      detail: detail || "An unexpected error occurred on the server",
      status: statusCodes.INTERNAL_SERVER_ERROR,
      extra: extra,
    });
  }
}
