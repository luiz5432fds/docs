#pragma once

#include <juce_audio_devices/juce_audio_devices.h>
#include "MM8Profile.h"
#include "ActionDispatcher.h"

namespace mm8
{
class MappingEngine
{
public:
    MappingEngine();

    void setMappings(const juce::Array<MM8ControlMapping>& mappingsToUse);
    void handleMidiMessage(const juce::MidiMessage& message);

private:
    juce::Array<MM8ControlMapping> mappings;
    ActionDispatcher dispatcher;
};
} // namespace mm8
