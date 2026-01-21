#pragma once

#include <juce_core/juce_core.h>

namespace mm8
{
struct PartState
{
    bool enabled = true;
    juce::String pluginRef { "None" };
    juce::String presetRef { "Init" };
    int midiChannelIn = 1;
    int midiChannelOut = 1;
    int keyLow = 0;
    int keyHigh = 127;
    int velocityLow = 1;
    int velocityHigh = 127;
    int transpose = 0;
    juce::String velocityCurve { "Linear" };
    bool sustainEnabled = true;
    bool modEnabled = true;
    bool pitchEnabled = true;
    bool aftertouchEnabled = true;
    float volume = 0.8f;
    float pan = 0.0f;
    juce::String name { "Part" };
    juce::String program { "Init" };
};

struct Performance
{
    juce::String name { "Init Performance" };
    juce::String tempo { "120" };
    juce::String scene { "A" };
    std::vector<PartState> parts { 16 };
};
} // namespace mm8
