#include "MappingEngine.h"

namespace mm8
{
MappingEngine::MappingEngine() = default;

void MappingEngine::setMappings(const juce::Array<MM8ControlMapping>& mappingsToUse)
{
    mappings = mappingsToUse;
}

void MappingEngine::handleMidiMessage(const juce::MidiMessage& message)
{
    if (!message.isController())
        return;

    for (const auto& mapping : mappings)
    {
        if (mapping.controllerNumber == message.getControllerNumber())
        {
            dispatcher.dispatch(mapping.action);
            break;
        }
    }
}
} // namespace mm8
