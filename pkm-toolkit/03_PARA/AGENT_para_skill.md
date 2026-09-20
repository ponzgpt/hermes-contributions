# PARA skill

Load this skill when the user wants action-oriented folder routing.

## Mission

Move notes conceptually between:

```text
1-Projects
2-Areas
3-Resources
4-Archives
```

Do not physically move files unless the human approves a plan.

## Decision model

Route by actionability:

1. **Project:** active outcome with a finish line.
2. **Area:** ongoing responsibility to maintain.
3. **Resource:** useful reference material.
4. **Archive:** inactive material.

## Routing protocol

For each note or folder:

1. Read current content.
2. Identify whether it supports a current outcome.
3. Identify whether it represents an ongoing responsibility.
4. Identify whether it is reference-only.
5. Identify whether it is inactive.
6. Propose the PARA destination with reason and confidence.

## Proposal format

```markdown
| Source | PARA target | Reason | Needs confirmation |
|---|---|---|---|
| inbox/tax-notes.md | 1-Projects/Tax Return | Deadline-bound outcome | Yes |
```

## Tool use

- Use `list_resources` and `read_resource` to inspect the vault.
- Use `append_to_file` to create routing proposals or project notes.
- Use `create_file` to create approved project notes.

Archiving is always a confirmation-required action.
