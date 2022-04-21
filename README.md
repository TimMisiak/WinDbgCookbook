# WinDbgCookbook
This is a repo for small, useful scripts and extensions.

Feel free to add your own scripts or update any of the scripts here. If you add a new script, just add a line in this readme file giving a summary of your script.

# stackCollector.js

This script adds a function that can be called from inside a breakpoint condition to capture the stack trace at the time the breakpoint was hit, and add it to a call graph. For instance, load the script and then set a breakpoint like:

```bp /w "@$scriptContents.onBreakpoint(), false" kernelbase!ReadFile```

Then run the program and later you can view the graph using a command like this:

```
0:007> dx -r3 @$scriptContents.stackRoot
@$scriptContents.stackRoot                 : undefined - 0
    KERNELBASE!ReadFile : KERNELBASE!ReadFile - 173
        ucrtbase!_read_nolock : ucrtbase!_read_nolock - 2
            ucrtbase!_read   : ucrtbase!_read - 2
        shcore!CFileStream::Read : shcore!CFileStream::Read - 156
            XmlLite!CharacterSource::Bytes::ReadMore : XmlLite!CharacterSource::Bytes::ReadMore - 70
            dbgeng!ConvertStreamToUnicode : dbgeng!ConvertStreamToUnicode - 86
        msvcrt!read_nolock : msvcrt!read_nolock - 1
            msvcrt!read      : msvcrt!read - 1
        dbghelp!IStreamFileWinAPI::Read : dbghelp!IStreamFileWinAPI::Read - 4
            dbghelp!MSF_HB::readPnOffCb : dbghelp!MSF_HB::readPnOffCb - 4
        dbgeng!ReadImageData : dbgeng!ReadImageData - 10
            dbgeng!IMAGE_HEADER_INFO::Read : dbgeng!IMAGE_HEADER_INFO::Read - 5
            dbgeng!IMAGE_HEADER_INFO::ReadLoadConfigDir : dbgeng!IMAGE_HEADER_INFO::ReadLoadConfigDir - 1
            dbgeng!IMAGE_HEADER_INFO::ReadDebugDir : dbgeng!IMAGE_HEADER_INFO::ReadDebugDir - 4
```
