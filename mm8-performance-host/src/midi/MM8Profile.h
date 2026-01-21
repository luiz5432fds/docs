#pragma once

#include <juce_core/juce_core.h>

namespace mm8
{
struct MM8ControlMapping
{
    juce::String action;
    int controllerNumber = -1;
    int value = 0;
};

class MM8Profile
{
public:
    MM8Profile();

    const juce::Array<MM8ControlMapping>& getMappings() const;

private:
    juce::Array<MM8ControlMapping> mappings;
};
} // namespace mm8
