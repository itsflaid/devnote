# DevNote

> A code snippet manager for developers — save, organize, search, and share code online.

DevNote helps developers save, organize, and share reusable code snippets — personal or team — in one searchable place.

Whether it's a reusable component, auth setup, Prisma schema, utility function, config file, or a complete source file, DevNote keeps everything tidy and easy to access whenever you need it.

---

## Why DevNote?

Developers constantly reuse the same resources:

- Authentication setups
- API integrations
- UI components
- Database schemas
- Utility functions
- Configuration files
- Boilerplate code

Instead of digging through old projects, chat history, browser bookmarks, or random folders, DevNote gives you one central place to manage and reuse your development knowledge.

---

## Features

### 📁 Personal Code Library

Store snippets, files, configs, and reusable resources. Search, filter by language, and sort the way you like.

### 🗂️ Collections

Organize snippets by topic, technology, or project.

### 🌍 Public Explore

Discover and browse public code snippets from other developers — like, copy, and reuse them.

### 🔗 Sharing

Share snippets via public links or a 9-character code.

Perfect for:

- Team collaboration
- Learning groups
- Classmates
- Open source projects

### 👥 Workspaces

Collaborate with multiple developers in shared workspaces and build a team knowledge base.

### ⚙️ Preferences

Tune your experience: sort order, default language, list density, code theme, font size, and line numbers.

### 📥 File Import

Import code directly from files (.ts, .py, .php, etc.) — language auto-detected.

### 📅 VS Code Extension *(Planned)*

Access DevNote resources directly inside VS Code.

---

## Tech Stack

- Next.js
- TypeScript
- TailwindCSS
- Prisma
- PostgreSQL
- NextAuth.js
- tRPC
- React Query
- Shiki
- Zustand
- Framer Motion
- CodeMirror

---

## Roadmap

### ✅ Available

- Personal Code Library
- Collections
- Public Explore
- Sharing (links & codes)
- Workspaces
- Preferences
- File Import

### 📅 Planned

- VS Code Extension
- API Access
- Team Knowledge Base
- Advanced Workspace Permissions

---

## Preview

### Welcome Page

<img src="apps/web/PreviewIMG/welcome.png" width="100%"/>

### Login

<img src="apps/web/PreviewIMG/login.png" width="100%"/>

### Register

<img src="apps/web/PreviewIMG/registrasi.png" width="100%"/>

### Dashboard

#### Sidebar Closed

<img src="apps/web/PreviewIMG/dashboard.png" width="100%"/>

#### Sidebar Open

<img src="apps/web/PreviewIMG/dashboard2.png" width="100%"/>

### Create Resource

<img src="apps/web/PreviewIMG/tambah-snippet.png" width="100%"/>

### 404 Not Found

<img src="apps/web/PreviewIMG/404.png" width="100%"/>

### Error Page

<img src="apps/web/PreviewIMG/error.png" width="100%"/>

---

## Getting Started

### Clone Repository

```bash
git clone <repository-url>
cd devnote
```

### Install Dependencies

```bash
pnpm install
```

### Configure Environment Variables

Create a `.env` file:

```env
DATABASE_URL=
DIRECT_URL=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
```

### Run Development Server

```bash
pnpm dev
```

Open:

```txt
http://localhost:3000
```

---

Built by [flaid.my.id](https://flaid.my.id)