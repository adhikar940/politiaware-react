import { useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { FilterFieldDef, FilterDataType } from './filterTypes';

export const INTROSPECT_FILTER_SCHEMA = gql`
  query IntrospectFilterSchema($name: String!) {
    __type(name: $name) {
      name
      inputFields {
        name
        type {
          name
          kind
          inputFields {
            name
            type {
              name
              kind
            }
          }
        }
      }
    }
  }
`;

/**
 * Fields to exclude from user-facing filter dropdowns
 * (binary assets, images, internal IDs, or sensitive contact fields)
 */
const EXCLUDED_FIELDS = new Set([
  'personPhoto',
  'fathersImage',
  'spouseImage',
  'voiceSample',
  'EmailAddress',
  'Mobile',
  'presentaddress',
  'premanentaddress',
]);

/**
 * Dictionary of polished, human-friendly labels for known database columns & relations
 */
const FRIENDLY_LABELS: Record<string, string> = {
  name: 'Name',
  gender: 'Gender',
  religion: 'Religion',
  caste: 'Caste',
  casteCategory: 'Caste Category',
  fathersName: "Father's Name",
  SpouseName: "Spouse's Name",
  HighestEducation: 'Highest Education',
  University: 'University / Institute',
  dob: 'Date of Birth',
  deathDate: 'Date of Death',
  ispresent: 'Currently In Office',
  children: 'Children Count',
  extraInfo: 'Additional Notes',
  // State relation
  'rulingstate.Statename': 'State / UT Name',
  'rulingstate.Status': 'Constitutional Status (State vs UT)',
  'rulingstate.capital': 'State Capital',
  'rulingstate.abbreviation': 'State Abbreviation',
  'rulingstate.oldname': 'State Historical Name',
  // Party relation
  'party.abbreviation': 'Party Abbreviation',
  'party.partyname': 'Party Full Name',
  // Ruling period relation
  'rulingperiods.startdate': 'Term Start Date',
  'rulingperiods.enddate': 'Term End Date',
  // Birth state/city
  'birthState.Statename': 'Birth State',
  'birthCity.Cityname': 'Birth City',
  'birthCity.cityName': 'Birth City',
  'birthCity.abbreviation': 'Birth City Abbreviation',
  // Governor specific
  state: 'State / UT Name',
  status: 'Constitutional Status',
  highestEducation: 'Highest Education',
  university: 'University / Institute',
  startDate: 'Term Start Date',
  appointedBy: 'Appointed By',
};

/**
 * Converts a camelCase or PascalCase identifier into Title Case
 */
function camelToTitleCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/([A-Z]+)/g, ' $1')
    .replace(/([A-Z][a-z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Formats a field name or dot-notation path into a clean human-readable label
 */
export function formatFieldLabel(path: string): string {
  if (FRIENDLY_LABELS[path]) {
    return FRIENDLY_LABELS[path];
  }

  if (path.includes('.')) {
    const parts = path.split('.');
    const relationPart = FRIENDLY_LABELS[parts[0]] || camelToTitleCase(parts[0]);
    const subPart = FRIENDLY_LABELS[parts[1]] || camelToTitleCase(parts[1]);
    return `${relationPart}: ${subPart}`;
  }

  return camelToTitleCase(path);
}

/**
 * Maps a GraphQL filter input type name to a FilterDataType
 */
function mapInputTypeToDataType(typeName: string): FilterDataType {
  if (!typeName) return 'string';
  if (typeName.startsWith('Date')) return 'date';
  if (typeName.startsWith('Int') || typeName.startsWith('Float')) return 'number';
  if (typeName.startsWith('Boolean')) return 'boolean';
  return 'string';
}

/**
 * Hook to dynamically introspect filter fields, types, and relations for any entity page
 */
export function useGraphQLFilterSchema(
  filterTypeName: string,
  fallbackFields: FilterFieldDef[] = []
): {
  availableFields: FilterFieldDef[];
  loading: boolean;
  error: any;
} {
  const { data, loading, error } = useQuery(INTROSPECT_FILTER_SCHEMA, {
    variables: { name: filterTypeName },
    fetchPolicy: 'cache-first', // Cache across page navigations
  });

  const availableFields: FilterFieldDef[] = useMemo(() => {
    const typeObj = data?.__type;
    if (!typeObj || !Array.isArray(typeObj.inputFields)) {
      return fallbackFields;
    }

    const fields: FilterFieldDef[] = [];

    typeObj.inputFields.forEach((item: any) => {
      const fieldName = item.name;
      if (EXCLUDED_FIELDS.has(fieldName)) return;

      const fieldType = item.type;
      const typeName = fieldType?.name || '';
      const nestedInputFields = fieldType?.inputFields;

      // Check if this is a foreign key relation (e.g. AsyncFilterStateStateDepth2, AsyncFilterPartyPartyDepth2)
      const isRelation =
        typeName.includes('Depth') ||
        (Array.isArray(nestedInputFields) &&
          nestedInputFields.length > 0 &&
          nestedInputFields.some((sub: any) => sub.type?.name?.endsWith('FilterInput')));

      if (isRelation && Array.isArray(nestedInputFields)) {
        // Expand relation sub-fields into dot notation
        nestedInputFields.forEach((sub: any) => {
          const subName = sub.name;
          if (EXCLUDED_FIELDS.has(subName) || subName === 'id') return;

          const dotPath = `${fieldName}.${subName}`;
          const subTypeName = sub.type?.name || '';
          const dataType = mapInputTypeToDataType(subTypeName);

          fields.push({
            id: dotPath,
            label: formatFieldLabel(dotPath),
            dataType,
            placeholder: `Filter by ${formatFieldLabel(dotPath).toLowerCase()}...`,
          });
        });
      } else {
        // Direct scalar field (name, dob, religion, ispresent, HighestEducation, etc.)
        if (fieldName === 'id') return; // Skip primary key id from user filters

        const dataType = mapInputTypeToDataType(typeName);

        fields.push({
          id: fieldName,
          label: formatFieldLabel(fieldName),
          dataType,
          placeholder: `Filter by ${formatFieldLabel(fieldName).toLowerCase()}...`,
        });
      }
    });

    return fields.length > 0 ? fields : fallbackFields;
  }, [data, fallbackFields]);

  return {
    availableFields,
    loading,
    error,
  };
}

