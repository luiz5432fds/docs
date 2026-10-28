#pragma once

#include <juce_core/juce_core.h>

namespace mm8
{
class AppConfig
{
public:
    AppConfig();

    void load();
    void save() const;

    bool needsAutoConfig() const;
    void markConfigured();

    bool startWithWindows = false;
    bool loadLastSetlist = true;
    juce::String lastSetlistPath;

private:
    bool configured = false;
    juce::File configFile;
};
} // namespace mm8
