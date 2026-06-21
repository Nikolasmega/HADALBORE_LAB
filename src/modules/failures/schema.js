export const schema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Failures Encyclopedia Schema",
  "description": "Validation schema for oilfield equipment and material failure modes.",
  "type": "array",
  "items": {
    "type": "object",
    "required": [
      "id",
      "type",
      "name",
      "description",
      "symptoms",
      "root_causes",
      "trigger_environments",
      "typical_metallurgy",
      "prevention_methods",
      "field_troubleshooting",
      "sources",
      "confidenceLevel",
      "lastUpdated"
    ],
    "properties": {
      "id": { "type": "string" },
      "type": { "type": "string" },
      "name": { "type": "string" },
      "aliases": {
        "type": "array",
        "items": { "type": "string" }
      },
      "description": { "type": "string" },
      "standards": {
        "type": "array",
        "items": { "type": "string" }
      },
      "temperature": {
        "type": "object",
        "properties": {
          "min": { "type": "number" },
          "max": { "type": "number" },
          "unit": { "type": "string" }
        }
      },
      "pressure": {
        "type": "object",
        "properties": {
          "min": { "type": "number" },
          "max": { "type": "number" },
          "unit": { "type": "string" }
        }
      },
      "chemicalComposition": { "type": "array" },
      "chemicalCompatibility": { "type": "array" },
      "usedInEquipment": {
        "type": "array",
        "items": { "type": "string" }
      },
      "advantages": { "type": "array" },
      "limitations": { "type": "array" },
      "applications": { "type": "array" },
      "typical_applications": {
        "type": "array",
        "items": { "type": "string" }
      },
      "typical_failures": {
        "type": "array",
        "items": { "type": "string" }
      },
      "sources": {
        "type": "array",
        "items": { "type": "string" }
      },
      "lastUpdated": { "type": "string" },
      "revisionDate": { "type": "string" },
      "why_selected": {
        "type": "array",
        "items": { "type": "string" }
      },
      "why_avoided": {
        "type": "array",
        "items": { "type": "string" }
      },
      "confidenceLevel": { "type": "string", "enum": ["High", "Medium", "Reference Only"] },
      
      // Custom Failure details fields
      "symptoms": { "type": "string" },
      "root_causes": { "type": "string" },
      "trigger_environments": { "type": "string" },
      "typical_metallurgy": { "type": "string" },
      "prevention_methods": { "type": "string" },
      "field_troubleshooting": { "type": "string" }
    }
  }
};
export default schema;
