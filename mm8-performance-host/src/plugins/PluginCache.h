#pragma once

#include <juce_audio_processors/juce_audio_processors.h>

namespace mm8
{
struct CachedPlugin
{
    juce::String name;
    juce::String vendor;
    juce::String format;
    juce::String path;
    juce::String uniqueId;
    juce::int64 lastModified = 0;
    juce::int64 fileSize = 0;
};

class PluginCache
{
public:
    void load(const juce::File& cacheFile);
    void save(const juce::File& cacheFile) const;

    void setEntries(const juce::Array<CachedPlugin>& entriesToStore);
    const juce::Array<CachedPlugin>& getEntries() const;

private:
    juce::Array<CachedPlugin> entries;
};
} // namespace mm8
