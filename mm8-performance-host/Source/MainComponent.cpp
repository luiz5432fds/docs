#include "MainComponent.h"

MainComponent::MainComponent()
{
    setLookAndFeel(&lookAndFeel);
    setSize(1200, 720);

    performanceName.setText("Performance: INIT", juce::dontSendNotification);
    performanceName.setJustificationType(juce::Justification::centredLeft);

    sceneLabel.setText("Scene A", juce::dontSendNotification);
    sceneLabel.setJustificationType(juce::Justification::centred);

    bpmLabel.setText("BPM 120", juce::dontSendNotification);
    bpmLabel.setJustificationType(juce::Justification::centred);

    statusLabel.setText("Audio: 48kHz • Buffer 256 • CPU 3% • Latency 9.3ms", juce::dontSendNotification);
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
                         &programList, &searchBox, &performanceButton, &bankButton,
                         &programButton, &mixerButton, &setlistButton, &midiMonitorButton,
                         &knob1, &knob2, &knob3, &knob4 })
    {
        addAndMakeVisible(child);
    }

    scanner.setDefaultPluginFolders();
    config.load();
    if (config.needsAutoConfig())
    {
        engine.autoConfigureIfNeeded();
        config.markConfigured();
        config.save();
    }
    store.loadFromDisk();
    engine.setPerformance(store.getActivePerformance());
    partsGrid.setParts(engine.getPerformance().parts);
    performanceName.setText("Performance: " + engine.getPerformance().name, juce::dontSendNotification);
    sceneLabel.setText("Scene " + engine.getPerformance().scene, juce::dontSendNotification);
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
    auto buttonWidth = buttonArea.getWidth() / 6;
    performanceButton.setBounds(buttonArea.removeFromLeft(buttonWidth).reduced(4));
    bankButton.setBounds(buttonArea.removeFromLeft(buttonWidth).reduced(4));
    programButton.setBounds(buttonArea.removeFromLeft(buttonWidth).reduced(4));
    mixerButton.setBounds(buttonArea.removeFromLeft(buttonWidth).reduced(4));
    setlistButton.setBounds(buttonArea.removeFromLeft(buttonWidth).reduced(4));
    midiMonitorButton.setBounds(buttonArea.removeFromLeft(buttonWidth).reduced(4));
}

void MainComponent::refreshStatusText()
{
    const auto deviceStatus = engine.describeAudioStatus();
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
