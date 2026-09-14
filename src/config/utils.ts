/**
 * Safely extracts a deeply nested value from an object using dot and array index notation.
 * Examples:
 *   getValueByPath(item, 'name') => item.name
 *   getValueByPath(item, 'rulingstate.Statename') => item.rulingstate?.Statename
 *   getValueByPath(item, 'rulingperiods[0].startdate') => item.rulingperiods?.[0]?.startdate
 *   getValueByPath(item, 'rulingperiods.startdate') => item.rulingperiods?.[0]?.startdate || item.rulingperiods?.startdate
 */
export function getValueByPath(obj: any, path: string): any {
  if (!obj || !path) return undefined;

  // Normalize array notation like [0] to .0
  const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
  const parts = normalizedPath.split('.');

  let current = obj;
  for (let i = 0; i < parts.length; i++) {
    if (current == null) return undefined;
    const part = parts[i];

    // If current is an array and part is not an index, inspect the first item
    if (Array.isArray(current) && isNaN(Number(part))) {
      current = current[0]?.[part];
    } else {
      current = current[part];
    }
  }

  return current;
}

/**
 * Computes frequency distribution (counts) for any field path across an array of records.
 */
export function computeCategoryDistribution(
  items: any[],
  fieldPath: string,
  fallback = 'Others'
): Record<string, number> {
  const counts: Record<string, number> = {};

  if (!items || !Array.isArray(items)) return counts;

  items.forEach((item) => {
    let val = getValueByPath(item, fieldPath);
    if (val === undefined || val === null || val === '') {
      val = fallback;
    }
    const key = String(val).trim();
    counts[key] = (counts[key] || 0) + 1;
  });

  return counts;
}

