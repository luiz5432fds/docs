#include "AppConfig.h"

namespace mm8
{
AppConfig::AppConfig()
{
    configFile = juce::File::getSpecialLocation(juce::File::userApplicationDataDirectory)
                     .getChildFile("MM8-Performance-Workstation")
                     .getChildFile("config.json");
}

void AppConfig::load()
{
    if (!configFile.existsAsFile())
        return;

    auto json = juce::JSON::parse(configFile);
    if (auto* object = json.getDynamicObject())
    {
        configured = object->getProperty("configured");
        startWithWindows = object->getProperty("startWithWindows");
        loadLastSetlist = object->getProperty("loadLastSetlist");
        lastSetlistPath = object->getProperty("lastSetlistPath").toString();
    }
}

void AppConfig::save() const
{
    juce::DynamicObject root;
    root.setProperty("schemaVersion", 1);
    root.setProperty("configured", configured);
    root.setProperty("startWithWindows", startWithWindows);
    root.setProperty("loadLastSetlist", loadLastSetlist);
    root.setProperty("lastSetlistPath", lastSetlistPath);

    configFile.getParentDirectory().createDirectory();
    configFile.replaceWithText(juce::JSON::toString(&root));
}

bool AppConfig::needsAutoConfig() const
{
    return !configured;
}

void AppConfig::markConfigured()
{
    configured = true;
}
} // namespace mm8
