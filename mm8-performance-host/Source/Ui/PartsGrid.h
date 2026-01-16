#pragma once

#include <juce_gui_extra/juce_gui_extra.h>
#include "../Engine/PerformanceTypes.h"

namespace mm8
{
class PartsGrid final : public juce::Component
{
public:
    PartsGrid();
    void paint(juce::Graphics& g) override;
    void resized() override;

    void setParts(const std::vector<PartState>& partsToShow);

private:
    std::vector<PartState> parts;
};
} // namespace mm8
