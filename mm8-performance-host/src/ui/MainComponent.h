#pragma once

#include <juce_gui_extra/juce_gui_extra.h>
#include "LookAndFeel.h"
#include "PartsGrid.h"
#include "../core/AppState.h"
#include "../core/FactoryBank.h"
#include "../midi/MidiDeviceManager.h"
#include "../midi/MappingEngine.h"
#include "../midi/MM8Profile.h"
#include "../midi/XPS10Profile.h"
#include "../plugins/PluginScanner.h"
#include "../plugins/EngineRegistry.h"
#include "../presets/PresetScanner.h"
#include "../presets/PresetIndex.h"

class MainComponent final : public juce::Component
{
public:
    MainComponent();
    ~MainComponent() override;

    void paint(juce::Graphics& g) override;
    void resized() override;

private:
    void refreshStatusText();
    void refreshFactoryBrowser();
    void runAutoConfiguration();
    void configureControllerMappings(const juce::String& deviceName);

    mm8::LookAndFeel lookAndFeel;
    mm8::PartsGrid partsGrid;

    juce::Label performanceName;
    juce::Label sceneLabel;
    juce::Label bpmLabel;
    juce::Label statusLabel;

    juce::ComboBox bankSelector;
    juce::ListBox programList;
    juce::TextEditor searchBox;

    juce::TextButton performanceButton { "Performance" };
    juce::TextButton bankButton { "Banks" };
    juce::TextButton enginesButton { "Engines" };
    juce::TextButton presetsButton { "Presets" };
    juce::TextButton midiButton { "MIDI" };
    juce::TextButton audioButton { "Audio" };
    juce::TextButton settingsButton { "Settings" };

    juce::Slider knob1;
    juce::Slider knob2;
    juce::Slider knob3;
    juce::Slider knob4;

    mm8::AppState appState;
    mm8::FactoryBank factoryBank;
    mm8::MidiDeviceManager midiDeviceManager;
    mm8::MappingEngine mappingEngine;
    mm8::PluginScanner pluginScanner;
    mm8::EngineRegistry engineRegistry;
    mm8::PresetScanner presetScanner;
    mm8::PresetIndex presetIndex;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(MainComponent)
};
