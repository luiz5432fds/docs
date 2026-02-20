#pragma once

#include <juce_audio_processors/juce_audio_processors.h>
#include "PluginCache.h"

namespace mm8
{
class PluginScanner
{
public:
    PluginScanner();

    void loadPluginPaths(const juce::File& configFile);
    void setPluginPaths(const juce::FileSearchPath& paths);
    const juce::FileSearchPath& getSearchPath() const;

    struct ScanResult
    {
        juce::Array<CachedPlugin> entries;
        juce::StringArray failures;
    };

    juce::Array<CachedPlugin> scan(const juce::File& cacheFile, bool rescanAll);
    void scanAsync(juce::ThreadPool& pool,
                   const juce::File& cacheFile,
                   bool rescanAll,
                   std::function<void(ScanResult)> onComplete);

private:
    juce::FileSearchPath searchPath;
    juce::AudioPluginFormatManager formatManager;

    juce::FileSearchPath defaultPluginPaths() const;
    void writeDefaultPluginConfig(const juce::File& configFile) const;
    juce::Array<juce::File> collectPluginFiles() const;
    juce::Array<CachedPlugin> loadCachedEntries(const juce::File& cacheFile) const;
    CachedPlugin toCachedPlugin(const juce::PluginDescription& description, const juce::File& file) const;
};
} // namespace mm8
