# -*- mode: python -*-

block_cipher = None


a = Analysis(['src/local-link-messaging-host.py'],
             pathex=['/home/alexander/code/webextension_local_filesystem_links/native-host'],
             binaries=[],
             datas=[],
             hiddenimports=[],
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher)
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)
exe = EXE(pyz,
          a.scripts,
          exclude_binaries=True,
          name='local-link-messaging-host',
          debug=False,
          strip=False,
          upx=True,
          console=True , version='version.rc', icon='src/addon_icon_48.ico')
coll = COLLECT(exe,
               a.binaries,
               a.zipfiles,
               a.datas,
               strip=False,
               upx=True,
               name='local-link-messaging-host')
