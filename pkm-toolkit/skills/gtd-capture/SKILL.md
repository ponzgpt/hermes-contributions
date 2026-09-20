---
name: gtd-capture
description: Capture and triage loose commitments into a Markdown GTD inbox with tags and next-action review.
version: 0.1.0
metadata:
  hermes:
    tags: [gtd, tasks, inbox, markdown]
    category: productivity
  openclaw:
    always: true
---
# GTD Capture

## When To Use

Use this skill when the user is dumping tasks, obligations, ideas, or unresolved commitments.

## Procedure

1. Append every raw item to `00_Inbox.md` unless the user names a specific inbox file.
2. Format each captured item as a Markdown checkbox.
3. Add lightweight context tags when obvious: `#computer`, `#home`, `#errand`, `#waiting`, `#someday`, `#call`, `#deep-work`.
4. Do not over-classify during capture.
5. During triage, classify each item as next action, project, waiting-for, someday/maybe, calendar, or reference.
6. Ask before creating new project files.

## Output Primitive

```markdown
- [ ] Task or commitment #context
```

## Pitfalls

- Do not turn capture into planning too early.
- Do not hide commitments inside prose summaries.
- Do not mark tasks complete unless the user explicitly says they are done.

## Verification

The inbox contains every captured item exactly once and each action has enough context for later triage.
