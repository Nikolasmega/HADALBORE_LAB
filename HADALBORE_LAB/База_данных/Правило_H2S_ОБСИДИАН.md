---
type: rules
id: rule_h2s_casing
calc_type: corrosion
condition: "inputs.environment === 'sour' && inputs.h2sPressure >= 0.05"
severity: warning
message_ru: "ОБСИДИАН: При p(H2S) >= 0.05 psi запрещено применять марки стали P110/Q125 согласно NACE MR0175."
message_en: "OBSIDIAN: For p(H2S) >= 0.05 psi, steel grades P110/Q125 are strictly prohibited per NACE MR0175."
---

# Динамическое правило контроля H₂S (Обсидиан)

Это динамическое правило автоматически считывается приложением OmniLab из Obsidian Vault. 
Оно накладывает запрет на использование сталей P110/Q125 при парциальном давлении H₂S свыше 0.05 psi согласно стандарту NACE MR0175.
