#include "Logger.h"

namespace mm8
{
Logger& Logger::get()
{
    static Logger instance;
    return instance;
}

void Logger::initialise()
{
    if (fileLogger)
        return;

    logFile = juce::File::getSpecialLocation(juce::File::userApplicationDataDirectory)
                  .getChildFile("MM8-Workstation-Performance-Host")
                  .getChildFile("mm8-host.log");
    logFile.getParentDirectory().createDirectory();

    fileLogger = std::make_unique<juce::FileLogger>(logFile, "MM8 Workstation Performance Host Log", 1024 * 1024, 10);
    juce::Logger::setCurrentLogger(fileLogger.get());
    juce::Logger::writeToLog("Logger initialised.");
}

void Logger::log(const juce::String& message)
{
    juce::Logger::writeToLog(message);
}

void Logger::logError(const juce::String& message)
{
    juce::Logger::writeToLog("[error] " + message);
}

const juce::File& Logger::getLogFile() const
{
    return logFile;
}
} // namespace mm8
