# DevMap

This repository uses DevMap to create reusable project context for developers and AI agents.

## Project Context

- Agent navigation index: `.devmap/index.json`
- Feature maps: `.devmap/features/*.json`
- Full analysis archive: `.devmap/snapshot.json`
- DevMap config: `~/.devmap/config.json`

## Commands

```bash
devmap analyze
devmap analyze --fresh
devmap analyze --json
devmap doctor
devmap doctor --json
```

## Navigation Order

1. `.devmap/index.json` — entry point, pick relevant feature
2. `.devmap/features/*.json` — focused feature map
3. `.devmap/snapshot.json` — full archive, only when above is insufficient
