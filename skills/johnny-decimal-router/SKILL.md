---
name: johnny-decimal-router
description: Route Markdown notes into existing Johnny.Decimal numeric folders without inventing new ranges silently.
version: 0.1.0
metadata:
  hermes:
    tags: [johnny-decimal, pkm, markdown, routing]
    category: knowledge
  openclaw:
    always: true
---
# Johnny.Decimal Router

## When To Use

Use this skill when the vault already has or wants stable numeric addresses.

## Procedure

1. Inspect existing numbered folders before routing.
2. Treat ranges `10-99` as user-owned address space.
3. Prefer existing categories over new categories.
4. If no category fits, propose a new category and wait.
5. Never invent top-level numeric folders without confirmation.
6. Present source path, destination path, reason, and confidence.

## Proposal Format

```markdown
| Source | Proposed JD path | Reason | Confidence |
|---|---|---|---|
| 00_Inbox/example.md | 20-29 Projects/21 Example.md | Active project outcome | Medium |
```

## Pitfalls

- Do not route by filename alone.
- Do not treat tags as stronger evidence than note content.
- Do not make bulk moves without a review table.

## Verification

The human can audit each proposed route before any filesystem change happens.
