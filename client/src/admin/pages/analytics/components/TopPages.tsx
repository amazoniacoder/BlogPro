import React from 'react';
import { TopPages as UITopPages } from '@/ui-system/components/admin';

interface TopPagesProps {
  pages: Array<{ page: string; views: number }>;
}

const TopPages: React.FC<TopPagesProps> = ({ pages }) => {
  return <UITopPages pages={pages} />;
};

export default TopPages;
