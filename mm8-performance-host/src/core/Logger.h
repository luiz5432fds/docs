#pragma once

#include <juce_core/juce_core.h>

namespace mm8
{
class Logger
{
public:
    static Logger& get();

    void initialise();
    void log(const juce::String& message);
    void logError(const juce::String& message);
    const juce::File& getLogFile() const;

private:
    Logger() = default;

    juce::File logFile;
    std::unique_ptr<juce::FileLogger> fileLogger;
};
} // namespace mm8
