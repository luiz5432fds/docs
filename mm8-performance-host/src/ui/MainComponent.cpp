#include "MainComponent.h"

MainComponent::MainComponent()
{
    setLookAndFeel(&lookAndFeel);
    setSize(1200, 720);

    appState.initialise();

    performanceName.setText("Performance: INIT", juce::dontSendNotification);
    performanceName.setJustificationType(juce::Justification::centredLeft);

    sceneLabel.setText("Scene A", juce::dontSendNotification);
    sceneLabel.setJustificationType(juce::Justification::centred);

    bpmLabel.setText("BPM 120", juce::dontSendNotification);
    bpmLabel.setJustificationType(juce::Justification::centred);

    statusLabel.setText("Audio: Initialising...", juce::dontSendNotification);
    statusLabel.setJustificationType(juce::Justification::centredRight);

    searchBox.setTextToShowWhenEmpty("Search programs", juce::Colours::grey);

    refreshFactoryBrowser();

    auto configureKnob = [](juce::Slider& slider)
    {
        slider.setSliderStyle(juce::Slider::RotaryHorizontalVerticalDrag);
        slider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 60, 20);
        slider.setRange(0.0, 127.0, 1.0);
    };

    configureKnob(knob1);
    configureKnob(knob2);
    configureKnob(knob3);
    configureKnob(knob4);

    for (auto* child : { &performanceName, &sceneLabel, &bpmLabel, &statusLabel, &partsGrid, &bankSelector,
                         &programList, &searchBox, &performanceButton, &bankButton, &enginesButton, &presetsButton,
                         &midiButton, &audioButton, &settingsButton, &knob1, &knob2, &knob3, &knob4 })
    {
        addAndMakeVisible(child);
    }

    runAutoConfiguration();
    appState.getPerformanceEngine().setPerformance(appState.getPerformanceStore().getActivePerformance());
    partsGrid.setParts(appState.getPerformanceEngine().getPerformance().parts);
    performanceName.setText("Performance: " + appState.getPerformanceEngine().getPerformance().name, juce::dontSendNotification);
    sceneLabel.setText("Scene " + appState.getPerformanceEngine().getPerformance().scene, juce::dontSendNotification);
    refreshStatusText();
}

MainComponent::~MainComponent()
{
    setLookAndFeel(nullptr);
}

void MainComponent::paint(juce::Graphics& g)
{
    g.fillAll(lookAndFeel.getColour(juce::ResizableWindow::backgroundColourId));

    g.setColour(lookAndFeel.getColour(mm8::LookAndFeel::accentColourId));
    g.fillRect(getLocalBounds().removeFromTop(6));
}

void MainComponent::resized()
{
    auto bounds = getLocalBounds().reduced(16);

    auto header = bounds.removeFromTop(60);
    performanceName.setBounds(header.removeFromLeft(bounds.getWidth() * 0.45f));
    sceneLabel.setBounds(header.removeFromLeft(90));
    bpmLabel.setBounds(header.removeFromLeft(120));
    statusLabel.setBounds(header);

    auto centerArea = bounds.removeFromTop(bounds.getHeight() * 0.62f);
    auto partsArea = centerArea.removeFromLeft(centerArea.getWidth() * 0.68f);
    partsGrid.setBounds(partsArea.reduced(0, 8));

    auto browserArea = centerArea.reduced(12, 0);
    searchBox.setBounds(browserArea.removeFromTop(32));
    browserArea.removeFromTop(8);
    bankSelector.setBounds(browserArea.removeFromTop(30));
    browserArea.removeFromTop(8);
    programList.setBounds(browserArea);

    auto footer = bounds;
    auto knobsArea = footer.removeFromLeft(footer.getWidth() * 0.5f);
    auto knobWidth = knobsArea.getWidth() / 4;
    knob1.setBounds(knobsArea.removeFromLeft(knobWidth).reduced(8, 0));
    knob2.setBounds(knobsArea.removeFromLeft(knobWidth).reduced(8, 0));
    knob3.setBounds(knobsArea.removeFromLeft(knobWidth).reduced(8, 0));
    knob4.setBounds(knobsArea.removeFromLeft(knobWidth).reduced(8, 0));

    auto buttonArea = footer.reduced(8, 0);
    auto buttonWidth = buttonArea.getWidth() / 7;
    performanceButton.setBounds(buttonArea.removeFromLeft(buttonWidth).reduced(4));
    bankButton.setBounds(buttonArea.removeFromLeft(buttonWidth).reduced(4));
    enginesButton.setBounds(buttonArea.removeFromLeft(buttonWidth).reduced(4));
    presetsButton.setBounds(buttonArea.removeFromLeft(buttonWidth).reduced(4));
    midiButton.setBounds(buttonArea.removeFromLeft(buttonWidth).reduced(4));
    audioButton.setBounds(buttonArea.removeFromLeft(buttonWidth).reduced(4));
    settingsButton.setBounds(buttonArea.removeFromLeft(buttonWidth).reduced(4));
}

void MainComponent::refreshStatusText()
{
    const auto deviceStatus = appState.getPerformanceEngine().describeAudioStatus();
    statusLabel.setText(deviceStatus, juce::dontSendNotification);
}

void MainComponent::refreshFactoryBrowser()
{
    bankSelector.clear();
    auto categories = factoryBank.getCategoryNames();
    if (categories.empty())
        categories = { "Piano", "Keyboard/Organ", "Guitar/Bass", "Strings", "Brass", "Synth Lead/Pad", "Drum/Perc/SE", "Ethnic", "GM" };

    int itemId = 1;
    for (const auto& category : categories)
        bankSelector.addItem(category, itemId++);

    bankSelector.setSelectedId(1);
}

void MainComponent::runAutoConfiguration()
{
    auto& settings = appState.getSettings();

    pluginScanner.loadPluginPaths(juce::File::getCurrentWorkingDirectory().getChildFile("config").getChildFile("plugin_paths.json"));
    auto engines = pluginScanner.scan(appState.getPersistence().getPluginCacheFile(), false);
    engineRegistry.updateFromCache(engines);

    presetIndex.setEntries(presetScanner.scan());
    presetIndex.save(appState.getPersistence().getPresetIndexFile());

    midiDeviceManager.autoDetectPrimaryController();
    configureControllerMappings(midiDeviceManager.getDetectedDeviceName());

    if (settings.needsAutoConfig())
    {
        appState.getPerformanceEngine().autoConfigureIfNeeded(settings);
        settings.save();
    }
    else
    {
        appState.getPerformanceEngine().applySettings(settings);
    }
}

void MainComponent::configureControllerMappings(const juce::String& deviceName)
{
    auto lowerName = deviceName.toLowerCase();
    if (lowerName.contains("xps") || lowerName.contains("roland"))
    {
        mm8::XPS10Profile profile;
        mappingEngine.setMappings(profile.getMappings());
        return;
    }

    mm8::MM8Profile profile;
    mappingEngine.setMappings(profile.getMappings());
}
