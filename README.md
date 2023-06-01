# WinDbgCookbook
This is a repo for small, useful scripts, extensions, and debugger data model "dx" queries.

Feel free to add your own scripts or update any of the scripts here. If you add a new script, just add a line in this readme file giving a summary of your script.

# Modules

Find if a module called "dbgeng.dll" has any imports called "RegGetValue".

```dx @$curprocess.Modules["dbgeng.dll"].Contents.Imports.SelectMany(x => x.Functions).Where(x => x.ToDisplayString().Contains("RegGetValue"))```

Set a breakpoint on every export of "symsrv.dll". (The ```.Where(x => false)``` makes the command silent and makes sure everything gets evaluated instead of stopping at 100 breakpoints)

```dx @$curprocess.Modules["symsrv"].Contents.Exports.Select(x => Debugger.Utility.Control.ExecuteCommand("bp " + x.CodeAddress.ToDisplayString("x"))).Where(x => false)```

Get a table of every import from a module "dbghelp":

```dx -g @$curprocess.Modules["dbghelp"].Contents.Imports.SelectMany(m => m.Functions.Select(f => new {Mod = m, Func = f})), 1000```

Find any modules that import module "foo.dll":

```dx @$curprocess.Modules.Where(m => m.Contents.Imports.Any(x => x.ModuleName.ToLower() == "foo.dll"))```

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

# .NET Managed objects with "dx"

You can "cast" a managed object pointer to "System.Object" and dx will give you the full object information.

```
dx (System_Private_CoreLib!System.Object *)0x1234
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

# ttdUtil.js

Find all calls to exports of a specific module for a TTD trace:

```
0:000> dx -g @$scriptContents.AllExportCalls("symsrv")
===========================================================================================================================================================================================================================================================================================================================
=           = (+) EventType = (+) ThreadId = (+) UniqueThreadId = (+) TimeStart  = (+) TimeEnd    = (+) Function                               = (+) FunctionAddress = (+) ReturnAddress = (+) ReturnValue = (+) Parameters = (+) SystemTimeStart                          = (+) SystemTimeEnd                            =
===========================================================================================================================================================================================================================================================================================================================
= [0x0]     - 0x0           - 0x8610       - 0x2                - 10A0BD:77      - 10A0BF:BC      - symsrv!SymbolServerSetOptionsW             - 0x7ffa9d5627c0      - 0x7ffa340b876a    - 1               - {...}          - Thursday, September 15, 2022 23:17:59.836    - Thursday, September 15, 2022 23:17:59.836    =
= [0x1]     - 0x0           - 0x8610       - 0x2                - 10A0C0:15      - 10A0C0:A4      - symsrv!SymbolServerSetOptionsW             - 0x7ffa9d5627c0      - 0x7ffa340b87b1    - 1               - {...}          - Thursday, September 15, 2022 23:17:59.836    - Thursday, September 15, 2022 23:17:59.836    =
= [0x2]     - 0x0           - 0x8610       - 0x2                - 10A0CA:15      - 10A0CA:A3      - symsrv!SymbolServerSetOptionsW             - 0x7ffa9d5627c0      - 0x7ffa340b87b1    - 1               - {...}          - Thursday, September 15, 2022 23:17:59.836    - Thursday, September 15, 2022 23:17:59.836    =
= [0x3]     - 0x0           - 0x8610       - 0x2                - 10A0CE:15      - 10A0CE:9F      - symsrv!SymbolServerSetOptionsW             - 0x7ffa9d5627c0      - 0x7ffa340b87b1    - 1               - {...}          - Thursday, September 15, 2022 23:17:59.836    - Thursday, September 15, 2022 23:17:59.836    =
= [0x4]     - 0x0           - 0x8610       - 0x2                - 10A0D0:18      - 10A0D1:0       - symsrv!SymbolServerGetOptionData           - 0x7ffa9d562db0      - 0x7ffa340b8857    - 0               - {...}          - Thursday, September 15, 2022 23:17:59.836    - Thursday, September 15, 2022 23:17:59.836    =
```

# Javascript tips

With `dx`, you can often index into a collection dynamically via multiple keys. For instance, ```@$curprocess.Modules[0]``` works as well as ```@$curprocess.Modules["foo.dll"]``` and ```@$curprocess.Modules["foo"]```. The same thing doesn't work directly from JavaScript because it doesn't support dynamic indexing. Instead the data model projects this in as `.getValueAt`, so you can do:

```
host.currentProcess.Modules.getValueAt("foo")
```

# Other collections of scripts and queries

* Official WinDbg samples: https://github.com/microsoft/WinDbg-Samples
* Yarden Shafir's WinDbg Scripts: https://github.com/yardenshafir/WinDbg_Scripts
* Hugsy's WinDbg JS scripts: https://github.com/hugsy/windbg_js_scripts
* Axel Souchet's scripts: https://github.com/0vercl0k/windbg-scripts
