#include "PartsGrid.h"
#include "LookAndFeel.h"

namespace mm8
{
PartsGrid::PartsGrid()
{
    parts.resize(16);
    for (size_t index = 0; index < parts.size(); ++index)
    {
        parts[index].name = "Part " + juce::String(static_cast<int>(index + 1));
        parts[index].program = "Init";
        parts[index].midiChannelIn = static_cast<int>(index + 1);
        parts[index].midiChannelOut = static_cast<int>(index + 1);
        parts[index].enabled = true;
    }
}

void PartsGrid::setParts(const std::vector<PartState>& partsToShow)
{
    parts = partsToShow;
    repaint();
}

void PartsGrid::paint(juce::Graphics& g)
{
    auto bounds = getLocalBounds();
    auto columns = 4;
    auto rows = 4;
    auto cellWidth = bounds.getWidth() / columns;
    auto cellHeight = bounds.getHeight() / rows;

    auto& lookAndFeel = dynamic_cast<LookAndFeel&>(getLookAndFeel());

    for (int row = 0; row < rows; ++row)
    {
        for (int col = 0; col < columns; ++col)
        {
            auto index = row * columns + col;
            if (index >= static_cast<int>(parts.size()))
                continue;

            auto cell = juce::Rectangle<int>(col * cellWidth, row * cellHeight, cellWidth, cellHeight)
                            .reduced(8);
            g.setColour(lookAndFeel.findColour(LookAndFeel::panelColourId));
            g.fillRoundedRectangle(cell.toFloat(), 8.0f);

            g.setColour(lookAndFeel.findColour(LookAndFeel::panelBorderColourId));
            g.drawRoundedRectangle(cell.toFloat(), 8.0f, 1.0f);

            auto textArea = cell.reduced(8);
            g.setColour(juce::Colours::white);
            g.setFont(juce::Font(15.0f, juce::Font::bold));
            g.drawText(parts[index].name, textArea.removeFromTop(20), juce::Justification::left);

            g.setFont(juce::Font(13.0f));
            g.setColour(juce::Colour(0xffc0b9ae));
            g.drawText(parts[index].program, textArea.removeFromTop(18), juce::Justification::left);

            g.setFont(juce::Font(12.0f));
            g.drawText("CH " + juce::String(parts[index].midiChannelIn) + " → "
                           + juce::String(parts[index].midiChannelOut),
                       textArea.removeFromTop(16), juce::Justification::left);

            g.drawText("Keys " + juce::String(parts[index].keyLow) + "-" + juce::String(parts[index].keyHigh)
                           + " • Vel " + juce::String(parts[index].velocityLow) + "-" + juce::String(parts[index].velocityHigh),
                       textArea.removeFromTop(16), juce::Justification::left);

            g.drawText(parts[index].enabled ? "Enabled" : "Muted",
                       textArea.removeFromTop(16), juce::Justification::left);
        }
    }
}

void PartsGrid::resized()
{
}
} // namespace mm8
