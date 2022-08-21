"use strict";

// Usage: Load this script by ".scriptload" or with the WinDbg script window.
//        Then run dx @$scriptContents.watchFunctionForStackCorruption("FuncName")
//        Continue execution and the debugger will break in when the specified function has its return
//        address overwritten.
// Note: This will script will not work if the watched function is called from more than 4 threads
//       at the same time, since it uses a hardware breakpoint on each invocation of the watched func.


function initializeScript()
{
    return [new host.apiVersionSupport(1, 7)];
}

function watchFunctionForStackCorruption(functionName)
{
    var bp = host.namespace.Debugger.Utility.Control.SetBreakpointAtOffset(functionName, 0);
    bp.Condition = "@$scriptContents.onWatchedFunctionEntry()";
}

function onWatchedFunctionEntry()
{
    var stackPtr = host.namespace.Debugger.State.PseudoRegisters.General.csp;
    var corruptionBP = host.namespace.Debugger.Utility.Control.SetBreakpointForReadWrite(stackPtr, "w", 8);
    corruptionBP.Command = ".echo Stack corruption detected!";
    var returnAddr = host.namespace.Debugger.State.PseudoRegisters.General.ra;
    // This is a bit ugly, but I don't think there's a way to set "one shot" breakpoints
    // from Debugger.Utility.Control or the Breakpoint object.
    var addrString = returnAddr.address.toString(16);
    host.namespace.Debugger.Utility.Control.ExecuteCommand("bp /1 " + addrString + '"bc ' + corruptionBP.Id + '; g"');
    return false;
}