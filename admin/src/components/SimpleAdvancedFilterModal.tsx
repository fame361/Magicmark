// @ts-nocheck
import React, { useState } from 'react';
import { Box, Button, Flex, Typography } from '@strapi/design-system';
import { Cross } from '@strapi/icons';
import styled from 'styled-components';
import QueryBuilder from './QueryBuilder';
import { parseQueryToStructure, type ConditionGroup } from '../utils/queryToStructure';
import { generateQueryString } from '../utils/queryGenerator';

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
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const ModalContent = styled(Box)`
  background: white;
  border-radius: 8px;
  max-height: 90vh;
  overflow-y: auto;
  max-width: 900px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 768px) {
    max-width: 100%;
    max-height: 95vh;
    border-radius: 12px;
  }
  
  @media (min-width: 769px) {
    width: 85%;
  }
`;

interface PopulateField {
  name: string;
  enabled: boolean;
  deep: boolean;
}

interface SimpleAdvancedFilterModalProps {
  onClose: () => void;
  onApply: (queryString: string) => void;
  availableFields: Array<{ name: string; type: string }>;
  availableRelations?: Array<{ name: string }>;
  currentQuery?: string;
}

const SimpleAdvancedFilterModal: React.FC<SimpleAdvancedFilterModalProps> = ({
  onClose,
  onApply,
  availableFields,
  availableRelations = [],
  currentQuery = '',
}) => {
  const [queryStructure, setQueryStructure] = useState<ConditionGroup | null>(null);
  const [initialStructure, setInitialStructure] = useState<ConditionGroup | null>(null);
  const [initialFiltersLoaded, setInitialFiltersLoaded] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [populateFields, setPopulateFields] = useState<PopulateField[]>(
    availableRelations.map(rel => ({
      name: rel.name,
      enabled: false,
      deep: false,
    }))
  );

  // Load current filters from URL when modal opens
  React.useEffect(() => {
    if (!initialFiltersLoaded) {
      console.log('[SimpleAdvancedFilter] Loading current query:', currentQuery);
      
      // Parse filters into structure
      if (currentQuery) {
        const parsed = parseQueryToStructure(currentQuery);
        setInitialStructure(parsed);
        setQueryStructure(parsed);
        
        // Parse populate and sort from URL
        const params = new URLSearchParams(currentQuery);
        const updatedPopulate = [...populateFields];
        
        params.forEach((value, key) => {
          // Parse populate
          if (key.startsWith('populate[')) {
            const match = key.match(/populate\[([^\]]+)\]/);
            if (match) {
              const fieldName = match[1];
              const index = updatedPopulate.findIndex(p => p.name === fieldName);
              if (index >= 0) {
                // Check if it's deep populate
                const isDeep = key.includes('[populate]') || value === '*';
                updatedPopulate[index] = {
                  ...updatedPopulate[index],
                  enabled: true,
                  deep: isDeep,
                };
              }
            }
          }
          // Parse sort
          else if (key === 'sort') {
            // Format: username:ASC or createdAt:DESC
            const parts = value.split(':');
            if (parts.length === 2) {
              setSortField(parts[0]);
              setSortOrder(parts[1].toUpperCase() as 'ASC' | 'DESC');
            }
          }
        });
        
        setPopulateFields(updatedPopulate);
      }
      
      setInitialFiltersLoaded(true);
      console.log('[SimpleAdvancedFilter] Initial structure loaded');
    }
  }, [currentQuery]);

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

  const handleApply = () => {
    if (!queryStructure) {
      console.warn('[SimpleAdvancedFilter] No query structure defined');
      return;
    }

    const queryString = generateQueryString(
      queryStructure,
      sortField,
      sortOrder,
      populateFields
    );
    
    console.log('[SimpleAdvancedFilter] Applying query:', queryString);
    onApply(queryString);
    onClose();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent padding={6} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <Flex justifyContent="space-between" alignItems="center" marginBottom={4}>
          <Typography as="h2" variant="beta">
            🔍 Advanced Filters
          </Typography>
          <Button onClick={onClose} variant="ghost" type="button">
            <Cross />
          </Button>
        </Flex>

        <Typography variant="pi" textColor="neutral600" marginBottom={4}>
          Build complex queries by combining AND/OR groups. Each group can contain conditions or nested groups.
        </Typography>

        {/* Query Builder */}
        <Box marginBottom={4}>
          <QueryBuilder 
            availableFields={availableFields}
            onQueryChange={setQueryStructure}
            initialStructure={initialStructure}
          />
        </Box>

        {/* Sorting Section */}
        <Box marginBottom={4} padding={3} background="warning100" borderRadius="4px">
          <Typography variant="pi" fontWeight="bold" style={{ marginBottom: '12px', display: 'block' }}>
            📊 Sorting:
          </Typography>
          <Flex gap={2} alignItems="center" style={{ flexWrap: 'wrap' }}>
            <Box style={{ flex: 2, minWidth: '200px' }}>
              <Typography variant="pi" style={{ marginBottom: '4px', display: 'block' }}>
                Sort by field:
              </Typography>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #dcdce4',
                  borderRadius: '4px',
                  background: 'white',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                <option value="">No sorting</option>
                {availableFields.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
            </Box>

            {sortField && (
              <Box style={{ flex: 1, minWidth: '120px' }}>
                <Typography variant="pi" style={{ marginBottom: '4px', display: 'block' }}>
                  Order:
                </Typography>
                <Flex gap={2}>
                  <Button
                    variant={sortOrder === 'ASC' ? 'default' : 'secondary'}
                    size="S"
                    onClick={() => setSortOrder('ASC')}
                  >
                    ↑ ASC
                  </Button>
                  <Button
                    variant={sortOrder === 'DESC' ? 'default' : 'secondary'}
                    size="S"
                    onClick={() => setSortOrder('DESC')}
                  >
                    ↓ DESC
                  </Button>
                </Flex>
              </Box>
            )}
          </Flex>
          {sortField && (
            <Typography variant="pi" textColor="warning700" style={{ marginTop: '8px', display: 'block', fontSize: '12px' }}>
              📊 Results will be sorted by <strong>{sortField}</strong> in <strong>{sortOrder}</strong> order
            </Typography>
          )}
        </Box>

        {/* Population Section */}
        {availableRelations.length > 0 && (
          <Box marginBottom={4} padding={3} background="neutral100" borderRadius="4px">
            <Typography variant="pi" fontWeight="bold" style={{ marginBottom: '12px', display: 'block' }}>
              🔗 Populate Relations:
            </Typography>
            {populateFields.map((field) => (
              <Flex 
                key={field.name} 
                gap={2} 
                alignItems="center" 
                marginBottom={2}
                style={{ flexWrap: 'wrap' }}
              >
                <Box style={{ flex: 1, minWidth: '120px' }}>
                  <Typography variant="pi">{field.name}</Typography>
                </Box>
                <Flex gap={2}>
                  <Button
                    variant={field.enabled && !field.deep ? 'default' : 'secondary'}
                    size="S"
                    onClick={() => togglePopulate(field.name)}
                  >
                    {field.enabled && !field.deep ? '✓ On' : 'Enable'}
                  </Button>
                  <Button
                    variant={field.deep ? 'default' : 'tertiary'}
                    size="S"
                    onClick={() => toggleDeepPopulate(field.name)}
                  >
                    {field.deep ? '🌲' : 'Deep'}
                  </Button>
                </Flex>
              </Flex>
            ))}
            <Typography variant="pi" textColor="neutral600" style={{ marginTop: '12px', display: 'block', fontSize: '12px' }}>
              💡 <strong>Deep populate</strong> loads all nested relations recursively
            </Typography>
          </Box>
        )}

        {/* Preview */}
        <Box marginBottom={4} padding={3} background="neutral100" borderRadius="4px">
          <Typography variant="pi" fontWeight="bold" style={{ marginBottom: '8px', display: 'block' }}>
            Generated Query:
          </Typography>
          <Typography variant="pi" fontFamily="monospace" style={{ wordBreak: 'break-all', fontSize: '11px' }}>
            {queryStructure ? generateQueryString(queryStructure, sortField, sortOrder, populateFields) : 'No filters defined'}
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

export default SimpleAdvancedFilterModal;

