// client/src/admin/pages/blog/components/BlogEditor.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { BlogPost } from "@/types/blog";
import { useBlogData } from "../hooks/useBlogData";
import { ContentEditableEditor } from "@/plugins/texteditor";
import { AdminEditor, AdminEditorField } from '@/ui-system/components/admin';
import { useNotification } from "@/ui-system/components/feedback";
import MediaSelector from "./MediaSelector";
import CategorySelector from "@/admin/components/CategorySelector";


interface BlogEditorProps {
  postId?: string;
  onSave: () => void;
  onCancel: () => void;
}

const BlogEditor: React.FC<BlogEditorProps> = ({
  postId,
  onSave,
  onCancel,
}) => {
  const { t } = useTranslation(['admin', 'common']);
  const {
    state,
    dispatch,
    updateBlogPost,
    createBlogPost,
    getBlogPostById,
    showMediaSelector,
    hideMediaSelector,
  } = useBlogData();
  const { showSuccess, showError } = useNotification();
  const isNewPost = !postId;

  // Initialize editor state
  if (!state.editor.isOpen) {
    if (!isNewPost && postId) {
      console.log('📚 BlogEditor: Loading existing post from database', { postId: postId });
      getBlogPostById(postId).then(post => {
        if (post) {
          console.log('✅ BlogEditor: Post loaded successfully', {
            id: post.id,
            title: post.title,
            contentLength: post.content?.length || 0,
            hasContent: !!post.content
          });
        } else {
          console.log('⚠️ BlogEditor: Post not found', { postId });
        }
        dispatch({ type: 'EDITOR/OPEN', post: post || undefined });
      });
    } else {
      console.log('🆕 BlogEditor: Creating new post');
      dispatch({ type: 'EDITOR/OPEN' });
    }
  }

  const handleImageSelect = (url: string) => {
    // Close media selector
    hideMediaSelector();
    // TODO: Implement image insertion with new Canvas editor API
    console.log('Image selected:', url);
  };
  const [mediaSelectContext, setMediaSelectContext] = React.useState<'featured' | 'textEditor'>('featured');
  // Content state for the editor
  const [editorContent, setEditorContent] = React.useState<string>('');
  const [isUserEditing, setIsUserEditing] = React.useState<boolean>(false);

  // Initialize editor content (only on initial load, not on WebSocket updates)
  React.useEffect(() => {
    // Only update if user is not actively editing and this is initial load or content is empty
    if (!isUserEditing && (!editorContent || editorContent === '<p></p>')) {
      console.log('🔄 BlogEditor: Initializing editor content', {
        newContent: state.editor.formData.content || '<p></p>',
        currentContent: editorContent,
        isUserEditing
      });
      setEditorContent(state.editor.formData.content || '<p></p>');
    } else {
      console.log('⚠️ BlogEditor: Skipping content update', {
        reason: isUserEditing ? 'user is editing' : 'editor has content',
        editorContentLength: editorContent.length,
        incomingContentLength: (state.editor.formData.content || '').length,
        isUserEditing
      });
    }
  }, [state.editor.formData.content, postId, isUserEditing]);

  // Keep WebSocket connected for real-time updates



  const handleFeaturedImageSelect = (url: string) => {
    dispatch({ type: 'EDITOR/UPDATE_FIELD', field: 'imageUrl', value: url });
    hideMediaSelector();
  };

  const handleMediaSelect = (url: string) => {
    if (mediaSelectContext === 'textEditor') {
      handleImageSelect(url);
    } else {
      handleFeaturedImageSelect(url);
    }
  };

  const handleContentChange = (content: string) => {
    console.log('📝 BlogEditor: Content changed in editor', {
      newLength: content.length,
      previousLength: editorContent.length,
      contentPreview: content.substring(0, 100) + '...',
      isContentDifferent: content !== editorContent
    });
    
    setIsUserEditing(true);
    setEditorContent(content);
    dispatch({ type: 'EDITOR/UPDATE_FIELD', field: 'content', value: content });
    
    // Reset editing flag after a delay
    setTimeout(() => setIsUserEditing(false), 5000);
  };

  const handleEditorSave = async (content: string) => {
    // Manual save to database when triggered by editor save (Ctrl+S)
    console.log('💾 BlogEditor: Manual save triggered from editor', {
      contentLength: content.length,
      postId: postId,
      hasPostId: !!postId
    });
    
    try {
      // Update local state first
      handleContentChange(content);
      
      // Save to database using BlogContentSaveService
      const { BlogContentSaveService } = await import('@/plugins/texteditor/core/services/BlogContentSaveService');
      const saveService = new BlogContentSaveService(postId ? parseInt(postId) : undefined);
      
      console.log('💾 BlogEditor: Calling BlogContentSaveService.saveContent');
      await saveService.saveContent(content, {
        title: state.editor.formData.title || 'Untitled Post',
        description: state.editor.formData.description || '',
        categoryId: state.editor.formData.categoryId,
        status: state.editor.formData.status || 'draft',
        tags: state.editor.formData.tags || [],
        imageUrl: state.editor.formData.imageUrl || '',
        slug: state.editor.formData.slug || ''
      });
      
      console.log('✅ BlogEditor: Content saved to database successfully');
      showSuccess('Content saved to database');
      
    } catch (error) {
      console.error('❌ BlogEditor: Failed to save content to database:', error);
      showError('Failed to save content to database');
    }
  };



  const handleSaveClick = async () => {
    try {
      // Validate required fields
      const errors = [];
      
      if (!state.editor.formData.description?.trim()) {
        errors.push("Description is required");
        const descField = document.getElementById("description");
        if (descField) descField.classList.add("error-field");
      }
      
      if (!state.editor.formData.content?.trim()) {
        errors.push("Content is required");
      }
      
      if (!state.editor.formData.categoryId) {
        errors.push("Please select a category");
        const categoryField = document.getElementById("categoryId");
        if (categoryField) categoryField.classList.add("error-field");
      }
      
      if (errors.length > 0) {
        showError(errors.join(", "));
        return;
      }

      dispatch({ type: 'EDITOR/SET_LOADING', loading: true });

      const { formData } = state.editor;
      const postData = {
        id: isNewPost ? undefined : postId!,
        title: formData.title || "",
        description: formData.description || "",
        content: formData.content || "",
        categoryId: formData.categoryId,
        imageUrl: formData.imageUrl || "",
        thumbnailUrl: formData.thumbnailUrl || "",
        projectUrl: formData.projectUrl || "",
        technologies: formData.technologies || [],
        status: formData.status || "draft",
        slug: formData.slug || "",
        tags: formData.tags || [],
        created_at: formData.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (isNewPost) {
        // Create the post
        await createBlogPost(postData as BlogPost);
        showSuccess(`Статья "${postData.title}" успешно создана`);
        onSave();
      } else {
        await updateBlogPost({
          ...postData,
          id: postId,
        } as BlogPost);
        showSuccess(`Статья "${postData.title}" успешно обновлена`);
        onSave();
      }
    } catch (error) {
      showError(
        `Failed to save blog post: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      dispatch({ type: 'EDITOR/SET_LOADING', loading: false });
    }
  };

  if (state.editor.loading && isNewPost === false) {
    return (
      <div className="admin-section">
        <div className="admin-loading">
          <div className="admin-loading__spinner"></div>
          <p>Loading blog post...</p>
        </div>
      </div>
    );
  }

  const fields: AdminEditorField[] = [
    {
      key: 'title',
      label: t('admin:title'),
      type: 'text',
      required: true,
      value: state.editor.formData.title || '',
      onChange: (value) => dispatch({ type: 'EDITOR/UPDATE_TITLE', value })
    },
    {
      key: 'description',
      label: t('admin:description'),
      type: 'textarea',
      required: true,
      value: state.editor.formData.description || '',
      onChange: (value) => {
        dispatch({ type: 'EDITOR/UPDATE_FIELD', field: 'description', value });
        const descField = document.getElementById('description');
        if (descField && value.trim()) descField.classList.remove('error-field');
      }
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'published', label: 'Published' },
        { value: 'draft', label: 'Draft' },
        { value: 'archived', label: 'Archived' }
      ],
      value: state.editor.formData.status || 'draft',
      onChange: (value) => dispatch({ type: 'EDITOR/UPDATE_FIELD', field: 'status', value })
    },
    {
      key: 'categoryId',
      label: 'Category',
      type: 'custom',
      required: true,
      render: () => (
        <CategorySelector
          value={state.editor.formData.categoryId}
          onChange={(categoryId) => {
            dispatch({ type: 'EDITOR/UPDATE_FIELD', field: 'categoryId', value: categoryId });
            const categoryField = document.getElementById('categoryId');
            if (categoryField) categoryField.classList.remove('error-field');
          }}
          className={state.editor.formData.categoryId ? '' : 'error-field'}
        />
      )
    },
    {
      key: 'slug',
      label: 'Slug',
      type: 'text',
      value: state.editor.formData.slug || '',
      onChange: (value) => dispatch({ type: 'EDITOR/UPDATE_FIELD', field: 'slug', value })
    },
    {
      key: 'tags',
      label: 'Tags',
      type: 'text',
      placeholder: 'tag1, tag2, tag3',
      value: (state.editor.formData.tags || []).join(', '),
      onChange: (value) => {
        const tags = value.split(',').map((tag: string) => tag.trim());
        dispatch({ type: 'EDITOR/UPDATE_FIELD', field: 'tags', value: tags });
      }
    }
  ];

  return (
    <>
      <AdminEditor
        title={isNewPost ? t('admin:createNewPost') : t('admin:editPost')}
        breadcrumbs={[
          {
            label: 'Blog Posts',
            onClick: () => {
              dispatch({ type: 'EDITOR/CLOSE' });
              onCancel();
            }
          },
          { label: isNewPost ? 'New Post' : 'Edit' }
        ]}
        fields={fields}
        mediaPreview={{
          imageUrl: state.editor.formData.imageUrl || undefined,
          onRemove: () => dispatch({ type: 'EDITOR/UPDATE_FIELD', field: 'imageUrl', value: null }),
          onChange: () => {
            setMediaSelectContext('featured');
            showMediaSelector();
          },
          onSelect: () => {
            setMediaSelectContext('featured');
            showMediaSelector();
          }
        }}
        contentEditor={
          <div className="admin-editor__content-section">
            <h4 className="admin-editor__section-title">Content <span className="admin-editor__required">*</span></h4>
            <ContentEditableEditor
              key={postId || 'new'}
              initialContent={editorContent}
              onChange={(content) => {
                console.log('🔄 ContentEditableEditor: onChange triggered', {
                  contentLength: content.length,
                  preview: content.substring(0, 50)
                });
                handleContentChange(content);
              }}
              onSave={handleEditorSave}
              placeholder="Start writing your blog post..."
              className="blog-content-editor"
            />
          </div>
        }
        actions={[
          {
            label: isNewPost ? 'Create Post' : 'Update Post',
            variant: 'primary',
            onClick: handleSaveClick
          }
        ]}
        onCancel={onCancel}
      />

      {state.mediaModalOpen && (
        <MediaSelector
          onSelect={handleMediaSelect}
          onClose={hideMediaSelector}
        />
      )}
    </>
  );
};

export default BlogEditor;
