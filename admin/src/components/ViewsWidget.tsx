import React, { useContext, useRef, useState, useEffect } from 'react';
import {
  Button,
  Flex,
} from '@strapi/design-system';
import { List, Plus } from '@strapi/icons';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { useFetchClient } from '@strapi/strapi/admin';

import ViewsListPopover from './ViewsListPopover';
import CreateEditModal from './CreateEditModal';
import pluginId from '../pluginId';

interface ViewsWidgetProps {
  privateViews?: any[];
  onCreateView?: () => void;
  onShowViews?: () => void;
}

const ViewsWidget: React.FC<ViewsWidgetProps> = () => {
  const { formatMessage } = useIntl();
  const navigate = useNavigate();
  const { get } = useFetchClient();
  const viewsButtonRef = useRef<HTMLButtonElement | null>(null);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [viewsPopoverVisible, setViewsPopoverVisible] = React.useState(false);
  const [bookmarks, setBookmarks] = React.useState<any[]>([]);
  const [isLoadingViews, setIsLoadingViews] = React.useState(false);
  const [currentPath, setCurrentPath] = React.useState('');
  const [currentQuery, setCurrentQuery] = React.useState('');

  const getBookmarks = async () => {
    setIsLoadingViews(true);
    const url = `/magic-mark/bookmarks`;
    
    try {
      const { data } = await get(url);
      setBookmarks(data.data || []);
    } catch (error) {
      console.error('[Magic-Mark] Error fetching bookmarks:', error);
      setBookmarks([]);
    } finally {
      setIsLoadingViews(false);
    }
  };

  const handleOpenModal = () => {
    // Capture current path and query from location
    let path = window.location.pathname;
    
    // Remove /admin prefix if present (navigate will add it automatically)
    if (path.startsWith('/admin/')) {
      path = path.substring(6); // Remove '/admin'
    }
    
    const query = window.location.search.substring(1); // Remove leading '?'
    console.log('[ViewsWidget] Captured path:', path);
    console.log('[ViewsWidget] Captured query:', query);
    
    setCurrentPath(path);
    setCurrentQuery(query);
    setShowCreateModal(true);
  };

  React.useEffect(() => {
    getBookmarks();
  }, [showCreateModal]);

  const handleBookmarkClick = (bookmark: any) => {
    if (bookmark.path && bookmark.query) {
      // Navigate to: /admin/content-manager/collection-types/api::article.article?filters...
      navigate(`${bookmark.path}?${bookmark.query}`);
    } else if (bookmark.path) {
      navigate(bookmark.path);
    }
    setViewsPopoverVisible(false);
  };

  return (
    <Flex gap={2} marginRight={1}>
      <Button
        variant="tertiary"
        startIcon={<Plus />}
        onClick={handleOpenModal}
      >
        {formatMessage({
          id: `${pluginId}.ViewsWidget.actions.create`,
          defaultMessage: 'Save Bookmark',
        })}
      </Button>

      <div style={{ position: 'relative' }}>
        <Button
          ref={viewsButtonRef}
          variant="tertiary"
          startIcon={<List />}
          onClick={() => setViewsPopoverVisible((s) => !s)}
        >
          {formatMessage({
            id: `${pluginId}.ViewsWidget.actions.showList`,
            defaultMessage: 'Magicmark',
          })}
        </Button>

        {viewsPopoverVisible && viewsButtonRef.current && (
          <ViewsListPopover
            views={bookmarks}
            onViewClick={handleBookmarkClick}
            isLoading={isLoadingViews}
            buttonElement={viewsButtonRef.current}
          />
        )}
      </div>

      {showCreateModal && (
        <CreateEditModal
          bookmark={null}
          pluginId={pluginId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            getBookmarks();
          }}
          currentPath={currentPath}
          currentQuery={currentQuery}
        />
      )}
    </Flex>
  );
};

export default ViewsWidget;
