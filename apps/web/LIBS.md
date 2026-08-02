# Devnote — Library Notes

## Database
prisma              → CLI buat migrate & generate database
@prisma/client      → yang dipake di kode buat query ke MySQL

## Auth
next-auth           → login, logout, session management
@auth/prisma-adapter → nyambungin nextauth ke prisma/MySQL

## Syntax Highlight
shiki               → warnain kode jadi kayak di VS Code (buat nampilin snippet)

## UI & Styling
tailwindcss         → utility CSS, pakai versi 3
lucide-react        → icon
clsx                → conditional className biar rapi
tailwind-merge      → gabungin class tailwind tanpa conflict
framer-motion       → animasi (fade, slide, transition)

## Form & Validasi
react-hook-form     → handle state & submit form
zod                 → validasi input form (schema)
@hookform/resolvers → nyambungin react-hook-form sama zod

## Code Editor (form input snippet)
@uiw/react-codemirror       → mini code editor di form tambah/edit snippet
@codemirror/lang-javascript → support JS/TS di editor
@codemirror/lang-php        → support PHP di editor
@codemirror/lang-css        → support CSS di editor
@codemirror/lang-sql        → support SQL di editor

## Utility
nanoid      → generate ID pendek unik (buat link share snippet)
date-fns    → format tanggal ("2 days ago", dll)