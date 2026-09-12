"use client";

import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { LANGUAGE_OPTIONS } from "@/lib/languages"
import { type Snippet } from "@/components/snippet/shared/types"
import { useMutation } from "@tanstack/react-query"
import { useAppStore } from "@/lib/store"
import {
    detectLanguage,
    formatFileSize,
    getFileExtension,
    isImageFile,
    IMPORT_ACCEPT,
    MAX_IMPORT_SIZE,
} from "@/lib/fileImport"

interface SnippetModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId?: number;
    snippetToEdit?: Snippet | null;
    onUpdated?: (snippet: Snippet) => void;
}

interface ImportNotice {
    type: "warning" | "error";
    message: string;
}

function getInitialForm(snippetToEdit?: Snippet | null, defaultLanguage: string = "typescript") {
    if (snippetToEdit) {
        return {
            title: snippetToEdit.title,
            language: snippetToEdit.language,
            description: snippetToEdit.description ?? "",
            code: snippetToEdit.code,
            tags: snippetToEdit.tags.join(", "),
        }
    }
    return { title: "", language: defaultLanguage, description: "", code: "", tags: "" }
}

export default function SnippetModal({
    isOpen,
    onClose,
    snippetToEdit,
    workspaceId,
    onUpdated,
}: SnippetModalProps) {
    const router = useRouter();
    const defaultLanguage = useAppStore(s => s.prefs.defaultLanguage)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const createSnippet = useMutation({
        mutationFn: (input: { title: string; language: string; description: string; code: string; tags: string[]; workspaceId?: number | null }) =>
            fetch("/api/snippets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input),
            }).then(async (res) => { if (!res.ok) throw new Error((await res.json()).error); return res.json() }),
    });
    const updateSnippet = useMutation({
        mutationFn: (input: { id: number; title: string; language: string; description: string; code: string; tags: string[]; workspaceId?: number | null }) =>
            fetch(`/api/snippets/${input.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input),
            }).then(async (res) => { if (!res.ok) throw new Error((await res.json()).error); return res.json() }),
    });

    const isEditMode = !!snippetToEdit;

    const [form, setForm] = useState(() => getInitialForm(snippetToEdit, defaultLanguage));

    // --- Import file state ---
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importedFile, setImportedFile] = useState<{ name: string; size: number } | null>(null);
    const [importNotice, setImportNotice] = useState<ImportNotice | null>(null);
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [onClose])

    if (!isOpen) return null;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const openFilePicker = () => {
        // Kalau sudah ada kode terisi (manual atau dari import sebelumnya),
        // konfirmasi dulu biar gak ketimpa tanpa sengaja.
        if (form.code.trim().length > 0) {
            const ok = window.confirm(
                "Import file baru akan menimpa kode yang sudah ada di form ini. Lanjutkan?"
            )
            if (!ok) return
        }

        fileInputRef.current?.click()
    }

    const resetImportState = () => {
        setImportedFile(null)
        setImportNotice(null)
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        // Reset value biar file yang sama bisa dipilih lagi kalau perlu re-import
        e.target.value = ""
        if (!file) return

        setImportNotice(null)
        const ext = getFileExtension(file.name)

        // 1. Tolak file gambar
        if (isImageFile(file, ext)) {
            setImportedFile(null)
            setImportNotice({
                type: "error",
                message: `File gambar (.${ext || "?"}) tidak bisa diimport ke sini. DevNote hanya menyimpan kode & teks — coba pilih file seperti .ts, .py, .php, dll.`,
            })
            return
        }

        // 2. Batasi ukuran file
        if (file.size > MAX_IMPORT_SIZE) {
            setImportedFile(null)
            setImportNotice({
                type: "error",
                message: `Ukuran file (${formatFileSize(file.size)}) melebihi batas 2MB. Silakan tempel kode secara manual.`,
            })
            return
        }

        setImporting(true)

        try {
            const text = await file.text()
            const { language, matched } = detectLanguage(file.name)

            setForm((prev) => ({
                ...prev,
                code: text,
                description: file.name,
                language: matched ? language : prev.language,
            }))

            setImportedFile({ name: file.name, size: file.size })
            setError("")

            setImportNotice(
                matched
                    ? null
                    : {
                        type: "warning",
                        message: `Ekstensi .${ext || "?"} belum dikenali otomatis oleh DevNote. Bahasa dibiarkan seperti sebelumnya — silakan pilih manual di bawah kalau perlu.`,
                    }
            )
        } catch {
            setImportedFile(null)
            setImportNotice({
                type: "error",
                message: "Gagal membaca isi file — kemungkinan ini bukan file teks/kode yang valid.",
            })
        } finally {
            setImporting(false)
        }
    }

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.description.trim() || !form.code.trim()) {
            setError("Judul, deskripsi, dan kode wajib diisi.");
            return;
        }

        setLoading(true);
        setError("");

        const tags = form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

        const input = { title: form.title, language: form.language, description: form.description, code: form.code, tags, workspaceId }

        try {
            if (isEditMode && snippetToEdit) {
                await updateSnippet.mutateAsync({ ...input, id: snippetToEdit.id })
                onUpdated?.({
                    ...snippetToEdit,
                    title: input.title,
                    language: input.language,
                    description: input.description,
                    code: input.code,
                    tags,
                    updatedAt: new Date().toISOString(),
                })
            } else {
                await createSnippet.mutateAsync(input)
            }
            router.refresh();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal menyimpan note.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
        >
            <div
                className="relative flex flex-col gap-4 rounded-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header — judul berubah sesuai mode */}
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-base" style={{ color: "var(--text)" }}>
                        {isEditMode ? "Edit Note" : "Tambah Note Baru"}
                    </h2>
                    <button onClick={onClose} style={{ color: "var(--text-muted)" }}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                {/* Import dari file — hanya di mode create */}
                {!isEditMode && (
                    <div className="flex flex-col gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={IMPORT_ACCEPT}
                            className="hidden"
                            onChange={handleFileSelect}
                        />

                        {importedFile ? (
                            <div
                                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5"
                                style={{
                                    background: "var(--em-faint)",
                                    border: "1px solid var(--em-border)",
                                }}
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--em)" strokeWidth="2" className="shrink-0">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                    <div className="min-w-0">
                                        <p className="text-[12.5px] font-medium truncate" style={{ color: "var(--em)" }}>
                                            {importedFile.name}
                                        </p>
                                        <p className="text-[10.5px]" style={{ color: "var(--text3)" }}>
                                            {formatFileSize(importedFile.size)} · terisi otomatis
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={openFilePicker}
                                    className="shrink-0 text-[11.5px] font-medium px-2.5 py-1.5 rounded-md transition-all"
                                    style={{
                                        color: "var(--em)",
                                        border: "1px solid var(--em-border)",
                                    }}
                                >
                                    Ganti file
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={openFilePicker}
                                disabled={importing}
                                className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-[13px] font-medium transition-all disabled:opacity-60"
                                style={{
                                    background: "var(--bg)",
                                    border: "1px dashed var(--border2)",
                                    color: "var(--text2)",
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                                {importing ? "Membaca file..." : "Import dari File"}
                            </button>
                        )}

                        {importNotice && (
                            <div
                                className="flex items-start gap-2 rounded-lg px-3 py-2.5 text-[12px] leading-relaxed"
                                style={
                                    importNotice.type === "error"
                                        ? { background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }
                                        : { background: "rgba(250,204,21,0.08)", border: "1px solid rgba(250,204,21,0.25)", color: "#facc15" }
                                }
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 mt-[1px]">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <div className="flex-1">
                                    {importNotice.message}
                                    {importNotice.type === "error" && (
                                        <button
                                            type="button"
                                            onClick={resetImportState}
                                            className="ml-1.5 underline underline-offset-2"
                                        >
                                            Tutup
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                            <span className="text-[10.5px] uppercase tracking-[1px]" style={{ color: "var(--text3)" }}>
                                atau isi manual
                            </span>
                            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                        </div>
                    </div>
                )}

                {/* Field: Judul */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                        Judul <span style={{ color: "var(--em)" }}>*</span>
                    </label>
                    <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Contoh: useDebounce hook"
                        className="rounded-lg px-3 py-2 text-sm outline-none"
                        style={{
                            background: "var(--bg)",
                            border: "1px solid var(--border)",
                            color: "var(--text)",
                        }}
                    />
                </div>

                {/* Field: Bahasa */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                        Bahasa
                    </label>
                    <select
                        name="language"
                        value={form.language}
                        onChange={handleChange}
                        className="rounded-lg px-3 py-2 text-sm outline-none"
                        style={{
                            background: "var(--bg)",
                            border: "1px solid var(--border)",
                            color: "var(--text)",
                        }}
                    >
                        {LANGUAGE_OPTIONS.map((lang) => (
                            <option key={lang} value={lang}>{lang}</option>
                        ))}
                    </select>
                </div>

                {/* Field: Deskripsi */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                        Deskripsi <span style={{ color: "var(--em)" }}>*</span>
                    </label>
                    <input
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Explain what this code does and when to use it..."
                        required
                        className="rounded-lg px-3 py-2 text-sm outline-none"
                        style={{
                            background: "var(--bg)",
                            border: "1px solid var(--border)",
                            color: "var(--text)",
                        }}
                    />
                </div>

                {/* Field: Kode */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                        Kode <span style={{ color: "var(--em)" }}>*</span>
                    </label>
                    <textarea
                        name="code"
                        value={form.code}
                        onChange={handleChange}
                        placeholder="Paste kode di sini..."
                        rows={8}
                        className="rounded-lg px-3 py-2 text-sm outline-none resize-none"
                        style={{
                            background: "var(--bg)",
                            border: "1px solid var(--border)",
                            color: "var(--text)",
                            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                        }}
                    />
                </div>

                {/* Field: Tags */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                        Tags <span style={{ color: "var(--text-muted)" }}>(pisah dengan koma)</span>
                    </label>
                    <input
                        name="tags"
                        value={form.tags}
                        onChange={handleChange}
                        placeholder="react, hooks, utility"
                        className="rounded-lg px-3 py-2 text-sm outline-none"
                        style={{
                            background: "var(--bg)",
                            border: "1px solid var(--border)",
                            color: "var(--text)",
                        }}
                    />
                </div>

                {/* Error */}
                {error && (
                    <p className="text-xs" style={{ color: "#f87171" }}>
                        {error}
                    </p>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-1">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm"
                        style={{
                            background: "var(--bg)",
                            border: "1px solid var(--border)",
                            color: "var(--text-muted)",
                        }}
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                        style={{
                            background: loading ? "var(--border)" : "var(--em)",
                            color: loading ? "var(--text-muted)" : "#000",
                            cursor: loading ? "not-allowed" : "pointer",
                        }}
                    >
                        {/* icon dan teks berubah sesuai mode */}
                        {loading
                            ? (isEditMode ? "Menyimpan..." : "Menyimpan...")
                            : (isEditMode ? "Simpan Perubahan" : "Simpan Note")
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
