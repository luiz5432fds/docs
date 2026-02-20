#pragma once

#include <juce_core/juce_core.h>

namespace mm8
{
struct PresetEntry
{
    juce::String name;
    juce::String engineId;
    juce::String path;
    juce::String category;
};

class PresetIndex
{
public:
    void load(const juce::File& file);
    void save(const juce::File& file) const;

    void setEntries(const juce::Array<PresetEntry>& entriesToStore);
    const juce::Array<PresetEntry>& getEntries() const;

private:
    juce::Array<PresetEntry> entries;
};
} // namespace mm8
