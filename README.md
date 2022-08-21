# WinDbgCookbook
This is a repo for small, useful scripts, extensions, and debugger data model "dx" queries.

Feel free to add your own scripts or update any of the scripts here. If you add a new script, just add a line in this readme file giving a summary of your script.

# Modules

Find if a module called "dbgeng.dll" has any imports called "RegGetValue".

```dx @$curprocess.Modules["dbgeng.dll"].Contents.Imports.SelectMany(x => x.Functions).Where(x => x.ToDisplayString().Contains("RegGetValue"))```

# Threads

Find any threads that are currently executing for a module called "mymodule.dll" or "mymodule.exe"

```dx @$curprocess.Threads.Where(x => x.Stack.Frames.Any(f => f.ToDisplayString().Contains("mymodule!")))```

# Environment variables

Find an environment variable by name

```
dx @$getEnvVar=(var) => @$curprocess.Attributes.Environment.Variables.Where(x => x.ToLower().StartsWith(var.ToLower() + "="))
```

Example:

```
0:000> dx @$getEnvVar("tmp")
@$getEnvVar("tmp")                
    [0x0]            : TMP=C:\Users\tmisiak\AppData\Local\Temp
```

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

# watchForStackCorruption.js

This script adds a function that can watch for stack corruptions in a function on the target.

Use it by running:

```
0:000> dx @$scriptContents.watchFunctionForStackCorruption("OverflowFunc")
@$scriptContents.watchFunctionForStackCorruption("OverflowFunc")
0:000> g
Stack corruption detected!
WindowsConsoleApp!OverflowFunc+0x3b:
00007ff7`56cb117b f3aa            rep stos byte ptr [rdi]
```

# Other collections of scripts and queries

* Official WinDbg samples: https://github.com/microsoft/WinDbg-Samples
* Yarden Shafir's WinDbg Scripts: https://github.com/yardenshafir/WinDbg_Scripts
* Hugsy's WinDbg JS scripts: https://github.com/hugsy/windbg_js_scripts
* Axel Souchet's scripts: https://github.com/0vercl0k/windbg-scripts
