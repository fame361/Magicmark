// @ts-nocheck
import React from 'react';
import { Box, Flex, Typography } from '@strapi/design-system';
import styled from 'styled-components';
import { parseQueryString, ParsedQuery, ParsedFilter } from '../utils/queryParser';

const FilterChip = styled.div<{ logic?: 'AND' | 'OR' }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 4px;
  background: ${props => props.logic === 'OR' ? '#FFF4E6' : '#E8F4FD'};
  border: 1px solid ${props => props.logic === 'OR' ? '#FFB84D' : '#5DA9E9'};
  font-size: 12px;
  margin: 4px;
  gap: 4px;
`;

const LogicBadge = styled.span<{ logic: 'AND' | 'OR' }>`
  font-weight: bold;
  color: ${props => props.logic === 'OR' ? '#D97706' : '#0369A1'};
  font-size: 10px;
  text-transform: uppercase;
`;

const PopulateChip = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 4px;
  background: #F0FDF4;
  border: 1px solid #86EFAC;
  font-size: 12px;
  margin: 4px;
`;

const SortChip = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 4px;
  background: #FEF3C7;
  border: 1px solid #FCD34D;
  font-size: 12px;
  margin: 4px;
`;

interface FilterPreviewProps {
  query: string;
}

const FilterPreview: React.FC<FilterPreviewProps> = ({ query }) => {
  const parsed = parseQueryString(query);

  if (!query || (parsed.filters.length === 0 && parsed.sort.length === 0 && parsed.populate.length === 0)) {
    return (
      <Box padding={2} background="neutral100" borderRadius="4px">
        <Typography variant="pi" textColor="neutral600">
          No filters applied
        </Typography>
      </Box>
    );
  }

  return (
    <Box padding={3} background="neutral100" borderRadius="4px">
      {/* Filters */}
      {parsed.filters.length > 0 && (
        <Box marginBottom={2}>
          <Typography variant="pi" fontWeight="bold" style={{ marginBottom: '8px', display: 'block' }}>
            Filters:
          </Typography>
          <Flex wrap="wrap" gap={1}>
            {parsed.filters.map((filter, idx) => (
              <FilterChip key={idx} logic={filter.logic}>
                {filter.logic && <LogicBadge logic={filter.logic}>{filter.logic}</LogicBadge>}
                <span>{filter.field} {filter.operator} <strong>{filter.value}</strong></span>
              </FilterChip>
            ))}
          </Flex>
        </Box>
      )}

      {/* Sorting */}
      {parsed.sort.length > 0 && (
        <Box marginBottom={2}>
          <Typography variant="pi" fontWeight="bold" style={{ marginBottom: '8px', display: 'block' }}>
            Sorting:
          </Typography>
          <Flex wrap="wrap" gap={1}>
            {parsed.sort.map((sort, idx) => (
              <SortChip key={idx}>
                📊 {sort}
              </SortChip>
            ))}
          </Flex>
        </Box>
      )}

      {/* Population */}
      {parsed.populate.length > 0 && (
        <Box>
          <Typography variant="pi" fontWeight="bold" style={{ marginBottom: '8px', display: 'block' }}>
            Relations:
          </Typography>
          <Flex wrap="wrap" gap={1}>
            {parsed.populate.map((field, idx) => (
              <PopulateChip key={idx}>
                🔗 {field}
              </PopulateChip>
            ))}
          </Flex>
        </Box>
      )}
    </Box>
  );
};

export default FilterPreview;

