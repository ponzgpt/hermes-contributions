---
name: para-router
description: Route Markdown notes into PARA: Projects, Areas, Resources, and Archives with approval for structural moves.
version: 0.1.0
metadata:
  hermes:
    tags: [para, pkm, markdown, routing]
    category: knowledge
  openclaw:
    always: true
---
# PARA Router

## When To Use

Use this skill when the user wants notes organized by actionability.

## Procedure

1. Read the note before proposing a route.
2. Classify by actionability:
   - `1-Projects`: active outcome with a finish line.
   - `2-Areas`: ongoing responsibility or standard.
   - `3-Resources`: reusable reference material.
   - `4-Archives`: inactive material kept for record.
3. Prefer existing folders.
4. If a route requires a new project or archive move, present a proposal first.
5. Keep links and backlinks in mind when proposing moves.

## Proposal Format

```markdown
| Source | PARA bucket | Proposed path | Reason |
|---|---|---|---|
| 00_Inbox/example.md | 1-Projects | 1-Projects/example.md | Active outcome |
```

## Pitfalls

- Do not archive unresolved commitments.
- Do not classify an area as a project just because it has tasks.
- Do not create duplicate project folders for the same outcome.

## Verification

Every routed item has a bucket, path, and reason the human can review.
