#include "MidiDeviceManager.h"

namespace mm8
{
void MidiDeviceManager::autoDetectPrimaryController()
{
    auto inputs = juce::MidiInput::getAvailableDevices();
    for (const auto& input : inputs)
    {
        auto name = input.name.toLowerCase();
        if (name.contains("yamaha") || name.contains("mm8") || name.contains("roland") || name.contains("xps"))
        {
            juce::MidiInput::enableDevice(input.identifier, true);
            detectedDeviceName = input.name;
            return;
        }
    }
}

juce::String MidiDeviceManager::getDetectedDeviceName() const
{
    return detectedDeviceName;
}

juce::StringArray MidiDeviceManager::getAvailableInputs() const
{
    juce::StringArray names;
    for (const auto& input : juce::MidiInput::getAvailableDevices())
        names.add(input.name);
    return names;
}
} // namespace mm8
