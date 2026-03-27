#include "Persistence.h"

namespace mm8
{
Persistence::Persistence()
{
    dataDirectory = juce::File::getSpecialLocation(juce::File::userApplicationDataDirectory)
                        .getChildFile("MM8-Workstation-Performance-Host");
    dataDirectory.createDirectory();
}

juce::File Persistence::getDataDirectory() const
{
    return dataDirectory;
}

juce::File Persistence::getPluginCacheFile() const
{
    return dataDirectory.getChildFile("plugin_cache.json");
}

juce::File Persistence::getPresetIndexFile() const
{
    return dataDirectory.getChildFile("preset_index.json");
}

juce::File Persistence::getPerformanceBankFile() const
{
    return dataDirectory.getChildFile("performance_bank.json");
}

juce::File Persistence::getSnapshotsDirectory() const
{
    auto dir = dataDirectory.getChildFile("snapshots");
    dir.createDirectory();
    return dir;
}
} // namespace mm8
