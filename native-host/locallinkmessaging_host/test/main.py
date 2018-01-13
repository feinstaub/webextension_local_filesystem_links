import unittest
import sys
from locallinkmessaging_host.src import local_link_messaging_host as host

#self.assertTrue / assertFalse
#self.assertEqual

class TestStringMethods(unittest.TestCase):
    def test_os(self):
        os = sys.platform
        self.assertEqual(host.currentOS, os)

if __name__ == '__main__':
    unittest.main()