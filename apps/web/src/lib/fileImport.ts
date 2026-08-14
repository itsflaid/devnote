import { languages } from "./languages"

/**
 * Mapping ekstensi file (tanpa titik, lowercase) → key bahasa di `languages.ts`.
 * Hanya isi entri yang key-nya BENERAN ada di object `languages`,
 * biar getLang() selalu dapat match yang valid.
 */
const EXTENSION_LANGUAGE_MAP: Record<string, string> = {
    // Web
    ts: "typescript",
    tsx: "react",
    js: "javascript",
    jsx: "react",
    mjs: "javascript",
    cjs: "javascript",
    vue: "vue",
    svelte: "svelte",
    html: "html",
    htm: "html",
    css: "css",
    scss: "scss",
    less: "less",
    astro: "astro",
    coffee: "coffeescript",
    elm: "elm",

    // Backend
    py: "python",
    php: "php",
    java: "java",
    cs: "csharp",
    cpp: "cpp",
    cc: "cpp",
    cxx: "cpp",
    hpp: "cpp",
    c: "c",
    h: "c",
    go: "go",
    rs: "rust",
    kt: "kotlin",
    kts: "kotlin",
    swift: "swift",
    dart: "dart",
    rb: "ruby",
    ex: "elixir",
    exs: "elixir",
    hs: "haskell",
    scala: "scala",
    lua: "lua",
    r: "r",
    pl: "perl",
    pm: "perl",
    m: "objectivec",
    mm: "objectivec",
    ps1: "powershell",
    psm1: "powershell",
    zig: "zig",
    nim: "nim",
    clj: "clojure",
    cljs: "clojure",
    erl: "erlang",
    fs: "fsharp",
    fsx: "fsharp",
    jl: "julia",
    cr: "crystal",
    sol: "solidity",
    asm: "assembly",
    s: "assembly",

    // Database
    sql: "sql",

    // DevOps & config
    sh: "bash",
    bash: "bash",
    zsh: "bash",
    yml: "yaml",
    yaml: "yaml",
    toml: "toml",
    xml: "xml",
    ini: "ini",
    cfg: "ini",
    mk: "makefile",
    cmake: "cmake",
    tf: "terraform",
    hcl: "terraform",

    // Data & markup
    json: "json",
    md: "markdown",
    markdown: "markdown",
    graphql: "graphql",
    gql: "graphql",
    proto: "protobuf",
    prisma: "prisma",

    // Plain fallback
    txt: "plaintext",
}

/** Nama file (tanpa ekstensi cocok) yang punya bahasa spesifik, dicek case-insensitive. */
const FILENAME_LANGUAGE_MAP: Record<string, string> = {
    dockerfile: "dockerfile",
    "nginx.conf": "nginx",
    makefile: "makefile",
    "cmakelists.txt": "cmake",
}

const IMAGE_EXTENSIONS = new Set([
    "png", "jpg", "jpeg", "gif", "webp", "bmp", "ico", "avif", "tiff", "tif", "svg", "heic", "heif",
])

/** Batas ukuran file yang boleh diimport (2MB) — biar textarea/editor gak lag. */
export const MAX_IMPORT_SIZE = 2 * 1024 * 1024

export function getFileExtension(filename: string): string {
    const parts = filename.toLowerCase().trim().split(".")
    return parts.length > 1 ? (parts.pop() ?? "") : ""
}

export function isImageFile(file: File, ext: string): boolean {
    return file.type.startsWith("image/") || IMAGE_EXTENSIONS.has(ext)
}

export interface DetectedLanguage {
    /** Key bahasa di `languages.ts`. Kalau tidak match, ini "other". */
    language: string
    /** true kalau ekstensi/nama file dikenali DevNote. */
    matched: boolean
}

export function detectLanguage(filename: string): DetectedLanguage {
    const lowerName = filename.toLowerCase().trim()
    const ext = getFileExtension(filename)

    const byFilename = FILENAME_LANGUAGE_MAP[lowerName]
    if (byFilename && languages[byFilename]) {
        return { language: byFilename, matched: true }
    }

    const byExt = EXTENSION_LANGUAGE_MAP[ext]
    if (byExt && languages[byExt]) {
        return { language: byExt, matched: true }
    }

    return { language: "other", matched: false }
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Ekstensi yang ditawarkan di dialog file picker (accept attribute). */
export const IMPORT_ACCEPT =
    ".ts,.tsx,.js,.jsx,.mjs,.cjs,.vue,.svelte,.html,.htm,.css,.scss,.less,.astro," +
    ".py,.php,.java,.cs,.cpp,.cc,.cxx,.hpp,.c,.h,.go,.rs,.kt,.kts,.swift,.dart," +
    ".rb,.ex,.exs,.hs,.scala,.lua,.r,.pl,.pm,.m,.mm,.ps1,.psm1,.zig,.nim,.clj,.cljs," +
    ".erl,.fs,.fsx,.jl,.cr,.sol,.asm,.s,.sql,.sh,.bash,.zsh,.yml,.yaml,.toml,.xml," +
    ".ini,.cfg,.mk,.cmake,.tf,.hcl,.json,.md,.markdown,.graphql,.gql,.proto,.prisma," +
    ".txt,text/plain"
