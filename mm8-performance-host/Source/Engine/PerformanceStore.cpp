#include "PerformanceStore.h"

namespace mm8
{
PerformanceStore::PerformanceStore()
{
    storageFile = juce::File::getSpecialLocation(juce::File::userApplicationDataDirectory)
                      .getChildFile("MM8-Performance-Workstation")
                      .getChildFile("performance.json");
}

void PerformanceStore::loadFromDisk()
{
    if (!storageFile.existsAsFile())
    {
        activePerformance.name = "INIT";
        activePerformance.tempo = "120";
        activePerformance.scene = "A";
        for (auto& part : activePerformance.parts)
            part.enabled = false;
        return;
    }

    auto json = juce::JSON::parse(storageFile);
    if (auto* object = json.getDynamicObject())
    {
        activePerformance.name = object->getProperty("name").toString();
        activePerformance.tempo = object->getProperty("tempo").toString();
        activePerformance.scene = object->getProperty("scene").toString();
    }
}

void PerformanceStore::saveToDisk() const
{
    juce::DynamicObject root;
    root.setProperty("schemaVersion", 1);
    root.setProperty("name", activePerformance.name);
    root.setProperty("tempo", activePerformance.tempo);
    root.setProperty("scene", activePerformance.scene);

    storageFile.getParentDirectory().createDirectory();
    storageFile.replaceWithText(juce::JSON::toString(&root));
}

const Performance& PerformanceStore::getActivePerformance() const
{
    return activePerformance;
}
} // namespace mm8
