

export interface AuthorInfoProps {
  author?: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  compact?: boolean;
}

export function AuthorInfo({ author, compact = false }: AuthorInfoProps) {
  return (
    <div className={`author-info ${compact ? 'author-info--compact' : ''}`}>
      <div className="author-info__content">
        {author && (
          <div className="author-info__details">
            {author.avatar && (
              <img 
                src={author.avatar} 
                alt={author.name}
                className="author-info__avatar"
              />
            )}
            <div className="author-info__text">
              <h4 className="author-info__name">{author.name}</h4>
              {author.bio && (
                <p className="author-info__bio">{author.bio}</p>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}