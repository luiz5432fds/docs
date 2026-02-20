#include "SnapshotManager.h"

namespace mm8
{
SnapshotManager::SnapshotManager(Persistence& persistenceRef)
    : persistence(persistenceRef)
{
}

bool SnapshotManager::saveSnapshot(const juce::String& snapshotName, juce::AudioPluginInstance& instance)
{
    juce::MemoryBlock state;
    instance.getStateInformation(state);

    auto file = persistence.getSnapshotsDirectory().getChildFile(snapshotName + ".snapshot");
    return file.replaceWithData(state.getData(), state.getSize());
}

bool SnapshotManager::loadSnapshot(const juce::String& snapshotName, juce::AudioPluginInstance& instance) const
{
    auto file = persistence.getSnapshotsDirectory().getChildFile(snapshotName + ".snapshot");
    if (!file.existsAsFile())
        return false;

    juce::MemoryBlock state;
    if (!file.loadFileAsData(state))
        return false;

    instance.setStateInformation(state.getData(), static_cast<int>(state.getSize()));
    return true;
}
} // namespace mm8
