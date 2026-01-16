#pragma once

#include <juce_gui_extra/juce_gui_extra.h>
#include "Ui/LookAndFeel.h"
#include "Ui/PartsGrid.h"
#include "Engine/FactoryBank.h"
#include "Engine/AppConfig.h"
#include "Engine/MidiScheduler.h"
#include "Engine/PerformanceEngine.h"
#include "Engine/PerformanceStore.h"
#include "Engine/PluginScanner.h"

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
    juce::TextButton bankButton { "Bank" };
    juce::TextButton programButton { "Program" };
    juce::TextButton mixerButton { "Mixer" };
    juce::TextButton setlistButton { "Setlist" };
    juce::TextButton midiMonitorButton { "MIDI Monitor" };

    juce::Slider knob1;
    juce::Slider knob2;
    juce::Slider knob3;
    juce::Slider knob4;

    mm8::PerformanceEngine engine;
    mm8::PerformanceStore store;
    mm8::PluginScanner scanner;
    mm8::FactoryBank factoryBank;
    mm8::MidiScheduler midiScheduler;
    mm8::AppConfig config;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(MainComponent)
};
