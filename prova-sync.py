"""Prova le scritture reali su fixture, mai sugli asset pubblicati."""
import importlib.util
import pathlib
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("sync_assets", "sync-assets.py")
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)


class AtomicWrite(unittest.TestCase):
    def test_interrupted_write(self):
        with tempfile.TemporaryDirectory() as folder:
            target = pathlib.Path(folder) / "asset.js"
            target.write_text("old", encoding="utf-8")
            original = pathlib.Path.write_text

            def interrupt(path, content, **kwargs):
                original(path, content[:3], **kwargs)
                raise InterruptedError("fixture: scrittura interrotta")

            with patch.object(pathlib.Path, "write_text", interrupt):
                with self.assertRaises(InterruptedError):
                    sync.write_if_changed(target, "new complete content")
            self.assertEqual(target.read_text(), "old")
            self.assertEqual(list(pathlib.Path(folder).iterdir()), [target])
            self.assertTrue(sync.write_if_changed(target, "new complete content"))
            self.assertEqual(target.read_text(), "new complete content")
            before = target.stat()
            self.assertFalse(sync.write_if_changed(target, "new complete content"))
            after = target.stat()
            self.assertEqual((before.st_ino, before.st_mtime_ns), (after.st_ino, after.st_mtime_ns))


if __name__ == "__main__":
    unittest.main()
