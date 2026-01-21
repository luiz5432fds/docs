#pragma once

#include <juce_audio_processors/juce_audio_processors.h>
#include "../core/PerformanceTypes.h"

namespace mm8
{
class EngineHost
{
public:
    EngineHost();

    void setSampleRate(double sampleRate, int bufferSize);
    void setPerformance(const Performance& performance);

    juce::AudioPluginFormatManager& getFormatManager();
    juce::OwnedArray<juce::AudioPluginInstance>& getLayerInstances();

    bool loadEngineForLayer(int layerIndex, const juce::PluginDescription& description, juce::String& error);
    void clearLayer(int layerIndex);

    const juce::CriticalSection& getProcessLock() const { return processLock; }

private:
    juce::AudioPluginFormatManager formatManager;
    juce::OwnedArray<juce::AudioPluginInstance> layerInstances;
    double currentSampleRate = 48000.0;
    int currentBufferSize = 256;
    juce::CriticalSection processLock;
};
} // namespace mm8
