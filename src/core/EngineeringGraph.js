/**
 * Lightweight in-memory relationship graph system.
 * Connects engineering entities bidirectionally with fast Map-based lookups.
 */
export class EngineeringGraph {
  constructor() {
    this.adjacencyList = new Map(); // key: entityId, value: Map of (relation -> Set of targetIds)
    this.initializeGraph();
  }

  /**
   * Add a bidirectional relation edge between two entities.
   * 
   * @param {string} sourceId 
   * @param {string} relation 
   * @param {string} targetId 
   */
  addEdge(sourceId, relation, targetId) {
    this._addDirectEdge(sourceId, relation, targetId);

    // Auto-resolve reverse relation for bidirectionality
    let revRelation = relation;
    if (relation === 'used_in') revRelation = 'employs';
    else if (relation === 'employs') revRelation = 'used_in';
    else if (relation === 'governs') revRelation = 'governed_by';
    else if (relation === 'governed_by') revRelation = 'governs';
    else if (relation === 'has_grade') revRelation = 'belongs_to';
    else if (relation === 'belongs_to') revRelation = 'has_grade';
    else if (relation === 'compatible_with') revRelation = 'compatible_with';

    this._addDirectEdge(targetId, revRelation, sourceId);
  }

  _addDirectEdge(sourceId, relation, targetId) {
    if (!this.adjacencyList.has(sourceId)) {
      this.adjacencyList.set(sourceId, new Map());
    }
    const relationsMap = this.adjacencyList.get(sourceId);
    if (!relationsMap.has(relation)) {
      relationsMap.set(relation, new Set());
    }
    relationsMap.get(relation).add(targetId);
  }

  /**
   * Retrieves all related items grouped by relation type.
   * 
   * @param {string} entityId 
   * @returns {Map<string, Set<string>>}
   */
  getRelated(entityId) {
    return this.adjacencyList.get(entityId) || new Map();
  }

  /**
   * Internal database initialization of core engineering links.
   */
  initializeGraph() {
    // Steels and Tubulars
    this.addEdge('steel_grade_j55', 'used_in', 'tubing_2375_j55');
    this.addEdge('steel_grade_j55', 'used_in', 'casing_13375_j55');
    this.addEdge('steel_grade_k55', 'used_in', 'casing_20000_k55');
    this.addEdge('steel_grade_n80_1', 'used_in', 'casing_9625_l80');
    this.addEdge('steel_grade_n80q', 'used_in', 'casing_9625_l80');
    this.addEdge('steel_grade_l80_1', 'used_in', 'tubing_2875_l80');
    this.addEdge('steel_grade_l80_13cr', 'used_in', 'tubing_2875_l80');
    this.addEdge('steel_grade_c90', 'used_in', 'tubing_3500_t95');
    this.addEdge('steel_grade_t95', 'used_in', 'tubing_3500_t95');
    this.addEdge('steel_grade_l80', 'used_in', 'tubing_2875_l80');
    this.addEdge('steel_grade_l80', 'used_in', 'casing_9625_l80');
    this.addEdge('steel_grade_p110', 'used_in', 'tubing_4500_p110');
    this.addEdge('steel_grade_p110', 'used_in', 'casing_7000_p110');
    this.addEdge('steel_grade_q125', 'used_in', 'casing_5500_q125');
    this.addEdge('steel_grade_vm125hc', 'used_in', 'casing_5500_q125');
    this.addEdge('steel_grade_l80', 'used_in', 'casing_4500_l80');
    this.addEdge('steel_grade_l80', 'used_in', 'casing_7000_l80');
    this.addEdge('steel_grade_p110', 'used_in', 'casing_9625_p110');
    this.addEdge('steel_grade_n80_1', 'used_in', 'casing_13375_n80');
    this.addEdge('steel_grade_j55', 'used_in', 'tubing_2875_j55');
    this.addEdge('steel_grade_l80', 'used_in', 'tubing_3500_l80');
    this.addEdge('steel_grade_13cr', 'used_in', 'acid_sour_gas_13cr');
    this.addEdge('steel_grade_super_13cr', 'used_in', 'acid_sour_gas_13cr');
    this.addEdge('steel_grade_duplex', 'used_in', 'acid_sour_gas_13cr');
    this.addEdge('steel_grade_25cr', 'used_in', 'acid_sour_gas_13cr');
    this.addEdge('steel_grade_28cr', 'used_in', 'acid_sour_gas_13cr');

    // Threads and Tubulars
    this.addEdge('thread_eue_2875', 'used_in', 'tubing_2875_l80');
    this.addEdge('thread_btc_9625', 'used_in', 'casing_9625_l80');
    this.addEdge('thread_ottm_gost', 'used_in', 'casing_9625_l80');
    this.addEdge('thread_ottg_gost', 'used_in', 'casing_9625_l80');
    this.addEdge('thread_vam_top', 'used_in', 'tubing_2875_l80');
    this.addEdge('thread_vam_top', 'used_in', 'tubing_3500_t95');
    this.addEdge('thread_tenaris_blue', 'used_in', 'casing_7000_p110');
    this.addEdge('thread_tmk_up', 'used_in', 'tubing_2875_l80');
    this.addEdge('thread_tp_cq', 'used_in', 'tubing_4500_p110');
    this.addEdge('thread_vam_21', 'used_in', 'tubing_4500_p110');
    this.addEdge('thread_hydril_wedge', 'used_in', 'casing_9625_l80');
    this.addEdge('thread_vam_ht', 'used_in', 'tubing_3500_t95');
    this.addEdge('thread_blue_dopeless', 'used_in', 'casing_7000_p110');
    this.addEdge('thread_fox', 'used_in', 'tubing_2875_l80');
    this.addEdge('thread_bear', 'used_in', 'casing_9625_l80');
    this.addEdge('thread_atlas_bradford', 'used_in', 'tubing_2375_j55');
    this.addEdge('thread_hydril_ph6', 'used_in', 'tubing_2875_l80');
    this.addEdge('thread_hydril_cs', 'used_in', 'tubing_2875_l80');
    this.addEdge('thread_xt', 'used_in', 'drillpipe_4500_x95');

    // Elastomers and Tubulars/Environments
    this.addEdge('elastomer_hnbr', 'compatible_with', 'tubing_2875_l80');
    this.addEdge('elastomer_nbr_nitrile', 'compatible_with', 'tubing_2375_j55');
    this.addEdge('elastomer_viton_fkm', 'compatible_with', 'steel_grade_13cr');
    this.addEdge('elastomer_kalrez_ffkm', 'compatible_with', 'steel_grade_inconel_718');
    this.addEdge('elastomer_teflon_ptfe', 'compatible_with', 'steel_grade_q125');
    this.addEdge('elastomer_aflas', 'compatible_with', 'steel_grade_duplex');
    this.addEdge('elastomer_epdm', 'compatible_with', 'steel_grade_p110');
    this.addEdge('elastomer_peek', 'compatible_with', 'steel_grade_25cr');
    this.addEdge('elastomer_pu', 'compatible_with', 'steel_grade_j55');
    this.addEdge('elastomer_xnbr', 'compatible_with', 'steel_grade_k55');

    // Standards and Tubulars/Steels
    this.addEdge('standard_casing_tubing', 'governs', 'tubing_2875_l80');
    this.addEdge('standard_casing_tubing', 'governs', 'casing_7000_p110');
    this.addEdge('standard_casing_tubing', 'governs', 'steel_grade_l80');
    this.addEdge('standard_casing_tubing', 'governs', 'casing_4500_l80');
    this.addEdge('standard_casing_tubing', 'governs', 'casing_7000_l80');
    this.addEdge('standard_casing_tubing', 'governs', 'casing_9625_p110');
    this.addEdge('standard_casing_tubing', 'governs', 'casing_13375_n80');
    this.addEdge('standard_casing_tubing', 'governs', 'tubing_2875_j55');
    this.addEdge('standard_casing_tubing', 'governs', 'tubing_3500_l80');
    this.addEdge('standard_drill_pipe', 'governs', 'drillpipe_4500_x95');
    this.addEdge('standard_drill_pipe', 'governs', 'drillpipe_5000_s135');
    this.addEdge('standard_drill_pipe', 'governs', 'drillpipe_5000_g105');
    this.addEdge('standard_api_5ct', 'governs', 'steel_grade_j55');
    this.addEdge('standard_nace_mr0175', 'governs', 'steel_grade_l80');

    // Environments, Fluids and PT References
    this.addEdge('acid_hcl_carbon_steel', 'compatible_with', 'steel_grade_l80');
    this.addEdge('acid_sour_gas_13cr', 'compatible_with', 'steel_grade_13cr');
    this.addEdge('fluid_nacl_brine', 'compatible_with', 'tubing_2375_j55');
    this.addEdge('fluid_cacl2_brine', 'compatible_with', 'tubing_2875_l80');
    this.addEdge('pt_fresh_water_gradient', 'compatible_with', 'tubing_2375_j55');
    this.addEdge('pt_salt_water_gradient', 'compatible_with', 'casing_7000_p110');

    // Failures and Steels/Threads/Elastomers
    this.addEdge('failure_ssc', 'compatible_with', 'steel_grade_l80');
    this.addEdge('failure_hic', 'compatible_with', 'steel_grade_j55');
    this.addEdge('failure_sohic', 'compatible_with', 'steel_grade_n80_1');
    this.addEdge('failure_sulfide_corrosion', 'compatible_with', 'steel_grade_k55');
    this.addEdge('failure_co2_corrosion', 'compatible_with', 'steel_grade_p110');
    this.addEdge('failure_chloride_scc', 'compatible_with', 'steel_grade_13cr');
    this.addEdge('failure_pitting', 'compatible_with', 'steel_grade_super_13cr');
    this.addEdge('failure_galvanic', 'compatible_with', 'steel_grade_monel_400');
    this.addEdge('failure_galling', 'compatible_with', 'steel_grade_inconel_718');
    this.addEdge('failure_washout', 'compatible_with', 'thread_eue_2875');
    this.addEdge('failure_collapse', 'compatible_with', 'casing_9625_l80');
    this.addEdge('failure_burst', 'compatible_with', 'tubing_4500_p110');
    this.addEdge('failure_fatigue', 'compatible_with', 'drillpipe_5000_s135');
    this.addEdge('failure_seal_leak', 'compatible_with', 'elastomer_viton_fkm');
    this.addEdge('failure_thread_jumpout', 'compatible_with', 'thread_btc_9625');
    this.addEdge('failure_overtorque', 'compatible_with', 'thread_eue_2875');
    this.addEdge('failure_backoff', 'compatible_with', 'thread_btc_9625');
    this.addEdge('failure_erosion', 'compatible_with', 'tubing_4500_p110');
  }

  /**
   * Helper to translate relation names.
   * 
   * @param {string} relation 
   * @param {string} lang 
   * @returns {string} Translated relation name
   */
  static getRelationLabel(relation, lang) {
    const labels = {
      used_in: lang === 'ru' ? 'Используется в' : 'Used In',
      employs: lang === 'ru' ? 'Содержит / Совместим с' : 'Employs / Fits',
      governs: lang === 'ru' ? 'Регламентирует' : 'Governs Spec',
      governed_by: lang === 'ru' ? 'Регулируется стандартом' : 'Governed By Spec',
      has_grade: lang === 'ru' ? 'Марка стали' : 'Has Steel Grade',
      belongs_to: lang === 'ru' ? 'Принадлежит группе' : 'Belongs To Group',
      compatible_with: lang === 'ru' ? 'Совместимо с' : 'Compatible With'
    };
    return labels[relation] || relation;
  }
}

export const graph = new EngineeringGraph();
export default graph;
