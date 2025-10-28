// @ts-nocheck
/**
 * Generates correct Strapi v5 filter query strings from QueryBuilder structure
 * Based on: https://docs.strapi.io/cms/api/document-service/filters
 */

import qs from 'qs';

export interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export interface ConditionGroup {
  id: string;
  logic: 'AND' | 'OR';
  conditions: (Condition | ConditionGroup)[];
  isGroup?: boolean;
}

/**
 * Convert QueryBuilder structure to Strapi filter object
 */
export const structureToFilters = (group: ConditionGroup): any => {
  const logic = group.logic.toLowerCase(); // 'and' or 'or'
  
  const conditions = group.conditions
    .filter(item => {
      // Filter out empty conditions
      if ((item as ConditionGroup).isGroup) return true;
      const cond = item as Condition;
      return cond.field && cond.value;
    })
    .map(item => {
      if ((item as ConditionGroup).isGroup) {
        // Nested group - recurse
        return structureToFilters(item as ConditionGroup);
      } else {
        // Simple condition
        const cond = item as Condition;
        return {
          [cond.field]: {
            [`$${cond.operator}`]: cond.value
          }
        };
      }
    });

  // If only one condition, don't wrap in $and/$or
  if (conditions.length === 1 && !(conditions[0].$and || conditions[0].$or)) {
    return conditions[0];
  }

  // Wrap in $and or $or
  return {
    [`$${logic}`]: conditions
  };
};

/**
 * Generate complete query string with filters, sort, and populate
 */
export const generateQueryString = (
  structure: ConditionGroup,
  sortField?: string,
  sortOrder?: 'ASC' | 'DESC',
  populateFields?: Array<{ name: string; enabled: boolean; deep: boolean }>
): string => {
  const queryObject: any = {};

  // Add filters
  if (structure && structure.conditions.length > 0) {
    const hasValidConditions = structure.conditions.some(item => {
      if ((item as ConditionGroup).isGroup) return true;
      const cond = item as Condition;
      return cond.field && cond.value;
    });

    if (hasValidConditions) {
      queryObject.filters = structureToFilters(structure);
    }
  }

  // Add sorting
  if (sortField) {
    // Don't add to queryObject - we'll add it manually to the query string
    // because Content Manager expects sort=field:order, not sort[0]=field:order
  }

  // Add populate
  if (populateFields && populateFields.length > 0) {
    const populate: any = {};
    populateFields.forEach(p => {
      if (p.enabled) {
        if (p.deep) {
          // Deep populate
          populate[p.name] = {
            populate: '*'
          };
        } else {
          // Simple populate
          populate[p.name] = true;
        }
      }
    });
    
    if (Object.keys(populate).length > 0) {
      queryObject.populate = populate;
    }
  }

  console.log('[QueryGenerator] Query object:', queryObject);

  // Use qs to generate proper URL query string
  let queryString = qs.stringify(queryObject, {
    encodeValuesOnly: true, // Pretty URLs
  });

  // Manually add sort parameter (Content Manager expects string, not array)
  if (sortField) {
    const sortParam = `sort=${sortField}:${sortOrder || 'ASC'}`;
    queryString = queryString ? `${queryString}&${sortParam}` : sortParam;
  }

  console.log('[QueryGenerator] Generated query string:', queryString);
  return queryString;
};

