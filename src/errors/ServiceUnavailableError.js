import statusCodes from "../statusCodes.js";
import { ProblemDetailsError } from "../problem-details-error.js";

export class SERVICE_UNAVAILABLE_ERROR extends ProblemDetailsError {
  constructor({ type, title, detail, instance, extra }) {
    super({
      type: type || "https://httpstatuses.io/503",
      title: title || "Service Unavailable",
      detail:
        detail ||
        "The server is currently unable to handle the request due to temporary overloading or maintenance of the server.",
      status: statusCodes.SERVICE_UNAVAILABLE,
      extra: extra,
      instance: instance,
    });
  }
}
