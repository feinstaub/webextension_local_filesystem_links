import struct

IMAGE_FILE_MACHINE_I386=332
IMAGE_FILE_MACHINE_IA64=512
IMAGE_FILE_MACHINE_AMD64=34404
# source from https://stackoverflow.com/questions/1345632/determine-if-an-executable-or-library-is-32-or-64-bits-on-windows

# bat & msi not detected --> stick to previous detection method for Win32
def generateReturn(val, text):
    res = {}
    res["isBinary"] = val
    res["readable"] = text
    return res

def GetBinaryType(fileName):
    f=open(fileName, "rb")

    s=f.read(2)
    if s!="MZ":
        return generateReturn(False, "Not an EXE file")
    else:
        f.seek(60)
        s=f.read(4)
        header_offset=struct.unpack("<L", s)[0]
        f.seek(header_offset+4)
        s=f.read(2)
        machine=struct.unpack("<H", s)[0]

        if machine==IMAGE_FILE_MACHINE_I386:
            return generateReturn(True, "IA-32 (32-bit x86)") # print "IA-32 (32-bit x86)"
        elif machine==IMAGE_FILE_MACHINE_IA64:
            return generateReturn(True, "IA-64 (Itanium)") # print "IA-64 (Itanium)"
        elif machine==IMAGE_FILE_MACHINE_AMD64:
            return generateReturn(True, "AMD64 (64-bit x86)") # print "AMD64 (64-bit x86)"
        else:
            return generateReturn(True, "Unknown architecture") # print "Unknown architecture"

    f.close()
