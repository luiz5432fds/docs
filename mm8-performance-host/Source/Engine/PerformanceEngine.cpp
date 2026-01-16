#include "PerformanceEngine.h"

namespace mm8
{
PerformanceEngine::PerformanceEngine()
{
    deviceManager.initialiseWithDefaultDevices(0, 2);
}

void PerformanceEngine::setPerformance(const Performance& performanceToLoad)
{
    performance = performanceToLoad;
}

const Performance& PerformanceEngine::getPerformance() const
{
    return performance;
}

void PerformanceEngine::autoConfigureIfNeeded()
{
    auto inputs = juce::MidiInput::getAvailableDevices();
    for (const auto& input : inputs)
    {
        auto name = input.name.toLowerCase();
        if (name.contains("yamaha") || name.contains("mm"))
        {
            deviceManager.setMidiInputDeviceEnabled(input.identifier, true);
            break;
        }
    }

    juce::OwnedArray<juce::AudioIODeviceType> types;
    deviceManager.createAudioDeviceTypes(types);
    for (auto* type : types)
    {
        type->scanForDevices();
        if (type->getTypeName().containsIgnoreCase("ASIO"))
        {
            deviceManager.setCurrentAudioDeviceType(type->getTypeName(), true);
            break;
        }
    }
}

juce::String PerformanceEngine::describeAudioStatus() const
{
    if (auto* device = deviceManager.getCurrentAudioDevice())
    {
        const auto sampleRate = device->getCurrentSampleRate();
        const auto latencySamples = device->getOutputLatencyInSamples();
        const auto latencyMs = sampleRate > 0.0 ? (latencySamples / sampleRate) * 1000.0 : 0.0;
        return "Audio: " + juce::String(device->getCurrentSampleRate(), 0)
            + "Hz • Buffer " + juce::String(device->getCurrentBufferSizeSamples())
            + " • CPU " + juce::String(deviceManager.getCpuUsage() * 100.0f, 1)
            + "% • Latency " + juce::String(latencyMs, 1) + "ms";
    }

    return "Audio: Not configured";
}
} // namespace mm8
