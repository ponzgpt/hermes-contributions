"""Hermes MCP server for local Markdown vaults.

The server exposes a tiny file surface to an agent:

- list_resources
- read_resource
- append_to_file
- create_file

No REST API. No database. The local Markdown vault is the source of truth.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from mcp.server.fastmcp import FastMCP


SERVER_NAME = "hermes-pkm-toolkit"
VAULT_ENV = "HERMES_VAULT_ROOT"

mcp = FastMCP(SERVER_NAME)


class VaultError(ValueError):
    """Raised when a vault operation is unsafe or invalid."""


def vault_root() -> Path:
    raw_root = os.environ.get(VAULT_ENV)
    if not raw_root:
        raise VaultError(f"{VAULT_ENV} is not set")
    root = Path(raw_root).expanduser().resolve()
    if not root.exists():
        raise VaultError(f"vault root does not exist: {root}")
    if not root.is_dir():
        raise VaultError(f"vault root is not a directory: {root}")
    return root


def resolve_md_path(relative_path: str) -> Path:
    root = vault_root()
    clean_relative = relative_path.strip().lstrip("/")
    if not clean_relative:
        raise VaultError("relative_path is required")
    target = (root / clean_relative).resolve()
    if target != root and root not in target.parents:
        raise VaultError(f"path escapes vault root: {relative_path}")
    if target.suffix.lower() != ".md":
        raise VaultError("only .md files are supported")
    return target


def as_relative(path: Path) -> str:
    return str(path.relative_to(vault_root()))


@mcp.tool()
def list_resources(
    glob_pattern: str = "**/*.md",
    include_hidden: bool = False,
    limit: int = 500,
) -> list[dict[str, Any]]:
    """List Markdown resources in the configured vault."""
    root = vault_root()
    safe_limit = max(1, min(limit, 5000))
    resources: list[dict[str, Any]] = []

    for path in sorted(root.glob(glob_pattern)):
        if len(resources) >= safe_limit:
            break
        if not path.is_file() or path.suffix.lower() != ".md":
            continue
        relative = path.relative_to(root)
        if not include_hidden and any(part.startswith(".") for part in relative.parts):
            continue
        stat = path.stat()
        resources.append(
            {
                "path": str(relative),
                "size": stat.st_size,
                "mtime_ns": stat.st_mtime_ns,
            }
        )

    return resources


@mcp.tool()
def read_resource(relative_path: str) -> dict[str, Any]:
    """Read a Markdown resource from the local vault."""
    path = resolve_md_path(relative_path)
    if not path.exists():
        raise FileNotFoundError(relative_path)
    stat = path.stat()
    return {
        "path": as_relative(path),
        "content": path.read_text(encoding="utf-8"),
        "size": stat.st_size,
        "mtime_ns": stat.st_mtime_ns,
    }


@mcp.tool()
def append_to_file(relative_path: str, content: str, create: bool = True) -> dict[str, Any]:
    """Append Markdown content to a file in the local vault."""
    path = resolve_md_path(relative_path)
    if path.exists() is False and create is False:
        raise FileNotFoundError(relative_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    prefix = "" if not path.exists() or path.stat().st_size == 0 else "\n"
    with path.open("a", encoding="utf-8") as handle:
        handle.write(prefix + content.rstrip() + "\n")
    stat = path.stat()
    return {
        "path": as_relative(path),
        "size": stat.st_size,
        "mtime_ns": stat.st_mtime_ns,
        "created": prefix == "",
    }


@mcp.tool()
def create_file(relative_path: str, content: str = "") -> dict[str, Any]:
    """Create a new Markdown file. Refuses to overwrite existing files."""
    path = resolve_md_path(relative_path)
    if path.exists():
        raise FileExistsError(relative_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.rstrip() + "\n", encoding="utf-8")
    stat = path.stat()
    return {
        "path": as_relative(path),
        "size": stat.st_size,
        "mtime_ns": stat.st_mtime_ns,
    }


if __name__ == "__main__":
    mcp.run()
