// @ts-nocheck
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Box,
  Button,
  Flex,
  TextInput,
  Typography,
} from '@strapi/design-system';
import { Cross, Plus, Trash } from '@strapi/icons';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const ModalContent = styled(Box)`
  background: white;
  border-radius: 8px;
  max-height: 90vh;
  overflow: auto;
  max-width: 700px;
  width: 90%;
`;

const FilterRow = styled(Flex)`
  padding: 12px;
  background: #f7f8fa;
  border-radius: 4px;
  margin-bottom: 8px;
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dcdce4;
  border-radius: 4px;
  background: white;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #4945ff;
  }
  
  &:disabled {
    background: #f7f8fa;
    cursor: not-allowed;
  }
`;

interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface PopulateField {
  name: string;
  enabled: boolean;
  deep: boolean;
}

interface AdvancedFilterModalProps {
  onClose: () => void;
  onApply: (queryString: string) => void;
  availableFields: Array<{ name: string; type: string }>;
  availableRelations?: Array<{ name: string }>;
  currentFilters?: FilterCondition[];
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
  { value: 'startsWith', label: 'starts with' },
  { value: 'endsWith', label: 'ends with' },
];

const AdvancedFilterModal: React.FC<AdvancedFilterModalProps> = ({
  onClose,
  onApply,
  availableFields,
  availableRelations = [],
  currentFilters = [],
}) => {
  const { formatMessage } = useIntl();
  const [useOr, setUseOr] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>(
    currentFilters.length > 0
      ? currentFilters
      : [{ id: '1', field: '', operator: 'eq', value: '' }]
  );
  const [populateFields, setPopulateFields] = useState<PopulateField[]>(
    availableRelations.map(rel => ({
      name: rel.name,
      enabled: false,
      deep: false,
    }))
  );

  const addFilter = () => {
    setFilters([
      ...filters,
      { id: Date.now().toString(), field: '', operator: 'eq', value: '' },
    ]);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  const updateFilter = (id: string, key: keyof FilterCondition, value: string) => {
    setFilters(filters.map(f => (f.id === id ? { ...f, [key]: value } : f)));
  };

  const togglePopulate = (name: string) => {
    setPopulateFields(populateFields.map(p => 
      p.name === name ? { ...p, enabled: !p.enabled } : p
    ));
  };

  const toggleDeepPopulate = (name: string) => {
    setPopulateFields(populateFields.map(p => 
      p.name === name ? { ...p, deep: !p.deep, enabled: true } : p
    ));
  };

  const generateQueryString = (): string => {
    const logic = useOr ? '$or' : '$and';
    const parts: string[] = [];

    // Add filters
    filters.forEach((filter, index) => {
      if (filter.field && filter.value) {
        const key = `filters[${logic}][${index}][${filter.field}][$${filter.operator}]`;
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(filter.value)}`);
      }
    });

    // Add populate
    populateFields.forEach(p => {
      if (p.enabled) {
        if (p.deep) {
          // Deep populate: populate[relation][populate]=*
          parts.push(`populate[${p.name}][populate]=%2A`); // %2A = *
        } else {
          // Simple populate
          parts.push(`populate[${p.name}]=true`);
        }
      }
    });

    return parts.join('&');
  };

  const handleApply = () => {
    const queryString = generateQueryString();
    console.log('[AdvancedFilter] Generated query:', queryString);
    onApply(queryString);
    onClose();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent padding={6} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <Flex justifyContent="space-between" alignItems="center" marginBottom={6}>
          <Typography as="h2" variant="beta">
            🔍 Advanced Filters
          </Typography>
          <Button onClick={onClose} variant="ghost" type="button">
            <Cross />
          </Button>
        </Flex>

        {/* Logic Toggle */}
        <Box marginBottom={4} padding={3} background="neutral100" borderRadius="4px">
          <Flex gap={2} alignItems="center" marginBottom={2}>
            <Typography variant="pi" fontWeight="bold">
              Filter Logic:
            </Typography>
            <Flex gap={2}>
              <Button
                variant={!useOr ? 'default' : 'secondary'}
                size="S"
                onClick={() => setUseOr(false)}
              >
                AND
              </Button>
              <Button
                variant={useOr ? 'default' : 'secondary'}
                size="S"
                onClick={() => setUseOr(true)}
              >
                OR
              </Button>
            </Flex>
          </Flex>
          <Typography variant="pi" textColor="neutral600">
            {useOr 
              ? '🟠 OR: Any condition can match (at least one must be true)'
              : '🔵 AND: All conditions must match (all must be true)'}
          </Typography>
        </Box>

        {/* Filters */}
        <Box marginBottom={4}>
          <Typography variant="pi" fontWeight="bold" style={{ marginBottom: '12px', display: 'block' }}>
            Filter Conditions:
          </Typography>

          {filters.map((filter, index) => (
            <FilterRow key={filter.id} gap={2} alignItems="flex-end">
              {/* Logic Badge */}
              {index > 0 && (
                <Box
                  padding={2}
                  background={useOr ? 'warning100' : 'primary100'}
                  borderRadius="4px"
                  style={{ alignSelf: 'center' }}
                >
                  <Typography variant="pi" fontWeight="bold" textColor={useOr ? 'warning600' : 'primary600'}>
                    {useOr ? 'OR' : 'AND'}
                  </Typography>
                </Box>
              )}

              {/* Field */}
              <Box style={{ flex: 2 }}>
                <Typography variant="pi" style={{ marginBottom: '4px', display: 'block' }}>
                  Field
                </Typography>
                <StyledSelect
                  value={filter.field}
                  onChange={(e) => updateFilter(filter.id, 'field', e.target.value)}
                >
                  <option value="">Select field</option>
                  {availableFields.map((field) => (
                    <option key={field.name} value={field.name}>
                      {field.name}
                    </option>
                  ))}
                </StyledSelect>
              </Box>

              {/* Operator */}
              <Box style={{ flex: 1 }}>
                <Typography variant="pi" style={{ marginBottom: '4px', display: 'block' }}>
                  Operator
                </Typography>
                <StyledSelect
                  value={filter.operator}
                  onChange={(e) => updateFilter(filter.id, 'operator', e.target.value)}
                >
                  {OPERATORS.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </StyledSelect>
              </Box>

              {/* Value */}
              <Box style={{ flex: 2 }}>
                <Typography variant="pi" style={{ marginBottom: '4px', display: 'block' }}>
                  Value
                </Typography>
                <TextInput
                  value={filter.value}
                  onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                  placeholder="Enter value"
                />
              </Box>

              {/* Delete */}
              <Button
                onClick={() => removeFilter(filter.id)}
                variant="danger-light"
                size="S"
                disabled={filters.length === 1}
              >
                <Trash />
              </Button>
            </FilterRow>
          ))}

          <Button onClick={addFilter} variant="secondary" startIcon={<Plus />} size="S">
            Add Condition
          </Button>
        </Box>

        {/* Population Section */}
        {availableRelations.length > 0 && (
          <Box marginBottom={4}>
            <Typography variant="pi" fontWeight="bold" style={{ marginBottom: '12px', display: 'block' }}>
              🔗 Populate Relations:
            </Typography>
            <Box padding={3} background="neutral100" borderRadius="4px">
              {populateFields.map((field) => (
                <Flex key={field.name} gap={3} alignItems="center" marginBottom={2}>
                  <Box style={{ flex: 1 }}>
                    <Typography variant="pi">{field.name}</Typography>
                  </Box>
                  <Button
                    variant={field.enabled && !field.deep ? 'default' : 'secondary'}
                    size="S"
                    onClick={() => togglePopulate(field.name)}
                  >
                    {field.enabled && !field.deep ? '✓ Enabled' : 'Enable'}
                  </Button>
                  <Button
                    variant={field.deep ? 'default' : 'tertiary'}
                    size="S"
                    onClick={() => toggleDeepPopulate(field.name)}
                  >
                    {field.deep ? '🌲 Deep' : 'Deep'}
                  </Button>
                </Flex>
              ))}
              <Typography variant="pi" textColor="neutral600" style={{ marginTop: '12px', display: 'block' }}>
                💡 <strong>Deep populate</strong> loads all nested relations recursively
              </Typography>
            </Box>
          </Box>
        )}

        {/* Preview */}
        <Box marginBottom={4} padding={3} background="neutral100" borderRadius="4px">
          <Typography variant="pi" fontWeight="bold" style={{ marginBottom: '8px', display: 'block' }}>
            Generated Query:
          </Typography>
          <Typography variant="pi" fontFamily="monospace" style={{ wordBreak: 'break-all' }}>
            {generateQueryString() || 'No filters defined'}
          </Typography>
        </Box>

        {/* Footer */}
        <Flex justifyContent="flex-end" gap={2}>
          <Button onClick={onClose} variant="tertiary">
            Cancel
          </Button>
          <Button onClick={handleApply} variant="default">
            Apply Filters
          </Button>
        </Flex>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AdvancedFilterModal;

