"use strict";

function initializeScript()
{
    return [new host.apiVersionSupport(1, 7)];
}


function AllExportCalls(mod)
{
    var TTD = host.currentSession.TTD;
    var funcs = host.currentProcess.Modules.getValueAt(mod).Contents.Exports;
    var funcNames = funcs.Select(x => mod + "!" + x.Name);
    // funcNames is an iterable, and we need to convert to an array for .apply
    var funcNamesCopy = [...funcNames];
    return TTD.Calls.apply(TTD, funcNamesCopy);
}

function AllExternalExportCalls(mod)
{
    var calls = AllExportCalls(mod);
    var exportModule = host.currentProcess.Modules.getValueAt(mod);
    var start = exportModule.BaseAddress;
    var end = exportModule.BaseAddress.add(exportModule.Size);
    return calls.Where(x => x.ReturnAddress.compareTo(start) < 0 ||
                            x.ReturnAddress.compareTo(end) > 0);
}
