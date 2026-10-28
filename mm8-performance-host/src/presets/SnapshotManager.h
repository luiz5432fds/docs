#pragma once

#include <juce_audio_processors/juce_audio_processors.h>
#include "../core/Persistence.h"

namespace mm8
{
class SnapshotManager
{
public:
    explicit SnapshotManager(Persistence& persistenceRef);

    bool saveSnapshot(const juce::String& snapshotName, juce::AudioPluginInstance& instance);
    bool loadSnapshot(const juce::String& snapshotName, juce::AudioPluginInstance& instance) const;

private:
    Persistence& persistence;
};
} // namespace mm8
