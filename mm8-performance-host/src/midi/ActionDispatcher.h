#pragma once

#include <juce_core/juce_core.h>

namespace mm8
{
class ActionDispatcher
{
public:
    void dispatch(const juce::String& action);
};
} // namespace mm8
