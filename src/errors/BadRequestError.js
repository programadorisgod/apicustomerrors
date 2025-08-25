import statusCodes from "../statusCodes.js";
import { ProblemDetailsError } from "../problem-details-error.js";

export class BAD_REQUEST_ERROR extends ProblemDetailsError {
  constructor({ type, title, detail, extra }) {
    super({
      type: type || "https://httpstatuses.io/400",
      title: title || "Bad Request",
      detail:
        detail ||
        "The server cannot process requests with malformed syntax or invalid data.",
      status: statusCodes.BAD_REQUEST,
      extra: extra,
    });
  }
}
