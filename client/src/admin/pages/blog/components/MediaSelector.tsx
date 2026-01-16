// client/src/admin/pages/blog/components/MediaSelector.tsx
import React, { useEffect, useState } from "react";
import { MediaFile as MediaItem } from "@/types/media";
import { useMediaData } from "../hooks/useMediaData";

interface MediaSelectorProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

const MediaSelector: React.FC<MediaSelectorProps> = ({ onSelect, onClose }) => {
  const { fetchMedia } = useMediaData();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMedia = async () => {
      try {
        setLoading(true);
        const response = await fetchMedia();
        // Filter to only show images and fix type compatibility
        const imageItems = response.data
          .filter((item) => item.mimeType?.startsWith("image/"))
          .map((item) => ({
            ...item,
            thumbnailUrl: item.thumbnailUrl || undefined
          }));
        setMediaItems(imageItems);
      } catch (err) {
        setError("Failed to load media items");
        console.error("Error loading media:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMedia();
  }, [fetchMedia]);

  // Function to handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = `${window.location.origin}/images/placeholder-image.png`;
  };

  return (
    <div className="admin-modal">
      <div className="admin-modal__overlay" onClick={onClose}></div>
      <div className="admin-modal__content admin-modal__content--large">
        <div className="admin-modal__header">
          <h3 className="admin-modal__title">Select Media</h3>
          <button className="admin-modal__close hover-bg" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="admin-modal__body">
          {loading ? (
            <div className="admin-loading">
              <div className="admin-loading__spinner"></div>
              <p>Loading media...</p>
            </div>
          ) : error ? (
            <div className="admin-alert admin-alert--error">
              <p>{error}</p>
            </div>
          ) : mediaItems.length === 0 ? (
            <div className="admin-empty">
              <p>No media items found. Please upload some images first.</p>
            </div>
          ) : (
            <div className="admin-media">
              <div className="admin-media__grid">
                {mediaItems.map((item) => (
                  <div
                    key={item.id}
                    className="admin-media__card"
                    onClick={() => onSelect(item.url)}
                  >
                    <div className="admin-media__thumbnail">
                      <img
                        src={item.thumbnailUrl || item.url}
                        alt={item.alt || item.originalName}
                        onError={handleImageError}
                        className="admin-media__image"
                      />
                    </div>
                    <div className="admin-media__info">
                      <div
                        className="admin-media__name"
                        title={item.originalName}
                      >
                        {item.originalName.length > 20
                          ? item.originalName.substring(0, 17) + "..."
                          : item.originalName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="admin-modal__footer">
          <button
            className="admin-button admin-button--secondary"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaSelector;
