from distutils.core import setup
import py2exe

options = {'py2exe': {
           'compressed':1,
           # 'bundle_files': 2,
           'dist_dir': "dist/host/windows"
           # 'dll_excludes': ['w9xpopen.exe']
           }}

setup(console=['./src/host/local-link-messaging-host.py'], options=options)
