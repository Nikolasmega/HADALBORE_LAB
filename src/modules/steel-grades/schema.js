export const schema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Acidic Environments Schema",
  "description": "Validation schema for metal corrosion limits in H2S and CO2 environments.",
  "type": "array",
  "items": {
    "type": "object",
    "required": [
      "type",
      "fluid",
      "gradient",
      "equivalent_sg",
      "standard",
      "source",
      "revision",
      "verified_at"
    ],
    "properties": {
      "type": {
        "type": "string"
      },
      "fluid": {
        "type": "string"
      },
      "gradient": {
        "type": "string"
      },
      "equivalent_sg": {
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
