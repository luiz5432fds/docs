#include "PluginCache.h"

namespace mm8
{
void PluginCache::load(const juce::File& cacheFile)
{
    entries.clear();

    if (!cacheFile.existsAsFile())
        return;

    auto json = juce::JSON::parse(cacheFile);
    auto* array = json.getArray();
    if (!array)
        return;

    for (const auto& item : *array)
    {
        if (auto* object = item.getDynamicObject())
        {
            CachedPlugin entry;
            entry.name = object->getProperty("name").toString();
            entry.vendor = object->getProperty("vendor").toString();
            entry.format = object->getProperty("format").toString();
            entry.path = object->getProperty("path").toString();
            entry.uniqueId = object->getProperty("uniqueId").toString();
            entry.lastModified = static_cast<juce::int64>(object->getProperty("lastModified"));
            entry.fileSize = static_cast<juce::int64>(object->getProperty("fileSize"));
            entries.add(entry);
        }
    }
}

void PluginCache::save(const juce::File& cacheFile) const
{
    juce::Array<juce::var> items;
    for (const auto& entry : entries)
    {
        juce::DynamicObject object;
        object.setProperty("name", entry.name);
        object.setProperty("vendor", entry.vendor);
        object.setProperty("format", entry.format);
        object.setProperty("path", entry.path);
        object.setProperty("uniqueId", entry.uniqueId);
        object.setProperty("lastModified", entry.lastModified);
        object.setProperty("fileSize", entry.fileSize);
        items.add(juce::var(&object));
    }

    cacheFile.getParentDirectory().createDirectory();
    cacheFile.replaceWithText(juce::JSON::toString(items, true));
}

void PluginCache::setEntries(const juce::Array<CachedPlugin>& entriesToStore)
{
    entries = entriesToStore;
}

const juce::Array<CachedPlugin>& PluginCache::getEntries() const
{
    return entries;
}
} // namespace mm8
