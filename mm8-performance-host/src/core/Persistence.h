#pragma once

#include <juce_core/juce_core.h>

namespace mm8
{
class Persistence
{
public:
    Persistence();

    juce::File getDataDirectory() const;
    juce::File getPluginCacheFile() const;
    juce::File getPresetIndexFile() const;
    juce::File getPerformanceBankFile() const;
    juce::File getSnapshotsDirectory() const;

private:
    juce::File dataDirectory;
};
} // namespace mm8
