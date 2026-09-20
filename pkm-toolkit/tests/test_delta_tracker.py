"""Tests for 00_CORE/delta_tracker.py."""

from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path

CORE_DIR = Path(__file__).resolve().parent.parent / "00_CORE"
sys.path.insert(0, str(CORE_DIR))

import delta_tracker  # noqa: E402


class DeltaTrackerTestCase(unittest.TestCase):
    def setUp(self) -> None:
        self._tmpdir = tempfile.TemporaryDirectory()
        self.vault_root = Path(self._tmpdir.name).resolve()

    def tearDown(self) -> None:
        self._tmpdir.cleanup()

    def test_all_files_reported_as_added_on_first_run(self) -> None:
        (self.vault_root / "a.md").write_text("hello", encoding="utf-8")
        (self.vault_root / "b.md").write_text("world", encoding="utf-8")

        result = delta_tracker.calculate_delta(self.vault_root)

        self.assertEqual(len(result["added"]), 2)
        self.assertEqual(result["modified"], [])
        self.assertEqual(result["deleted"], [])
        self.assertEqual(result["unchanged_count"], 0)

    def test_second_run_with_no_changes_reports_unchanged(self) -> None:
        (self.vault_root / "a.md").write_text("hello", encoding="utf-8")
        delta_tracker.calculate_delta(self.vault_root)

        result = delta_tracker.calculate_delta(self.vault_root)

        self.assertEqual(result["added"], [])
        self.assertEqual(result["modified"], [])
        self.assertEqual(result["unchanged_count"], 1)

    def test_modified_file_detected_by_content_change(self) -> None:
        target = self.vault_root / "a.md"
        target.write_text("hello", encoding="utf-8")
        delta_tracker.calculate_delta(self.vault_root)

        target.write_text("hello, edited", encoding="utf-8")
        result = delta_tracker.calculate_delta(self.vault_root)

        self.assertEqual(len(result["modified"]), 1)
        self.assertEqual(result["modified"][0]["path"], "a.md")

    def test_deleted_file_detected(self) -> None:
        target = self.vault_root / "a.md"
        target.write_text("hello", encoding="utf-8")
        delta_tracker.calculate_delta(self.vault_root)

        target.unlink()
        result = delta_tracker.calculate_delta(self.vault_root)

        self.assertEqual(len(result["deleted"]), 1)
        self.assertEqual(result["deleted"][0]["path"], "a.md")

    def test_non_markdown_files_are_ignored(self) -> None:
        (self.vault_root / "a.md").write_text("hello", encoding="utf-8")
        (self.vault_root / "notes.txt").write_text("ignore me", encoding="utf-8")

        result = delta_tracker.calculate_delta(self.vault_root)

        paths = {r["path"] for r in result["added"]}
        self.assertEqual(paths, {"a.md"})

    def test_state_dir_is_excluded_from_scan(self) -> None:
        (self.vault_root / "a.md").write_text("hello", encoding="utf-8")
        delta_tracker.calculate_delta(self.vault_root)

        # A second run must not treat its own state file as vault content.
        result = delta_tracker.calculate_delta(self.vault_root)
        paths = {r["path"] for r in result.get("added", [])}
        self.assertNotIn(".hermes/delta_tracker.json", paths)

    def test_state_file_is_written_and_valid_json(self) -> None:
        (self.vault_root / "a.md").write_text("hello", encoding="utf-8")
        result = delta_tracker.calculate_delta(self.vault_root)

        state_path = Path(result["state_path"])
        self.assertTrue(state_path.exists())
        loaded = delta_tracker.load_state(self.vault_root)
        self.assertIn("a.md", loaded["files"])


if __name__ == "__main__":
    unittest.main()
