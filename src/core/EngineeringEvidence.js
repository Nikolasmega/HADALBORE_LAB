/**
 * EngineeringEvidence model class.
 * Standardizes source traceability, confidence levels, and applicability limits.
 */
export class EngineeringEvidence {
  constructor(data = {}) {
    this.sources = data.sources || [];
    this.confidenceLevel = data.confidenceLevel || 'Reference Only';
    this.lastUpdated = data.lastUpdated || 'N/A';
    this.revisionDate = data.revisionDate || 'N/A';
    this.applicabilityScope = data.applicabilityScope || '';
    this.limitationNotes = data.limitationNotes || '';
  }

  /**
   * Factory method to normalize and construct an EngineeringEvidence instance from a database object.
   * 
   * @param {Object} obj - Raw record object from database
   * @returns {EngineeringEvidence} Normalized evidence instance
   */
  static fromObject(obj) {
    if (!obj) return new EngineeringEvidence();
    
    // Resolve limitation notes from various database formats
    let limitationNotes = obj.limitationNotes || '';
    if (!limitationNotes && obj.limitations && Array.isArray(obj.limitations)) {
      limitationNotes = obj.limitations.join(', ');
    }
    if (!limitationNotes && obj.why_avoided && Array.isArray(obj.why_avoided)) {
      limitationNotes = obj.why_avoided.join(', ');
    }
    if (!limitationNotes) {
      limitationNotes = 'Reference estimate only. Not for safety-critical decisions.';
    }

    // Resolve applicability scope from various database formats
    let applicabilityScope = obj.applicabilityScope || '';
    if (!applicabilityScope && obj.applications && Array.isArray(obj.applications)) {
      applicabilityScope = obj.applications.join(', ');
    }
    if (!applicabilityScope && obj.typical_applications && Array.isArray(obj.typical_applications)) {
      applicabilityScope = obj.typical_applications.join(', ');
    }
    if (!applicabilityScope) {
      applicabilityScope = 'General engineering lookup and reference.';
    }

    // Build raw source list
    let sources = obj.sources;
    if (!sources && obj.source) {
      sources = [obj.source];
    }
    if (!sources || !Array.isArray(sources)) {
      sources = [];
    }

    return new EngineeringEvidence({
      sources,
      confidenceLevel: obj.confidenceLevel || 'Reference Only',
      lastUpdated: obj.lastUpdated || 'N/A',
      revisionDate: obj.revisionDate || 'N/A',
      applicabilityScope,
      limitationNotes
    });
  }
}

export default EngineeringEvidence;
