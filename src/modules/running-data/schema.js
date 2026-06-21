export const schema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Running and Operational Data Schema",
  "description": "Validation schema for hydrostatic reference gradients and brine specifications.",
  "type": "array",
  "items": {
    "type": "object",
    "required": [
      "type",
      "name",
      "standards",
      "sources",
      "lastUpdated",
      "revisionDate"
    ],
    "properties": {
      "type": {
        "type": "string"
      },
      "name": {
        "type": "string"
      },
      "standards": {
        "type": "array",
        "items": { "type": "string" }
      },
      "sources": {
        "type": "array",
        "items": { "type": "string" }
      }
    }
  }
};
export default schema;
