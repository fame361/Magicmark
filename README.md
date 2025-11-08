# MagicMark - Advanced Query Builder for Strapi v5 🔖

**Save and apply complex Content Manager queries with one click.** Professional bookmark management with role-based sharing, advanced filtering, and drag-and-drop organization for Strapi v5.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm version](https://badge.fury.io/js/strapi-plugin-magic-mark.svg)](https://www.npmjs.com/package/strapi-plugin-magic-mark)
[![GitHub release](https://img.shields.io/github/v/release/Schero94/Magicmark.svg)](https://github.com/Schero94/Magicmark/releases)

---

## 📋 Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [How It Works](#how-it-works)
- [Core Concepts](#core-concepts)
- [API Routes](#api-routes)
- [Configuration](#configuration)
- [Admin Dashboard](#admin-dashboard)
- [Use Cases](#use-cases)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [NPM Release Process](#npm-release-process)

---

## ✨ Features

### Core Bookmark Management
✅ **Query Bookmarks** - Save complex Content Manager filters, sorts, and pagination  
✅ **One-Click Apply** - Instantly restore entire query states  
✅ **Emoji Identification** - Visual icons for quick bookmark recognition  
✅ **Pin to Top** - Keep frequently used bookmarks always accessible  
✅ **Drag & Drop** - Reorder bookmarks effortlessly  
✅ **Mobile Optimized** - Fully responsive design  

### Advanced Sharing
✅ **Role-Based Sharing** - Share with specific admin roles  
✅ **User Sharing** - Share with individual admin users  
✅ **Public Bookmarks** - Make bookmarks visible to all users  
✅ **Permission Control** - Fine-grained access management  

### User Experience
✅ **Quick Access** - Bookmark button in Content Manager toolbar  
✅ **Filter Preview** - See exactly what's saved in each bookmark  
✅ **Descriptions** - Add notes to remember bookmark purpose  
✅ **Context Aware** - Automatically detects current content type  
✅ **Instant Save** - Capture current query state in one click  
✅ **Professional UI** - Beautiful gradient design with smooth animations  

### Multi-Language Support
✅ **5 Languages** - English, Deutsch, Français, Español, Português  
✅ **Auto-Detection** - Follows your Strapi admin language  
✅ **Complete i18n** - All UI elements translated  

---

## 🚀 Quick Start

### 1. Install Plugin

```bash
npm install strapi-plugin-magic-mark
# or
yarn add strapi-plugin-magic-mark
```

### 2. Register in Config

Add to `src/config/plugins.ts` (or `plugins.js`):

```typescript
export default () => ({
  'magic-mark': {
    enabled: true,
  },
});
```

### 3. Build & Run

```bash
# Rebuild admin panel
npm run build

# Start Strapi
npm run develop
```

### 4. Activate License (First Use)

- Go to Admin → **MagicMark**
- Click **"Activate License"**
- Choose: Auto-create, Manual entry, or Existing key
- Done! Plugin is ready

### 5. Save Your First Bookmark

1. Navigate to any Content Manager collection
2. Apply filters, sorting, or search
3. Click the **MagicMark** button in the toolbar
4. Click **"Save Bookmark"**
5. Add:
   - Name (e.g., "Published Articles")
   - Emoji (e.g., 📰)
   - Description (optional)
   - Sharing settings (optional)
6. Click **Save**

### 6. Use Bookmarks

- Click **MagicMark** → Select bookmark → Done!
- All filters are instantly applied
- Share with team members

---

## 🔄 How It Works

### Bookmark Save Flow

```
User in Content Manager
       ↓
Applies: Filters, Sort, Search, Pagination
       ↓
[Click MagicMark Button]
       ↓
"Save Bookmark" Modal opens
       ↓
User enters: Name, Emoji, Description, Sharing
       ↓
[Save]
       ↓
Query parameters captured:
  - Path: /content-manager/collection-types/api::article.article
  - Query: filters[$and][0][publishedAt][$notNull]=true&sort[0]=createdAt:desc
  - Pagination: page=1&pageSize=25
       ↓
Bookmark stored in database
       ↓
Success! Bookmark appears in list
```

### Bookmark Apply Flow

```
User clicks MagicMark button
       ↓
List of available bookmarks appears
  (filtered by user permissions)
       ↓
[User selects bookmark]
       ↓
Navigation to content type happens
       ↓
Query parameters applied:
  - Filters restored
  - Sort order set
  - Pagination reset
  - Search cleared
       ↓
Content Manager displays filtered results
```

### Sharing Logic

```
Bookmark created by: User A
       ↓
Sharing settings:
  - Owner (User A): Full access ✓
  - Role "Editor": Read access
  - User B: Read access
  - Public: Read access
       ↓
When User B views MagicMark list:
  - Sees bookmarks shared with them
  - Can apply but NOT edit
  - Can create personal bookmarks
```

---

## 🔑 Core Concepts

### Bookmark Object

All bookmark data stored in `api::magic-mark.bookmark` content type:

```javascript
{
  id: 1,
  name: "Published Articles",
  emoji: "📰",
  description: "Articles published in last 30 days",
  
  // Query State
  path: "/content-manager/collection-types/api::article.article",
  query: "filters[$and][0][publishedAt][$notNull]=true&sort[0]=createdAt:desc",
  
  // Metadata
  createdBy: { id: 1, email: "user@example.com" },
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:35:00Z",
  
  // Organization
  order: 1,
  isPinned: true,
  
  // Sharing
  isPublic: false,
  sharedWithRoles: [1, 2, 3],     // Role IDs
  sharedWithUsers: [2, 5, 8],     // User IDs
}
```

### Query State Captured

When saving a bookmark, MagicMark captures:

```javascript
{
  // Filters (all conditions)
  filters: {
    $and: [
      { publishedAt: { $notNull: true } },
      { status: { $eq: "published" } },
      { createdAt: { $gte: "2024-01-01" } }
    ]
  },
  
  // Sorting (column + direction)
  sort: [
    { field: "createdAt", order: "desc" },
    { field: "title", order: "asc" }
  ],
  
  // Pagination (current page & size)
  pagination: {
    page: 1,
    pageSize: 25
  },
  
  // Search (if applicable)
  search: "strapi",
  
  // Field visibility (if customized)
  fields: ["id", "title", "status", "publishedAt"]
}
```

### Permission Model

| Action | Owner | Shared Users | Shared Roles | Public |
|--------|-------|--------------|--------------|--------|
| View | ✅ | ✅ | ✅ | ✅ |
| Apply | ✅ | ✅ | ✅ | ✅ |
| Edit | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ |
| Share | ✅ | ❌ | ❌ | ❌ |

---

## 📡 API Routes

### Content API Routes

All routes require valid JWT authentication (except public bookmarks).

#### Get All Bookmarks

```bash
GET /api/magic-mark/bookmarks

Response:
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "name": "Published Articles",
        "emoji": "📰",
        "description": "Recent published content",
        "path": "/content-manager/collection-types/api::article.article",
        "query": "filters[$and][0][publishedAt][$notNull]=true",
        "isPinned": true,
        "isPublic": false,
        "createdAt": "2024-01-15T10:30:00Z"
      },
      "relationships": {
        "createdBy": { "data": { "id": 1 } }
      }
    }
  ],
  "meta": { "count": 5 }
}
```

#### Create Bookmark

```bash
POST /api/magic-mark/bookmarks
Authorization: Bearer JWT_TOKEN

Request:
{
  "data": {
    "name": "Draft Posts",
    "emoji": "📝",
    "description": "Unpublished drafts",
    "path": "/content-manager/collection-types/api::article.article",
    "query": "filters[0][publishedAt][$null]=true",
    "isPublic": false,
    "sharedWithRoles": [1, 2],
    "sharedWithUsers": [3]
  }
}

Response:
{
  "data": {
    "id": 6,
    "attributes": { /* bookmark data */ }
  }
}
```

#### Update Bookmark

```bash
PUT /api/magic-mark/bookmarks/:id
Authorization: Bearer JWT_TOKEN

# Only bookmark owner can update
```

#### Delete Bookmark

```bash
DELETE /api/magic-mark/bookmarks/:id
Authorization: Bearer JWT_TOKEN

# Only bookmark owner can delete
```

#### Reorder Bookmarks

```bash
POST /api/magic-mark/bookmarks/reorder
Authorization: Bearer JWT_TOKEN

Request:
{
  "bookmarkIds": [3, 1, 5, 2, 4]
}

# Sets new order for user's bookmarks
```

---

### Admin API Routes

All require **admin authentication**.

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/magic-mark/admin/bookmarks` | Get all bookmarks (all users) |
| `GET` | `/api/magic-mark/admin/stats` | Get bookmark statistics |
| `GET` | `/api/magic-mark/admin/license/status` | Get license status |

---

## ⚙️ Configuration

### Basic Setup (Default)

The plugin works out of the box with zero configuration!

```typescript
// src/config/plugins.ts
export default () => ({
  'magic-mark': {
    enabled: true,
  },
});
```

### Advanced Options (Optional)

```typescript
export default () => ({
  'magic-mark': {
    enabled: true,
    config: {
      // Future: Query history limit
      maxHistoryItems: 100,
      
      // Future: Default bookmarks per user
      maxBookmarksPerUser: 50,
      
      // Future: Auto-cleanup old queries
      autoCleanupDays: 90,
    },
  },
});
```

---

## 🎛️ Admin Dashboard

Access at **Admin → MagicMark** (sidebar plugin)

### Main Interface

#### Bookmark List
- **Pinned Bookmarks** - Appear at top (⭐ indicator)
- **All Bookmarks** - Sorted by creation date
- **Search** - Find bookmarks by name or description
- **Drag to Reorder** - Change bookmark order

#### Bookmark Card
- Displays: Emoji, Name, Description
- Click to apply bookmark
- Right-click for options menu

#### Options Menu
- **Edit** - Update bookmark details
- **Duplicate** - Create a copy
- **Pin** - Pin to top
- **Share** - Configure access
- **Delete** - Remove bookmark

---

## 💡 Use Cases

### Content Management

**Published Articles**
```
Filter: publishedAt is not empty
Sort: createdAt DESC
Result: Quick access to all published content
```

**Draft Posts**
```
Filter: publishedAt is empty AND status = "draft"
Sort: updatedAt DESC
Result: Focus on work in progress
```

**Recent Updates**
```
Filter: updatedAt >= 7 days ago
Sort: updatedAt DESC
Result: See what changed recently
```

### Team Collaboration

- **Shared Queries** - Team members access same filtered views
- **Role-Based Access** - Different bookmarks per admin role
- **Public Bookmarks** - Common queries for entire team

---

## 🧪 Testing

### 1. Install & Setup Test Strapi

```bash
# Create test Strapi instance
npx create-strapi-app@latest test-app --quickstart

cd test-app

# Copy magic-mark plugin
cp -r /path/to/magic-mark src/plugins/

# Add to config/plugins.ts
npm run develop
```

### 2. Create Test Content Type

1. Go to Settings → Content-Types Builder
2. Create new Collection: "Post"
3. Add fields: title, status, publishedAt
4. Create & save

### 3. Test Bookmark Save

1. Go to Content Manager → Posts
2. Click **MagicMark** → Save Bookmark
3. Fill form and save
4. Verify bookmark appears

### 4. Test Bookmark Apply

1. Click **MagicMark** → Select bookmark
2. Verify filters are applied correctly

### 5. Test Sharing

1. Edit bookmark
2. Share with role/user
3. Login as that user
4. Verify bookmark appears

---

## 🐛 Troubleshooting

### MagicMark Button Not Appearing

**Solutions:**
1. Verify plugin is enabled in config
2. Rebuild admin UI: `npm run build`
3. Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)
4. Check browser console for errors (F12)

### Bookmarks Not Saving

**Solutions:**
1. Check Strapi logs for errors
2. Verify `api::magic-mark.bookmark` collection exists
3. Check license is activated
4. Verify database is writable

### Bookmarks Not Applying

**Solutions:**
1. Refresh page and try again
2. Check browser console for errors
3. Try creating new bookmark
4. Check browser localStorage

### License Validation Fails

**Solutions:**
1. Check internet connection
2. Try activating license again
3. Use auto-create option
4. Contact support if issue persists

---

## 🛠️ Development

### Local Development

```bash
# Watch mode - rebuilds on file changes
npm run watch

# Link to local Strapi
npm run watch:link

# Type checking
npm run test:ts:front   # Frontend TypeScript
npm run test:ts:back    # Backend TypeScript

# Verify plugin
npm run verify
```

### Plugin Structure

```
magic-mark/
├── admin/                      # React admin UI
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── translations/
│       └── index.ts
├── server/                     # Backend (TypeScript)
│   └── src/
│       ├── bootstrap.ts
│       ├── controllers/
│       ├── services/
│       ├── routes/
│       └── content-types/
├── .github/workflows/          # CI/CD pipelines
├── package.json
├── .releaserc.json             # semantic-release config
└── README.md
```

### Build & Release

```bash
# Build plugin
npm run build

# Package for NPM
npm run verify

# Release (automatic via GitHub Actions)
# Just use conventional commits: feat:, fix:, etc.
```

---

## 📦 NPM Release Process

This plugin uses **semantic-release** for automated versioning.

### Automatic Release Workflow

```
Developer commits with semantic messages (feat:, fix:)
       ↓
GitHub Actions triggered on push to main
       ↓
Analyzes commits:
  - feat: → MINOR version
  - fix: → PATCH version
  - BREAKING CHANGE: → MAJOR version
       ↓
CHANGELOG updated
       ↓
Version bumped in package.json
       ↓
Published to NPM
       ↓
GitHub release created
```

### Commit Message Format

```bash
# PATCH version (bug fix)
git commit -m "fix: correct bookmark save"

# MINOR version (new feature)
git commit -m "feat: add bookmark export"

# MAJOR version (breaking change)
git commit -m "feat!: change API format"
```

### GitHub Actions Workflows

- **release.yml** - Automatic release to NPM
- **test.yml** - Test & verify on PR

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing`
3. Commit: `git commit -m "feat: add amazing feature"`
4. Push: `git push origin feature/amazing`
5. Open Pull Request

---

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

---

## 🐛 Bug Reports & Feature Requests

**GitHub Issues:** https://github.com/Schero94/Magicmark/issues

---

## 📚 Resources

- **NPM Package:** https://www.npmjs.com/package/strapi-plugin-magic-mark
- **GitHub:** https://github.com/Schero94/Magicmark
- **Issues:** https://github.com/Schero94/Magicmark/issues

---

## 📄 License

**MIT License** - Free for personal & commercial use

**Copyright (c) 2025 Schero D.**

---

## 🌐 Languages

- 🇬🇧 English
- 🇩🇪 Deutsch
- 🇫🇷 Français
- 🇪🇸 Español
- 🇵🇹 Português

---

**Made with 🔖 by Schero D.**
