#pragma once

#include <juce_audio_processors/juce_audio_processors.h>
#include "../core/PerformanceTypes.h"

namespace mm8
{
class LayerRouter
{
public:
    void updateLayers(const std::vector<PartState>& parts);
    bool shouldHandleMessage(const juce::MidiMessage& message, const PartState& part) const;

private:
    std::vector<PartState> cachedParts;
};
} // namespace mm8
