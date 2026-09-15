// Beberapa key bahasa internal DevNote (lihat lib/languages.ts) bukan id
// grammar Shiki yang valid. Map ke id Shiki yang benar di sini, khusus
// untuk keperluan syntax highlighting — key asli di note/DB TIDAK berubah.
const SHIKI_LANG_OVERRIDES: Record<string, string> = {
    react: "tsx",           // grammar tsx meng-cover JSX + TS, aman juga untuk kode JS+JSX biasa
    objectivec: "objective-c",
    assembly: "asm",
    mysql: "sql",
    postgresql: "sql",
    mongodb: "javascript",  // mongo shell query berbasis JS
}

export function toShikiLang(language: string): string {
    const key = (language ?? "").toLowerCase().trim()
    return SHIKI_LANG_OVERRIDES[key] ?? key
}
