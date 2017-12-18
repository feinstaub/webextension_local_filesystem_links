import sys
from distutils.core import setup
import py2exe

platform = sys.platform

options = {
        'build': {'build_base': 'dist/'},
        'py2exe': {
           'compressed':1,
           # 'bundle_files': 2,
           'dist_dir': "bin/" + platform
           # 'dll_excludes': ['w9xpopen.exe']
    }}

setup(console=['./src/local-link-messaging-host.py'], options=options)
