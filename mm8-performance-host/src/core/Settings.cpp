#include "Settings.h"

namespace mm8
{
Settings::Settings()
{
    settingsFile = juce::File::getSpecialLocation(juce::File::userApplicationDataDirectory)
                       .getChildFile("MM8-Workstation-Performance-Host")
                       .getChildFile("settings.json");
}

void Settings::load()
{
    if (!settingsFile.existsAsFile())
        return;

    auto json = juce::JSON::parse(settingsFile);
    if (auto* object = json.getDynamicObject())
    {
        audioDeviceType = object->getProperty("audioDeviceType").toString();
        bufferSize = static_cast<int>(object->getProperty("bufferSize"));
        sampleRate = object->getProperty("sampleRate");
        midiInputName = object->getProperty("midiInputName").toString();
        configured = static_cast<bool>(object->getProperty("configured"));
    }
}

void Settings::save() const
{
    juce::DynamicObject root;
    root.setProperty("audioDeviceType", audioDeviceType);
    root.setProperty("bufferSize", bufferSize);
    root.setProperty("sampleRate", sampleRate);
    root.setProperty("midiInputName", midiInputName);
    root.setProperty("configured", configured);

    settingsFile.getParentDirectory().createDirectory();
    settingsFile.replaceWithText(juce::JSON::toString(&root, true));
}

const juce::File& Settings::getSettingsFile() const
{
    return settingsFile;
}

bool Settings::needsAutoConfig() const
{
    return !configured;
}

void Settings::markConfigured()
{
    configured = true;
}
} // namespace mm8
