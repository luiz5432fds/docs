#include "AppConfig.h"

namespace mm8
{
AppConfig::AppConfig()
{
    configFile = juce::File::getSpecialLocation(juce::File::userApplicationDataDirectory)
                     .getChildFile("MM8-Workstation-Performance-Host")
                     .getChildFile("config.json");
}

void AppConfig::load()
{
    if (!configFile.existsAsFile())
        return;

    auto json = juce::JSON::parse(configFile);
    if (auto* object = json.getDynamicObject())
    {
        startWithWindows = static_cast<bool>(object->getProperty("startWithWindows"));
        loadLastSetlist = static_cast<bool>(object->getProperty("loadLastSetlist"));
        lastSetlistPath = object->getProperty("lastSetlistPath").toString();
        configured = static_cast<bool>(object->getProperty("configured"));
    }
}

void AppConfig::save() const
{
    juce::DynamicObject root;
    root.setProperty("startWithWindows", startWithWindows);
    root.setProperty("loadLastSetlist", loadLastSetlist);
    root.setProperty("lastSetlistPath", lastSetlistPath);
    root.setProperty("configured", configured);

    configFile.getParentDirectory().createDirectory();
    configFile.replaceWithText(juce::JSON::toString(&root, true));
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
