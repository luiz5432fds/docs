#include "EngineHost.h"

namespace mm8
{
EngineHost::EngineHost()
{
    formatManager.addDefaultFormats();
    layerInstances.ensureStorageAllocated(16);
    for (int i = 0; i < 16; ++i)
        layerInstances.add(nullptr);
}

void EngineHost::setSampleRate(double sampleRate, int bufferSize)
{
    currentSampleRate = sampleRate;
    currentBufferSize = bufferSize;
}

void EngineHost::setPerformance(const Performance& performance)
{
    for (size_t index = 0; index < performance.parts.size(); ++index)
    {
        if (!performance.parts[index].enabled)
            clearLayer(static_cast<int>(index));
    }
}

juce::AudioPluginFormatManager& EngineHost::getFormatManager()
{
    return formatManager;
}

juce::OwnedArray<juce::AudioPluginInstance>& EngineHost::getLayerInstances()
{
    return layerInstances;
}

bool EngineHost::loadEngineForLayer(int layerIndex, const juce::PluginDescription& description, juce::String& error)
{
    if (layerIndex < 0 || layerIndex >= layerInstances.size())
    {
        error = "Invalid layer index";
        return false;
    }

    std::unique_ptr<juce::AudioPluginInstance> instance;
    instance.reset(formatManager.createPluginInstance(description, currentSampleRate, currentBufferSize, error));
    if (!instance)
        return false;

    instance->prepareToPlay(currentSampleRate, currentBufferSize);
    layerInstances.set(layerIndex, instance.release());
    return true;
}

void EngineHost::clearLayer(int layerIndex)
{
    if (layerIndex < 0 || layerIndex >= layerInstances.size())
        return;

    if (auto* instance = layerInstances[layerIndex])
    {
        instance->releaseResources();
        layerInstances.set(layerIndex, nullptr, true);
    }
}
} // namespace mm8
