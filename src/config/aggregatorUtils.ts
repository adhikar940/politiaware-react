import { FilterRule } from '../components/FilterSection/filterTypes';

/**
 * Standard colors for Indian political parties based on database records.
 */
export const KNOWN_PARTY_COLORS: Record<string, string> = {
  BJP: '#FF9933',
  INC: '#00A2E8',
  AAP: '#800080',
  AITC: '#FFD700',
  TMC: '#FFD700',
  SP: '#FF0000',
  'CPI(M)': '#000000',
  'CPIM': '#000000',
  CPI: '#FF0000',
  'CPIMLL': '#FF0000',
  DMK: '#A52A2A',
  AIADMK: '#000080',
  TDP: '#FFFF00',
  YSRCP: '#0000FF',
  BRS: '#FF69B4',
  BJD: '#008000',
  'JD(U)': '#008000',
  'JD(S)': '#008000',
  JDU: '#008000',
  JDS: '#008000',
  SHS: '#FF4500',
  'SS(UBT)': '#FF4500',
  RJD: '#008000',
  NCP: '#00CED1',
  NCPSP: '#00CED1',
  BSP: '#008000',
  BPF: '#FFA500',
  DMDK: '#FF0000',
  GFP: '#008000',
  MNF: '#000080',
  PPA: '#008000',
  RLJP: '#000080',
  RLP: '#FFFF00',
  RSP: '#FF0000',
  SAD: '#000080',
  TMP: '#FFFF00',
  UPPL: '#FFFF00',
  VPP: '#008000',
  ZNP: '#000080',
  NPF: '#000080',
  AIFB: '#FF0000',
  AIMIM: '#008000',
  AJSU: '#008000',
  ADS: '#800080',
  NPP: '#FF0000',
  SDF: '#000080',
  SKM: '#FF4500',
  AIUDF: '#008000',
  AGP: '#008000',
  JKPDP: '#008000',
  JSP: '#FF0000',
  JJP: '#008000',
  JCC: '#FF9933',
  JMM: '#00FF00',
  KC: '#008000',
  'KC(M)': '#008000',
  MGP: '#FF9933',
  NTK: '#FF0000',
  RGP: '#008000',
  UDP: '#000080',
  AINRC: '#FFA500',
  HSPDP: '#000080',
  INLD: '#008000',
  IUML: '#008000',
  IPFT: '#008000',
  JKNC: '#FF0000',
  JKNPP: '#000080',
  LJPRV: '#000080',
  MNS: '#FFA500',
  ZPM: '#00CED1',
  NDPP: '#DC143C',
  RLD: '#008000',
  MDMK: '#FF0000',
  VCK: '#0000FF',
  HAMS: '#006400',
  'ASP(KR)': '#000080',
  BAP: '#FF8C00',
  IND: '#808080',
  OTHERS: '#64748b',
};

export const GENDER_COLORS: Record<string, string> = {
  Male: '#3b82f6',
  Female: '#ec4899',
  Others: '#8b5cf6',
  Unspecified: '#94a3b8',
};

export const RELIGION_COLORS: Record<string, string> = {
  Hindu: '#f97316',
  Muslim: '#10b981',
  Christian: '#3b82f6',
  Sikh: '#eab308',
  Buddhist: '#a855f7',
  Jain: '#06b6d4',
  Unspecified: '#94a3b8',
};

const ROTATING_PALETTE = [
  '#f97316',
  '#2563eb',
  '#10b981',
  '#a855f7',
  '#ef4444',
  '#eab308',
  '#06b6d4',
  '#ec4899',
  '#64748b',
];

/**
 * Normalizes a raw key (e.g. "bjp", "male", "hindu", "null") into a human-friendly display label.
 */
export function formatCategoryKey(category: string, rawKey: string): string {
  if (!rawKey || rawKey === 'null' || rawKey === 'undefined') {
    return category.toLowerCase() === 'party' ? 'Independent / Others' : 'Unspecified';
  }

  const catLower = category.toLowerCase();
  if (catLower === 'party') {
    return rawKey.toUpperCase();
  }

  // Capitalize first letter for gender / religion
  return rawKey.charAt(0).toUpperCase() + rawKey.slice(1).toLowerCase();
}

/**
 * Converts applied FilterSection advanced rules into a Strawberry GraphQL filter input object.
 */
export function buildGraphQLFilters(rules: FilterRule[]): Record<string, any> | undefined {
  if (!rules || rules.length === 0) return undefined;

  const validRules = rules.filter((r) => {
    if (!r.field || !r.operator) return false;
    if (['is_empty', 'is_not_empty', 'is_true', 'is_false'].includes(r.operator)) return true;
    return Boolean(r.value && r.value.trim() !== '');
  });

  if (validRules.length === 0) return undefined;

  const root: Record<string, any> = {};

  validRules.forEach((rule) => {
    const parts = rule.field.split('.');
    let curr = root;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!curr[part] || typeof curr[part] !== 'object') {
        curr[part] = {};
      }
      curr = curr[part];
    }

    const lastPart = parts[parts.length - 1];
    let filterCondition: Record<string, any>;

    switch (rule.operator) {
      case 'exact':
      case 'equals':
        filterCondition = { iexact: rule.value.trim() };
        break;
      case 'contains':
        filterCondition = { icontains: rule.value.trim() };
        break;
      case 'startswith':
        filterCondition = { istartswith: rule.value.trim() };
        break;
      case 'endswith':
        filterCondition = { iendswith: rule.value.trim() };
        break;
      case 'in':
        filterCondition = { in: rule.value.split(',').map((s) => s.trim()).filter(Boolean) };
        break;
      case 'gt':
      case 'after':
        filterCondition = { gt: !isNaN(Number(rule.value.trim())) ? Number(rule.value.trim()) : rule.value.trim() };
        break;
      case 'gte':
      case 'on_or_after':
        filterCondition = { gte: !isNaN(Number(rule.value.trim())) ? Number(rule.value.trim()) : rule.value.trim() };
        break;
      case 'lt':
      case 'before':
        filterCondition = { lt: !isNaN(Number(rule.value.trim())) ? Number(rule.value.trim()) : rule.value.trim() };
        break;
      case 'lte':
      case 'on_or_before':
        filterCondition = { lte: !isNaN(Number(rule.value.trim())) ? Number(rule.value.trim()) : rule.value.trim() };
        break;
      case 'year':
        filterCondition = { year: parseInt(rule.value.trim(), 10) };
        break;
      case 'is_empty':
        filterCondition = { isnull: true };
        break;
      case 'is_not_empty':
        filterCondition = { isnull: false };
        break;
      case 'is_true':
        filterCondition = { exact: true };
        break;
      case 'is_false':
        filterCondition = { exact: false };
        break;
      default:
        filterCondition = { icontains: rule.value.trim() };
        break;
    }

    curr[lastPart] = { ...(curr[lastPart] || {}), ...filterCondition };
  });

  return Object.keys(root).length > 0 ? root : undefined;
}

export interface ParsedAggregatorData {
  categoryData: Record<string, number>;
  categoryPercentages: Record<string, number>;
  categoryColors: Record<string, string>;
  currentTotal: number;
}

/**
 * Parses the raw aggregator `results` JSON into structured data and color mapping for the active category tab.
 */
export function parseAggregatorResults(
  results: any,
  selectedCategory: string,
  backendPartyColorMap?: Record<string, string>
): ParsedAggregatorData {
  const categoryData: Record<string, number> = {};
  const categoryPercentages: Record<string, number> = {};
  const categoryColors: Record<string, string> = {};

  if (!results || typeof results !== 'object') {
    return { categoryData, categoryPercentages, categoryColors, currentTotal: 0 };
  }

  const catLower = selectedCategory.toLowerCase();
  const rawGroup = results[catLower] || results[selectedCategory];

  if (!rawGroup || typeof rawGroup !== 'object') {
    return { categoryData, categoryPercentages, categoryColors, currentTotal: 0 };
  }

  let totalFromItems = 0;
  let paletteIdx = 0;

  Object.entries(rawGroup).forEach(([rawKey, val]) => {
    let count = 0;
    let percentage = 0;

    if (Array.isArray(val)) {
      count = typeof val[0] === 'number' ? val[0] : parseInt(String(val[0]), 10) || 0;
      percentage = typeof val[1] === 'number' ? val[1] : parseFloat(String(val[1])) || 0;
    } else if (typeof val === 'number') {
      count = val;
    }

    if (count <= 0) return;

    totalFromItems += count;
    const label = formatCategoryKey(selectedCategory, rawKey);

    categoryData[label] = (categoryData[label] || 0) + count;
    categoryPercentages[label] = percentage;

    // Resolve color
    if (catLower === 'gender') {
      categoryColors[label] = GENDER_COLORS[label] || '#94a3b8';
    } else if (catLower === 'religion') {
      categoryColors[label] = RELIGION_COLORS[label] || '#94a3b8';
    } else if (catLower === 'party') {
      const upperKey = rawKey.toUpperCase();
      const backendColor = backendPartyColorMap?.[upperKey] || backendPartyColorMap?.[rawKey];
      categoryColors[label] =
        backendColor ||
        KNOWN_PARTY_COLORS[upperKey] ||
        KNOWN_PARTY_COLORS[label] ||
        ROTATING_PALETTE[paletteIdx % ROTATING_PALETTE.length];
      paletteIdx++;
    } else {
      categoryColors[label] = ROTATING_PALETTE[paletteIdx % ROTATING_PALETTE.length];
      paletteIdx++;
    }
  });

  return {
    categoryData,
    categoryPercentages,
    categoryColors,
    currentTotal: totalFromItems,
  };
}

/**
 * Extracts female count and distinct political parties count from aggregator results JSON
 */
export function getAggregatorSummaryStats(results: any): { femaleCount: number; partyCount: number } {
  let femaleCount = 0;
  let partyCount = 0;

  if (!results || typeof results !== 'object') {
    return { femaleCount, partyCount };
  }

  const genderGroup = results.gender || results.Gender;
  if (genderGroup && typeof genderGroup === 'object') {
    Object.entries(genderGroup).forEach(([key, val]) => {
      if (key.toLowerCase() === 'female') {
        if (Array.isArray(val)) {
          femaleCount = typeof val[0] === 'number' ? val[0] : parseInt(String(val[0]), 10) || 0;
        } else if (typeof val === 'number') {
          femaleCount = val;
        }
      }
    });
  }

  const partyGroup = results.party || results.Party;
  if (partyGroup && typeof partyGroup === 'object') {
    partyCount = Object.keys(partyGroup).length;
  }

  return { femaleCount, partyCount };
}
