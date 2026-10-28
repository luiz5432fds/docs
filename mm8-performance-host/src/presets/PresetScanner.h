#pragma once

#include <juce_core/juce_core.h>
#include "PresetIndex.h"

namespace mm8
{
class PresetScanner
{
public:
    juce::Array<PresetEntry> scan();

private:
    juce::Array<juce::File> presetRoots() const;
    void scanDirectory(const juce::File& root, juce::Array<PresetEntry>& entries) const;
};
} // namespace mm8
