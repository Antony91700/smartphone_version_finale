// Analysis utility functions for anatomical measurements
import { THRESHOLDS } from './thresholds';

export const classifyPerineum = (perineeToTotalRatio) => {
  if (perineeToTotalRatio < THRESHOLDS.PERINEUM.SHORT_MAX) return 'court';
  if (perineeToTotalRatio <= THRESHOLDS.PERINEUM.MEDIUM_MAX) return 'moyen';
  return 'long';
};

export const classifyVulva = (perineeToVulvaRatio) => {
  // Classification based on perineum/vulva ratio
  // If perineum is <45% of vulva, then perineum is short relative to vulva (vulva is long)
  // If perineum is 45-55% of vulva, then balanced (vulva is medium)  
  // If perineum is >55% of vulva, then perineum is long relative to vulva (vulva is short)
  
  if (perineeToVulvaRatio < THRESHOLDS.VULVA.LONG_MAX) return 'longue';  // Perineum short relative to vulva = vulva long
  if (perineeToVulvaRatio <= THRESHOLDS.VULVA.MEDIUM_MAX) return 'moyenne'; // Balanced
  return 'courte'; // Perineum long relative to vulva = vulva short
};

export const getCaseNumber = (perineumClass, vulvaClass) => {
  const caseMatrix = {
    'court': { 'courte': 'cas_01', 'moyenne': 'cas_02', 'longue': 'cas_03' },
    'moyen': { 'courte': 'cas_04', 'moyenne': 'cas_05', 'longue': 'cas_06' },
    'long': { 'courte': 'cas_07', 'moyenne': 'cas_08', 'longue': 'cas_09' }
  };
  
  return caseMatrix[perineumClass][vulvaClass];
};

export const getAnalysisConclusion = (caseNumber, perineumClass, vulvaClass, perineeToVulvaRatio, perineeToTotalRatio, vulvaToTotalRatio) => {
  const conclusions = {
    'cas_01': 'Configuration avec périnée court et fente vulvaire courte. Cette configuration peut nécessiter une attention particulière lors d\'examens cliniques.',
    'cas_02': 'Configuration avec périnée court et fente vulvaire moyenne. Configuration relativement équilibrée malgré un périnée plus court.',
    'cas_03': 'Configuration avec périnée court et fente vulvaire longue. La fente vulvaire domine largement la longueur totale.',
    'cas_04': 'Configuration avec périnée moyen et fente vulvaire courte. Cette proportion peut donner l\'impression d\'un périnée relativement prédominant du fait de la petite taille de la fente vulvaire.',
    'cas_05': 'Configuration avec périnée moyen et fente vulvaire moyenne. Configuration anatomique équilibrée et dans les normes de référence.',
    'cas_06': 'Configuration avec périnée moyen et fente vulvaire longue. La fente vulvaire est prédominante avec un périnée dans la norme.',
    'cas_07': 'Configuration avec périnée long et fente vulvaire courte. Le périnée domine nettement la configuration anatomique.',
    'cas_08': 'Configuration avec périnée long et fente vulvaire moyenne. Configuration avec un périnée plus développé que la moyenne.',
    'cas_09': 'Configuration avec périnée long et fente vulvaire longue. Les deux structures sont bien développées, configuration généralement sans anomalie.'
  };
  
  return conclusions[caseNumber] || 'Configuration non classifiée.';
};

export const performCompleteAnalysis = (measurements) => {
  // Calculate ratios
  const perineeToVulvaRatio = measurements.ratio2312; // P2-P3/P1-P2 (périnée/fente)
  const perineeToTotalRatio = measurements.ratio2313; // P2-P3/P1-P3 (périnée/total)
  const vulvaToTotalRatio = 100 - perineeToTotalRatio; // P1-P2/P1-P3 (fente/total)
  
  // Classify structures
  const perineumClass = classifyPerineum(perineeToTotalRatio);
  const vulvaClass = classifyVulva(perineeToVulvaRatio);
  
  // Get case number
  const caseNumber = getCaseNumber(perineumClass, vulvaClass);
  
  // Get conclusion
  const conclusion = getAnalysisConclusion(caseNumber, perineumClass, vulvaClass, perineeToVulvaRatio, perineeToTotalRatio, vulvaToTotalRatio);
  
  return {
    perineeToVulvaRatio,
    perineeToTotalRatio,
    vulvaToTotalRatio,
    perineumClass,
    vulvaClass,
    caseNumber,
    conclusion,
    analysis: {
      perineum: {
        status: perineumClass,
        percentage: perineeToTotalRatio,
        reference: '33%',
        interpretation: perineeToTotalRatio < THRESHOLDS.PERINEUM.SHORT_MAX ? 'en dessous de la norme' : 
                       perineeToTotalRatio <= THRESHOLDS.PERINEUM.MEDIUM_MAX ? 'dans la norme' : 'au-dessus de la norme'
      },
      vulva: {
        status: vulvaClass,
        percentage: perineeToVulvaRatio,
        reference: '50%',
        interpretation: perineeToVulvaRatio < THRESHOLDS.VULVA.LONG_MAX ? 'périnée court par rapport à la fente vulvaire' :
                       perineeToVulvaRatio <= THRESHOLDS.VULVA.MEDIUM_MAX ? 'rapport équilibré' : 'périnée long par rapport à la fente vulvaire'
      }
    }
  };
};