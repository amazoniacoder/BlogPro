/**
 * BlogPro Feedback Components
 * Universal feedback system exports with unified notifications
 */

export { Alert } from './Alert';
export { Toast } from './Toast';
export { Spinner } from './Spinner';
export { Badge } from './Badge';
export { Tooltip } from './Tooltip';
export { Toaster } from './Toaster';
export { StatusMessage } from './StatusMessage';
export { UpdateNotification } from './UpdateNotification';
export { ErrorDisplay } from './ErrorDisplay';
export { ErrorBoundary } from './ErrorBoundary';

// New unified notification system
export { 
  NotificationProvider, 
  useNotifications,
  useNotifications as useNotification,
  useGlobalNotifications,
  showSuccessNotification,
  showErrorNotification
} from '../notifications/NotificationManager';
export { UnifiedNotification } from '../notifications/UnifiedNotification';

export type { AlertProps } from './Alert';
export type { ToastProps } from './Toast';
export type { SpinnerProps } from './Spinner';
export type { BadgeProps } from './Badge';
export type { TooltipProps } from './Tooltip';
export type { ToasterProps } from './Toaster';
export type { StatusMessageProps } from './StatusMessage';
export type { UpdateNotificationProps } from './UpdateNotification';
export type { ErrorDisplayProps } from './ErrorDisplay';
export type { ErrorBoundaryProps } from './ErrorBoundary';
export type { NotificationProps } from '../notifications/UnifiedNotification';

// Import feedback styles
import './feedback.css';
import './toaster.css';
import './status-message.css';
import './update-notification.css';
import './error-display.css';
import '../notifications/notifications.css';
