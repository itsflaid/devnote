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
