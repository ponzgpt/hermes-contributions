"""Johnny.Decimal index generator: validate a user's areas/categories and preview or create the folders.

Config (JSON):
    {"areas": [{"range": 10, "name": "Life admin",
                "categories": [{"id": 11, "name": "Finance"}, {"id": 12, "name": "Health"}]}]}

    python3 00_CORE/jd_index.py jd.json                 # preview the folder paths
    python3 00_CORE/jd_index.py jd.json --write VAULT   # create them (never moves or deletes anything)
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


class JDError(ValueError):
    pass


def safe_label(label: object) -> str:
    """A label becomes part of a folder name: no separators, control chars or leading dots."""
    if not isinstance(label, str):
        raise JDError(f"label must be text, got {label!r}")
    clean = re.sub(r"[\x00-\x1f/\\:*?\"<>|]", " ", label)
    clean = re.sub(r"\s+", " ", clean).strip().lstrip(".").strip()
    if not clean:
        raise JDError(f"label {label!r} is empty once made filesystem-safe")
    return clean


def build_index(config: dict) -> list[str]:
    """Return the relative folder paths, sorted, or raise JDError naming the first problem."""
    areas = config.get("areas") if isinstance(config, dict) else None
    if not isinstance(areas, list) or not areas:
        raise JDError('config needs a non-empty "areas" list')
    paths: list[str] = []
    seen_areas: set[int] = set()
    seen_ids: set[int] = set()
    for area in areas:
        start = area.get("range")
        if not isinstance(start, int) or isinstance(start, bool) or start not in range(10, 100, 10):
            raise JDError(f"area range must be one of 10, 20 … 90, got {start!r}")
        if start in seen_areas:
            raise JDError(f"area {start}-{start + 9} is defined twice")
        seen_areas.add(start)
        area_dir = f"{start}-{start + 9} {safe_label(area.get('name'))}"
        paths.append(area_dir)
        for cat in area.get("categories", []):
            cid = cat.get("id")
            if not isinstance(cid, int) or isinstance(cid, bool) or not start <= cid <= start + 9:
                raise JDError(f"category {cid!r} is outside area {start}-{start + 9}")
            if cid in seen_ids:
                raise JDError(f"category {cid} is defined twice")
            seen_ids.add(cid)
            paths.append(f"{area_dir}/{cid} {safe_label(cat.get('name'))}")
    return sorted(paths)


def write_index(vault: Path, paths: list[str]) -> list[str]:
    """Create missing folders under vault; return the ones created. Existing folders are left alone."""
    created = []
    for rel in paths:
        target = vault / rel
        if not target.exists():
            target.mkdir(parents=True)
            created.append(rel)
    return created


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("config", type=Path)
    parser.add_argument("--write", type=Path, metavar="VAULT", help="create the folders under VAULT")
    args = parser.parse_args(argv)
    try:
        paths = build_index(json.loads(args.config.read_text(encoding="utf-8")))
    except (JDError, json.JSONDecodeError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    if args.write:
        for rel in write_index(args.write, paths):
            print(f"created {rel}")
    else:
        print("\n".join(paths))
    return 0


if __name__ == "__main__":
    sys.exit(main())
