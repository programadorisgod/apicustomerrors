import statusCodes from "./statusCodes.js";
export class ProblemDetailsError extends Error {
  constructor({ type, title, status, detail, instance, errors, extra }) {
    super(detail);
    this.name = title || "ProblemDetailsError";
    this.type = type || "about:blank";
    this.status = status || statusCodes.INTERNAL_SERVER_ERROR;
    this.detail = detail || "An unexpected error occurred.";
    this.instance = instance || "";
    this.errors = errors || null;
    this.extra = extra || null;
    this.timestamp = new Date.toISOString();
  }

  toJSON() {
     const json =  {
      type: this.type,
      title: this.name,
      status: this.status,
      detail: this.detail,
      instance: this.instance,
      errors: this.errors,
      extra: this.extra,
      timestamp: this.timestamp,
    };

    if (this.instance) json.instance = this.instance;
    if (this.errors) json.errors = this.errors;
    if (this.extra) json.extra = this.extra;

    return json;
  }
}
