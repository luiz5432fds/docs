#include "PresetIndex.h"

namespace mm8
{
void PresetIndex::load(const juce::File& file)
{
    entries.clear();
    if (!file.existsAsFile())
        return;

    auto json = juce::JSON::parse(file);
    auto* array = json.getArray();
    if (!array)
        return;

    for (const auto& item : *array)
    {
        if (auto* object = item.getDynamicObject())
        {
            PresetEntry entry;
            entry.name = object->getProperty("name").toString();
            entry.engineId = object->getProperty("engineId").toString();
            entry.path = object->getProperty("path").toString();
            entry.category = object->getProperty("category").toString();
            entries.add(entry);
        }
    }
}

void PresetIndex::save(const juce::File& file) const
{
    juce::Array<juce::var> items;
    for (const auto& entry : entries)
    {
        juce::DynamicObject object;
        object.setProperty("name", entry.name);
        object.setProperty("engineId", entry.engineId);
        object.setProperty("path", entry.path);
        object.setProperty("category", entry.category);
        items.add(juce::var(&object));
    }

    file.getParentDirectory().createDirectory();
    file.replaceWithText(juce::JSON::toString(items, true));
}

void PresetIndex::setEntries(const juce::Array<PresetEntry>& entriesToStore)
{
    entries = entriesToStore;
}

const juce::Array<PresetEntry>& PresetIndex::getEntries() const
{
    return entries;
}
} // namespace mm8
