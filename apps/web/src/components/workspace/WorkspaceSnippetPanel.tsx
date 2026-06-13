"use client"

import { useState } from "react"
import SnippetExplorer from "@/components/snippet/shared/SnippetExplorer"
import SnippetDetail from "@/components/snippet/shared/SnippetDetail"
import type { Snippet } from "@/components/snippet/shared/types"
import SnippetModal from "@/components/snippet/SnippetModal"
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
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null)

  if (snippets.length === 0) return null

  return (
    <>
      <SnippetExplorer
        title="Shared Notes"
        items={snippets}
        getSnippet={(item) => item.snippet}
        getKey={(item) => `${item.workspaceId}-${item.snippetId}`}
        getAuthorName={(item) => item.authorName}
        listWidthClassName="w-[320px]"
        renderDetail={(selected) => (
          <SnippetDetail
            key={selected.id}
            snippet={selected}
            canEdit={canEdit}
            canDelete={false}
            canManageCollections={false}
            showPersonalControls={false}
            onEdit={() => setEditingSnippet(selected)}
            renderAdditionalActions={
              canEdit
                ? (variant) => (
                    <RemoveWorkspaceSnippetButton
                      workspaceId={workspaceId}
                      snippetId={selected.id}
                      variant={variant}
                    />
                  )
                : undefined
            }
          />
        )}
      />

      <SnippetModal
        isOpen={!!editingSnippet}
        onClose={() => setEditingSnippet(null)}
        snippetToEdit={editingSnippet}
        workspaceId={workspaceId}
      />
    </>
  )
}
