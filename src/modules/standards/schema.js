export const schema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Standards Equivalents Schema",
  "description": "Validation schema for API, ISO, GOST and GB/T standards lookup mapping.",
  "type": "array",
  "items": {
    "type": "object",
    "required": [
      "type",
      "equipment",
      "api",
      "iso",
      "gost",
      "gbt",
      "scope",
      "standard",
      "source",
      "revision",
      "verified_at"
    ],
    "properties": {
      "type": {
        "type": "string"
      },
      "equipment": {
        "type": "string"
      },
      "api": {
        "type": "string"
      },
      "iso": {
        "type": "string"
      },
      "gost": {
        "type": "string"
      },
      "gbt": {
        "type": "string"
      },
      "scope": {
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
