/**
 * User display utilities for consistent user information rendering
 */

interface User {
  id: string | number;
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
}

export const getUserDisplayName = (user: User): string => {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user.username || 'Anonymous User';
};

export const getUserAvatar = (user: User): string => {
  return user.profile_image_url || '/default-avatar.png';
};

export const getUserInitials = (user: User): string => {
  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  }
  if (user.username) {
    return user.username.substring(0, 2).toUpperCase();
  }
  return 'AU';
};