#pragma once

#include "MM8Profile.h"

namespace mm8
{
class XPS10Profile
{
public:
    XPS10Profile();

    const juce::Array<MM8ControlMapping>& getMappings() const;

private:
    juce::Array<MM8ControlMapping> mappings;
};
} // namespace mm8
