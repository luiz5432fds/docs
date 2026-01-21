#include "PresetRules.h"

namespace mm8
{
juce::String PresetRules::categoryForPath(const juce::File& file)
{
    auto path = file.getFullPathName().toLowerCase();
    if (path.contains("piano"))
        return "Piano";
    if (path.contains("organ"))
        return "Organ";
    if (path.contains("strings"))
        return "Strings";
    if (path.contains("brass"))
        return "Brass";
    if (path.contains("bass"))
        return "Bass";
    if (path.contains("drum") || path.contains("perc"))
        return "Drums";
    return "Synth";
}

bool PresetRules::shouldIgnoreFile(const juce::File& file)
{
    auto name = file.getFileName();
    if (name == ".DS_Store" || name == "desktop.ini")
        return true;
    return name.startsWith("._");
}
} // namespace mm8
