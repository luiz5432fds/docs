#pragma once

#include <juce_gui_extra/juce_gui_extra.h>
#include "../core/PerformanceTypes.h"

namespace mm8
{
class PartsGrid final : public juce::Component
{
public:
    void setParts(const std::vector<PartState>& partsToShow);

    void paint(juce::Graphics& g) override;
    void resized() override;

private:
    std::vector<PartState> parts;
};
} // namespace mm8
