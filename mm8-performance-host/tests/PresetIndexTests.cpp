#include <juce_core/juce_core.h>
#include "../src/presets/PresetIndex.h"

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
                       .getChildFile("mm8-preset-index-tests");
    tempDir.createDirectory();
    auto indexFile = tempDir.getChildFile("preset_index.json");

    mm8::PresetIndex index;
    juce::Array<mm8::PresetEntry> entries;
    mm8::PresetEntry entry;
    entry.name = "OpaquePreset";
    entry.engineId = "Kontakt";
    entry.path = "D:/kontakt/opaque/preset.nki";
    entry.category = "Strings";
    entries.add(entry);
    index.setEntries(entries);
    index.save(indexFile);

    mm8::PresetIndex loaded;
    loaded.load(indexFile);
    failures += failIf(loaded.getEntries().size() != 1, "should load one preset entry");
    if (loaded.getEntries().size() == 1)
    {
        const auto& loadedEntry = loaded.getEntries().getReference(0);
        failures += failIf(loadedEntry.name != "OpaquePreset", "name mismatch");
        failures += failIf(loadedEntry.engineId != "Kontakt", "engineId mismatch");
    }

    indexFile.deleteFile();
    return failures;
}
