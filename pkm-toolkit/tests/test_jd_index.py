"""Tests for 00_CORE/jd_index.py."""

from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "00_CORE"))

import jd_index  # noqa: E402

CONFIG = {"areas": [
    {"range": 20, "name": "Work", "categories": [{"id": 21, "name": "Clients"}]},
    {"range": 10, "name": "Life admin", "categories": [{"id": 12, "name": "Health"}, {"id": 11, "name": "Finance"}]},
]}


class JDIndexTestCase(unittest.TestCase):
    def test_paths_are_deterministic_and_sorted(self) -> None:
        self.assertEqual(jd_index.build_index(CONFIG), [
            "10-19 Life admin", "10-19 Life admin/11 Finance", "10-19 Life admin/12 Health",
            "20-29 Work", "20-29 Work/21 Clients",
        ])

    def test_invalid_numbers_are_rejected(self) -> None:
        for bad in ({"areas": [{"range": 15, "name": "x"}]},
                    {"areas": [{"range": 100, "name": "x"}]},
                    {"areas": [{"range": 10, "name": "x", "categories": [{"id": 21, "name": "y"}]}]},
                    {"areas": [{"range": True, "name": "x"}]}):
            with self.assertRaises(jd_index.JDError):
                jd_index.build_index(bad)

    def test_duplicates_are_rejected(self) -> None:
        with self.assertRaises(jd_index.JDError):
            jd_index.build_index({"areas": [{"range": 10, "name": "a"}, {"range": 10, "name": "b"}]})
        with self.assertRaises(jd_index.JDError):
            jd_index.build_index({"areas": [{"range": 10, "name": "a", "categories": [
                {"id": 11, "name": "x"}, {"id": 11, "name": "y"}]}]})

    def test_user_labels_cannot_escape_or_vanish(self) -> None:
        self.assertEqual(jd_index.safe_label("  ../Tax / 2026:Q1 "), "Tax 2026 Q1")
        for bad in ("", " / ", "..", None):
            with self.assertRaises(jd_index.JDError):
                jd_index.safe_label(bad)

    def test_write_creates_only_missing_folders(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            vault = Path(tmp)
            (vault / "10-19 Life admin").mkdir()
            (vault / "10-19 Life admin" / "note.md").write_text("keep", encoding="utf-8")
            created = jd_index.write_index(vault, jd_index.build_index(CONFIG))
            self.assertNotIn("10-19 Life admin", created)
            self.assertEqual(len(created), 4)
            self.assertEqual((vault / "10-19 Life admin" / "note.md").read_text(encoding="utf-8"), "keep")


if __name__ == "__main__":
    unittest.main()
