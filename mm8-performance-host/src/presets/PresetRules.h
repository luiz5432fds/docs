#pragma once

#include <juce_core/juce_core.h>

namespace mm8
{
class PresetRules
{
public:
    static juce::String categoryForPath(const juce::File& file);
    static bool shouldIgnoreFile(const juce::File& file);
};
} // namespace mm8
