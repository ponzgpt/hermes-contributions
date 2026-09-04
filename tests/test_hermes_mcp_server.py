"""Filesystem-safety tests for 00_CORE/hermes_mcp_server.py (issue #6)."""

from __future__ import annotations

import importlib
import os
import sys
import tempfile
import unittest
from pathlib import Path

CORE_DIR = Path(__file__).resolve().parent.parent / "00_CORE"
sys.path.insert(0, str(CORE_DIR))


class HermesMcpServerTestCase(unittest.TestCase):
    def setUp(self) -> None:
        self._tmpdir = tempfile.TemporaryDirectory()
        self.vault_root = Path(self._tmpdir.name).resolve()
        self._old_env = os.environ.get("HERMES_VAULT_ROOT")
        os.environ["HERMES_VAULT_ROOT"] = str(self.vault_root)

        sys.modules.pop("hermes_mcp_server", None)
        self.server = importlib.import_module("hermes_mcp_server")

    def tearDown(self) -> None:
        if self._old_env is None:
            os.environ.pop("HERMES_VAULT_ROOT", None)
        else:
            os.environ["HERMES_VAULT_ROOT"] = self._old_env
        self._tmpdir.cleanup()

    # -- vault_root --------------------------------------------------

    def test_vault_root_missing_env_raises(self) -> None:
        os.environ.pop("HERMES_VAULT_ROOT", None)
        with self.assertRaises(self.server.VaultError):
            self.server.vault_root()

    def test_vault_root_nonexistent_path_raises(self) -> None:
        os.environ["HERMES_VAULT_ROOT"] = str(self.vault_root / "does-not-exist")
        with self.assertRaises(self.server.VaultError):
            self.server.vault_root()

    def test_vault_root_file_not_directory_raises(self) -> None:
        a_file = self.vault_root / "not-a-dir.md"
        a_file.write_text("x", encoding="utf-8")
        os.environ["HERMES_VAULT_ROOT"] = str(a_file)
        with self.assertRaises(self.server.VaultError):
            self.server.vault_root()

    # -- resolve_md_path: path traversal ------------------------------

    def test_rejects_parent_traversal(self) -> None:
        with self.assertRaises(self.server.VaultError):
            self.server.resolve_md_path("../outside.md")

    def test_rejects_deep_parent_traversal(self) -> None:
        with self.assertRaises(self.server.VaultError):
            self.server.resolve_md_path("../../../../etc/passwd.md")

    def test_absolute_path_is_neutralized_to_vault_relative(self) -> None:
        # resolve_md_path() lstrip()s leading slashes, so an absolute-looking
        # input is treated as vault-relative rather than escaping the vault.
        path = self.server.resolve_md_path("/etc/passwd.md")
        self.assertEqual(path, self.vault_root / "etc" / "passwd.md")
        self.assertTrue(self.vault_root in path.parents or path == self.vault_root)

    def test_rejects_traversal_hidden_inside_subpath(self) -> None:
        with self.assertRaises(self.server.VaultError):
            self.server.resolve_md_path("notes/../../outside.md")

    def test_rejects_non_markdown_suffix(self) -> None:
        with self.assertRaises(self.server.VaultError):
            self.server.resolve_md_path("notes/secret.txt")

    def test_rejects_empty_relative_path(self) -> None:
        with self.assertRaises(self.server.VaultError):
            self.server.resolve_md_path("   ")

    def test_allows_legitimate_nested_path(self) -> None:
        path = self.server.resolve_md_path("projects/2026/plan.md")
        self.assertEqual(path, self.vault_root / "projects" / "2026" / "plan.md")

    def test_allows_path_with_leading_slash_stripped(self) -> None:
        path = self.server.resolve_md_path("/notes/today.md")
        self.assertEqual(path, self.vault_root / "notes" / "today.md")

    def test_allows_vault_root_itself_only_if_md(self) -> None:
        # root/"root.md" is a legitimate direct child, not the root itself.
        path = self.server.resolve_md_path("root.md")
        self.assertEqual(path, self.vault_root / "root.md")

    # -- list_resources ------------------------------------------------

    def test_list_resources_hides_hidden_by_default(self) -> None:
        (self.vault_root / ".hermes").mkdir()
        (self.vault_root / ".hermes" / "state.md").write_text("x", encoding="utf-8")
        (self.vault_root / "visible.md").write_text("x", encoding="utf-8")

        results = self.server.list_resources()
        paths = {r["path"] for r in results}
        self.assertIn("visible.md", paths)
        self.assertNotIn(".hermes/state.md", paths)

    def test_list_resources_respects_limit(self) -> None:
        for i in range(5):
            (self.vault_root / f"note{i}.md").write_text("x", encoding="utf-8")
        results = self.server.list_resources(limit=2)
        self.assertEqual(len(results), 2)

    # -- read_resource ---------------------------------------------------

    def test_read_resource_missing_file_raises(self) -> None:
        with self.assertRaises(FileNotFoundError):
            self.server.read_resource("missing.md")

    def test_read_resource_returns_content(self) -> None:
        (self.vault_root / "hello.md").write_text("hi there", encoding="utf-8")
        result = self.server.read_resource("hello.md")
        self.assertEqual(result["content"], "hi there")
        self.assertEqual(result["path"], "hello.md")

    def test_read_resource_blocks_traversal(self) -> None:
        with self.assertRaises(self.server.VaultError):
            self.server.read_resource("../secret.md")

    # -- append_to_file ---------------------------------------------------

    def test_append_creates_file_when_missing(self) -> None:
        result = self.server.append_to_file("new.md", "first line")
        self.assertTrue(result["created"])
        self.assertEqual((self.vault_root / "new.md").read_text(encoding="utf-8"), "first line\n")

    def test_append_refuses_create_false_on_missing_file(self) -> None:
        with self.assertRaises(FileNotFoundError):
            self.server.append_to_file("missing.md", "text", create=False)

    def test_append_adds_newline_separator_to_existing_content(self) -> None:
        (self.vault_root / "log.md").write_text("line one", encoding="utf-8")
        self.server.append_to_file("log.md", "line two")
        content = (self.vault_root / "log.md").read_text(encoding="utf-8")
        self.assertEqual(content, "line one\nline two\n")

    def test_append_creates_missing_parent_directories(self) -> None:
        self.server.append_to_file("deep/nested/dir/note.md", "content")
        self.assertTrue((self.vault_root / "deep" / "nested" / "dir" / "note.md").exists())

    def test_append_blocks_traversal(self) -> None:
        with self.assertRaises(self.server.VaultError):
            self.server.append_to_file("../outside.md", "content")

    def test_append_blocks_non_markdown(self) -> None:
        with self.assertRaises(self.server.VaultError):
            self.server.append_to_file("notes.txt", "content")

    # -- create_file ---------------------------------------------------

    def test_create_file_writes_content(self) -> None:
        self.server.create_file("fresh.md", "hello")
        self.assertEqual((self.vault_root / "fresh.md").read_text(encoding="utf-8"), "hello\n")

    def test_create_file_refuses_overwrite(self) -> None:
        (self.vault_root / "exists.md").write_text("original", encoding="utf-8")
        with self.assertRaises(FileExistsError):
            self.server.create_file("exists.md", "clobber")
        self.assertEqual((self.vault_root / "exists.md").read_text(encoding="utf-8"), "original")

    def test_create_file_blocks_traversal(self) -> None:
        with self.assertRaises(self.server.VaultError):
            self.server.create_file("../escape.md", "content")

    def test_create_file_creates_missing_parent_directories(self) -> None:
        self.server.create_file("a/b/c.md", "content")
        self.assertTrue((self.vault_root / "a" / "b" / "c.md").exists())


if __name__ == "__main__":
    unittest.main()
