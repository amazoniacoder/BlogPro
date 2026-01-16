// D:\\WebDesignStudio\\client\\src\\admin\\pages\\dashboard\\index.tsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/store/auth-context";
import { blogService } from "@/services/api/blog";
import { userService } from "@/services/api/users";
import { mediaService } from "@/services/api/media";
import { 
  DashboardStats,
  RecentActivity,
  QuickActions,
  PerformanceChart 
} from '@/ui-system/components/admin';

const DashboardPage = () => {
  const { t } = useTranslation(['admin', 'common']);
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState({
    blogPosts: 0,
    mediaFiles: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Function to refresh stats
  const refreshStats = async () => {
    try {
      setLoading(true);
      
      // Fetch data using optimized services
      let blogPostsCount = 0;
      let mediaFilesCount = 0;
      let usersCount = 0;
      
      try {
        const blogPostsResponse = await blogService.getAll();
        blogPostsCount = blogPostsResponse.length;
      } catch (err) {
        console.log('Blog posts fetch error:', err);
        // Try alternative method
        try {
          const response = await fetch('/api/blog', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          });
          if (response.ok) {
            const posts = await response.json();
            blogPostsCount = Array.isArray(posts) ? posts.length : 0;
          }
        } catch (altErr) {
          console.log('Alternative blog fetch error:', altErr);
        }
      }

      try {
        const mediaFiles = await mediaService.getMediaFiles();
        mediaFilesCount = mediaFiles.length;
      } catch (err) {
        // Silent error handling
      }

      try {
        const users = await userService.getAll();
        usersCount = users.length;
      } catch (err) {
        // Silent error handling for auth errors
      }

      setStats({
        blogPosts: blogPostsCount,
        mediaFiles: mediaFilesCount,
        users: usersCount,
      });
      
      // Fetch recent activities
      await fetchRecentActivities();
      
      setError(null);
    } catch (err) {
      // Silent error handling
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch recent activities
  const fetchRecentActivities = async () => {
    try {
      const activities = [];
      
      // Get recent blog posts
      try {
        const blogPosts = await blogService.getAll();
        const recentPosts = blogPosts.slice(0, 3).map(post => ({
          id: `blog-${post.id}`,
          type: 'blog',
          title: `Blog post "${post.title}" published`,
          user: 'Admin',
          timestamp: post.created_at || new Date().toISOString()
        }));
        activities.push(...recentPosts);
      } catch (err) {
        console.log('Recent blog posts fetch error:', err);
      }
      
      // Get recent media uploads
      try {
        const mediaFiles = await mediaService.getMediaFiles();
        const recentMedia = mediaFiles.slice(0, 2).map((file, index) => ({
          id: `media-${file.id || index}`,
          type: 'media',
          title: `Image "${file.originalName || file.filename}" uploaded`,
          user: 'Admin',
          timestamp: file.createdAt || new Date().toISOString()
        }));
        activities.push(...recentMedia);
      } catch (err) {
        console.log('Recent media fetch error:', err);
      }
      
      // Sort by timestamp (newest first)
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setRecentActivities(activities.slice(0, 5)); // Show only 5 most recent
    } catch (err) {
      console.log('Recent activities fetch error:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchStats = async () => {
      if (!isMounted || !isAuthenticated || user?.role !== 'admin') return;
      await refreshStats();
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.role]);

  if (loading) {
    return <div className="admin-loading">{t('common:loading')}</div>;
  }

  if (error) {
    return <div className="admin-alert admin-alert--error">
      <span className="admin-alert__icon">⚠️</span>
      <div className="admin-alert__content">
        <p className="admin-alert__message">{error}</p>
      </div>
    </div>;
  }



  return (
    <div className="admin-section admin-dashboard">
      <div className="admin-section__header">
        <h2 className="admin-section__title">{t('admin:overview')}</h2>
        <div className="admin-section__actions gap-4">
          <button 
            className="admin-button admin-button--secondary" 
            onClick={refreshStats}
            aria-label="Refresh statistics"
          >
            <span className="admin-button__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
            </span>
            <span className="admin-button__text">{t('admin:refreshStats', { defaultValue: 'Обновить статистику' })}</span>
          </button>
        </div>
      </div>

      <DashboardStats stats={stats} />
      
      <div className="admin-dashboard__row grid-cols-1">
        <QuickActions />
        <PerformanceChart />
      </div>
      
      <RecentActivity activities={recentActivities} />
    </div>
  );
};

export default DashboardPage;
