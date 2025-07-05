// Configuration centralisée des seuils de classification
export const THRESHOLDS = {
  // Seuils pour la classification du périnée (périnée/total)
  PERINEUM: {
    SHORT_MAX: 31.6,      // < 31.6% = court
    MEDIUM_MAX: 34.9,     // 31.6-34.9% = moyen
    // > 34.9% = long
  },
  
  // Seuils pour la classification de la vulve (périnée/vulve)
  VULVA: {
    LONG_MAX: 45,         // < 45% = vulve longue (périnée court relatif)
    MEDIUM_MAX: 55,       // 45-55% = vulve moyenne (équilibré)
    // > 55% = vulve courte (périnée long relatif)
  },
  
  // Seuils dérivés pour vulve/total (complémentaires aux seuils périnée)
  VULVA_TO_TOTAL: {
    SHORT_MAX: 65.1,      // < 65.1% = vulve courte
    MEDIUM_MAX: 68.4,     // 65.1-68.4% = vulve moyenne
    // > 68.4% = vulve longue
  }
};

// Labels pour l'affichage
export const THRESHOLD_LABELS = {
  PERINEUM: {
    SHORT: `<${THRESHOLDS.PERINEUM.SHORT_MAX}%`,
    MEDIUM: `${THRESHOLDS.PERINEUM.SHORT_MAX}-${THRESHOLDS.PERINEUM.MEDIUM_MAX}%`,
    LONG: `>${THRESHOLDS.PERINEUM.MEDIUM_MAX}%`
  },
  
  VULVA: {
    LONG: `<${THRESHOLDS.VULVA.LONG_MAX}%`,
    MEDIUM: `${THRESHOLDS.VULVA.LONG_MAX}-${THRESHOLDS.VULVA.MEDIUM_MAX}%`,
    SHORT: `>${THRESHOLDS.VULVA.MEDIUM_MAX}%`
  },
  
  VULVA_TO_TOTAL: {
    SHORT: `<${THRESHOLDS.VULVA_TO_TOTAL.SHORT_MAX}%`,
    MEDIUM: `${THRESHOLDS.VULVA_TO_TOTAL.SHORT_MAX}-${THRESHOLDS.VULVA_TO_TOTAL.MEDIUM_MAX}%`,
    LONG: `>${THRESHOLDS.VULVA_TO_TOTAL.MEDIUM_MAX}%`
  }
};