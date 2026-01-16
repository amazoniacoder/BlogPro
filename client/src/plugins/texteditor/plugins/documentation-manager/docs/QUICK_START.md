# Quick Start Guide

## Getting Started with Documentation Manager

### 1. Access Library Pages

#### Public Documentation Pages
- **Text Editor Documentation**: [/plugins/texteditor/documentation-texteditor](http://localhost:3000/plugins/texteditor/documentation-texteditor)
- **Website Documentation**: [/plugins/texteditor/documentation-site](http://localhost:3000/plugins/texteditor/documentation-site)

#### Admin Control Panel (Admin/Editor Only)
- **Documentation Manager**: [/plugins/texteditor/documentation-manager](http://localhost:3000/plugins/texteditor/documentation-manager)

### 2. Basic User Actions

#### For Readers (Public Access)
1. **Browse Documentation**
   - Navigate sections using the left sidebar
   - Click on section names to jump to content
   - Use hierarchical navigation for organized browsing

2. **Search Functionality**
   - Press `Ctrl+K` (or `Cmd+K` on Mac) to open search
   - Type your query for real-time results
   - Click results to jump directly to content
   - Search works across all published content

3. **Navigate Between Libraries**
   - Use the header navigation to switch between:
     - Text Editor Documentation (blue theme)
     - Website Documentation (green theme)

#### For Editors/Admins (Authenticated Users)

##### Enable Admin Mode
1. Log in with editor or admin credentials
2. Look for the admin toggle in the header: `🔒 Admin`
3. Click to enable admin mode: `🔓 Admin`
4. Content sections now show editing indicators on hover

##### Context Menu Editing
1. **Right-click** on any content section while in admin mode
2. Choose from available actions:
   - **✏️ Edit Content** - Start inline editing
   - **📋 View Versions** - See content history
   - **📥 Export Content** - Download content
   - **⚙️ Open in Admin Panel** - Full editor interface

##### Inline Editing
1. **Double-click** on any text content while in admin mode
2. Content becomes editable with toolbar
3. Make your changes in the editor
4. Use keyboard shortcuts:
   - `Ctrl+Enter` - Save changes
   - `Escape` - Cancel editing
5. Changes are saved automatically and broadcast to other users

##### Create New Content
1. Click **⚙️ Panel** in the header to open admin panel
2. Or navigate directly to `/plugins/texteditor/documentation-manager`
3. Use the content creation interface (see Admin Panel section below)

### 3. Admin Panel Features

#### Library Management
1. **Library Switcher**: Toggle between texteditor and site libraries
   - Blue theme for Text Editor documentation
   - Green theme for Website documentation
   - Content is completely separate between libraries

2. **View Switcher**: Choose your management view
   - **📝 Content** - Create, edit, and manage documentation pages
   - **🗂️ Sections** - Organize content hierarchy (Admin only)
   - **📋 Versions** - View and restore content history

#### Content Manager
1. **Content List** (Left Panel)
   - View all content items for selected library
   - See publication status (Published/Draft)
   - Quick actions: Edit, View, Delete
   - Click items to select for editing

2. **Content Editor** (Right Panel)
   - **Title**: Page title (auto-generates URL slug)
   - **Slug**: URL-friendly identifier
   - **Section**: Organize content into sections
   - **Excerpt**: Brief description for search results
   - **Content**: Full content using integrated text editor
   - **Publish**: Toggle to make content publicly visible

3. **Creating Content**
   - Click **➕ Create New** button
   - Fill in required fields (Title, Content)
   - Choose section for organization
   - Save as draft or publish immediately

#### Section Manager (Admin Only)
1. **Hierarchical Organization**
   - Create nested sections for content organization
   - Drag and drop to reorder sections
   - Set icons and descriptions for sections

2. **Section Actions**
   - **➕ Create Section** - Add new organizational section
   - **✏️ Edit** - Modify section details
   - **🗑️ Delete** - Remove section (moves content to root)

#### Version Manager
1. **Content Selection**
   - Choose content item from sidebar
   - View complete version history
   - See who made changes and when

2. **Version Actions**
   - **👁️ View** - See content at specific version
   - **🔄 Restore** - Revert to previous version
   - **📊 Compare** - See differences between versions

### 4. Real-time Collaboration

#### Content Locking System
- When you start editing, content is automatically locked
- Other users see "🔒 Being edited by [Your Name]" indicator
- Locks expire after 30 minutes of inactivity
- Only one person can edit content at a time

#### Live Updates
- See real-time changes when others edit content
- Notifications appear for content updates
- User awareness shows who is currently editing
- Changes appear immediately without page refresh

#### Collaboration Best Practices
1. **Communicate**: Use team chat when making major changes
2. **Short Sessions**: Keep editing sessions brief to avoid long locks
3. **Save Frequently**: Use `Ctrl+Enter` to save and unlock quickly
4. **Check Locks**: Look for lock indicators before editing

### 5. Keyboard Shortcuts

#### Global Shortcuts
- **`Ctrl+K`** (or `Cmd+K`): Open search panel
- **`Ctrl+Shift+D`**: Open documentation manager (if authorized)
- **`Escape`**: Close modals, panels, and cancel editing

#### Editing Shortcuts
- **`Ctrl+Enter`**: Save content and exit editing
- **`Escape`**: Cancel editing without saving
- **`Ctrl+Z`**: Undo changes (in text editor)
- **`Ctrl+Y`**: Redo changes (in text editor)

#### Navigation Shortcuts
- **`Tab`**: Navigate between form fields
- **`Shift+Tab`**: Navigate backwards between fields
- **`Enter`**: Submit forms or confirm actions

### 6. Troubleshooting

#### Common Issues

**Can't Edit Content**
- Ensure you're logged in with editor or admin role
- Check that admin mode is enabled (🔓 Admin in header)
- Verify content isn't locked by another user

**Changes Not Saving**
- Check your internet connection
- Ensure you have proper permissions
- Try refreshing the page and editing again

**Search Not Working**
- Ensure content is published (drafts don't appear in search)
- Try different search terms
- Check that you're searching the correct library

**Admin Panel Not Accessible**
- Verify you have editor or admin role
- Check the URL: `/plugins/texteditor/documentation-manager`
- Ensure you're logged in

#### Getting Help
1. **Check Documentation**: Review this guide and architecture docs
2. **Check Browser Console**: Look for error messages
3. **Contact Administrator**: Report persistent issues
4. **Check Network**: Ensure stable internet connection

### 7. Best Practices

#### Content Creation
- **Clear Titles**: Use descriptive, searchable titles
- **Good Structure**: Organize content with proper headings
- **Useful Excerpts**: Write helpful descriptions for search
- **Consistent Style**: Follow your organization's style guide

#### Content Organization
- **Logical Sections**: Group related content together
- **Clear Hierarchy**: Use nested sections appropriately
- **Meaningful Slugs**: Create readable URLs
- **Regular Reviews**: Keep content up-to-date

#### Collaboration
- **Communicate Changes**: Inform team of major updates
- **Version Control**: Use meaningful change summaries
- **Regular Backups**: Content is automatically versioned
- **Access Control**: Only grant necessary permissions

### 8. Advanced Features

#### Content Import/Export
- Export individual pages or entire libraries
- Import content from other documentation systems
- Bulk operations for large content migrations

#### Custom Styling
- Library-specific themes (blue for texteditor, green for site)
- Responsive design works on all devices
- Print-friendly formatting for documentation

#### Integration Options
- API access for external systems
- WebSocket integration for real-time features
- Database-driven content for dynamic updates

---

## Need More Help?

- **Architecture Guide**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Database Schema**: [DATABASE.md](./DATABASE.md)
- **API Reference**: [API_SECURITY.md](./API_SECURITY.md)
- **Implementation Plan**: [FINAL_IMPLEMENTATION_PLAN.md](./FINAL_IMPLEMENTATION_PLAN.md)