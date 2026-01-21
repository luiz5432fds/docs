#include "LayerRouter.h"

namespace mm8
{
void LayerRouter::updateLayers(const std::vector<PartState>& parts)
{
    cachedParts = parts;
}

bool LayerRouter::shouldHandleMessage(const juce::MidiMessage& message, const PartState& part) const
{
    if (!part.enabled)
        return false;

    if (message.isNoteOn() || message.isNoteOff())
    {
        auto note = message.getNoteNumber();
        if (note < part.keyLow || note > part.keyHigh)
            return false;
    }

    if (part.midiChannelIn <= 0)
        return true;

    return message.getChannel() == part.midiChannelIn;
}
} // namespace mm8
