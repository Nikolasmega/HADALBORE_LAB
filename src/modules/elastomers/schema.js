export const schema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Elastomers Schema",
  "description": "Validation schema for packing elements, O-rings, and sealing compounds.",
  "type": "array",
  "items": {
    "type": "object",
    "required": [
      "type",
      "material",
      "pressure_rating_psi",
      "temp_range",
      "compatibility",
      "limitations",
      "alternatives",
      "standard",
      "source",
      "revision",
      "verified_at"
    ],
    "properties": {
      "type": {
        "type": "string"
      },
      "material": {
        "type": "string"
      },
      "pressure_rating_psi": {
        "type": "integer"
      },
      "temp_range": {
        "type": "string"
      },
      "compatibility": {
        "type": "string"
      },
      "limitations": {
        "type": "string"
      },
      "alternatives": {
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
