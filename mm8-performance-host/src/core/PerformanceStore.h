#pragma once

#include <juce_core/juce_core.h>
#include "PerformanceTypes.h"

namespace mm8
{
class PerformanceStore
{
public:
    PerformanceStore();

    void loadFromDisk();
    void saveToDisk() const;

    const Performance& getActivePerformance() const;

private:
    Performance activePerformance;
    juce::File storageFile;
};
} // namespace mm8
