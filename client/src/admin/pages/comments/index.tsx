/**
 * Admin Comments Page
 * Comment management interface for administrators
 */

import React from 'react';
import { CommentsManager } from '@/ui-system/components/admin/comments/CommentsManager';

const CommentsPage: React.FC = () => {
  return (
    <div className="admin-content-wrapper">
      <CommentsManager />
    </div>
  );
};

export default CommentsPage;