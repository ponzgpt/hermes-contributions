"""Delta tracker for local Markdown vaults.

Tracks sha256, mtime_ns, and size for every .md file in a vault. The state is
stored in <vault>/.hermes/delta_tracker.json.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
from typing import Any


STATE_DIR = ".hermes"
STATE_FILE = "delta_tracker.json"


def hash_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def iter_markdown_files(vault_root: Path) -> list[Path]:
    files: list[Path] = []
    for root, dirnames, filenames in os.walk(vault_root):
        dirnames[:] = [name for name in dirnames if name != STATE_DIR]
        for filename in filenames:
            if filename.lower().endswith(".md"):
                files.append(Path(root) / filename)
    return sorted(files)


def file_record(vault_root: Path, path: Path) -> dict[str, Any]:
    stat = path.stat()
    return {
        "path": str(path.relative_to(vault_root)),
        "sha256": hash_file(path),
        "mtime_ns": stat.st_mtime_ns,
        "size": stat.st_size,
    }


def state_path(vault_root: Path) -> Path:
    return vault_root / STATE_DIR / STATE_FILE


def load_state(vault_root: Path) -> dict[str, Any]:
    path = state_path(vault_root)
    if not path.exists():
        return {"files": {}}
    return json.loads(path.read_text(encoding="utf-8"))


def write_state(vault_root: Path, state: dict[str, Any]) -> None:
    path = state_path(vault_root)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(state, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def calculate_delta(vault_root: str | Path) -> dict[str, Any]:
    root = Path(vault_root).expanduser().resolve()
    previous = load_state(root).get("files", {})
    current_records = [file_record(root, path) for path in iter_markdown_files(root)]
    current = {record["path"]: record for record in current_records}

    added = []
    modified = []
    unchanged_count = 0

    for relative_path, record in current.items():
        old = previous.get(relative_path)
        if old is None:
            added.append(record)
        elif (
            old.get("sha256") != record["sha256"]
            or old.get("mtime_ns") != record["mtime_ns"]
            or old.get("size") != record["size"]
        ):
            modified.append(record)
        else:
            unchanged_count += 1

    deleted = [
        {"path": relative_path, **record}
        for relative_path, record in sorted(previous.items())
        if relative_path not in current
    ]

    new_state = {"files": current}
    write_state(root, new_state)

    return {
        "vault_root": str(root),
        "state_path": str(state_path(root)),
        "added": added,
        "modified": modified,
        "deleted": deleted,
        "unchanged_count": unchanged_count,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Track modified Markdown files in a vault.")
    parser.add_argument("vault_root", help="Path to the local Markdown vault")
    args = parser.parse_args()
    print(json.dumps(calculate_delta(args.vault_root), indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
