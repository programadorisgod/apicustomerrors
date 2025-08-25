import statusCodes from "../statusCodes.js";
import { ProblemDetailsError } from "../problem-details-error.js";

export class UNSUPPORTED_MEDIA_TYPE_ERROR extends ProblemDetailsError {
  constructor({ type, title, detail, instance, extra }) {
    super({
      type: type || "https://httpstatuses.io/415",
      title: title || "Unsupported Media Type",
      detail:
        detail ||
        "The request entity has a media type which the server or resource does not support.",
      status: statusCodes.UNSUPPORTED_MEDIA_TYPE,
      extra: extra,
      instance: instance,
    });
  }
}
