#include "PerformanceEngine.h"
#include "Logger.h"

namespace mm8
{
PerformanceEngine::PerformanceEngine()
{
    audioDeviceManager.initialise();
}

void PerformanceEngine::setPerformance(const Performance& performanceToLoad)
{
    performance = performanceToLoad;
    layerRouter.updateLayers(performance.parts);
    mixer.updateMixSettings(performance.parts);
    engineHost.setPerformance(performance);
}

const Performance& PerformanceEngine::getPerformance() const
{
    return performance;
}

void PerformanceEngine::autoConfigureIfNeeded(Settings& settings)
{
    if (!settings.audioDeviceType.isEmpty())
    {
        audioDeviceManager.setPreferredDeviceType(settings.audioDeviceType);
    }
    else
    {
        audioDeviceManager.setPreferredDeviceType("ASIO4ALL");
        settings.audioDeviceType = audioDeviceManager.getCurrentDeviceType();
    }

    auto inputs = juce::MidiInput::getAvailableDevices();
    for (const auto& input : inputs)
    {
        auto name = input.name.toLowerCase();
        if (name.contains("yamaha") || name.contains("mm8"))
        {
            juce::MidiInput::enableDevice(input.identifier, true);
            settings.midiInputName = input.name;
            break;
        }
    }

    settings.bufferSize = settings.bufferSize == 0 ? 256 : settings.bufferSize;
    settings.sampleRate = settings.sampleRate == 0.0 ? 48000.0 : settings.sampleRate;
    engineHost.setSampleRate(settings.sampleRate, settings.bufferSize);
    settings.markConfigured();
}

void PerformanceEngine::applySettings(const Settings& settings)
{
    audioDeviceManager.setPreferredDeviceType(settings.audioDeviceType);
    engineHost.setSampleRate(settings.sampleRate, settings.bufferSize);
}

juce::String PerformanceEngine::describeAudioStatus() const
{
    return audioDeviceManager.describeStatus();
}

AudioDeviceManager& PerformanceEngine::getAudioDeviceManager()
{
    return audioDeviceManager;
}

EngineHost& PerformanceEngine::getEngineHost()
{
    return engineHost;
}
} // namespace mm8
