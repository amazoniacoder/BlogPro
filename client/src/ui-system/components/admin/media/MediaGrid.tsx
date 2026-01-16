import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/ui-system/icons/components';
import type { MediaItem, MediaAction } from '@/admin/pages/media/state/types';

interface MediaGridProps {
  items: MediaItem[];
  selectedItems: string[];
  dispatch: React.Dispatch<MediaAction>;
  mode?: 'default' | 'picker';
  onItemClick?: (item: MediaItem) => void;
}

const MediaGrid: React.FC<MediaGridProps> = ({ 
  items, 
  selectedItems, 
  dispatch, 
  mode = 'default',
  onItemClick 
}) => {
  const { t } = useTranslation(['admin', 'common']);

  const handleItemClick = (item: MediaItem) => {
    if (mode === 'picker' && onItemClick) {
      onItemClick(item);
    } else {
      dispatch({ type: 'SHOW_VIEW_MODAL', item });
    }
  };

  const handleSelectItem = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_ITEM_SELECTION', itemId });
  };

  const handleDeleteClick = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    dispatch({ type: 'SHOW_DELETE_MODAL', itemId });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Failed to load image, hiding element');
    e.currentTarget.style.display = 'none';
    const parent = e.currentTarget.parentElement;
    if (parent) {
      parent.innerHTML = '<div class="admin-media__icon"><span>🖼️</span></div>';
    }
  };

  const getMediaIcon = (mimeType: string | undefined) => {
    if (mimeType?.startsWith('image/')) return <Icon name="image" size={24} />;
    if (mimeType?.startsWith('video/')) return <Icon name="video" size={24} />;
    if (mimeType?.startsWith('audio/')) return <Icon name="audio" size={24} />;
    return <Icon name="file" size={24} />;
  };

  return (
    <div className="admin-media">
      {items.length === 0 ? (
        <div className="admin-empty text-center">
          <p>{t('admin:noMediaFound', { defaultValue: 'Медиафайлы не найдены.' })}</p>
        </div>
      ) : (
        <div className="admin-media__grid">
          {items.map((item) => (
            <div
              key={item.id}
              className={`admin-media__card overflow-hidden ${
                selectedItems.includes(item.id) ? 'admin-media__card--selected' : ''
              } ${
                mode === 'picker' ? 'admin-media__card--picker' : ''
              }`}
              onClick={() => handleItemClick(item)}
            >
              <div className="admin-media__thumbnail overflow-hidden">
                {item.mimeType?.startsWith('image/') ? (
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.alt || item.originalName}
                    onError={handleImageError}
                    className={`admin-media__image ${
                      mode === 'picker' ? 'admin-media__image--picker' : ''
                    }`}
                  />
                ) : (
                  <div className="admin-media__icon">
                    {getMediaIcon(item.mimeType)}
                  </div>
                )}

                {mode === 'default' && (
                  <div className="admin-media__actions">
                    <button
                      className="admin-media__select rounded"
                      onClick={(e) => handleSelectItem(e, item.id)}
                      aria-label={
                        selectedItems.includes(item.id) 
                          ? t('admin:deselect', { defaultValue: 'Отменить выбор' }) 
                          : t('admin:select', { defaultValue: 'Выбрать' })
                      }
                    >
                      {selectedItems.includes(item.id) ? (
                        <Icon name="check" size={16} />
                      ) : (
                        <Icon name="circle" size={16} />
                      )}
                    </button>
                    <button
                      className="admin-media__delete rounded"
                      onClick={(e) => handleDeleteClick(e, item.id)}
                      aria-label={t('common:delete')}
                      title={t('admin:deleteMedia', { defaultValue: 'Удалить медиафайл' })}
                    >
                      <Icon name="delete" size={16} />
                    </button>
                  </div>
                )}
                
                {mode === 'picker' && (
                  <div className="admin-media__picker-overlay">
                    <Icon name="check" size={24} />
                  </div>
                )}
              </div>

              <div className="admin-media__info">
                <div className="admin-media__name whitespace-nowrap" title={item.originalName}>
                  {item.originalName.length > 20
                    ? item.originalName.substring(0, 17) + '...'
                    : item.originalName}
                </div>
                <div className="admin-media__details">
                  <span>{formatFileSize(item.size)}</span>
                  {item.width && item.height && (
                    <span>{item.width}×{item.height}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(MediaGrid);
