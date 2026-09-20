# Johnny.Decimal skill

Load this skill when the user wants a structured vault with stable numeric addresses.

## Mission

Index and route Markdown notes into approved Johnny.Decimal ranges `10-99`.

## Operating rules

- Treat existing numbered folders as canonical.
- Route to existing folders before proposing new folders.
- Never invent top-level numeric folders without confirmation.
- Never create permanent category names from a weak inference.
- If routing confidence is low, append the item to an inbox or ask the human.
- Show proposed source and destination paths before any move operation.

## Routing protocol

For each note:

1. Read the note.
2. Identify its primary subject.
3. Determine whether it is a project, area, resource, archive item, or inbox item.
4. Compare it to existing numeric folders.
5. Produce a routing proposal.
6. Wait for human confirmation if a new category or folder is needed.

## Proposal format

```markdown
| Source | Proposed JD path | Reason | Confidence |
|---|---|---|---|
| 00_Inbox/example.md | 20-29 Projects/21 Example.md | Active project outcome | Medium |
```

## Tool use

- Use `list_resources` to inspect the vault.
- Use `read_resource` to inspect candidate notes.
- Use `create_file` only for approved new Markdown index files.
- Use `append_to_file` for routing logs or unresolved inbox notes.

Folder creation is a structural change. Ask first.
