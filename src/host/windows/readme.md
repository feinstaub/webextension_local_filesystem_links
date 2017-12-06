This folder contains information needed for the windows installer.

## Files
- InnoSetupScript.iss: Used by [Inno Setup](http://www.jrsoftware.org/) to create the installer.
- vcredist_x86.exe: Needed for Py2Exe to work (unchecked by default because it needs admin rights to install)
  Bundled in the setup.exe (can be enabled during installation)
  Question: Is it already installed at most users pcs or not?
- Windows SDK for signTool - download [here](https://developer.microsoft.com/en-us/windows/downloads/windows-10-sdk)
  (not everything needed but still around 300 MB, most important part is SDK Signing tools)

## Useful resources
- Configure py2exe destination [SO question](https://stackoverflow.com/questions/5811960/is-there-a-way-to-specify-the-build-directory-for-py2exe)

- Configure Registry addition in InnoSetup [SO question](https://stackoverflow.com/questions/13537841/how-to-write-install-path-to-registry-after-install-is-complete-with-inno-setup)

# Possible improvements to the installer
- Check if vcredist is installed (if not install it) --> probably not that easy as I'd like to start with-out admin rights
  Resource for a VC++ check can be found [here](https://stackoverflow.com/questions/11137424/how-to-make-vcredist-x86-reinstall-only-if-not-yet-installed)


## SignTool
Signing is needed to avoid security warning from Windows Defender.

[step by step guide to sign inno setup installer](https://revolution.screenstepslive.com/s/revolution/m/10695/l/563371-signing-installers-you-create-with-inno-setup)

Path to signtool at my installation C:\Program Files (x86)\Windows Kits\10\bin\10.0.16299.0\x86\signtool.exe
