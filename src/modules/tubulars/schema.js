export const schema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Tubulars Reference Schema",
  "description": "Schema for validation of casing, tubing, and drill pipe specifications.",
  "type": "array",
  "items": {
    "type": "object",
    "required": [
      "type",
      "od",
      "weight",
      "grade",
      "inner_dia",
      "drift_id",
      "burst",
      "collapse",
      "tensile",
      "standard",
      "source",
      "revision",
      "verified_at"
    ],
    "properties": {
      "type": {
        "type": "string",
        "enum": ["Tubing", "Casing", "Drill Pipe", "Бурильная", "НКТ", "Обсадная"]
      },
      "od": {
        "type": "number",
        "minimum": 0.5,
        "maximum": 30.0
      },
      "weight": {
        "type": "number",
        "minimum": 1.0,
        "maximum": 200.0
      },
      "grade": {
        "type": "string",
        "minLength": 2
      },
      "inner_dia": {
        "type": "number",
        "minimum": 0.1
      },
      "drift_id": {
        "type": "number",
        "minimum": 0.1
      },
      "burst": {
        "type": "integer",
        "minimum": 500
      },
      "collapse": {
        "type": "integer",
        "minimum": 500
      },
      "tensile": {
        "type": "integer",
        "minimum": 1000
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
        "type": "string",
        "pattern": "^\\d{4}-\\d{2}$"
      }
    }
  }
};
export default schema;
