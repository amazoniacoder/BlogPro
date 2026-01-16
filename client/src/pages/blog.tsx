import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { blogService } from '@/services/api/blog';
import { BlogPost } from '@/types/blog';
import { BlogCard } from '@/ui-system/patterns';
import { SEOHead } from '@/ui-system/components/utility';
import { WebsiteStructuredData } from '@/ui-system/components/utility';
import websocketService from '@/services/websocket-service';
import { BlogPage } from '@/ui-system/patterns';
import { BlogCategoryTree, BlogCategory } from '@/ui-system/components/blog';
import { Link } from 'wouter';
import { categoriesService } from '@/services/api/categories';

const Blog: React.FC = () => {
  const { t } = useTranslation('blog');
  const { t: tCommon } = useTranslation('common');
  const [posts, setPosts] = useState<(BlogPost & {uniqueKey: string; createdAt: string; imageUrl: string})[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  
  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      // Clear any cached data first
      await blogService.refreshBlog();
      // Use getAll to get all posts and filter on client side
      const data = await blogService.getAll();
      // Filter for published posts on the client side and add guaranteed unique keys
      const publishedPosts = data
        .filter(post => post.status === 'published')
        .map(post => ({
          ...post,
          categoryId: post.categoryId,
          createdAt: post.created_at,
          imageUrl: post.imageUrl || '',
          uniqueKey: `post-${post.id}-${Math.random().toString(36).substring(2, 15)}`
        }));
      setPosts(publishedPosts);
      setError(null);
    } catch (err) {
      setError(tCommon('error'));
      console.error(err);
    } finally {
      // Add a slight delay before hiding the loader for smoother transition
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };
  
  useEffect(() => {
    fetchBlogPosts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const categoryTree = await categoriesService.getCategoriesTree();
      // Transform CategoryTreeNode[] to BlogCategory[]
      const transformedCategories: BlogCategory[] = categoryTree.map(cat => ({
        id: cat.id.toString(),
        name: cat.name,
        slug: cat.slug,
        count: getCategoryCount(cat.id.toString()),
        children: cat.children?.map(child => ({
          id: child.id.toString(),
          name: child.name,
          slug: child.slug,
          count: getCategoryCount(child.id.toString()),
          parentId: cat.id.toString()
        }))
      }));
      setCategories(transformedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  // WebSocket connection and event handlers
  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect();
    
    // Connection status handlers
    const handleOpen = () => {};
    const handleClose = () => {};
    
    // Handle test and ping messages
    const handleTest = (data: any) => {
      console.log('Test message received:', data);
    };
    
    const handlePing = () => {
      // Just acknowledge ping to keep connection alive
      console.log('Ping received, connection active');
    };
    
    // Transform backend blog post data to frontend BlogPost type
    const transformBackendBlogPost = (backendBlogPost: any): BlogPost => {
      console.log('Raw backend blog post data:', backendBlogPost);
      
      // Handle both camelCase and snake_case field names from database
      const createdAt = backendBlogPost.createdAt || backendBlogPost.created_at;
      const updatedAt = backendBlogPost.updatedAt || backendBlogPost.updated_at;
      const imageUrl = backendBlogPost.imageUrl || backendBlogPost.image_url;
      const thumbnailUrl = backendBlogPost.thumbnailUrl || backendBlogPost.thumbnail_url;
      const projectUrl = backendBlogPost.projectUrl || backendBlogPost.project_url;
      
      const createdAtISO = createdAt ? new Date(createdAt).toISOString() : new Date().toISOString();
      const updatedAtISO = updatedAt ? new Date(updatedAt).toISOString() : createdAtISO;

      const transformed = {
        id: backendBlogPost.id.toString(),
        title: backendBlogPost.title || '',
        description: backendBlogPost.description || '',
        content: backendBlogPost.content || '',
        categoryId: backendBlogPost.categoryId || backendBlogPost.category_id,
        imageUrl: imageUrl || null,
        thumbnailUrl: thumbnailUrl || null,
        projectUrl: projectUrl || null,
        technologies: backendBlogPost.technologies || [],
        status: backendBlogPost.status || 'draft',
        slug: backendBlogPost.slug || null,
        tags: backendBlogPost.tags || [],
        created_at: createdAtISO,
        updated_at: updatedAtISO,
      };
      
      console.log('Transformed blog post:', transformed);
      return transformed;
    };

    // Blog post event handlers
    const handleBlogCreated = (backendData: any) => {
      console.log('🆕 Blog post created via WebSocket:', backendData);
      
      // Transform backend data to frontend format
      const transformedPost = transformBackendBlogPost(backendData);
      
      // Only add to the list if it's published
      if (transformedPost.status === 'published') {
        console.log('✅ Adding published post to list:', transformedPost.title);
        setPosts(prev => {
          // Remove any existing posts with the same ID
          const filteredPosts = prev.filter(post => post.id !== transformedPost.id);
          
          // Create a new post with a guaranteed unique key
          const newPost = {
            ...transformedPost,
            createdAt: transformedPost.created_at,
            imageUrl: transformedPost.imageUrl || '',
            uniqueKey: `post-${transformedPost.id}-${Date.now()}`
          };
          
          return [newPost, ...filteredPosts];
        });
      }
    };
    
    const handleBlogUpdated = (backendData: any) => {
      console.log('🔄 Blog post updated via WebSocket:', backendData);
      
      // Transform backend data to frontend format
      const transformedPost = transformBackendBlogPost(backendData);
      
      setPosts(prev => {
        // First, remove any existing posts with this ID
        const filteredPosts = prev.filter(post => post.id !== transformedPost.id);
        
        // If the post is not published, just return the filtered list (without the post)
        if (transformedPost.status !== 'published') {
          console.log('❌ Updated post not published, removing from list');
          return filteredPosts;
        }
        
        // Otherwise, add the updated post with a guaranteed unique key
        const updatedPost = {
          ...transformedPost,
          createdAt: transformedPost.created_at,
          imageUrl: transformedPost.imageUrl || '',
          uniqueKey: `post-${transformedPost.id}-${Date.now()}`
        };
        
        return [updatedPost, ...filteredPosts];
      });
    };
    
    const handleBlogDeleted = (data: any) => {
      console.log('🗑️ Blog post deleted:', data);
      
      // Handle different data formats
      const postId = data?.id || data;
      
      setPosts(prev => {
        return prev.filter(post => post.id !== postId.toString());
      });
    };
    
    // Subscribe to WebSocket events
    websocketService.subscribe('_open', handleOpen);
    websocketService.subscribe('_close', handleClose);
    websocketService.subscribe('_connected', handleOpen);
    
    console.log('Subscribing to blog WebSocket events');
    websocketService.subscribe('blog_created', handleBlogCreated);
    websocketService.subscribe('blog_updated', handleBlogUpdated);
    websocketService.subscribe('blog_deleted', handleBlogDeleted);
    websocketService.subscribe('test_blog', handleTest);
    websocketService.subscribe('ping', handlePing);
    
    // Send a test message to verify connection after a short delay
    setTimeout(() => {
      if (websocketService.isConnected()) {
        websocketService.sendMessage('test_blog', { message: 'Blog page connected' });
      }
    }, 1000);
    
    // Unsubscribe when component unmounts
    return () => {
      websocketService.unsubscribe('_open', handleOpen);
      websocketService.unsubscribe('_close', handleClose);
      websocketService.unsubscribe('_connected', handleOpen);
      websocketService.unsubscribe('blog_created', handleBlogCreated);
      websocketService.unsubscribe('blog_updated', handleBlogUpdated);
      websocketService.unsubscribe('blog_deleted', handleBlogDeleted);
      websocketService.unsubscribe('test_blog', handleTest);
      websocketService.unsubscribe('ping', handlePing);
    };
  }, []);
  
  // Filter posts by selected category
  const filteredPosts = selectedCategoryId 
    ? posts.filter(post => post.categoryId?.toString() === selectedCategoryId)
    : posts;

  const handleCategoryFilter = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };


  
  // Calculate actual category counts from posts
  const getCategoryCount = (categoryId: string) => {
    return posts.filter(post => post.categoryId?.toString() === categoryId).length;
  };
  
  // Recalculate categories when posts change
  useEffect(() => {
    if (categories.length > 0 && posts.length > 0) {
      fetchCategories();
    }
  }, [posts.length]);



  return (
    <>
      <SEOHead 
        title={t('title')}
        description={t('metaDescription')}
        canonical={window.location.href}
      />
      <WebsiteStructuredData 
        name="BlogPro"
        description={t('metaDescription')}
        url={window.location.origin}
      />
      
      <div className="container">
        <BlogPage
          title={t('title')}
          description={t('description', 'Read our latest blog posts about technology, design, and development.')}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
          loading={loading}
          error={error}
          sidebar={
            <BlogCategoryTree
              categories={categories}
              selectedCategory={selectedCategoryId || undefined}
              onCategorySelect={handleCategoryFilter}
            />
          }
        >
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <Link key={post.uniqueKey} href={`/blog/${post.id}`} className="blog-card-link">
                <BlogCard post={post} />
              </Link>
            ))
          ) : (
            <div className="blog-page__empty">
              {t('noPosts')}
            </div>
          )}
        </BlogPage>
      </div>
    </>
  );
};

export default Blog;
