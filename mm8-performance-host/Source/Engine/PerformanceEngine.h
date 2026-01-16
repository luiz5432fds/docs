#pragma once

#include <juce_audio_utils/juce_audio_utils.h>
#include "PerformanceTypes.h"

namespace mm8
{
class PerformanceEngine
{
public:
    PerformanceEngine();

    void setPerformance(const Performance& performanceToLoad);
    const Performance& getPerformance() const;
    void autoConfigureIfNeeded();

    juce::String describeAudioStatus() const;

private:
    Performance performance;
    juce::AudioDeviceManager deviceManager;
};
} // namespace mm8
