import sys
from distutils.core import setup
import py2exe

platform = '' # win32, linux

# code form https://stackoverflow.com/questions/677577/distutils-how-to-pass-a-user-defined-parameter-to-setup-py
if '--platform' in sys.argv:
    index = sys.argv.index('--platform')
    sys.argv.pop(index)  # Removes the '--platform'
    platform = sys.argv.pop(index)  # Returns the element after the '--platform'
# The foo is now ready to use for the setup

options = {
        'build': {'build_base': 'dist/'},
        'py2exe': {
           'compressed':1,
           # 'bundle_files': 2,
           'dist_dir': "bin/" + platform
           # 'dll_excludes': ['w9xpopen.exe']
    }}

setup(console=['./src/local-link-messaging-host.py'], options=options)
