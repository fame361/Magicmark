// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import {
  Box,
  Button,
  Flex,
  TextInput,
  Textarea,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Typography,
  Stack,
} from '@strapi/design-system';
import styled from 'styled-components';

const EmojiPicker = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
`;

const EmojiButton = styled.button<{ isSelected?: boolean }>`
  padding: 8px;
  font-size: 24px;
  border: 2px solid ${props => props.isSelected ? '#3945C9' : '#e0e0e0'};
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3945C9;
    background: #f7f8fa;
  }
`;

const BOOKMARK_EMOJIS = ['🔖', '📌', '⭐', '💫', '❤️', '🎯', '🚀', '📝', '🔗', '🌟', '💼', '🎨', '📚', '🔔', '✅', '🎁'];

interface CreateEditModalProps {
  bookmark: any | null;
  onClose: () => void;
  onSuccess: () => void;
  pluginId: string;
}

const CreateEditModal: React.FC<CreateEditModalProps> = ({
  bookmark,
  onClose,
  onSuccess,
  pluginId,
}) => {
  const { formatMessage } = useIntl();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [emoji, setEmoji] = useState('🔖');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (bookmark) {
      setName(bookmark.name);
      setUrl(bookmark.url);
      setEmoji(bookmark.emoji);
      setDescription(bookmark.description || '');
    }
  }, [bookmark]);

  const validateForm = () => {
    setError('');
    if (!name.trim()) {
      setError(formatMessage({
        id: `${pluginId}.error.nameRequired`,
        defaultMessage: 'Name is required'
      }));
      return false;
    }
    if (!url.trim()) {
      setError(formatMessage({
        id: `${pluginId}.error.urlRequired`,
        defaultMessage: 'URL is required'
      }));
      return false;
    }
    try {
      new URL(url);
    } catch {
      setError(formatMessage({
        id: `${pluginId}.error.invalidUrl`,
        defaultMessage: 'Please enter a valid URL (e.g., https://example.com)'
      }));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const method = bookmark ? 'PUT' : 'POST';
      const endpoint = bookmark
        ? `/admin/plugins/${pluginId}/bookmarks/${bookmark.id}`
        : `/admin/plugins/${pluginId}/bookmarks`;

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          url,
          emoji,
          description,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save bookmark');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving bookmark:', error);
      setError(formatMessage({
        id: `${pluginId}.error.save`,
        defaultMessage: 'Failed to save bookmark'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!bookmark;

  return (
    <Modal onClose={onClose} size="M">
      <ModalHeader>
        <Typography as="h2" id="title" variant="beta">
          {isEditing
            ? formatMessage({
                id: `${pluginId}.modal.edit`,
                defaultMessage: 'Edit Bookmark'
              })
            : formatMessage({
                id: `${pluginId}.modal.create`,
                defaultMessage: 'Create New Bookmark'
              })}
        </Typography>
      </ModalHeader>
      <ModalBody>
        <Stack spacing={4}>
          {error && (
            <Box padding={3} background="danger100" borderRadius="4px">
              <Typography textColor="danger600">{error}</Typography>
            </Box>
          )}

          {/* Emoji Selector */}
          <Box>
            <Typography variant="pi" fontWeight="bold" marginBottom={2}>
              {formatMessage({
                id: `${pluginId}.form.emoji`,
                defaultMessage: 'Choose Icon'
              })}
            </Typography>
            <Flex gap={2} alignItems="center">
              <Box
                as="button"
                padding={3}
                borderRadius="4px"
                border="1px solid #e0e0e0"
                fontSize="32px"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                style={{ cursor: 'pointer' }}
              >
                {emoji}
              </Box>
              <Typography variant="pi" textColor="neutral600">
                {formatMessage({
                  id: `${pluginId}.form.selectEmoji`,
                  defaultMessage: 'Click to select'
                })}
              </Typography>
            </Flex>
            {showEmojiPicker && (
              <EmojiPicker>
                {BOOKMARK_EMOJIS.map((e) => (
                  <EmojiButton
                    key={e}
                    isSelected={emoji === e}
                    onClick={() => {
                      setEmoji(e);
                      setShowEmojiPicker(false);
                    }}
                  >
                    {e}
                  </EmojiButton>
                ))}
              </EmojiPicker>
            )}
          </Box>

          {/* Name */}
          <Box>
            <Typography variant="pi" fontWeight="bold" as="label" htmlFor="name" marginBottom={2}>
              {formatMessage({
                id: `${pluginId}.form.name`,
                defaultMessage: 'Bookmark Name'
              })} *
            </Typography>
            <TextInput
              id="name"
              type="text"
              placeholder="e.g., Google Search"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Box>

          {/* URL */}
          <Box>
            <Typography variant="pi" fontWeight="bold" as="label" htmlFor="url" marginBottom={2}>
              {formatMessage({
                id: `${pluginId}.form.url`,
                defaultMessage: 'URL'
              })} *
            </Typography>
            <TextInput
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Typography variant="pi" textColor="neutral600" marginTop={1}>
              {formatMessage({
                id: `${pluginId}.form.urlHelp`,
                defaultMessage: 'Enter the full URL with https://'
              })}
            </Typography>
          </Box>

          {/* Description */}
          <Box>
            <Typography variant="pi" fontWeight="bold" as="label" htmlFor="description" marginBottom={2}>
              {formatMessage({
                id: `${pluginId}.form.description`,
                defaultMessage: 'Description (Optional)'
              })}
            </Typography>
            <Textarea
              id="description"
              placeholder="Add a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Box>
        </Stack>
      </ModalBody>
      <ModalFooter
        startActions={
          <Button onClick={onClose} variant="tertiary">
            {formatMessage({
              id: `${pluginId}.button.cancel`,
              defaultMessage: 'Cancel'
            })}
          </Button>
        }
        endActions={
          <Button
            onClick={handleSubmit}
            loading={isSubmitting}
          >
            {isEditing
              ? formatMessage({
                  id: `${pluginId}.button.update`,
                  defaultMessage: 'Update'
                })
              : formatMessage({
                  id: `${pluginId}.button.create`,
                  defaultMessage: 'Create'
                })}
          </Button>
        }
      />
    </Modal>
  );
};

export default CreateEditModal;
