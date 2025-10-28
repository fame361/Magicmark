# MagicMark - Advanced Query Builder for Strapi v5

Save and apply complex Content Manager queries with one click. Professional bookmark management with role-based sharing and advanced filtering.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm version](https://badge.fury.io/js/strapi-plugin-magic-mark.svg)](https://www.npmjs.com/package/strapi-plugin-magic-mark)

## 🌍 Supported Languages

The admin interface is available in **5 languages** for international accessibility:

- 🇬🇧 **English** - Global standard
- 🇩🇪 **Deutsch** - German (DACH region)
- 🇫🇷 **Français** - French
- 🇪🇸 **Español** - Spanish (Spain & Latin America)
- 🇵🇹 **Português** - Portuguese (Brazil & Portugal)

The language automatically follows your Strapi admin interface language setting.

---

## 📜 License

This plugin is licensed under the **MIT License** - free for everyone to use!

### What you CAN do:
- ✅ Use the plugin freely (personal & commercial)
- ✅ View and study the source code
- ✅ Report issues and contribute improvements
- ✅ Deploy in production without fees
- ✅ Integrate in your commercial projects

### What you CANNOT do:
- ❌ Remove or bypass the license validation system
- ❌ Modify `license-guard.ts` or license-related endpoints
- ❌ Disable license activation requirements

**Important:** The license validation system must remain intact and functional. This ensures quality, support, and continued development. Users must activate the plugin (free) through the admin interface.

📄 See [LICENSE](./LICENSE) for full terms

---

## ✨ Features

### Core Functionality
- 🔖 **Query Bookmarks** - Save complex Content Manager queries
- 🎯 **One-Click Apply** - Restore filters, sorting, and pagination instantly
- 📱 **Mobile Optimized** - Perfect responsive design
- 🎨 **Emoji Icons** - Visual bookmark identification
- 📌 **Pin Important** - Keep frequently used bookmarks on top

### Advanced Features
- 👥 **Role-Based Sharing** - Share bookmarks with specific admin roles
- 🔐 **User Sharing** - Share with individual admin users
- 🌍 **Public Bookmarks** - Make bookmarks visible to all users
- 🔄 **Drag & Drop Reorder** - Organize bookmarks with drag-and-drop
- 📊 **Filter Preview** - See exactly what filters are saved
- 🌐 **License Management** - Built-in license activation interface

### User Experience
- ⚡ **Instant Save** - Capture current query state in one click
- 🎭 **Context Aware** - Automatically detects current content type
- 🔍 **Quick Access** - Bookmark button in Content Manager toolbar
- 📝 **Descriptions** - Add notes to remember bookmark purpose
- 🎨 **Professional UI** - Beautiful gradient design

---

## 📦 Installation

```bash
npm install strapi-plugin-magic-mark
```

or

```bash
yarn add strapi-plugin-magic-mark
```

Then add the plugin to your `config/plugins.ts`:

```typescript
export default {
  'magic-mark': {
    enabled: true,
  },
};
```

Rebuild your admin panel:

```bash
npm run build
# or
yarn build
```

---

## 🚀 Quick Start

### 1. Activate License

On first use, a modal will appear:
- Click **"Activate License"** to auto-create with your admin account
- Or enter license details manually
- Or use an existing license key

### 2. Save Your First Bookmark

1. Navigate to any Content Manager collection
2. Apply filters, sorting, or search
3. Click the **MagicMark** button in the toolbar
4. Click **"Save Bookmark"**
5. Add a name, emoji, and description
6. Save!

### 3. Use Bookmarks

- Click **MagicMark** button → Select bookmark → Done!
- Filters are instantly applied
- Navigate faster than ever before

---

## 🎯 Use Cases

### Content Management
- **Published Articles** - Quick access to published content
- **Draft Posts** - Filter for unpublished drafts
- **Recent Updates** - Items modified in last 7 days
- **My Content** - Content created by you

### Team Collaboration
- **Shared Queries** - Team members access same filtered views
- **Role-Based Access** - Editors see different bookmarks than Authors
- **Public Bookmarks** - Common queries for everyone

### Power Users
- **Complex Filters** - Save multi-condition queries
- **Sorted Views** - Specific sort orders for different needs
- **Pinned Favorites** - Most used bookmarks always on top

---

## 📸 Screenshots

### Bookmark Management
Professional interface for managing query bookmarks.

![MagicMark Dashboard](pics/dashboard.png)

### Save Bookmark Modal
Create bookmarks with emoji, name, and sharing options.

![Create Bookmark](pics/create-bookmark.png)

### Content Manager Integration
Seamless integration in Content Manager toolbar.

![Content Manager](pics/content-manager.png)

---

## 🔧 Configuration

### Basic Setup

The plugin works out of the box with no configuration required!

### Advanced Options

Configure in `config/plugins.ts`:

```typescript
export default {
  'magic-mark': {
    enabled: true,
    config: {
      // Future configuration options
    },
  },
};
```

---

## 🛠️ Development

### Build Plugin

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

### Link for Development

```bash
npm run watch:link
```

Then in your Strapi project:

```bash
yalc add strapi-plugin-magic-mark
npm install
```

---

## 📚 API

### Create Bookmark

```typescript
POST /magic-mark/bookmarks
{
  "name": "Published Articles",
  "path": "/content-manager/collection-types/api::article.article",
  "query": "filters[$and][0][publishedAt][$notNull]=true",
  "emoji": "📰",
  "description": "All published articles",
  "isPublic": false,
  "sharedWithRoles": [1, 2],
  "sharedWithUsers": []
}
```

### Get Bookmarks

```typescript
GET /magic-mark/bookmarks
// Returns bookmarks accessible to current user
```

### Update Bookmark

```typescript
PUT /magic-mark/bookmarks/:id
```

### Delete Bookmark

```typescript
DELETE /magic-mark/bookmarks/:id
```

### Reorder Bookmarks

```typescript
POST /magic-mark/bookmarks/reorder
{
  "bookmarkIds": [3, 1, 2]
}
```

---

## 🔐 License System

MagicMark uses a secure license validation system:

- **Free to use** - No payment required
- **One-click activation** - Auto-create with your admin account
- **Offline mode** - 24-hour grace period
- **Multiple options** - Auto-create, manual, or existing key

The license ensures:
- Quality support and updates
- Spam prevention
- Usage analytics for improvements

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 🐛 Bug Reports

Found a bug? Please report it:

**GitHub Issues:** https://github.com/begservice/strapi-plugin-magic-mark/issues

Include:
- Strapi version
- Plugin version
- Steps to reproduce
- Expected vs actual behavior

---

## 💡 Feature Requests

Have an idea? We'd love to hear it!

Open an issue with:
- Clear description
- Use case
- Why it would be useful

---

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and updates.

---

## 👨‍💻 Author

**Schero A. (begservice)**
- GitHub: [@begservice](https://github.com/begservice)
- Email: schero1894@gmail.com

---

## 🌟 Support

If you find this plugin useful:

- ⭐ Star the repository
- 🐦 Share on social media
- 📝 Write a review
- 🤝 Contribute improvements

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

**Copyright (c) 2025 Schero A. (begservice)**

---

## 🔗 Links

- **NPM Package:** https://www.npmjs.com/package/strapi-plugin-magic-mark
- **GitHub Repository:** https://github.com/begservice/strapi-plugin-magic-mark
- **Issues:** https://github.com/begservice/strapi-plugin-magic-mark/issues
- **Strapi Market:** Coming soon

---

## 🙏 Acknowledgments

Built with ❤️ for the Strapi community.

Special thanks to:
- Strapi team for the amazing CMS
- Community contributors
- All users providing feedback

---

**Made with 🔖 by begservice**
