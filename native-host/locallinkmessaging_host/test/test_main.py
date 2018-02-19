import unittest
import sys
import os
from StringIO import StringIO
import json
import struct
from locallinkmessaging import locallinkmessaging as host
from mock import Mock, patch

# TODO
# - Modify tests so they can run on different platforms. At the moment, just Windows supported
# - Add test coverage run
# - Check CI like TravisCI (maybe later)
# - add gitignore files coverage reports (vscode settings can be added)

# Missing tests from coverage
# - is_exe check for windows
#   * line 72 getLongPathName of executable to lower
#   * line 77
# - is_exe check for unix not covered
# - preparePath
#   * test unix path preparation
#   * test unix home path handling
# - getFilePath
#   * test json response {"error": "ERROR_EXECTUBALES_NOT_ENABLED"} & return None
# - read_thread_func
#   * sys.exit(1) line 169 not covered but it should be in test
#   * reveal test for existing path line 188
#   * open with-out result should return access denied - line 193
#   * else case not covered linr 196 - 202
# - Main:
#   * test sys.exit(0) line 210

# test path variables
test_path = os.path.abspath(os.path.dirname(__file__))
test_files_path = os.path.join(
    test_path,
    'test_files'
)

class LocalMessagingTestCase(unittest.TestCase):
    # @classmethod
    # def setUpClass(LocalMessagingTestCase):
    #     LocalMessagingTestCase.saved_stdout = sys.stdout
    # run before each test - the mock_popen will be available and in the right state in every test<something> function
    def setUp(self):
        self.out = StringIO()
        self.saved_stdout = sys.stdout

        # re-map stdout to out variable
        sys.stdout = self.out

        # print subprocess.Popen
        # The "where to patch" bit is important - http://www.voidspace.org.uk/python/mock/patch.html#where-to-patch
        self.popen_patcher = patch('locallinkmessaging.locallinkmessaging.Popen')
        self.mock_popen = self.popen_patcher.start()

        self.mock_rv = Mock()
        # # communicate() returns [STDOUT, STDERR]
        self.mock_rv.communicate.return_value = ['', None]
        self.mock_popen.return_value = self.mock_rv
    
    # run after each test
    def tearDown(self):
        self.popen_patcher.stop()

    def test_os(self):
        os = sys.platform
        self.assertEqual(host.currentOS, os, 'wrong OS detected')

    def test_is_executable(self):
        # print test_files_path
        test_files_positive = [
            'cmd.exe',
            'example.bat',
            'tree.com'
            # todo add a msi file & it will fail as is_exe doesn't detect it yet
        ]

        for exe in test_files_positive:
            exePath = os.path.join(test_files_path, 'executables', exe)
            self.assertTrue(host.is_exe(exePath), 'executable test failed')

    def test_prepare_path_backslash(self):
        test_str = 'file:\\\\c:\\' # two slash link
        self.assertEqual(host.preparePath(test_str), 'c:\\') 
        test_str = 'file:\\\\\\c:\\' # three slash link
        self.assertEqual(host.preparePath(test_str), 'c:\\') # difficult to test in windows because path.norm returns backslash path

    def test_check_path(self):
        # first check a path that exists
        self.assertTrue(host.checkPath(test_files_path), 'Path does not exist')
        # check path that doesn't exist
        self.assertFalse(host.checkPath('c:\\nonexisting\\'), 'Path exists')

    def test_get_file_path(self):
        # should return None if exeAllowed false
        exe = os.path.join(test_files_path, 'executables\cmd.exe')
        self.assertIsNone(host.getFilePath(exe, False), 'Not None')
        # should send error to browser with stdout
        # not sure why there are these characters *\x00\x00\x00 before the msg --> just removed them
        self.assertEqual('{"error": "ERROR_EXECTUBALES_NOT_ENABLED"}', self.out.getvalue().strip('*\x00\x00\x00'))
        # should return filePath if it is allowed
        self.assertEqual(host.getFilePath(exe, True), exe, 'No file path')

    def createMessage(self, url, reveal=False, exeAllow=False):
        obj = {
            "url": url, 
            "reveal": reveal, 
            "exeAllowed": exeAllow
        }
        self.applyMessage(obj)
        return obj

    def applyMessage(self, obj):
        stub_input = StringIO()
        msg = json.dumps(obj)
        # print msg
        encoded_length = struct.pack('>I', len(msg))
        stub_input.write(encoded_length)
        stub_input.write(msg)
        stub_input.seek(0) # rewind to the beginning of stdin
        sys.stdin = stub_input

    def test_message_open_success(self):
        # sys.stdout = self.saved_stdout
        self.createMessage("file://c:/")
        
        with self.assertRaises(SystemExit) as cm:
            # host.openFile('explorer c:\\')
            host.read_thread_func(None)

        self.assertEqual(cm.exception.code, 0)
        # self.assertTrue(self.mock_popen.called)
        self.mock_popen.assert_called_with(u"%s \"%s\"" % (host.fileExplorer['open'], "c:\\"), shell=True, stderr=-1, stdin=-1, stdout=-1)
    
    def test_message_reveal_success(self):
        self.createMessage("file://c:/", True)
        
        with self.assertRaises(SystemExit) as cm:
            # host.openFile('explorer c:\\')
            host.read_thread_func(None)

        self.assertEqual(cm.exception.code, 0)
        # self.assertTrue(self.mock_popen.called)
        expected = host.fileExplorer['reveal']['cmd'] + ' ' + host.fileExplorer['reveal']['arg'] + "\"%s\"" % "c:\\"
        self.mock_popen.assert_called_with(expected, shell=True, stderr=-1, stdin=-1, stdout=-1)

    def test_message_reveal_nonexisting(self):
        self.createMessage("file://c:/nonexisting.txt", True)
        
        with self.assertRaises(SystemExit) as cm:
            # host.openFile('explorer c:\\')
            host.read_thread_func(None)

        self.assertEqual(cm.exception.code, 0)
        expected = host.fileExplorer['open'] + " \"%s\"" % "c:\\"
        self.mock_popen.assert_called_with(expected, shell=True, stderr=-1, stdin=-1, stdout=-1)

    def test_message_badlink(self):
        test_url = 'file://notfound/'
        self.createMessage(test_url)
        
        with self.assertRaises(SystemExit):
            # host.openFile('explorer c:\\')
            host.read_thread_func(None)

        self.assertEqual(u'{"error": "ERROR_BAD_LINK", "url": "%s"}' % test_url, self.out.getvalue().strip('6\x00\x00\x00'))

    def test_message_wrong_length(self):
        stub_input = StringIO()
        sys.stdin = stub_input
        with self.assertRaises(SystemExit) as cm:
            host.read_thread_func(None)

        self.assertEqual(cm.exception.code, 1)

if __name__ == '__main__':
    unittest.main()