# BlogPro - Professional Blog Platform

BlogPro is a modern, full-featured blogging platform with real-time content management capabilities, built on React, TypeScript and PostgreSQL.

## Features

- **Real-time content management**: Enhanced real-time updates with 95%+ WebSocket reliability
- **Advanced admin panel**: Comprehensive content management with BEM-style components
- **Enterprise-grade analytics**: High-performance analytics system with Redis caching (75% faster response times)
- **🆕 Professional Footer Visual Editor**: Drag & drop footer builder with live preview
- **Footer Block Library**: Pre-built components (brand, links, contact, social, newsletter)
- **Responsive Footer Design**: Mobile-first approach with device-specific layouts
- **Footer Style Editor**: Visual styling with color picker, typography, and spacing controls
- **Footer Version Control**: History tracking with rollback functionality
- **🆕 Enhanced UI System**: Centralized Design Tokens with Storybook documentation
- **Design Tokens**: Consistent colors, typography, spacing, and component tokens
- **Accessibility First**: WCAG 2.1 AA compliance with screen reader support
- **Component Library**: Enhanced Button, Input, Card components with Compound Components pattern
- **Storybook Integration**: Interactive component documentation and testing
- **Multi-level caching**: Client-side and server-side caching with Redis integration
- **Type-safe development**: Full TypeScript implementation with generic types
- **Modern architecture**: Clear separation of concerns with service layers
- **Internationalization**: Multi-language support (English/Russian)
- **Responsive design**: Mobile-first approach with centralized responsive styles in `breakpoints.css`
- **Advanced search**: Full-text search with relevance scoring
- **JWT authentication**: Secure stateless authentication with JWT-based access control roles
- **🆕 Professional Media Library**: Categorized file storage with tabbed interface, bulk operations, and text editor integration
- **Media Management**: Advanced file organization with automatic categorization by type and source
- **Email system**: Contact forms and mailing list management
- **🆕 Professional Text Editor**: Google Docs-compliant editor with character-level formatting, smart boundaries, undo/redo, paste intelligence, and 60fps performance (✅ COMPLETED)
- **🏗️ Optimized Architecture**: ServiceFactory pattern, consolidated types, organized services, and streamlined hooks (✅ COMPLETED)

## Tech stack

### Frontend
- React with TypeScript
- **Enhanced UI System**: Centralized Design Tokens with Storybook documentation
- **Design Tokens**: Consistent colors, typography, spacing, and component system
- **Accessibility**: WCAG 2.1 AA compliance with screen reader and keyboard navigation support
- **Component Library**: Enhanced Button, Input, Card with Compound Components pattern
- **W3C compliant CSS** with strict BEM methodology (no utility frameworks)
- **CSS duplicate analyzer** for optimization and standards compliance
- **Professional text editor** with Google Docs-compliant behavior and performance
- WebSocket client for real-time updates
- Multi-level caching system
- Context-based state management

### Backend
- Express.js with TypeScript
- PostgreSQL with Drizzle ORM
- Redis for caching (optional)
- WebSocket server for real-time communication
- RESTful API design with search endpoints
- JWT authentication with jsonwebtoken
- Upload handling files with Multer
- Email service integration

## Quick start
1. Install dependencies:
```bash
npm install
cd client && npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Set up database and Redis connections
```

3. Run the development server:
```bash
npm run dev
```

4. Access the application:
- Frontend: http://localhost:3000
- Admin panel: http://localhost:3000/admin (login required)
- Analytics panel: http://localhost:3000/admin/analytics
- Blog: http://localhost:3000/blog
- API: http://localhost:5000/api
- **🆕 Storybook**: http://localhost:6006 (component documentation)
- Search: Available in the header with a slide-out menu

## Project structure

### Client (`client/`)
- `src/components/` - Reusable UI components
- `src/admin/` - Admin panel with BEM-styled components and analytics system
- `src/ui-system/` - **Enhanced UI System** with Design Tokens and Storybook integration
  - `tokens/` - Centralized Design Tokens (colors, typography, spacing, effects)
  - `components/` - Enhanced component library with accessibility and Compound Components
    - `button/` - Enhanced Button with Icon, Text, Group subcomponents
    - `input/` - Enhanced Input with Label, Group, validation support
    - `card/` - Enhanced Card with Design Tokens integration
    - `admin/` - Admin-specific components
    - `accessibility/` - WCAG 2.1 AA compliance utilities
  - `utilities/` - Accessibility hooks and helper functions
  - `icons/` - SVG icon system with TypeScript integration
  - `.storybook/` - Storybook configuration and documentation
- `src/services/` - API services and caching system
- `src/styles/` - **W3C compliant CSS** with strict BEM methodology and centralized architecture
- `main.css` - Single entry point for all CSS imports (prevents duplicates)
- `base/` - Global styles, variables and centralized responsive styles
- `blocks/` - BEM-styled component blocks with strict naming conventions
- `admin/` - Admin panel styles following BEM architecture
- **CSS analyzer integration** - Built-in duplicate detection and W3C validation
- `src/hooks/` - Custom React hooks
- `src/types/` - TypeScript type definitions

### Server (`server/`)
- `api/` - RESTful API endpoints organized by functions
- `db/` - Database configuration with PostgreSQL and Redis
- `services/` - Business logic layer (auth, blog, media, email)
- `middleware/` - Express middleware (auth, caching, security)
- `websocket.ts` - WebSocket server for real-time updates
- `utils/` - Server utilities and helpers

### Shared (`shared/`)
- `types/` - Common TypeScript interfaces and database schema
- `utils/` - Common utility functions
- `validation/` - Zod validation schemas for API endpoints
## Security

BlogPro implements comprehensive security measures including:
- Custom security headers (CSP, HSTS, XSS protection)
- Input rate limiting and sanitization
- Session-based authentication with secure cookies
- CORS configuration and file upload security

See [SECURITY.md](./SECURITY.md) for detailed security implementation.

## Authentication

BlogPro uses JWT token-based authentication:

- **Administrator Access**: Navigate to `/admin` and log in with admin credentials
- **User Roles**: `admin`, `editor`, `user` with different permission levels
- **Token Management**: JWT tokens are stored in localStorage with a 7-day expiration
- **Email Verification**: Required for new user registration
- **Stateless Design**: No server-side session storage required
- **Auto-Redirect**: Administrators → `/admin`, Regular Users → `/profile`

### Default Admin Account

The administrator account is created automatically when the server is first started.

**Note**: Database uses the `username` field instead of `login` to identify the user.

## Search functionality

Advanced search system with:

- **Full-text search**: Search titles, descriptions and content of blog posts
- **Relevance score**: Results are ranked by relevance (title > description > content)
- **Category filtering**: Optional category-based filtering
- **Real-time search**: Deferred search with instant results
- **Responsive UI**: Search drop-down list located under the title

## Admin panel features

### Content management
- **Blog management**: Create, edit, delete blog posts with rich text editor
- **Analytics panel**: Enterprise-grade analytics system at `/admin/analytics` with:
  - Real-time visitor tracking and page views
  - Performance metrics with 75% faster response times
  - Redis-based caching for optimal performance
  - WebSocket live updates with 95%+ reliability
  - Data retention management and automated cleanup
  - Comprehensive health monitoring and diagnostics
- **🆕 Professional Media Library**: Categorized file management with:
  - Tabbed interface (All Files, Images, Documents, Videos, Audio, Editor)
  - Bulk operations (select all, bulk delete, batch processing)
  - Advanced filtering (date range, file size, search)
  - Text editor integration with dedicated upload endpoint
  - Organized storage (`/uploads/images/`, `/uploads/documents/`, `/uploads/editor/`)
  - Automatic file categorization and WebP optimization
- **User management**: Manage user accounts and permissions
- **Real-time updates**: Enhanced WebSocket integration with connection health monitoring
- **Cache management**: Redis-based caching with automatic invalidation
- **Form validation**: Validation of required fields with visual indicators
- **Responsive admin interface**: Separate mobile admin menu system for optimal mobile experience

### Site Editor
- **Dynamic Menu Builder**: Create and manage website navigation with drag & drop interface
- **Hierarchical Menu Structure**: Support nested menu items and submenus
- **Live Menu Preview**: Live preview of navigation changes
- **Multiple Menu Types**: Header, Footer and Custom Menu Configurations
- **🆕 Professional Footer Visual Editor**: Advanced drag & drop footer builder with:
  - **Live Preview**: Real-time footer preview with WebSocket synchronization
  - **Block Library**: Pre-built components (brand, links, contact, social, newsletter)
  - **Visual Style Editor**: Color picker, typography controls, spacing adjustments
  - **Responsive Design**: Mobile-first approach with device-specific layouts
  - **Version Control**: History tracking with rollback functionality
  - **Custom Blocks**: Support for custom HTML and CSS blocks
- **Link Management**: Internal Pages, External URLs and Custom Routing
- **Mobile Menu Optimization**: Automatic responsive menu generation
- **Visibility Control**: Role-based menu item display

### CSS Quality Assurance
- **CSS Duplicate Analyzer**: Advanced tool to detect and remove duplicate CSS rules
- Smart duplicate detection based on properties (not just class names)
- Similarity Score: Identical (100%) vs Similar (80%+) duplicates
- Batch Duplicate Removal with safe preservation of originals
- File location tracking with exact line numbers
- **W3C CSS validation**: Automated validation against W3C CSS specs
- Standards compliance check for all CSS files
- Error categorization: Syntax, property and value errors
- Support for vendor prefixes and custom properties
- Detailed error reporting with file locations
- **Performance optimization**: Reduce CSS bundle size by removing duplicates
- **Maintenance tools**: Refresh and reset functionality for CSS analysis

## HTTPS configuration

BlogPro supports HTTPS for both local development and production:

```bash
# Generate local SSL certificates
npm run ssl:generate

# Run HTTPS server
npm run dev
```

The application runs on **https://localhost:3000** (frontend) with the backend on **https://localhost:5000** when SSL certificates are available.

## CSS Architecture and Standards

BlogPro maintains the highest CSS quality standards:

### BEM Methodology Compliance
- **Strong BEM Naming**: `.block`, `.block__element`, `.block--modifier`
- **Centralized CSS Architecture**: Single entry point `main.css` prevents duplicates
- **Component Organization**: Each component has a dedicated CSS directory
- **No Utility Frameworks**: Pure CSS with semantic class names (Tailwind is prohibited)

### W3C Standards Compliance
- **100% W3C Valid CSS**: All 227+ CSS files are validated against W3C specs
- **Built-in Validation Tools**: CSS Parser with Real-Time W3C Conformance Check
- **Standards Enforcement**: Automated validation prevents non-compliant CSS
- **Property Validation**: CSS properties and values are validated against official W3C standards

### Performance Optimization
- **Duplicate Detection**: Advanced parser identifies and removes duplicate CSS rules
- **Bundle Size Optimization**: Removing duplicates significantly reduces CSS file size
- **Efficient Loading**: Centralized imports prevent redundant CSS downloads
- **Cache Optimization**: Clean CSS structure improves browser caching

### Quality Assurance Process
1. **Development**: Writing CSS following BEM conventions
2. **Analysis**: Using CSS parser to detect duplicates and validate W3C compliance
3. **Optimization**: Removing duplicates while maintaining functionality
4. **Validation**: Ensuring 100% compliance with W3C standards
5. **Testing**: Checking visual consistency after optimization

See [docs/deployment/HTTPS_SETUP.md](./docs/deployment/HTTPS_SETUP.md) for local development and [docs/deployment/SSL_PRODUCTION_GUIDE.md](./docs/deployment/SSL_PRODUCTION_GUIDE.md) for production SSL configuration.

## Documentation

### Main documentation
- [Development Guide](./docs/development/DEVELOPMENT_STANDARDS.md)
- [API Documentation](./docs/api/API_DOCUMENTATION.md)
- [Deployment Guide](./docs/deployment/DEPLOYMENT_GUIDE.md)
- [WebSocket Architecture](./docs/architecture/WEBSOCKET_ARCHITECTURE.md)
- [Security](./SECURITY.md)

### 🆕 Professional Text Editor Documentation (Updated)
- [Architecture Overview (Updated)](./client/src/plugins/texteditor/docs/ARCHITECTURE_OVERVIEW_UPDATED.md)
- [API Reference (Optimized)](./client/src/plugins/texteditor/docs/API_REFERENCE_OPTIMIZED.md)
- [Integration Guide (Updated)](./client/src/plugins/texteditor/docs/INTEGRATION_GUIDE_UPDATED.md)
- [Google Docs Compliance](./client/src/plugins/texteditor/docs/GOOGLE_DOCS_COMPLIANCE_SPEC.md)
- [Performance Guide](./client/src/plugins/texteditor/docs/PERFORMANCE_GUIDE.md)
- [TypeScript Standards](./client/src/plugins/texteditor/docs/TYPESCRIPT_STANDARDS.md)

### 🆕 UI System & Storybook Documentation
- [UI System Overview](#ui-system--design-tokens) - Design Tokens and Enhanced Components
- [Storybook Documentation](http://localhost:6006) - Interactive component playground
- [Accessibility Guide](./docs/features/ACCESSIBILITY.md) - WCAG 2.1 AA compliance
- [Design Tokens Reference](./client/src/ui-system/tokens/) - Centralized design system

## Text Editor Testing

The professional text editor includes comprehensive testing (97% coverage):

```bash
# Run text editor tests
cd client/src/plugins/texteditor
npm test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

See [Testing Documentation](./client/src/plugins/texteditor/__tests__/) for complete testing suite.

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## UI System & Design Tokens

BlogPro features a comprehensive UI system built with modern design principles and accessibility standards.

### Design Tokens
- **Centralized Design System**: Consistent colors, typography, spacing, and effects
- **CSS Variables**: Easy theming and customization
- **TypeScript Integration**: Type-safe token usage in components
- **Scalable Architecture**: 8px grid system and modular color scales

### Enhanced Components
- **Button Component**: Compound Components pattern with Icon, Text, Group subcomponents
- **Input Component**: Full accessibility support with Label, Group, validation
- **Card Component**: Flexible layout with Design Tokens integration
- **Accessibility First**: WCAG 2.1 AA compliance built-in

### Storybook Documentation
Interactive component documentation and testing environment:

```bash
# Start Storybook
cd client
npm run storybook
```

Access at: http://localhost:6006

**Features**:
- Interactive component playground
- Accessibility testing with @storybook/addon-a11y
- Design Tokens documentation
- Responsive viewport testing
- Dark/Light theme switching

### Usage Examples

#### Design Tokens in CSS
```css
.my-component {
  color: var(--color-primary-600);
  padding: var(--space-4);
  font-size: var(--text-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}
```

#### Enhanced Components
```tsx
import { Button, Input } from '@/ui-system/components';

// Button with icon and text
<Button variant="primary" size="md">
  <Button.Icon name="plus" position="left" />
  <Button.Text>Add Item</Button.Text>
</Button>

// Input with label and validation
<Input.Group>
  <Input.Label required>Email</Input.Label>
  <Input 
    type="email" 
    leftIcon="email"
    error="Invalid email format"
  />
</Input.Group>
```

#### Accessibility Features
```tsx
import { useScreenReader, useFocusManagement } from '@/ui-system/utilities/accessibility';

const MyComponent = () => {
  const { announce } = useScreenReader();
  const { trapFocus } = useFocusManagement();
  
  const handleAction = () => {
    announce('Action completed successfully');
  };
  
  return (
    <div>
      <Button onClick={handleAction} aria-label="Perform action">
        Action
      </Button>
    </div>
  );
};
```

### Development Workflow

1. **Design Tokens**: Use centralized tokens for consistency
2. **Component Development**: Build with accessibility in mind
3. **Storybook Testing**: Document and test components interactively
4. **Accessibility Validation**: Use built-in a11y tools
5. **Responsive Design**: Test across different viewports