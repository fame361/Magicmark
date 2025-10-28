// @ts-nocheck
/**
 * Converts URL query string back into QueryBuilder structure
 */

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
 * Parse URL query parameters into QueryBuilder structure
 * Supports nested groups like: filters[$and][1][$or][0][field][$eq]=value
 */
export const parseQueryToStructure = (queryString: string): ConditionGroup => {
  const params = new URLSearchParams(queryString);
  
  // Build a tree structure from filter params
  const filterTree: any = {};
  
  params.forEach((value, key) => {
    if (key.startsWith('filters[')) {
      // Parse the key structure
      // filters[$and][0][id][$eq] or filters[$and][1][$or][0][email][$contains]
      const parts = key.match(/\[([^\]]+)\]/g)?.map(p => p.slice(1, -1)) || [];
      
      if (parts.length >= 4) {
        // parts: ['$and', '0', 'id', '$eq'] or ['$and', '1', '$or', '0', 'email', '$contains']
        const logic = parts[0].substring(1); // Remove $
        const index = parseInt(parts[1]);
        
        // Check if nested group
        if (parts[2].startsWith('$')) {
          // Nested: filters[$and][1][$or][0][email][$contains]
          const nestedLogic = parts[2].substring(1);
          const nestedIndex = parseInt(parts[3]);
          const field = parts[4];
          const operator = parts[5].substring(1);
          
          if (!filterTree[logic]) filterTree[logic] = {};
          if (!filterTree[logic][index]) filterTree[logic][index] = { nested: nestedLogic, items: {} };
          filterTree[logic][index].items[nestedIndex] = { field, operator, value };
        } else {
          // Simple: filters[$and][0][id][$eq]
          const field = parts[2];
          const operator = parts[3].substring(1);
          
          if (!filterTree[logic]) filterTree[logic] = {};
          filterTree[logic][index] = { field, operator, value };
        }
      }
    }
  });

  console.log('[QueryParser] Filter tree:', filterTree);

  // Convert tree to QueryBuilder structure
  const rootLogic = Object.keys(filterTree)[0] || 'and';
  const rootGroup: ConditionGroup = {
    id: 'root',
    logic: rootLogic.toUpperCase() as 'AND' | 'OR',
    conditions: [],
  };

  let conditionId = 1;
  const rootItems = filterTree[rootLogic] || {};
  
  Object.keys(rootItems).sort((a, b) => parseInt(a) - parseInt(b)).forEach(index => {
    const item = rootItems[index];
    
    if (item.nested) {
      // Nested group
      const subGroup: ConditionGroup = {
        id: `group_${conditionId++}`,
        logic: item.nested.toUpperCase() as 'AND' | 'OR',
        conditions: [],
        isGroup: true,
      };
      
      Object.keys(item.items).sort((a, b) => parseInt(a) - parseInt(b)).forEach(subIndex => {
        const subItem = item.items[subIndex];
        subGroup.conditions.push({
          id: `condition_${conditionId++}`,
          field: subItem.field,
          operator: subItem.operator,
          value: decodeURIComponent(subItem.value),
        });
      });
      
      rootGroup.conditions.push(subGroup);
    } else {
      // Simple condition
      rootGroup.conditions.push({
        id: `condition_${conditionId++}`,
        field: item.field,
        operator: item.operator,
        value: decodeURIComponent(item.value),
      });
    }
  });

  // If no conditions found, add empty one
  if (rootGroup.conditions.length === 0) {
    rootGroup.conditions.push({
      id: 'condition_1',
      field: '',
      operator: 'eq',
      value: '',
    });
  }

  console.log('[QueryParser] Built structure:', rootGroup);
  return rootGroup;
};

/**
 * Parse individual filter parameter
 * Example: filters[$and][0][blocked][$eq] = true
 * Returns: { logic: 'and', index: 0, field: 'blocked', operator: 'eq', value: 'true' }
 */
const parseFilterParam = (key: string, value: string): { logic: string; index: number; field: string; operator: string; value: string } | null => {
  try {
    // Extract components
    // filters[$and][0][blocked][$eq] -> logic: and, index: 0, field: blocked, operator: eq
    
    const logicMatch = key.match(/\[\$(\w+)\]/);
    const logic = logicMatch ? logicMatch[1] : 'and';
    
    const indexMatch = key.match(/\]\[(\d+)\]\[/);
    const index = indexMatch ? parseInt(indexMatch[1]) : 0;
    
    const fieldMatch = key.match(/\[(\w+)\]\[\$/);
    const field = fieldMatch ? fieldMatch[1] : '';
    
    const operatorMatch = key.match(/\[\$(\w+)\]$/);
    const operator = operatorMatch ? operatorMatch[1] : 'eq';

    if (field) {
      return {
        logic,
        index,
        field,
        operator,
        value: decodeURIComponent(value),
      };
    }
    
    return null;
  } catch (error) {
    console.error('[QueryParser] Error parsing filter:', key, error);
    return null;
  }
};

