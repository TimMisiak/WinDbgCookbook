"use strict";

function initializeScript()
{
    return [new host.apiVersionSupport(1, 7)];
}

class StackEntry
{
    constructor(name)
    {
        this.__name = name;
        this.__count = 0;
    }

    getOrCreateChild(name)
    {
        if (!(name in this))
        {
            this[name] = new StackEntry(name);
        }
        return this[name];
    }

    toString()
    {
        return this.__name + " - " + this.__count;
    }
}

var stackRoot = new StackEntry();

function onBreakpoint()
{
    var node = stackRoot;
    for (var frame of host.namespace.Debugger.State.DebuggerVariables.curstack.Frames)
    {
        var funcName = frame.toString().split("+")[0].trim();
        node = node.getOrCreateChild(funcName);
        node.__count++;
    }
}

function resetStackTraces()
{
    stackRoot = new StackEntry();
}