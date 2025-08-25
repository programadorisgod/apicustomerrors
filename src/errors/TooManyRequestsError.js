import statusCodes from "../statusCodes.js";
import { ProblemDetailsError } from "../problem-details-error.js";

export class TOO_MANY_REQUESTS_ERROR extends ProblemDetailsError {
  constructor({ type, title, detail, extra, instance }) {
    super({
      type: type || "https://httpstatuses.io/429",
      title: title || "Too Many Requests",
      detail:
        detail || "You have sent too many requests in a given amount of time.",
      status: statusCodes.TOO_MANY_REQUESTS,
      extra: extra,
      instance: instance,
    });
  }
}
