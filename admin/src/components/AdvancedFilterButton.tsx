// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Button } from '@strapi/design-system';
import { Filter } from '@strapi/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFetchClient } from '@strapi/strapi/admin';
import SimpleAdvancedFilterModal from './SimpleAdvancedFilterModal';

const AdvancedFilterButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { get } = useFetchClient();
  const [availableFields, setAvailableFields] = useState<Array<{ name: string; type: string }>>([]);
  const [availableRelations, setAvailableRelations] = useState<Array<{ name: string }>>([]);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Check if URL has filters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let hasFilters = false;
    params.forEach((value, key) => {
      if (key.startsWith('filters[')) {
        hasFilters = true;
      }
    });
    setHasActiveFilters(hasFilters);
  }, [location.search]);

  // Extract content type UID from URL
  // /admin/content-manager/collection-types/plugin::users-permissions.user -> plugin::users-permissions.user
  const extractContentTypeUid = (): string | null => {
    const match = location.pathname.match(/collection-types\/([^/?]+)/);
    return match ? match[1] : null;
  };

  // Fetch schema for current content type
  useEffect(() => {
    const fetchSchema = async () => {
      const uid = extractContentTypeUid();
      if (!uid) {
        console.log('[AdvancedFilter] No content type UID found in URL');
        return;
      }

      try {
        console.log('[AdvancedFilter] Fetching schema for:', uid);
        
        // Try to get the actual content type schema
        let schemaData;
        try {
          const response = await get(`/content-manager/content-types/${uid}/configuration`);
          schemaData = response.data;
          console.log('[AdvancedFilter] Configuration response:', schemaData);
        } catch (e) {
          console.log('[AdvancedFilter] Configuration endpoint failed, trying direct strapi schema');
        }
        
        // Extract attributes from the layout/metadatas
        // The structure is: response.data.data.contentType
        const contentTypeData = schemaData?.data?.contentType || schemaData?.contentType || {};
        const metadatas = contentTypeData.metadatas || {};
        const layouts = contentTypeData.layouts || {};
        
        console.log('[AdvancedFilter] Metadatas:', metadatas);
        console.log('[AdvancedFilter] Layouts:', layouts);
        
        // Get fields from edit layout
        let allFieldNames = new Set<string>();
        
        // From metadatas (most reliable)
        Object.keys(metadatas).forEach(key => allFieldNames.add(key));
        
        // From edit layout
        if (layouts.edit) {
          layouts.edit.forEach((row: any) => {
            row.forEach((field: any) => {
              if (field.name) allFieldNames.add(field.name);
            });
          });
        }
        
        // From list layout
        if (layouts.list) {
          layouts.list.forEach((fieldName: string) => allFieldNames.add(fieldName));
        }
        
        const attributes = {};
        allFieldNames.forEach(name => {
          const metadata = metadatas[name];
          attributes[name] = {
            type: metadata?.edit?.type || 'string',
          };
        });
        
        console.log('[AdvancedFilter] Reconstructed attributes:', attributes);
        
        if (attributes && Object.keys(attributes).length > 0) {
          // Extract filterable fields
          const fields: Array<{ name: string; type: string }> = [];
          const relations: Array<{ name: string }> = [];
          const fieldNames = new Set<string>();
          
          Object.keys(attributes).forEach((key) => {
            const attr = attributes[key];
            
            // Check if it's a relation
            if (attr.type === 'relation') {
              relations.push({ name: key });
            } else if (!fieldNames.has(key)) {
              // Regular field - add only once
              fieldNames.add(key);
              fields.push({ 
                name: key, 
                type: attr.type || 'string' 
              });
            }
          });

          // Add default fields if not already present
          ['id', 'createdAt', 'updatedAt'].forEach(defaultField => {
            if (!fieldNames.has(defaultField)) {
              fields.unshift({ 
                name: defaultField, 
                type: defaultField === 'id' ? 'integer' : 'datetime' 
              });
            }
          });

          setAvailableFields(fields);
          setAvailableRelations(relations);
          
          console.log('[AdvancedFilter] Extracted fields:', fields);
          console.log('[AdvancedFilter] Extracted relations:', relations);
        } else {
          console.warn('[AdvancedFilter] No attributes found in schema response');
          // Use fallback
          setAvailableFields([
            { name: 'id', type: 'integer' },
            { name: 'createdAt', type: 'datetime' },
            { name: 'updatedAt', type: 'datetime' },
          ]);
        }
      } catch (error) {
        console.error('[AdvancedFilter] Error fetching schema:', error);
        // Fallback to basic fields
        setAvailableFields([
          { name: 'id', type: 'integer' },
          { name: 'createdAt', type: 'datetime' },
          { name: 'updatedAt', type: 'datetime' },
        ]);
      }
    };

    fetchSchema();
  }, [location.pathname]);

  const handleApplyFilters = (queryString: string) => {
    console.log('[AdvancedFilter] Applying filters:', queryString);
    
    // Get current path
    const currentPath = location.pathname;
    
    // Merge with existing query (keep pagination, sorting if present)
    const currentParams = new URLSearchParams(location.search);
    const newParams = new URLSearchParams(queryString);
    
    // Remove old filters
    const cleanParams = new URLSearchParams();
    currentParams.forEach((value, key) => {
      if (!key.startsWith('filters[') && !key.startsWith('populate[')) {
        cleanParams.set(key, value);
      }
    });
    
    // Add new filters
    newParams.forEach((value, key) => {
      cleanParams.set(key, value);
    });
    
    // Navigate with new query
    navigate(`${currentPath}?${cleanParams.toString()}`);
  };

  const handleClearFilters = () => {
    const currentPath = location.pathname;
    const currentParams = new URLSearchParams(location.search);
    
    // Keep only non-filter params (like page, pageSize, sort)
    const cleanParams = new URLSearchParams();
    currentParams.forEach((value, key) => {
      if (!key.startsWith('filters[') && !key.startsWith('populate[')) {
        cleanParams.set(key, value);
      }
    });
    
    navigate(`${currentPath}${cleanParams.toString() ? '?' + cleanParams.toString() : ''}`);
  };

  // Extract current filters from URL
  const getCurrentFilters = () => {
    const params = new URLSearchParams(location.search);
    const currentQuery = params.toString();
    console.log('[AdvancedFilter] Current query from URL:', currentQuery);
    return currentQuery;
  };

  return (
    <>
      <Button
        variant={hasActiveFilters ? 'default' : 'secondary'}
        startIcon={<Filter />}
        onClick={() => setShowModal(true)}
        size="S"
      >
        {hasActiveFilters ? '🔍 Filters Active' : 'Advanced Filters'}
      </Button>

      {hasActiveFilters && (
        <Button
          variant="danger-light"
          onClick={handleClearFilters}
          size="S"
        >
          Clear All
        </Button>
      )}

      {showModal && (
        <SimpleAdvancedFilterModal
          onClose={() => setShowModal(false)}
          onApply={handleApplyFilters}
          availableFields={availableFields}
          availableRelations={availableRelations}
          currentQuery={getCurrentFilters()}
        />
      )}
    </>
  );
};

export default AdvancedFilterButton;

