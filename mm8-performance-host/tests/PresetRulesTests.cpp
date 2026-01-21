#include <juce_core/juce_core.h>
#include "../src/presets/PresetRules.h"

static int failIf(bool condition, const juce::String& message)
{
    if (!condition)
    {
        juce::Logger::writeToLog("Test failed: " + message);
        return 1;
    }
    return 0;
}

int main()
{
    int failures = 0;
    failures += failIf(mm8::PresetRules::shouldIgnoreFile(juce::File("C:/tmp/.DS_Store")), "should ignore .DS_Store");
    failures += failIf(mm8::PresetRules::shouldIgnoreFile(juce::File("C:/tmp/desktop.ini")), "should ignore desktop.ini");
    failures += failIf(mm8::PresetRules::shouldIgnoreFile(juce::File("C:/tmp/._preset.nki")), "should ignore resource fork");
    failures += failIf(!mm8::PresetRules::shouldIgnoreFile(juce::File("C:/tmp/preset.nki")), "should not ignore normal preset");

    failures += failIf(mm8::PresetRules::categoryForPath(juce::File("C:/Sounds/Piano/preset.nki")) != "Piano", "category piano");
    failures += failIf(mm8::PresetRules::categoryForPath(juce::File("C:/Sounds/Strings/preset.nki")) != "Strings", "category strings");
    failures += failIf(mm8::PresetRules::categoryForPath(juce::File("C:/Sounds/Bass/preset.nki")) != "Bass", "category bass");
    failures += failIf(mm8::PresetRules::categoryForPath(juce::File("C:/Sounds/Drums/preset.nki")) != "Drums", "category drums");

    return failures;
}
