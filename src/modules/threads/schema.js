export const schema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Threads Reference Schema",
  "description": "Validation schema for thread profiles, connection limits, and makeup loss values.",
  "type": "array",
  "items": {
    "type": "object",
    "required": [
      "type",
      "connection_type",
      "torque_range",
      "turns",
      "makeup_loss",
      "standoff",
      "drift",
      "seal_type",
      "standard",
      "source",
      "revision",
      "verified_at"
    ],
    "properties": {
      "type": {
        "type": "string",
        "enum": ["Thread", "Connection", "Резьба", "Соединение"]
      },
      "connection_type": {
        "type": "string"
      },
      "torque_range": {
        "type": "string"
      },
      "turns": {
        "type": "string"
      },
      "makeup_loss": {
        "type": "string"
      },
      "standoff": {
        "type": "string"
      },
      "drift": {
        "type": "string"
      },
      "seal_type": {
        "type": "string"
      },
      "standard": {
        "type": "string"
      },
      "source": {
        "type": "string"
      },
      "revision": {
        "type": "string"
      },
      "verified_at": {
        "type": "string"
      }
    }
  }
};
export default schema;
