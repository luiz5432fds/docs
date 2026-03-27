#include "EngineRegistry.h"

namespace mm8
{
void EngineRegistry::updateFromCache(const juce::Array<CachedPlugin>& entries)
{
    engines = entries;
}

const juce::Array<CachedPlugin>& EngineRegistry::getEngines() const
{
    return engines;
}
} // namespace mm8
