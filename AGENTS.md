# Agent Workflow

When working in this repository:

- Create a branch before making changes unless the user explicitly asks to work on the current branch.
- Keep changes scoped to the user request.
- Do not revert unrelated user changes.
- Prefer opening a pull request instead of pushing directly to `main`, unless the user explicitly asks to push to `main`.

## Commits

- Keep the user's Git identity as the primary author whenever possible.
- For AI-assisted work, add the following trailer to every commit message:

  ```text
  Co-authored-by: devnote-agent <270543300+devnote-agent@users.noreply.github.com>
  ```

- Example:

  ```text
  feat: add snippet sharing

  Co-authored-by: devnote-agent <270543300+devnote-agent@users.noreply.github.com>
  ```

- Only use the `devnote-agent` identity as the primary commit author when the user explicitly requests agent-authored commits.
- Do not modify global Git configuration.
- Keep commit messages short, specific, and focused on the user-visible fix or feature.

<!-- DevMap Instruction Block -->
## DevMap Context

Before working in this repository, read `DEVMAP.md` for project metadata and available commands.

### Navigation

1. Read `.devmap/index.json`.
2. Pick the relevant feature by name or keywords.
3. Open the matching `.devmap/features/*.json` map.
4. Inspect only files listed in `sourcePriority` first.
5. Fall back to `.devmap/snapshot.json` only when index and feature maps are insufficient.

Do not scan the whole repository. Open source files only when:
- the snapshot is missing or stale
- the snapshot lacks enough detail for the task
- the task requires edit, debug, or refactor
- the user explicitly asks for code changes

When source inspection is needed, inspect the smallest relevant set first.

### Maintenance

- If `.devmap/index.json` is missing, run `devmap analyze`.
- If the snapshot may be stale, run `devmap analyze --fresh`.
- Use `--json` when calling DevMap programmatically.
- Do not edit files inside `.devmap/`.
- Never commit API keys or provider credentials.
<!-- End DevMap Instruction Block -->
