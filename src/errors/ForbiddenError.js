import statusCodes from "../statusCodes.js";
import { ProblemDetailsError } from "../problem-details-error.js";

export class FORBIDDEN_ERROR extends ProblemDetailsError {
  constructor({ type, title, detail, extra }) {
    super({
      type: "https://httpstatuses.io/403",
      title: "Forbidden",
      detail: detail || "You do not have permission to access this resource.",
      status: statusCodes.FORBIDDEN,
      extra: extra,
    });
  }
}
