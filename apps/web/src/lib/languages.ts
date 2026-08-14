export interface LanguageConfig {
    label: string
    color: string
    pip: string
    stripe: string
}

export const languages: Record<string, LanguageConfig> = {

    // --- Web ---
    typescript: {
        label: "TS",
        color: "#3178c6",
        pip: "bg-[rgba(49,120,198,0.1)] text-[#3178c6] border-[rgba(49,120,198,0.25)]",
        stripe: "bg-[#3178c6]",
    },
    javascript: {
        label: "JS",
        color: "#f7df1e",
        pip: "bg-[rgba(247,223,30,0.1)] text-[#f7df1e] border-[rgba(247,223,30,0.25)]",
        stripe: "bg-[#f7df1e]",
    },
    html: {
        label: "HTML",
        color: "#e34c26",
        pip: "bg-[rgba(227,76,38,0.1)] text-[#e34c26] border-[rgba(227,76,38,0.25)]",
        stripe: "bg-[#e34c26]",
    },
    css: {
        label: "CSS",
        color: "#264de4",
        pip: "bg-[rgba(38,77,228,0.1)] text-[#264de4] border-[rgba(38,77,228,0.25)]",
        stripe: "bg-[#264de4]",
    },
    scss: {
        label: "SCSS",
        color: "#cc6699",
        pip: "bg-[rgba(204,102,153,0.1)] text-[#cc6699] border-[rgba(204,102,153,0.25)]",
        stripe: "bg-[#cc6699]",
    },
    less: {
        label: "LESS",
        color: "#1d365d",
        pip: "bg-[rgba(29,54,93,0.1)] text-[#5c85c9] border-[rgba(29,54,93,0.25)]",
        stripe: "bg-[#1d365d]",
    },

    // --- Frontend Frameworks ---
    vue: {
        label: "VUE",
        color: "#42b883",
        pip: "bg-[rgba(66,184,131,0.1)] text-[#42b883] border-[rgba(66,184,131,0.25)]",
        stripe: "bg-[#42b883]",
    },
    react: {
        label: "RE",
        color: "#61dafb",
        pip: "bg-[rgba(97,218,251,0.1)] text-[#61dafb] border-[rgba(97,218,251,0.25)]",
        stripe: "bg-[#61dafb]",
    },
    svelte: {
        label: "SV",
        color: "#ff3e00",
        pip: "bg-[rgba(255,62,0,0.1)] text-[#ff3e00] border-[rgba(255,62,0,0.25)]",
        stripe: "bg-[#ff3e00]",
    },
    astro: {
        label: "ASTRO",
        color: "#ff5a03",
        pip: "bg-[rgba(255,90,3,0.1)] text-[#ff5a03] border-[rgba(255,90,3,0.25)]",
        stripe: "bg-[#ff5a03]",
    },
    elm: {
        label: "ELM",
        color: "#60b5cc",
        pip: "bg-[rgba(96,181,204,0.1)] text-[#60b5cc] border-[rgba(96,181,204,0.25)]",
        stripe: "bg-[#60b5cc]",
    },
    coffeescript: {
        label: "COFFEE",
        color: "#244776",
        pip: "bg-[rgba(36,71,118,0.1)] text-[#5c85c9] border-[rgba(36,71,118,0.25)]",
        stripe: "bg-[#244776]",
    },

    // --- Backend ---
    python: {
        label: "PY",
        color: "#ffd43b",
        pip: "bg-[rgba(255,212,59,0.1)] text-[#ffd43b] border-[rgba(255,212,59,0.25)]",
        stripe: "bg-[#ffd43b]",
    },
    php: {
        label: "PHP",
        color: "#777bb4",
        pip: "bg-[rgba(119,123,180,0.1)] text-[#777bb4] border-[rgba(119,123,180,0.25)]",
        stripe: "bg-[#777bb4]",
    },
    java: {
        label: "JAVA",
        color: "#f89820",
        pip: "bg-[rgba(248,152,32,0.1)] text-[#f89820] border-[rgba(248,152,32,0.25)]",
        stripe: "bg-[#f89820]",
    },
    csharp: {
        label: "C#",
        color: "#9b4f96",
        pip: "bg-[rgba(155,79,150,0.1)] text-[#9b4f96] border-[rgba(155,79,150,0.25)]",
        stripe: "bg-[#9b4f96]",
    },
    cpp: {
        label: "C++",
        color: "#00599c",
        pip: "bg-[rgba(0,89,156,0.1)] text-[#00599c] border-[rgba(0,89,156,0.25)]",
        stripe: "bg-[#00599c]",
    },
    c: {
        label: "C",
        color: "#a8b9cc",
        pip: "bg-[rgba(168,185,204,0.1)] text-[#a8b9cc] border-[rgba(168,185,204,0.25)]",
        stripe: "bg-[#a8b9cc]",
    },
    go: {
        label: "GO",
        color: "#00add8",
        pip: "bg-[rgba(0,173,216,0.1)] text-[#00add8] border-[rgba(0,173,216,0.25)]",
        stripe: "bg-[#00add8]",
    },
    rust: {
        label: "RS",
        color: "#dea584",
        pip: "bg-[rgba(222,165,132,0.1)] text-[#dea584] border-[rgba(222,165,132,0.25)]",
        stripe: "bg-[#dea584]",
    },
    kotlin: {
        label: "KT",
        color: "#7f52ff",
        pip: "bg-[rgba(127,82,255,0.1)] text-[#7f52ff] border-[rgba(127,82,255,0.25)]",
        stripe: "bg-[#7f52ff]",
    },
    swift: {
        label: "SW",
        color: "#f05138",
        pip: "bg-[rgba(240,81,56,0.1)] text-[#f05138] border-[rgba(240,81,56,0.25)]",
        stripe: "bg-[#f05138]",
    },
    dart: {
        label: "DART",
        color: "#0175c2",
        pip: "bg-[rgba(1,117,194,0.1)] text-[#0175c2] border-[rgba(1,117,194,0.25)]",
        stripe: "bg-[#0175c2]",
    },
    ruby: {
        label: "RB",
        color: "#cc342d",
        pip: "bg-[rgba(204,52,45,0.1)] text-[#cc342d] border-[rgba(204,52,45,0.25)]",
        stripe: "bg-[#cc342d]",
    },
    elixir: {
        label: "EX",
        color: "#6e4a7e",
        pip: "bg-[rgba(110,74,126,0.1)] text-[#6e4a7e] border-[rgba(110,74,126,0.25)]",
        stripe: "bg-[#6e4a7e]",
    },
    haskell: {
        label: "HS",
        color: "#5e5086",
        pip: "bg-[rgba(94,80,134,0.1)] text-[#5e5086] border-[rgba(94,80,134,0.25)]",
        stripe: "bg-[#5e5086]",
    },
    scala: {
        label: "SC",
        color: "#dc322f",
        pip: "bg-[rgba(220,50,47,0.1)] text-[#dc322f] border-[rgba(220,50,47,0.25)]",
        stripe: "bg-[#dc322f]",
    },
    lua: {
        label: "LUA",
        color: "#000080",
        pip: "bg-[rgba(0,0,128,0.1)] text-[#4d4dff] border-[rgba(0,0,128,0.25)]",
        stripe: "bg-[#000080]",
    },
    r: {
        label: "R",
        color: "#198ce7",
        pip: "bg-[rgba(25,140,231,0.1)] text-[#198ce7] border-[rgba(25,140,231,0.25)]",
        stripe: "bg-[#198ce7]",
    },
    perl: {
        label: "PL",
        color: "#0298c3",
        pip: "bg-[rgba(2,152,195,0.1)] text-[#0298c3] border-[rgba(2,152,195,0.25)]",
        stripe: "bg-[#0298c3]",
    },
    objectivec: {
        label: "OBJC",
        color: "#438eff",
        pip: "bg-[rgba(67,142,255,0.1)] text-[#438eff] border-[rgba(67,142,255,0.25)]",
        stripe: "bg-[#438eff]",
    },
    powershell: {
        label: "PS",
        color: "#5391fe",
        pip: "bg-[rgba(83,145,254,0.1)] text-[#5391fe] border-[rgba(83,145,254,0.25)]",
        stripe: "bg-[#5391fe]",
    },
    zig: {
        label: "ZIG",
        color: "#ec915c",
        pip: "bg-[rgba(236,145,92,0.1)] text-[#ec915c] border-[rgba(236,145,92,0.25)]",
        stripe: "bg-[#ec915c]",
    },
    nim: {
        label: "NIM",
        color: "#ffc200",
        pip: "bg-[rgba(255,194,0,0.1)] text-[#ffc200] border-[rgba(255,194,0,0.25)]",
        stripe: "bg-[#ffc200]",
    },
    clojure: {
        label: "CLJ",
        color: "#db5855",
        pip: "bg-[rgba(219,88,85,0.1)] text-[#db5855] border-[rgba(219,88,85,0.25)]",
        stripe: "bg-[#db5855]",
    },
    erlang: {
        label: "ERL",
        color: "#b83998",
        pip: "bg-[rgba(184,57,152,0.1)] text-[#b83998] border-[rgba(184,57,152,0.25)]",
        stripe: "bg-[#b83998]",
    },
    fsharp: {
        label: "F#",
        color: "#b845fc",
        pip: "bg-[rgba(184,69,252,0.1)] text-[#b845fc] border-[rgba(184,69,252,0.25)]",
        stripe: "bg-[#b845fc]",
    },
    julia: {
        label: "JL",
        color: "#a270ba",
        pip: "bg-[rgba(162,112,186,0.1)] text-[#a270ba] border-[rgba(162,112,186,0.25)]",
        stripe: "bg-[#a270ba]",
    },
    crystal: {
        label: "CR",
        color: "#776791",
        pip: "bg-[rgba(119,103,145,0.1)] text-[#776791] border-[rgba(119,103,145,0.25)]",
        stripe: "bg-[#776791]",
    },
    solidity: {
        label: "SOL",
        color: "#aa6746",
        pip: "bg-[rgba(170,103,70,0.1)] text-[#aa6746] border-[rgba(170,103,70,0.25)]",
        stripe: "bg-[#aa6746]",
    },
    assembly: {
        label: "ASM",
        color: "#6e4c13",
        pip: "bg-[rgba(110,76,19,0.1)] text-[#6e4c13] border-[rgba(110,76,19,0.25)]",
        stripe: "bg-[#6e4c13]",
    },

    // --- Database ---
    mysql: {
        label: "MY",
        color: "#00758f",
        pip: "bg-[rgba(0,117,143,0.1)] text-[#00758f] border-[rgba(0,117,143,0.25)]",
        stripe: "bg-[#00758f]",
    },
    postgresql: {
        label: "PG",
        color: "#336791",
        pip: "bg-[rgba(51,103,145,0.1)] text-[#336791] border-[rgba(51,103,145,0.25)]",
        stripe: "bg-[#336791]",
    },
    mongodb: {
        label: "MDB",
        color: "#47a248",
        pip: "bg-[rgba(71,162,72,0.1)] text-[#47a248] border-[rgba(71,162,72,0.25)]",
        stripe: "bg-[#47a248]",
    },
    sql: {
        label: "SQL",
        color: "#e38c00",
        pip: "bg-[rgba(227,140,0,0.1)] text-[#e38c00] border-[rgba(227,140,0,0.25)]",
        stripe: "bg-[#e38c00]",
    },

    // --- DevOps & Tools ---
    dockerfile: {
        label: "DOCK",
        color: "#2496ed",
        pip: "bg-[rgba(36,150,237,0.1)] text-[#2496ed] border-[rgba(36,150,237,0.25)]",
        stripe: "bg-[#2496ed]",
    },
    docker: {
        label: "DOCKER",
        color: "#2496ed",
        pip: "bg-[rgba(36,150,237,0.1)] text-[#2496ed] border-[rgba(36,150,237,0.25)]",
        stripe: "bg-[#2496ed]",
    },
    bash: {
        label: "SH",
        color: "#4eaa25",
        pip: "bg-[rgba(78,170,37,0.1)] text-[#4eaa25] border-[rgba(78,170,37,0.25)]",
        stripe: "bg-[#4eaa25]",
    },
    yaml: {
        label: "YAML",
        color: "#f7c244",
        pip: "bg-[rgba(247,194,68,0.1)] text-[#f7c244] border-[rgba(247,194,68,0.25)]",
        stripe: "bg-[#f7c244]",
    },
    nginx: {
        label: "NGINX",
        color: "#009900",
        pip: "bg-[rgba(0,153,0,0.1)] text-[#009900] border-[rgba(0,153,0,0.25)]",
        stripe: "bg-[#009900]",
    },
    toml: {
        label: "TOML",
        color: "#9c4221",
        pip: "bg-[rgba(156,66,33,0.1)] text-[#9c4221] border-[rgba(156,66,33,0.25)]",
        stripe: "bg-[#9c4221]",
    },
    ini: {
        label: "INI",
        color: "#6d8086",
        pip: "bg-[rgba(109,128,134,0.1)] text-[#6d8086] border-[rgba(109,128,134,0.25)]",
        stripe: "bg-[#6d8086]",
    },
    makefile: {
        label: "MAKE",
        color: "#427819",
        pip: "bg-[rgba(66,120,25,0.1)] text-[#427819] border-[rgba(66,120,25,0.25)]",
        stripe: "bg-[#427819]",
    },
    cmake: {
        label: "CMAKE",
        color: "#da3434",
        pip: "bg-[rgba(218,52,52,0.1)] text-[#da3434] border-[rgba(218,52,52,0.25)]",
        stripe: "bg-[#da3434]",
    },
    terraform: {
        label: "TF",
        color: "#844fba",
        pip: "bg-[rgba(132,79,186,0.1)] text-[#844fba] border-[rgba(132,79,186,0.25)]",
        stripe: "bg-[#844fba]",
    },

    // --- Data, Schema & Markup ---
    json: {
        label: "JSON",
        color: "#f5a623",
        pip: "bg-[rgba(245,166,35,0.1)] text-[#f5a623] border-[rgba(245,166,35,0.25)]",
        stripe: "bg-[#f5a623]",
    },
    markdown: {
        label: "MD",
        color: "#94a3b8",
        pip: "bg-[rgba(148,163,184,0.1)] text-[#94a3b8] border-[rgba(148,163,184,0.25)]",
        stripe: "bg-[#94a3b8]",
    },
    xml: {
        label: "XML",
        color: "#0060ac",
        pip: "bg-[rgba(0,96,172,0.1)] text-[#0060ac] border-[rgba(0,96,172,0.25)]",
        stripe: "bg-[#0060ac]",
    },
    graphql: {
        label: "GQL",
        color: "#e10098",
        pip: "bg-[rgba(225,0,152,0.1)] text-[#e10098] border-[rgba(225,0,152,0.25)]",
        stripe: "bg-[#e10098]",
    },
    prisma: {
        label: "PRIS",
        color: "#0c344b",
        pip: "bg-[rgba(12,52,75,0.12)] text-[#5aa3c4] border-[rgba(12,52,75,0.3)]",
        stripe: "bg-[#0c344b]",
    },
    protobuf: {
        label: "PROTO",
        color: "#7c8b9d",
        pip: "bg-[rgba(124,139,157,0.1)] text-[#7c8b9d] border-[rgba(124,139,157,0.25)]",
        stripe: "bg-[#7c8b9d]",
    },
    plaintext: {
        label: "TXT",
        color: "#9ca3af",
        pip: "bg-white/5 text-white/50 border-white/10",
        stripe: "bg-[#9ca3af]",
    },

    // --- Fallback ---
    other: {
        label: "?",
        color: "#64748b",
        pip: "bg-white/5 text-white/40 border-white/10",
        stripe: "bg-[#64748b]",
    },
}

// Default
export const defaultLang: LanguageConfig = languages.other

// Alias untuk fleksibilitas input (sangat berguna)
const alias: Record<string, string> = {
    ts: "typescript",
    js: "javascript",
    py: "python",
    sh: "bash",
    shell: "bash",
    yml: "yaml",
    md: "markdown",
    rs: "rust",
    golang: "go",
    "c#": "csharp",
    "c++": "cpp",
    cs: "csharp",
    cpp: "cpp",
    docker: "dockerfile",
    sql: "sql",
    kt: "kotlin",
    dart: "dart",
    swift: "swift",

    // Tambahan
    rb: "ruby",
    ex: "elixir",
    exs: "elixir",
    hs: "haskell",
    ps1: "powershell",
    psm1: "powershell",
    tf: "terraform",
    hcl: "terraform",
    sol: "solidity",
    cr: "crystal",
    coffee: "coffeescript",
    jl: "julia",
    fs: "fsharp",
    fsx: "fsharp",
    erl: "erlang",
    s: "assembly",
    asm: "assembly",
    mk: "makefile",
    txt: "plaintext",
    m: "objectivec",
    mm: "objectivec",
    pl: "perl",
    pm: "perl",
    gql: "graphql",
    cfg: "ini",
}

export function getLang(language: string): LanguageConfig {
    if (!language) return defaultLang

    let key = language.toLowerCase().trim()
    key = key.replace(/\s+/g, "")          // hapus semua spasi
    key = key.replace(/^\./, "")           // hapus titik di depan (contoh: .ts → ts)

    const normalized = alias[key] ?? key

    return languages[normalized] ?? defaultLang
}


export const LANGUAGE_OPTIONS = Object.keys(languages).filter(key => key !== "other")

export const TOTAL_LANGUAGES = LANGUAGE_OPTIONS.length

export const SORTED_LANGUAGE_OPTIONS = [...LANGUAGE_OPTIONS].sort((a, b) =>
    a.localeCompare(b)
)
