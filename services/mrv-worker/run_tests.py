import sys
import unittest
from pathlib import Path

if __name__ == "__main__":
    worker_root = Path(__file__).parent.resolve()
    sys.path.insert(0, str(worker_root))
    tests_dir = worker_root / "tests"

    suite = unittest.TestLoader().discover(str(tests_dir))
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
