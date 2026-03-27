#pragma once

#include "PerformanceTypes.h"
#include "../audio/AudioDeviceManager.h"
#include "../audio/EngineHost.h"
#include "../audio/LayerRouter.h"
#include "../audio/Mixer.h"
#include "Settings.h"

namespace mm8
{
class PerformanceEngine
{
public:
    PerformanceEngine();

    void setPerformance(const Performance& performanceToLoad);
    const Performance& getPerformance() const;

    void autoConfigureIfNeeded(Settings& settings);
    void applySettings(const Settings& settings);

    juce::String describeAudioStatus() const;
    AudioDeviceManager& getAudioDeviceManager();
    EngineHost& getEngineHost();

private:
    Performance performance;
    AudioDeviceManager audioDeviceManager;
    EngineHost engineHost;
    LayerRouter layerRouter;
    Mixer mixer;
};
} // namespace mm8
