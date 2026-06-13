"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { LANGUAGE_OPTIONS } from "@/lib/languages"
import { type Snippet } from "@/components/snippet/shared/types"

interface SnippetModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId?: number;
    snippetToEdit?: Snippet | null; // kalau ada → mode edit, kalau null → mode tambah
}

export default function SnippetModal({
    isOpen,
    onClose,
    snippetToEdit,
    workspaceId,
}: SnippetModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isEditMode = !!snippetToEdit; // true kalau mode edit

    const [form, setForm] = useState({
        title: "",
        language: "typescript",
        description: "",
        code: "",
        tags: "",
    });

    // prefill form kalau mode edit — setiap kali snippetToEdit berubah
    useEffect(() => {
        if (snippetToEdit) {
            setForm({
                title: snippetToEdit.title,
                language: snippetToEdit.language,
                description: snippetToEdit.description ?? "",
                code: snippetToEdit.code,
                tags: snippetToEdit.tags.join(", "), // array → string comma-separated
            })
        } else {
            // reset form kalau balik ke mode tambah
            setForm({ title: "", language: "typescript", description: "", code: "", tags: "" })
        }
    }, [snippetToEdit, isOpen])

    if (!isOpen) return null;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

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

        try {
            // mode edit → PUT ke /api/snippets/:id
            // mode tambah → POST ke /api/snippets
            const res = await fetch(
                isEditMode ? `/api/snippets/${snippetToEdit.id}` : "/api/snippets",
                {
                    method: isEditMode ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...form, tags, workspaceId }),
                }
            );

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || data.message || "Gagal menyimpan note.");
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
        >
            <div
                className="relative flex flex-col gap-4 rounded-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
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
