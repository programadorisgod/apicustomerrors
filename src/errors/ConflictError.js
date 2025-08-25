import statusCodes from "../statusCodes.js";
import { ProblemDetailsError } from "../problem-details-error.js";

export class CONFLICT_ERROR extends ProblemDetailsError {
  constructor({ type, title, detail, instance, extra }) {
    super({
      type: type || "https://httpstatuses.io/409",
      title: title || "Conflict",
      detail: detail || "Conflict with current state of the resource",
      status: statusCodes.CONFLICT,
      extra: extra,
      instance: instance,
    });
  }
}
