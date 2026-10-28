#pragma once

#include <juce_audio_devices/juce_audio_devices.h>

namespace mm8
{
class MidiDeviceManager
{
public:
    void autoDetectPrimaryController();
    juce::String getDetectedDeviceName() const;
    juce::StringArray getAvailableInputs() const;

private:
    juce::String detectedDeviceName;
};
} // namespace mm8
