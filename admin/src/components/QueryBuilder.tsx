// @ts-nocheck
import React, { useState } from 'react';
import { Box, Button, Flex, TextInput, Typography } from '@strapi/design-system';
import { Plus, Trash } from '@strapi/icons';
import styled from 'styled-components';
import CustomSelect from './CustomSelect';

const GroupContainer = styled.div<{ level: number }>`
  border: 2px solid ${props => props.level === 0 ? '#4945ff' : '#dcdce4'};
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
  background: ${props => props.level === 0 ? '#f0f0ff' : '#fafafa'};
  
  @media (max-width: 768px) {
    padding: 12px;
    margin: 6px 0;
  }
`;

const ConditionRow = styled(Flex)`
  padding: 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin: 8px 0;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    padding: 10px;
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    
    > * {
      width: 100% !important;
      flex: none !important;
    }
  }
`;

const LogicBadge = styled.div<{ logic: 'AND' | 'OR' }>`
  padding: 4px 12px;
  border-radius: 4px;
  background: ${props => props.logic === 'OR' ? '#FFF4E6' : '#E8F4FD'};
  color: ${props => props.logic === 'OR' ? '#D97706' : '#0369A1'};
  font-weight: bold;
  font-size: 11px;
  text-align: center;
  min-width: 40px;
`;

const StyledSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #dcdce4;
  border-radius: 4px;
  background: white;
  font-size: 14px;
  cursor: pointer;
  flex: 1;
  min-width: 100px;
  
  &:focus {
    outline: none;
    border-color: #4945ff;
  }
  
  @media (max-width: 768px) {
    font-size: 13px;
    padding: 6px 8px;
    min-width: 80px;
  }
`;

const StyledInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #dcdce4;
  border-radius: 4px;
  font-size: 14px;
  flex: 2;
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: #4945ff;
  }
  
  @media (max-width: 768px) {
    font-size: 13px;
    padding: 6px 8px;
    min-width: 100px;
  }
`;

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface ConditionGroup {
  id: string;
  logic: 'AND' | 'OR';
  conditions: (Condition | ConditionGroup)[];
  isGroup?: boolean;
}

interface QueryBuilderProps {
  availableFields: Array<{ name: string; type: string }>;
  onQueryChange: (query: ConditionGroup) => void;
  initialStructure?: ConditionGroup;
}

const OPERATORS = [
  { value: 'eq', label: '=' },
  { value: 'ne', label: '≠' },
  { value: 'lt', label: '<' },
  { value: 'lte', label: '≤' },
  { value: 'gt', label: '>' },
  { value: 'gte', label: '≥' },
  { value: 'contains', label: 'contains' },
  { value: 'notContains', label: 'not contains' },
];

const QueryBuilder: React.FC<QueryBuilderProps> = ({ 
  availableFields, 
  onQueryChange, 
  initialStructure 
}) => {
  const [rootGroup, setRootGroup] = useState<ConditionGroup>(
    initialStructure || {
      id: 'root',
      logic: 'AND',
      conditions: [
        { id: '1', field: '', operator: 'eq', value: '' }
      ],
    }
  );

  // Update if initialStructure changes
  React.useEffect(() => {
    if (initialStructure) {
      console.log('[QueryBuilder] Loading initial structure:', initialStructure);
      setRootGroup(initialStructure);
    }
  }, [initialStructure]);

  const updateRootGroup = (newGroup: ConditionGroup) => {
    setRootGroup(newGroup);
    onQueryChange(newGroup);
  };

  const addCondition = (groupId: string) => {
    const newGroup = JSON.parse(JSON.stringify(rootGroup));
    const group = findGroup(newGroup, groupId);
    if (group) {
      group.conditions.push({
        id: Date.now().toString(),
        field: '',
        operator: 'eq',
        value: '',
      });
      updateRootGroup(newGroup);
    }
  };

  const addGroup = (parentGroupId: string) => {
    const newGroup = JSON.parse(JSON.stringify(rootGroup));
    const parentGroup = findGroup(newGroup, parentGroupId);
    if (parentGroup) {
      parentGroup.conditions.push({
        id: Date.now().toString(),
        logic: 'AND',
        conditions: [{ id: Date.now().toString() + '_1', field: '', operator: 'eq', value: '' }],
        isGroup: true,
      });
      updateRootGroup(newGroup);
    }
  };

  const removeItem = (groupId: string, itemId: string) => {
    const newGroup = JSON.parse(JSON.stringify(rootGroup));
    const group = findGroup(newGroup, groupId);
    if (group) {
      group.conditions = group.conditions.filter((c: any) => c.id !== itemId);
      updateRootGroup(newGroup);
    }
  };

  const updateCondition = (conditionId: string, key: string, value: string) => {
    const newGroup = JSON.parse(JSON.stringify(rootGroup));
    const condition = findCondition(newGroup, conditionId);
    if (condition) {
      condition[key] = value;
      updateRootGroup(newGroup);
    }
  };

  const toggleGroupLogic = (groupId: string) => {
    const newGroup = JSON.parse(JSON.stringify(rootGroup));
    const group = findGroup(newGroup, groupId);
    if (group) {
      group.logic = group.logic === 'AND' ? 'OR' : 'AND';
      updateRootGroup(newGroup);
    }
  };

  const findGroup = (group: ConditionGroup, id: string): ConditionGroup | null => {
    if (group.id === id) return group;
    for (const item of group.conditions) {
      if ((item as ConditionGroup).isGroup) {
        const found = findGroup(item as ConditionGroup, id);
        if (found) return found;
      }
    }
    return null;
  };

  const findCondition = (group: ConditionGroup, id: string): Condition | null => {
    for (const item of group.conditions) {
      if (!( item as ConditionGroup).isGroup && item.id === id) {
        return item as Condition;
      }
      if ((item as ConditionGroup).isGroup) {
        const found = findCondition(item as ConditionGroup, id);
        if (found) return found;
      }
    }
    return null;
  };

  const renderGroup = (group: ConditionGroup, level: number = 0): React.ReactNode => {
    return (
      <GroupContainer key={group.id} level={level}>
        {/* Group Header */}
        <Flex gap={2} marginBottom={3} alignItems="center">
          <Typography variant="pi" fontWeight="bold">
            {level === 0 ? '🔍 Root Group' : '📁 Sub-Group'}
          </Typography>
          <Button
            variant={group.logic === 'AND' ? 'default' : 'secondary'}
            size="S"
            onClick={() => toggleGroupLogic(group.id)}
          >
            {group.logic}
          </Button>
          <Typography variant="pi" textColor="neutral600">
            {group.logic === 'AND' ? 'All must match' : 'Any can match'}
          </Typography>
        </Flex>

        {/* Conditions */}
        {group.conditions.map((item, index) => (
          <Box key={item.id}>
            {/* Logic Badge between conditions */}
            {index > 0 && (
              <Flex justifyContent="center" marginBottom={2}>
                <LogicBadge logic={group.logic}>{group.logic}</LogicBadge>
              </Flex>
            )}

            {(item as ConditionGroup).isGroup ? (
              // Render nested group
              renderGroup(item as ConditionGroup, level + 1)
            ) : (
              // Render condition
              <ConditionRow>
                <Box style={{ flex: 2, minWidth: '150px' }}>
                  <CustomSelect
                    value={(item as Condition).field}
                    onChange={(val) => updateCondition(item.id, 'field', val)}
                    options={[
                      { value: '', label: 'Select field' },
                      ...availableFields.map(f => ({ value: f.name, label: f.name }))
                    ]}
                    placeholder="Select field"
                    searchable={true}
                  />
                </Box>

                <Box style={{ flex: 1, minWidth: '100px' }}>
                  <CustomSelect
                    value={(item as Condition).operator}
                    onChange={(val) => updateCondition(item.id, 'operator', val)}
                    options={OPERATORS}
                    searchable={false}
                  />
                </Box>

                <StyledInput
                  value={(item as Condition).value}
                  onChange={(e) => updateCondition(item.id, 'value', e.target.value)}
                  placeholder="Enter value"
                />

                <Button
                  variant="danger-light"
                  size="S"
                  onClick={() => removeItem(group.id, item.id)}
                  disabled={group.conditions.length === 1 && level === 0}
                >
                  <Trash />
                </Button>
              </ConditionRow>
            )}
          </Box>
        ))}

        {/* Add buttons */}
        <Flex gap={2} marginTop={3}>
          <Button
            variant="secondary"
            size="S"
            startIcon={<Plus />}
            onClick={() => addCondition(group.id)}
          >
            Add Condition
          </Button>
          {level < 2 && (
            <Button
              variant="tertiary"
              size="S"
              startIcon={<Plus />}
              onClick={() => addGroup(group.id)}
            >
              Add Group
            </Button>
          )}
        </Flex>
      </GroupContainer>
    );
  };

  return <Box>{renderGroup(rootGroup)}</Box>;
};

export default QueryBuilder;

