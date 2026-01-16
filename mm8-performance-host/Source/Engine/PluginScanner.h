#pragma once

#include <juce_audio_processors/juce_audio_processors.h>

namespace mm8
{
class PluginScanner
{
public:
    PluginScanner();

    void setDefaultPluginFolders();
    void addCustomFolder(const juce::File& folder);
    const juce::FileSearchPath& getSearchPath() const;

private:
    juce::FileSearchPath searchPath;
};
} // namespace mm8
