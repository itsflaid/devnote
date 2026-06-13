"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faCheck } from "@fortawesome/free-solid-svg-icons"
import { useAppStore } from "@/lib/store"

const SORT_OPTIONS = [
    { value: "newest", label: "Terbaru" },
    { value: "oldest", label: "Terlama" },
    { value: "az", label: "A → Z" },
    { value: "za", label: "Z → A" },
]

const THEME_OPTIONS = [
    { value: "one-dark-pro", label: "One Dark Pro" },
    { value: "github-dark", label: "GitHub Dark" },
    { value: "dracula", label: "Dracula" },
    { value: "nord", label: "Nord" },
    { value: "catppuccin-mocha", label: "Catppuccin Mocha" },
]

const FONT_SIZE_OPTIONS = [
    { value: "12", label: "12px" },
    { value: "13", label: "13px" },
    { value: "14", label: "14px" },
]

const LANGUAGE_OPTIONS = [
    "javascript", "typescript", "python", "rust", "go",
    "java", "php", "css", "html", "sql", "bash"
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
                <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[var(--text4)]">
                    {title}
                </p>
            </div>
            <div className="bg-[var(--bg)] divide-y divide-[var(--border)]">
                {children}
            </div>
        </div>
    )
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between px-5 py-4 gap-4">
            <div>
                <p className="text-[13px] font-medium text-[var(--text)]">{label}</p>
                {description && <p className="text-[11px] text-[var(--text4)] mt-0.5">{description}</p>}
            </div>
            <div className="shrink-0">{children}</div>
        </div>
    )
}

function SegmentedControl({ options, value, onChange }: {
    options: { value: string; label: string }[]
    value: string
    onChange: (val: string) => void
}) {
    return (
        <div className="flex items-center bg-[var(--surface)] border border-[var(--border)] rounded-lg p-[3px] gap-[2px]">
            {options.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`px-3 py-[5px] rounded-md text-[12px] font-medium transition-all
                        ${value === opt.value
                            ? 'bg-[var(--em)] text-[#0a0a0a]'
                            : 'text-[var(--text3)] hover:text-[var(--text)]'
                        }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    )
}

function SelectInput({ options, value, onChange }: {
    options: { value: string; label: string }[] | string[]
    value: string
    onChange: (val: string) => void
}) {
    const normalized = options.map(o => typeof o === "string" ? { value: o, label: o } : o)
    return (
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="bg-[var(--surface)] border border-[var(--border2)] rounded-lg px-3 py-[6px] text-[12px] text-[var(--text)] outline-none focus:border-[var(--em-dim)] transition-all cursor-pointer"
        >
            {normalized.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (val: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!value)}
            className={`relative w-[40px] h-[22px] rounded-full transition-all ${value ? 'bg-[var(--em)]' : 'bg-[var(--surface3)]'}`}
        >
            <div className={`absolute top-[3px] w-[16px] h-[16px] rounded-full bg-white transition-all ${value ? 'left-[21px]' : 'left-[3px]'}`} />
        </button>
    )
}

export default function PreferencesPage() {
    const router = useRouter()
    const [saved, setSaved] = useState(false)
    const { prefs, updatePref } = useAppStore()

    const handleSave = () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div className="max-w-[640px] mx-auto px-6 py-8 flex flex-col gap-6">

            <div className="flex items-center gap-3 mb-2">
                <button
                    onClick={() => router.back()}
                    className="w-[32px] h-[32px] flex items-center justify-center rounded-lg text-[var(--text3)] hover:bg-[var(--surface2)] hover:text-[var(--text)] transition-all"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="w-[13px] h-[13px]" />
                </button>
                <div>
                    <h1 className="text-[20px] font-bold tracking-[-0.5px]">Preferences</h1>
                </div>
            </div>

            {/* Snippet Display */}
            <Section title="Note Display">
                <Row label="Default Sort" description="Urutan note saat pertama dibuka">
                    <SelectInput
                        options={SORT_OPTIONS}
                        value={prefs.sortOrder}
                        onChange={val => updatePref("sortOrder", val as "newest" | "oldest" | "az" | "za")}
                    />
                </Row>
                <Row label="Default Language" description="Bahasa yang dipilih saat buat note baru">
                    <SelectInput
                        options={LANGUAGE_OPTIONS}
                        value={prefs.defaultLanguage}
                        onChange={val => updatePref("defaultLanguage", val)}
                    />
                </Row>
                <Row label="List View" description="Tampilan kepadatan card note">
                    <SegmentedControl
                        options={[{ value: "comfortable", label: "Comfortable" }, { value: "compact", label: "Compact" }]}
                        value={prefs.listView}
                        onChange={val => updatePref("listView", val as "comfortable" | "compact")}
                    />
                </Row>
            </Section>

            <Section title="Code Block">
                <Row label="Theme" description="Warna syntax highlight">
                    <SelectInput
                        options={THEME_OPTIONS}
                        value={prefs.codeTheme}
                        onChange={val => updatePref("codeTheme", val)}
                    />
                </Row>
                <Row label="Font Size">
                    <SegmentedControl
                        options={FONT_SIZE_OPTIONS}
                        value={prefs.codeFontSize}
                        onChange={val => updatePref("codeFontSize", val as "12" | "13" | "14")}
                    />
                </Row>
                <Row label="Line Numbers" description="Tampilkan nomor baris di code block">
                    <Toggle
                        value={prefs.lineNumbers}
                        onChange={val => updatePref("lineNumbers", val)}
                    />
                </Row>
            </Section>

            <button
                onClick={handleSave}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-[14px] transition-all
                    ${saved
                        ? 'bg-[var(--em-faint)] text-[var(--em)] border border-[var(--em-border)]'
                        : 'bg-[var(--em)] text-[#0a0a0a] hover:bg-[#2bc48a] hover:shadow-[0_4px_24px_var(--em-glow)]'
                    }`}
            >
                {saved && <FontAwesomeIcon icon={faCheck} className="w-[12px] h-[12px]" />}
                {saved ? "Tersimpan!" : "Simpan Preferensi"}
            </button>

        </div>
    )
}
