import statusCodes from "../statusCodes.js";
import { ProblemDetailsError } from "../problem-details-error.js";

export class UNAUTHORIZED_ERROR extends ProblemDetailsError {
  constructor({ type, title, detail, instance, extra }) {
    super({
      type: type || "https://httpstatuses.io/401",
      title: title || "Unauthorized",
      detail:
        detail ||
        "Authentication is required and has failed or has not yet been provided.",
      status: statusCodes.UNAUTHORIZED,
      extra: extra,
      instance: instance,
    });
  }
}
