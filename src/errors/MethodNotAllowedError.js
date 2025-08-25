import statusCodes from "../statusCodes.js";
import { ProblemDetailsError } from "../problem-details-error.js";

export class METHOD_NOT_ALLOWED_ERROR extends ProblemDetailsError {
  constructor({ type, title, detail, instance, extra }) {
    super({
      type: type || "https://httpstatuses.io/405",
      title: title || "Method Not Allowed",
      detail: detail || "The requested method is not allowed for the resource",
      status: statusCodes.METHOD_NOT_ALLOWED,
      extra: extra,
      instance: instance,
    });
  }
}
