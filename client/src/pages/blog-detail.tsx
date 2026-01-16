import React, { useEffect, useState, useCallback } from 'react';
import { useRoute, Link } from 'wouter';
import { blogService } from '@/services/api/blog';
import { BlogPost } from '@/types/blog';
import { Spinner } from '@/ui-system/components/feedback';
import websocketService from '@/services/websocket-service';
import { MediaService } from '@/plugins/texteditor/core/services/media/MediaService';
import { Icon } from '@/ui-system/icons/components';
import { useTranslation } from '@/hooks/useTranslation';
import { CommentSection, CommentCounter } from '@/ui-system/components/comments';
import { Breadcrumb } from '@/ui-system/components/navigation';
import { BlogHero, AuthorInfo, SocialShare } from '@/ui-system/components/blog';
import { Modal } from '@/ui-system/components/modal';


const BlogDetail: React.FC = () => {
  const { t } = useTranslation('blog');
  const { t: tErrors } = useTranslation('errors');

  const [match, params] = useRoute<{ id: string }>('/blog/:id');
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  // Transform backend blog post data to frontend BlogPost type
  const transformBackendBlogPost = useCallback((backendBlogPost: any): BlogPost => {
    // Database uses snake_case consistently
    const createdAt = backendBlogPost.created_at;
    const updatedAt = backendBlogPost.updated_at;
    const imageUrl = backendBlogPost.image_url;
    const thumbnailUrl = backendBlogPost.thumbnail_url;
    const projectUrl = backendBlogPost.project_url;
    
    const createdAtISO = createdAt ? new Date(createdAt).toISOString() : new Date().toISOString();
    const updatedAtISO = updatedAt ? new Date(updatedAt).toISOString() : createdAtISO;
    
    return {
      id: backendBlogPost.id.toString(),
      title: backendBlogPost.title || '',
      description: backendBlogPost.description || '',
      content: backendBlogPost.content || '',
      categoryId: backendBlogPost.category_id,
      imageUrl: imageUrl || null,
      thumbnailUrl: thumbnailUrl || null,
      projectUrl: projectUrl || null,
      technologies: backendBlogPost.technologies || [],
      status: backendBlogPost.status || 'draft',
      slug: backendBlogPost.slug || null,
      tags: backendBlogPost.tags || [],
      created_at: createdAtISO,
      updated_at: updatedAtISO,
      author_id: backendBlogPost.author_id,
      author_name: backendBlogPost.author_name,
      author_bio: backendBlogPost.author_bio,
      author_avatar: backendBlogPost.author_avatar,
    };
  }, []);

  // Fetch comment count
  const fetchCommentCount = useCallback(async (postId: string) => {
    try {
      console.log('🔍 Fetching comment count for post ID:', postId);
      const response = await fetch(`/api/comments/${postId}/count`);
      console.log('📡 API Response status:', response.status);
      const data = await response.json();
      console.log('📊 API Response data:', data);
      if (data.success) {
        console.log('✅ Setting comment count to:', data.data?.count || 0);
        setCommentCount(data.data?.count || 0);
      } else {
        console.log('❌ API response not successful:', data);
        setCommentCount(0);
      }
    } catch (error) {
      console.error('❌ Error fetching comment count:', error);
      setCommentCount(0);
    }
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      if (!match || !params?.id) return;

      try {
        setLoading(true);
        // Try to get the specific blog post by ID first
        try {
          const data = await blogService.getBlogPostById(params.id);
          if (data) {
            setPost(data);
            
            // Get all posts for related posts
            const allPosts = await blogService.getAll();
            
            // Fetch related posts (same category)
            if (data.categoryId) {
              const related = allPosts
                .filter(p => 
                  p.id.toString() !== data.id.toString() && 
                  p.categoryId === data.categoryId &&
                  p.status === 'published'
                )
                .slice(0, 3); // Limit to 3 related posts
              
              setRelatedPosts(related);
            }
            
            setError(null);
            return;
          }
        } catch (err) {
          console.log('Direct API call failed, trying fallback method');
        }
        
        // Fallback: Get all posts and find the one with matching ID
        const allPosts = await blogService.getAll();
        const data = allPosts.find((post: BlogPost) => post.id.toString() === params.id);

        if (!data) {
          throw new Error('Blog post not found');
        }
        
        setPost(data);
        
        // Fetch related posts (same category) only if we haven't already done it
        if (data.categoryId && relatedPosts.length === 0) {
          const related = allPosts
            .filter(p => 
              p.id.toString() !== data.id.toString() && 
              p.categoryId === data.categoryId &&
              p.status === 'published'
            )
            .slice(0, 3); // Limit to 3 related posts
          
          setRelatedPosts(related);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError(tErrors('somethingWentWrong'));
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params?.id, match, tErrors, relatedPosts.length]);

  // WebSocket integration for real-time updates
  useEffect(() => {
    if (!params?.id) return;

    const currentPostId = params.id;
    console.log('Setting up WebSocket handlers for blog detail page:', currentPostId);
    
    const handleOpen = () => {};
    const handleClose = () => {};

    const handleBlogUpdated = (backendData: any) => {
      console.log('Blog post updated via WebSocket:', backendData);
      
      // Only update if this is the same post being viewed
      if (String(backendData.id) === currentPostId) {
        const transformedPost = transformBackendBlogPost(backendData);
        setPost(transformedPost);
        console.log('Current blog post updated in detail view:', transformedPost);
      }
    };

    const handleBlogDeleted = (data: { id: string | number }) => {
      console.log('Blog post deleted via WebSocket:', data.id);
      
      // If the current post is deleted, show error
      if (String(data.id) === currentPostId) {
        console.log('Current blog post deleted via WebSocket');
        setError(t('postDeleted', 'This blog post has been deleted.'));
        setPost(null);
      }
    };

    const handleCommentUpdate = () => {
      // Refresh comment count when comments are updated
      if (post?.id) {
        fetchCommentCount(post.id);
      }
    };

    // Subscribe to WebSocket events
    websocketService.subscribe('_open', handleOpen);
    websocketService.subscribe('_close', handleClose);
    websocketService.subscribe('_connected', handleOpen);
    websocketService.subscribe('blog_updated', handleBlogUpdated);
    websocketService.subscribe('blog_deleted', handleBlogDeleted);
    websocketService.subscribe('comment_created', handleCommentUpdate);
    websocketService.subscribe('comment_deleted', handleCommentUpdate);

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up WebSocket handlers for blog detail page');
      websocketService.unsubscribe('_open', handleOpen);
      websocketService.unsubscribe('_close', handleClose);
      websocketService.unsubscribe('_connected', handleOpen);
      websocketService.unsubscribe('blog_updated', handleBlogUpdated);
      websocketService.unsubscribe('blog_deleted', handleBlogDeleted);
      websocketService.unsubscribe('comment_created', handleCommentUpdate);
      websocketService.unsubscribe('comment_deleted', handleCommentUpdate);
    };
  }, [params?.id, transformBackendBlogPost, post?.id, fetchCommentCount]);

  // Initialize frontend image popups after content is rendered
  useEffect(() => {
    if (post && post.content) {
      // Small delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        MediaService.initFrontendImagePopups();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [post?.content]);

  // Fetch comment count when post is loaded
  useEffect(() => {
    if (post?.id) {
      fetchCommentCount(post.id);
    }
  }, [post?.id, fetchCommentCount]);

  // Handle comment anchor scrolling and sidebar reset
  useEffect(() => {
    // Close sidebar when navigating away
    setSidebarOpen(false);
    
    if (post) {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#comment-')) {
        // Wait for comments to load, then scroll
        const timer = setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
            element.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            // Add highlight effect
            element.classList.add('comment-item--highlighted');
            setTimeout(() => {
              element.classList.remove('comment-item--highlighted');
            }, 3000);
          }
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
  }, [post, params?.id]);

  if (loading) {
    return (
      <div className="blog-detail-page">
        <div className="blog-detail__loading">
          <Spinner />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-detail-page">
        <div className="blog-detail__error">
          <h2 className="blog-detail__error-title">{tErrors('error', 'Error')}</h2>
          <p className="blog-detail__error-message">{error || t('postNotFound', 'Blog post not found')}</p>
          <Link href="/blog" className="button button--primary">
            {t('backToBlog')}
          </Link>
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: post.title }
  ];

  const handleCommentClick = () => {
    setCommentsVisible(!commentsVisible);
    if (!commentsVisible) {
      // Scroll to comments when opening
      setTimeout(() => {
        const commentSection = document.querySelector('.blog-detail__comments');
        if (commentSection) {
          commentSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    }
  };



  const handleImageClick = () => {
    if (post.imageUrl) {
      setImageModalOpen(true);
    }
  };

  const handleMainClick = () => {
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="blog-detail-page">
      <div className="blog-detail-page__container">
        {/* Main content */}
        <div className="blog-detail-page__main" onClick={handleMainClick}>
          <Breadcrumb items={breadcrumbItems} />
        
          <BlogHero
            title={post.title}
            description={post.description}
            imageUrl={post.imageUrl || undefined}
            date={formatDate(post.created_at)}
            onImageClick={handleImageClick}
          />
          
          <article className="blog-detail">
            <div 
              className="blog-detail__content"
              dangerouslySetInnerHTML={{ __html: post.content || '' }}
            />
          </article>

          <footer className="blog-detail__footer">
            <div className="blog-detail__footer-content">
              <AuthorInfo
                author={{
                  name: post.author_name || 'BlogPro Author',
                  bio: post.author_bio || 'Professional content creator and developer',
                  avatar: post.author_avatar
                }}
                compact={true}
              />
              
              <CommentCounter 
                count={commentCount}
                onLoadComments={handleCommentClick}
                isLoading={loading}
              />
            </div>
          </footer>

          {commentsVisible && (
            <section className="blog-detail__comments">
              <CommentSection postId={parseInt(post.id)} />
            </section>
          )}
        </div>
        
        {/* Sidebar Tab */}
        <div className={`blog-detail-page__sidebar-tab ${sidebarOpen ? 'blog-detail-page__sidebar-tab--open' : ''}`}>
          <button 
            className={`sidebar-tab__button ${sidebarOpen ? 'sidebar-tab__button--open' : ''}`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <Icon name={sidebarOpen ? "x" : "hamburger"} size={20} />
          </button>
        </div>
        
        {/* Integrated Sidebar */}
        <div 
          className={`blog-detail-page__sidebar ${sidebarOpen ? 'blog-detail-page__sidebar--open' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="blog-detail__sidebar-card">
            <SocialShare 
              title={post.title}
              url={window.location.href}
            />
          </div>
          
          <Link href="/blog" className="blog-detail__back-link">
            <Icon name="arrow-left" size={20} />
            {t('backToBlog')}
          </Link>
          
          {relatedPosts.length > 0 && (
            <div className="blog-detail__sidebar-card">
              <h3 className="blog-detail__sidebar-title">{t('relatedPosts')}</h3>
              <div className="blog-detail__related-list">
                {relatedPosts.map(relatedPost => (
                  <Link 
                    key={relatedPost.id} 
                    href={`/blog/${relatedPost.id}`}
                    className="blog-detail__related-item"
                    onClick={() => setSidebarOpen(false)}
                  >
                    {relatedPost.imageUrl && (
                      <div className="blog-detail__related-image-container">
                        <img 
                          src={relatedPost.imageUrl} 
                          alt={relatedPost.title} 
                          className="blog-detail__related-image" 
                        />
                      </div>
                    )}
                    <div className="blog-detail__related-content">
                      <h4 className="blog-detail__related-title">{relatedPost.title}</h4>
                      <span className="blog-detail__related-date">
                        {formatDate(relatedPost.created_at)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="blog-detail__sidebar-card">
              <h3 className="blog-detail__sidebar-title">{t('tags')}</h3>
              <div className="blog-detail__tags">
                {post.tags.map((tag, index) => (
                  <span key={index} className="blog-detail__tag">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>



      {imageModalOpen && post.imageUrl && (
        <Modal
          isOpen={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          title={post.title}
          size="xl"
          className="image-modal"
        >
          <div className="image-modal__content">
            <img 
              src={post.imageUrl}
              alt={post.title}
              className="image-modal__image"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BlogDetail;
