# PARA human guide

Use PARA when you want action-oriented organization.

PARA sorts information by how actionable it is now, not by abstract topic taxonomy. It is especially useful for project-heavy users who want a vault that supports execution.

## Buckets

```text
1-Projects   Active outcomes with a finish line
2-Areas      Ongoing responsibilities
3-Resources  Reference material
4-Archives   Inactive material
```

## Why use it

- Simple enough for daily use.
- Easy for an agent to reason about.
- Works well with Markdown folders.
- Keeps projects separate from long-term responsibilities.

## Agent boundary

Hermes may propose PARA moves, but it should not move or archive files without confirmation. Archiving can hide context, so it must be explicit.

## Best first prompt

```text
Review these notes and propose whether each belongs in Projects, Areas, Resources, or Archives.
Do not move anything yet.
```
