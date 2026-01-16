import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/ui-system/icons/components';
import type { MediaItem, MediaAction } from '@/admin/pages/media/state/types';

interface MediaTableProps {
  items: MediaItem[];
  selectedItems: string[];
  dispatch: React.Dispatch<MediaAction>;
}

const MediaTable: React.FC<MediaTableProps> = ({
  items,
  selectedItems,
  dispatch,
}) => {
  const { t } = useTranslation(['admin', 'common']);

  const handleItemClick = (item: MediaItem) => {
    dispatch({ type: 'SHOW_VIEW_MODAL', item });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getMediaIcon = (mimeType: string | undefined) => {
    if (mimeType?.startsWith('image/')) return <Icon name="image" size={16} />;
    if (mimeType?.startsWith('video/')) return <Icon name="video" size={16} />;
    if (mimeType?.startsWith('audio/')) return <Icon name="audio" size={16} />;
    return <Icon name="file" size={16} />;
  };

  return (
    <div className="admin-table-container">
      {items.length === 0 ? (
        <div className="admin-empty">
          <p>{t('admin:noMediaFound', { defaultValue: 'No media items found matching your criteria.' })}</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead className="admin-table__head">
            <tr className="admin-table__row">
              <th className="admin-table__header-cell admin-table__cell--checkbox">
                <input 
                  type="checkbox" 
                  onChange={(e) => {
                    dispatch({ 
                      type: 'SELECT_ALL_ITEMS', 
                      selected: e.target.checked 
                    });
                  }}
                  checked={items.length > 0 && selectedItems.length === items.length}
                />
              </th>
              <th className="admin-table__header-cell admin-table__cell--thumbnail">
                {t('admin:preview', { defaultValue: 'Preview' })}
              </th>
              <th className="admin-table__header-cell">
                {t('admin:fileName', { defaultValue: 'File Name' })}
              </th>
              <th className="admin-table__header-cell">
                {t('admin:type', { defaultValue: 'Type' })}
              </th>
              <th className="admin-table__header-cell">
                {t('admin:size', { defaultValue: 'Size' })}
              </th>
              <th className="admin-table__header-cell">
                {t('admin:dimensions', { defaultValue: 'Dimensions' })}
              </th>
              <th className="admin-table__header-cell">
                {t('admin:uploaded', { defaultValue: 'Uploaded' })}
              </th>
              <th className="admin-table__header-cell admin-table__cell--actions">
                {t('common:actions', { defaultValue: 'Actions' })}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr 
                key={item.id} 
                className={`admin-table__row ${selectedItems.includes(item.id) ? 'admin-table__row--selected' : ''}`}
                onClick={() => handleItemClick(item)}
              >
                <td className="admin-table__cell admin-table__cell--checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => handleCheckboxChange(e, item.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="admin-table__cell admin-table__cell--thumbnail">
                  <div className="admin-table__thumbnail">
                    {item.mimeType?.startsWith('image/') ? (
                      <img
                        src={item.thumbnailUrl || item.url}
                        alt={item.alt || item.originalName}
                        className="admin-table__thumbnail-image"
                      />
                    ) : (
                      <div className="admin-table__thumbnail-placeholder">
                        {getMediaIcon(item.mimeType)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="admin-table__cell">
                  <div className="admin-table__content">
                    <div className="admin-table__content-title">{item.originalName}</div>
                    <div className="admin-table__content-subtitle">{item.alt || ''}</div>
                  </div>
                </td>
                <td className="admin-table__cell">{item.mimeType}</td>
                <td className="admin-table__cell">{formatFileSize(item.size)}</td>
                <td className="admin-table__cell">
                  {item.width && item.height ? `${item.width}×${item.height}` : '-'}
                </td>
                <td className="admin-table__cell">{formatDate(item.createdAt)}</td>
                <td className="admin-table__cell admin-table__cell--actions">
                  <div className="admin-table__actions">
                    <button 
                      className="admin-button admin-button--edit"
                      title={t('admin:editMedia', { defaultValue: 'Edit Media' })}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemClick(item);
                      }}
                    >
                      <Icon name="edit" size={12} />
                    </button>
                    <button 
                      className="admin-button admin-button--delete"
                      title={t('admin:deleteMedia', { defaultValue: 'Delete Media' })}
                      onClick={(e) => handleDeleteClick(e, item.id)}
                    >
                      <Icon name="delete" size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default React.memo(MediaTable);
