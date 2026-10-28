#pragma once

#include <juce_gui_extra/juce_gui_extra.h>

namespace mm8
{
class LookAndFeel final : public juce::LookAndFeel_V4
{
public:
    enum ColourIds
    {
        accentColourId = 0x2000100,
        panelColourId,
        panelBorderColourId
    };

    LookAndFeel();

    void drawButtonBackground(juce::Graphics& g, juce::Button& button,
                              const juce::Colour& backgroundColour,
                              bool isMouseOverButton, bool isButtonDown) override;

    void drawRotarySlider(juce::Graphics& g, int x, int y, int width, int height,
                          float sliderPos, float rotaryStartAngle, float rotaryEndAngle,
                          juce::Slider& slider) override;
};
} // namespace mm8
