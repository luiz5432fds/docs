#include "PerformanceStore.h"

namespace mm8
{
PerformanceStore::PerformanceStore()
{
    storageFile = juce::File::getSpecialLocation(juce::File::userApplicationDataDirectory)
                      .getChildFile("MM8-Workstation-Performance-Host")
                      .getChildFile("performance_bank.json");
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

        if (auto* partsArray = object->getProperty("parts").getArray())
        {
            activePerformance.parts.clear();
            for (const auto& partVar : *partsArray)
            {
                PartState part;
                if (auto* partObject = partVar.getDynamicObject())
                {
                    part.enabled = static_cast<bool>(partObject->getProperty("enabled"));
                    part.pluginRef = partObject->getProperty("pluginRef").toString();
                    part.presetRef = partObject->getProperty("presetRef").toString();
                    part.midiChannelIn = static_cast<int>(partObject->getProperty("midiChannelIn"));
                    part.midiChannelOut = static_cast<int>(partObject->getProperty("midiChannelOut"));
                    part.keyLow = static_cast<int>(partObject->getProperty("keyLow"));
                    part.keyHigh = static_cast<int>(partObject->getProperty("keyHigh"));
                    part.velocityLow = static_cast<int>(partObject->getProperty("velocityLow"));
                    part.velocityHigh = static_cast<int>(partObject->getProperty("velocityHigh"));
                    part.transpose = static_cast<int>(partObject->getProperty("transpose"));
                    part.volume = static_cast<float>(partObject->getProperty("volume"));
                    part.pan = static_cast<float>(partObject->getProperty("pan"));
                    part.name = partObject->getProperty("name").toString();
                    part.program = partObject->getProperty("program").toString();
                }
                activePerformance.parts.push_back(part);
            }
        }
    }
}

void PerformanceStore::saveToDisk() const
{
    juce::DynamicObject root;
    root.setProperty("schemaVersion", 1);
    root.setProperty("name", activePerformance.name);
    root.setProperty("tempo", activePerformance.tempo);
    root.setProperty("scene", activePerformance.scene);

    juce::Array<juce::var> parts;
    for (const auto& part : activePerformance.parts)
    {
        juce::DynamicObject partObject;
        partObject.setProperty("enabled", part.enabled);
        partObject.setProperty("pluginRef", part.pluginRef);
        partObject.setProperty("presetRef", part.presetRef);
        partObject.setProperty("midiChannelIn", part.midiChannelIn);
        partObject.setProperty("midiChannelOut", part.midiChannelOut);
        partObject.setProperty("keyLow", part.keyLow);
        partObject.setProperty("keyHigh", part.keyHigh);
        partObject.setProperty("velocityLow", part.velocityLow);
        partObject.setProperty("velocityHigh", part.velocityHigh);
        partObject.setProperty("transpose", part.transpose);
        partObject.setProperty("volume", part.volume);
        partObject.setProperty("pan", part.pan);
        partObject.setProperty("name", part.name);
        partObject.setProperty("program", part.program);
        parts.add(juce::var(&partObject));
    }
    root.setProperty("parts", parts);

    storageFile.getParentDirectory().createDirectory();
    storageFile.replaceWithText(juce::JSON::toString(&root, true));
}

const Performance& PerformanceStore::getActivePerformance() const
{
    return activePerformance;
}
} // namespace mm8
