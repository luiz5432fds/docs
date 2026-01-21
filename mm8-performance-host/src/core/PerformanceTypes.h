#pragma once

#include <juce_core/juce_core.h>
#include <vector>

namespace mm8
{
struct PartState
{
    bool enabled = false;
    juce::String pluginRef;
    juce::String presetRef;
    int midiChannelIn = 0;
    int midiChannelOut = 1;
    int keyLow = 0;
    int keyHigh = 127;
    int velocityLow = 0;
    int velocityHigh = 127;
    int transpose = 0;
    juce::String velocityCurve { "Linear" };
    bool sustainEnabled = true;
    bool modEnabled = true;
    bool pitchEnabled = true;
    bool aftertouchEnabled = true;
    float volume = 1.0f;
    float pan = 0.0f;
    juce::String name;
    juce::String program;
};

struct Performance
{
    juce::String name;
    juce::String tempo { "120" };
    juce::String scene { "A" };
    std::vector<PartState> parts { 16 };
};
} // namespace mm8
