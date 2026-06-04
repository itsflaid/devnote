# DevNote

> A developer knowledge hub for reusable code, files, and resources.

DevNote helps developers save, organize, share, and reuse development resources in one place.

Whether it's a reusable component, authentication setup, Prisma schema, utility function, configuration file, or even a complete source file, DevNote keeps everything searchable, structured, and easy to access whenever you need it.

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

Instead of searching old projects, chat history, browser bookmarks, or random folders, DevNote provides a centralized place to manage and reuse development knowledge.

---

## Features

### 📁 Personal Library

Store snippets, files, configurations, and reusable resources.

### 🗂️ Collections

Organize resources by topic, technology, or project.

### 🌍 Public Resources

Explore and discover resources shared by other developers.

### 🔗 Sharing

Share resources instantly using public links.

Perfect for:

- Team collaboration
- Learning groups
- Classmates
- Open source projects

### 🚧 Workspaces *(In Progress)*

Collaborate with multiple developers in shared workspaces.

Build a shared knowledge base with your team.

### 📅 VS Code Extension *(Planned)*

Access DevNote resources directly inside VS Code.

---

## Tech Stack

- Next.js
- TypeScript
- TailwindCSS
- Prisma
- MySQL
- NextAuth.js
- Shiki
- Zustand
- Framer Motion
- CodeMirror

---

## Roadmap

### ✅ Available

- Personal Resource Library
- Collections
- Public Resources
- Resource Sharing

### 🚧 In Progress

- Workspaces

### 📅 Planned

- VS Code Extension
- Resource Templates
- Setup Guides
- Team Knowledge Base
- Workspace Permissions
- API Access

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

