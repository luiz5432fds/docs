#pragma once

#include <juce_audio_devices/juce_audio_devices.h>

namespace mm8
{
class AudioDeviceManager
{
public:
    AudioDeviceManager();

    void initialise();
    void setPreferredDeviceType(const juce::String& deviceTypeName);
    juce::String getCurrentDeviceType() const;
    juce::String describeStatus() const;

    juce::AudioDeviceManager& getDeviceManager();

private:
    juce::AudioDeviceManager deviceManager;
    juce::String preferredDeviceType;

    void selectDeviceType(const juce::String& deviceTypeName);
};
} // namespace mm8
