"use client"

import SnippetExplorer from "@/components/snippet/shared/SnippetExplorer"
import SnippetDetail from "@/components/snippet/shared/SnippetDetail"
import type { Snippet } from "@/components/snippet/shared/types"
import RemoveWorkspaceSnippetButton from "@/components/workspace/RemoveWorkspaceSnippetButton"

interface WorkspaceSnippetItem {
  workspaceId: number
  snippetId: number
  snippet: Snippet
  authorName: string
}

interface WorkspaceSnippetPanelProps {
  workspaceId: number
  snippets: WorkspaceSnippetItem[]
  canEdit: boolean
}

export default function WorkspaceSnippetPanel({
  workspaceId,
  snippets,
  canEdit,
}: WorkspaceSnippetPanelProps) {
  if (snippets.length === 0) return null

  return (
    <SnippetExplorer
      title="Shared Snippets"
      items={snippets}
      getSnippet={(item) => item.snippet}
      getKey={(item) => `${item.workspaceId}-${item.snippetId}`}
      getAuthorName={(item) => item.authorName}
      listWidthClassName="w-[320px]"
      renderDetail={(selected) => (
        <>
          <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--bg)] flex items-center justify-between gap-3 shrink-0">
            <div>
              <p className="text-[10px] uppercase tracking-[1.4px] text-[var(--text4)] font-semibold">
                Workspace Snippet
              </p>

              <p className="text-[12px] text-[var(--text3)] mt-0.5">
                Bisa diedit oleh Owner dan Editor workspace.
              </p>
            </div>

            {canEdit && (
              <RemoveWorkspaceSnippetButton
                workspaceId={workspaceId}
                snippetId={selected.id}
              />
            )}
          </div>

          <div className="flex-1 min-h-0">
            <SnippetDetail
              key={selected.id}
              snippet={selected}
              onEdit={() => {
                // nanti sambungkan ke edit modal permission workspace
              }}
            />
          </div>
        </>
      )}
    />
  )
}
