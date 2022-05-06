"use strict";

function initializeScript()
{
    return [new host.apiVersionSupport(1, 7)];
}

function __getModByName(modName)
{
    modName = modName.toLowerCase();
    var matches = host.currentProcess.Modules.Where(function (x) { return x.Name.toLowerCase() == modName; });
    if (matches.Count() == 0)
    {
        matches = host.currentProcess.Modules.Where(function (x) { return x.Name.toLowerCase().includes(modName); });
    }
    if (matches.Count() == 0)
    {
        return undefined;
    }
    return matches.First();
}

class dependencyWalker
{
    constructor(modName)
    {
        this.__modName = modName;
    }

    

    *[Symbol.iterator]()
    {
        var rootMod = __getModByName(this.__modName);
        if (rootMod === undefined)
        {
            return;
        }
        for (var mod of rootMod.Contents.Imports)
        {
            yield new dependencyWalker(mod.ModuleName);
        }
    }

    toString()
    {
        return this.__modName;
    }
}

class reverseDependencyWalker
{
    constructor(modName)
    {
        this.__modName = modName;
    }

    getModByName(modName)
    {
        modName = modName.toLowerCase();
        var matches = host.currentProcess.Modules.Where(function (x) { return x.Name.toLowerCase() == modName; });
        if (matches.Count() == 0)
        {
            matches = host.currentProcess.Modules.Where(function (x) { return x.Name.toLowerCase().includes(modName); });
        }
        if (matches.Count() == 0)
        {
            return undefined;
        }
        return matches.First();
    }

    *[Symbol.iterator]()
    {
        var rootMod = this.getModByName(this.__modName);
        if (rootMod === undefined)
        {
            return;
        }

        var cleanModName = rootMod.Name;
        if (cleanModName.includes("\\"))
        {
            cleanModName = cleanModName.substring(cleanModName.lastIndexOf("\\") + 1);
        }
        cleanModName = cleanModName.toLowerCase();

        var matches = host.currentProcess.Modules.Where(function (x)
            {
                return x.Contents.Imports.Any(function (y)
                {
                    //host.diagnostics.debugLog(y.ModuleName.toLowerCase() + "<>" + cleanModName + "\r\n");
                    return y.ModuleName == cleanModName;
                });
            });
        for (var mod of matches)
        {
            yield new reverseDependencyWalker(mod.Name);
        }
    }

    toString()
    {
        return this.__modName;
    }
}

function dependencyTree(modName)
{
    return new dependencyWalker(modName);
}

function inverseDependencyTree(modName)
{
    return new reverseDependencyWalker(modName);
}