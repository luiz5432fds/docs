#pragma once

#include <juce_core/juce_core.h>

namespace mm8
{
struct FactoryProgram
{
    juce::String category;
    juce::String name;
    int msb = 0;
    int lsb = 0;
    int program = 0;
};

class FactoryBank
{
public:
    FactoryBank();

    const std::vector<FactoryProgram>& getPrograms() const;
    std::vector<juce::String> getCategoryNames() const;

private:
    void loadFromResource();

    std::vector<FactoryProgram> programs;
};
} // namespace mm8
