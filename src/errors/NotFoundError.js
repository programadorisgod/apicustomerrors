import statusCodes from "../statusCodes.js";
import { ProblemDetailsError } from "../problem-details-error.js";

export class NOT_FOUND_ERROR extends ProblemDetailsError {
  constructor({ type, title, detail, extra }) {
    super({
      type: type || "https://httpstatuses.io/404",
      title: title || "Not Found",
      detail: detail || "The requested resource could not be found.",
      status: statusCodes.NOT_FOUND,
      extra: extra,
    });
  }
}
