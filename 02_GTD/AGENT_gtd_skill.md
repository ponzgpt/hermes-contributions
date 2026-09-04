# GTD skill

Load this skill when the user wants fast capture and asynchronous task triage.

## Mission

Capture everything into `00_Inbox.md` first. Classify later using context tags and review passes.

## Capture rule

All unprocessed tasks, ideas, obligations, and open loops go to:

```text
00_Inbox.md
```

Append each item as a Markdown checkbox:

```markdown
- [ ] Task text #context
```

## Context tags

Use only obvious tags:

- `#home`
- `#computer`
- `#errand`
- `#call`
- `#email`
- `#waiting`
- `#someday`
- `#clarify`

If context is unclear, use `#clarify` or no tag.

## Async triage protocol

During a review pass:

1. Read changed files from delta tracking.
2. Read `00_Inbox.md`.
3. Classify each checkbox as:
   - next action;
   - waiting for;
   - someday/maybe;
   - project support;
   - reference;
   - needs clarification.
4. Present the triage table.
5. Do not rewrite the inbox until the human approves.

## Tool use

- Use `append_to_file` for capture.
- Use `read_resource` for triage.
- Use `create_file` only if the human approves new GTD files.

Appending to `00_Inbox.md` is safe. Rewriting or deleting inbox items is not.
