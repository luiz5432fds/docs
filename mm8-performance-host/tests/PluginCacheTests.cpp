#include <juce_core/juce_core.h>
#include "../src/plugins/PluginCache.h"

static int failIf(bool condition, const juce::String& message)
{
    if (!condition)
    {
        juce::Logger::writeToLog("Test failed: " + message);
        return 1;
    }
    return 0;
}

int main()
{
    int failures = 0;
    auto tempDir = juce::File::getSpecialLocation(juce::File::tempDirectory)
                       .getChildFile("mm8-cache-tests");
    tempDir.createDirectory();
    auto cacheFile = tempDir.getChildFile("plugin_cache.json");

    mm8::PluginCache cache;
    juce::Array<mm8::CachedPlugin> entries;
    mm8::CachedPlugin entry;
    entry.name = "TestPlugin";
    entry.vendor = "Vendor";
    entry.format = "VST3";
    entry.path = "C:/Plugins/TestPlugin.vst3";
    entry.uniqueId = "1234";
    entry.lastModified = 123;
    entry.fileSize = 456;
    entries.add(entry);
    cache.setEntries(entries);
    cache.save(cacheFile);

    mm8::PluginCache loaded;
    loaded.load(cacheFile);
    failures += failIf(loaded.getEntries().size() != 1, "should load one entry");
    if (loaded.getEntries().size() == 1)
    {
        const auto& loadedEntry = loaded.getEntries().getReference(0);
        failures += failIf(loadedEntry.name != "TestPlugin", "name mismatch");
        failures += failIf(loadedEntry.fileSize != 456, "fileSize mismatch");
    }

    cacheFile.deleteFile();
    return failures;
}
