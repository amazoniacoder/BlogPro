// client/src/admin/pages/media/components/MediaTable.tsx
import React from "react";
import { MediaItem, MediaAction } from "../state/types";

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
  const handleItemClick = (item: MediaItem) => {
    dispatch({ type: "SHOW_VIEW_MODAL", item });
  };



  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    e.stopPropagation();
    dispatch({ type: "TOGGLE_ITEM_SELECTION", itemId });
  };

  const handleDeleteClick = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    dispatch({ type: "SHOW_DELETE_MODAL", itemId });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="admin-table-container">
      {items.length === 0 ? (
        <div className="admin-table__empty">
          <p>No media items found matching your criteria.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead className="admin-table__head">
            <tr className="admin-table__row">
              <th className="admin-table__header-cell admin-table__cell--checkbox">
                <input 
                  type="checkbox" 
                  onChange={(e) => {
                    if (e.target.checked) {
                      dispatch({ type: "SELECT_ALL_ITEMS", selected: true });
                    } else {
                      dispatch({ type: "SELECT_ALL_ITEMS", selected: false });
                    }
                  }}
                  checked={items.length > 0 && selectedItems.length === items.length}
                />
              </th>
              <th className="admin-table__header-cell admin-table__cell--thumbnail">Preview</th>
              <th className="admin-table__header-cell">File Name</th>
              <th className="admin-table__header-cell">Type</th>
              <th className="admin-table__header-cell">Size</th>
              <th className="admin-table__header-cell">Dimensions</th>
              <th className="admin-table__header-cell">Uploaded</th>
              <th className="admin-table__header-cell admin-table__cell--actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr 
                key={item.id} 
                className={`admin-table__row ${selectedItems.includes(item.id) ? "admin-table__row--selected" : ""}`}
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
                    {item.mimeType?.startsWith("image/") ? (
                      <img
                        src={item.thumbnailUrl || item.url}
                        alt={item.alt || item.originalName}
                        className="admin-table__thumbnail-image"
                      />
                    ) : (
                      <div className="admin-table__thumbnail-placeholder">
                        {item.mimeType?.split('/')[0] || 'file'}
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
                      title="Edit Media"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemClick(item);
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button 
                      className="admin-button admin-button--delete"
                      title="Delete Media"
                      onClick={(e) => handleDeleteClick(e, item.id)}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
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
