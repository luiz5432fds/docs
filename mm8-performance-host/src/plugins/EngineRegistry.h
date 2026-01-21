#pragma once

#include <juce_audio_processors/juce_audio_processors.h>
#include "PluginCache.h"

namespace mm8
{
class EngineRegistry
{
public:
    void updateFromCache(const juce::Array<CachedPlugin>& entries);
    const juce::Array<CachedPlugin>& getEngines() const;

private:
    juce::Array<CachedPlugin> engines;
};
} // namespace mm8
