import statusCodes from "../statusCodes.js";
import { ProblemDetailsError } from "../problem-details-error.js";

export class VALIDATION_ERROR extends ProblemDetailsError {
  constructor({ type, title, detail, errors, extra }) {
    super({
      type: type || "https://httpstatuses.io/422",
      title: title || "Unprocessable Entity",
      detail:
        detail ||
        "The request was well-formed but was unable to be followed due to semantic errors.",
      status: statusCodes.UNPROCESSABLE_ENTITY,
      errors,
    });
  }
}
