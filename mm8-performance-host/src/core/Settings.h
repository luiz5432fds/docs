#pragma once

#include <juce_core/juce_core.h>

namespace mm8
{
class Settings
{
public:
    Settings();

    void load();
    void save() const;

    const juce::File& getSettingsFile() const;
    bool needsAutoConfig() const;
    void markConfigured();

    juce::String audioDeviceType;
    int bufferSize = 256;
    double sampleRate = 48000.0;
    juce::String midiInputName;
    bool configured = false;

private:
    juce::File settingsFile;
};
} // namespace mm8
