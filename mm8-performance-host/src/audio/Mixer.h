#pragma once

#include <juce_audio_processors/juce_audio_processors.h>
#include "../core/PerformanceTypes.h"

namespace mm8
{
class Mixer
{
public:
    void updateMixSettings(const std::vector<PartState>& parts);
    float getLayerGain(size_t index) const;
    float getLayerPan(size_t index) const;

private:
    std::vector<float> gains;
    std::vector<float> pans;
};
} // namespace mm8
