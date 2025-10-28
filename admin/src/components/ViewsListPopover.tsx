// @ts-nocheck
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Flex,
} from '@strapi/design-system';
import { useIntl } from 'react-intl';
import pluginId from '../pluginId';

interface ViewsListPopoverProps {
  views: any[];
  onViewClick: (view: any) => void;
  isLoading?: boolean;
  buttonElement?: HTMLElement;
}

const ViewsListPopover: React.FC<ViewsListPopoverProps> = ({
  views,
  onViewClick,
  isLoading = false,
  buttonElement,
}) => {
  const { formatMessage } = useIntl();

  return (
    <Box
      hasRadius
      shadow="popover"
      padding={3}
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        marginTop: '8px',
        minWidth: '200px',
        maxWidth: '300px',
        zIndex: 1000,
        backgroundColor: 'white',
      }}
    >
      {isLoading ? (
        <Typography variant="pi" textColor="neutral600" textAlign="center">
          {formatMessage({ id: 'loading', defaultMessage: 'Loading...' })}
        </Typography>
      ) : views && views.length > 0 ? (
        <Flex direction="column" gap={1} as="nav">
          {views.map((view) => (
            <Button
              key={view.id}
              variant="ghost"
              fullWidth
              onClick={() => onViewClick(view)}
              style={{
                textAlign: 'left',
                justifyContent: 'flex-start',
              }}
            >
              {view.name}
            </Button>
          ))}
        </Flex>
      ) : (
        <Typography variant="pi" textColor="neutral600">
          {formatMessage({
            id: `${pluginId}.ViewsWidget.ViewsPopover.emptyList`,
            defaultMessage: "You don't have any private views saved yet...",
          })}
        </Typography>
      )}
    </Box>
  );
};

export default ViewsListPopover as any;
