#include "AudioDeviceManager.h"

namespace mm8
{
AudioDeviceManager::AudioDeviceManager() = default;

void AudioDeviceManager::initialise()
{
    deviceManager.initialiseWithDefaultDevices(0, 2);

    auto* type = deviceManager.getCurrentAudioDeviceType();
    if (type == nullptr)
        return;

    if (!preferredDeviceType.isEmpty())
        selectDeviceType(preferredDeviceType);

    if (deviceManager.getCurrentAudioDevice() == nullptr)
        deviceManager.restartLastAudioDevice();
}

void AudioDeviceManager::setPreferredDeviceType(const juce::String& deviceTypeName)
{
    preferredDeviceType = deviceTypeName;
    selectDeviceType(deviceTypeName);
}

void AudioDeviceManager::selectDeviceType(const juce::String& deviceTypeName)
{
    auto types = deviceManager.getAvailableDeviceTypes();
    for (auto* type : types)
    {
        if (type->getTypeName().containsIgnoreCase(deviceTypeName))
        {
            deviceManager.setCurrentAudioDeviceType(type->getTypeName(), true);
            return;
        }
    }
}

juce::String AudioDeviceManager::getCurrentDeviceType() const
{
    if (auto* type = deviceManager.getCurrentAudioDeviceType())
        return type->getTypeName();

    return {};
}

juce::String AudioDeviceManager::describeStatus() const
{
    if (auto* device = deviceManager.getCurrentAudioDevice())
    {
        auto sampleRate = device->getCurrentSampleRate();
        auto bufferSize = device->getCurrentBufferSizeSamples();
        auto latencyMs = device->getOutputLatencyInSamples() / sampleRate * 1000.0;
        return "Audio: " + getCurrentDeviceType() + " • "
               + juce::String(sampleRate, 0) + "Hz • Buffer "
               + juce::String(bufferSize) + " • Latency "
               + juce::String(latencyMs, 1) + "ms";
    }

    return "Audio: Not configured";
}

juce::AudioDeviceManager& AudioDeviceManager::getDeviceManager()
{
    return deviceManager;
}
} // namespace mm8
