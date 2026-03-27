#include "LookAndFeel.h"

namespace mm8
{
LookAndFeel::LookAndFeel()
{
    setColour(juce::ResizableWindow::backgroundColourId, juce::Colour(0xff1b1b1d));
    setColour(juce::Label::textColourId, juce::Colour(0xffe7e1d8));
    setColour(juce::TextButton::buttonColourId, juce::Colour(0xff2a2a2f));
    setColour(juce::TextButton::textColourOffId, juce::Colour(0xfff2aa44));
    setColour(juce::Slider::thumbColourId, juce::Colour(0xfff2aa44));
    setColour(juce::Slider::rotarySliderFillColourId, juce::Colour(0xfff2aa44));
    setColour(accentColourId, juce::Colour(0xfff09a2a));
    setColour(panelColourId, juce::Colour(0xff202024));
    setColour(panelBorderColourId, juce::Colour(0xff3a3a40));
}

void LookAndFeel::drawButtonBackground(juce::Graphics& g, juce::Button& button,
                                       const juce::Colour& backgroundColour,
                                       bool isMouseOverButton, bool isButtonDown)
{
    auto bounds = button.getLocalBounds().toFloat();
    auto colour = backgroundColour;

    if (isButtonDown)
        colour = colour.brighter(0.1f);
    else if (isMouseOverButton)
        colour = colour.brighter(0.05f);

    g.setColour(colour);
    g.fillRoundedRectangle(bounds, 6.0f);

    g.setColour(findColour(panelBorderColourId));
    g.drawRoundedRectangle(bounds, 6.0f, 1.0f);
}

void LookAndFeel::drawRotarySlider(juce::Graphics& g, int x, int y, int width, int height,
                                   float sliderPos, float rotaryStartAngle, float rotaryEndAngle,
                                   juce::Slider& slider)
{
    auto radius = juce::jmin(width, height) / 2.0f - 6.0f;
    auto centreX = x + width * 0.5f;
    auto centreY = y + height * 0.5f;
    auto rx = centreX - radius;
    auto ry = centreY - radius;
    auto angle = rotaryStartAngle + sliderPos * (rotaryEndAngle - rotaryStartAngle);

    g.setColour(findColour(panelColourId));
    g.fillEllipse(rx, ry, radius * 2.0f, radius * 2.0f);

    g.setColour(findColour(panelBorderColourId));
    g.drawEllipse(rx, ry, radius * 2.0f, radius * 2.0f, 1.0f);

    juce::Path pointer;
    pointer.addRectangle(-2.0f, -radius + 6.0f, 4.0f, radius * 0.5f);

    g.setColour(findColour(juce::Slider::rotarySliderFillColourId));
    g.fillPath(pointer, juce::AffineTransform::rotation(angle).translated(centreX, centreY));
}
} // namespace mm8
