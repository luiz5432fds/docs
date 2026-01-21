#include "PresetRules.h"

namespace mm8
{
juce::String PresetRules::categoryForPath(const juce::File& file)
{
    auto path = file.getFullPathName().toLowerCase();
    auto name = file.getFileNameWithoutExtension().toLowerCase();

    if (path.contains("piano") || path.contains("grand"))
        return "Piano";
    if (path.contains("epiano") || path.contains("rhodes") || path.contains("wurli"))
        return "E.Piano";
    if (path.contains("organ") || path.contains("b3") || path.contains("hammond"))
        return "Organ";
    if (path.contains("string") || path.contains("orchestra") || path.contains("cello"))
        return "Strings";
    if (path.contains("brass") || path.contains("sax") || path.contains("trumpet"))
        return "Brass";
    if (path.contains("guitar") && !path.contains("bass"))
        return "Guitar";
    if (path.contains("bass"))
        return "Bass";
    if (path.contains("pad") || path.contains("atmosphere"))
        return "Synth Pad";
    if (path.contains("lead") || path.contains("solo"))
        return "Synth Lead";
    if (path.contains("drum") || path.contains("perc") || path.contains("kit"))
        return "Drums";

    return "Synth";
}

bool PresetRules::shouldIgnoreFile(const juce::File& file)
{
    auto name = file.getFileName();
    if (name == ".DS_Store" || name == "desktop.ini")
        return true;
    if (name.startsWith("._"))
        return true;

    auto ext = file.getFileExtension().toLowerCase();
    if (ext == ".txt" || ext == ".pdf" || ext == ".jpg" || ext == ".png" || ext == ".html")
        return true;

    return false;
}
} // namespace mm8
