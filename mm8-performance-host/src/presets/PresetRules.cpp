#include "PresetRules.h"

namespace mm8
{
juce::String PresetRules::categoryForPath(const juce::File& file)
{
    auto path = file.getFullPathName().toLowerCase();
    auto name = file.getFileNameWithoutExtension().toLowerCase();

    if (path.contains("grand") && path.contains("piano"))
        return "Piano";
    if (path.contains("upright"))
        return "Piano";
    if (path.contains("epiano") || path.contains("e.piano") || path.contains("rhodes") || path.contains("wurli") || path.contains("clav"))
        return "E.Piano";

    if (path.contains("organ") || path.contains("b3") || path.contains("hammond") || path.contains("vox") || path.contains("farfisa"))
        return "Organ";

    if (path.contains("string") || path.contains("orchestra") || path.contains("violin") || path.contains("cello"))
        return "Strings";

    if (path.contains("brass") || path.contains("trumpet") || path.contains("sax") || path.contains("horn"))
        return "Brass";
    if (path.contains("flute") || path.contains("clarinet") || path.contains("oboe") || path.contains("woodwind"))
        return "Woodwind";

    if (path.contains("guitar") && !path.contains("bass"))
        return "Guitar";
    if (path.contains("bass") && !path.contains("drum"))
        return "Bass";

    if (path.contains("pad") || path.contains("atmosphere") || path.contains("drone"))
        return "Synth Pad";
    if (path.contains("lead") || path.contains("solo"))
        return "Synth Lead";
    if (path.contains("arp") || path.contains("seq") || path.contains("puls"))
        return "Synth Comp";

    if (path.contains("drum") || path.contains("perc") || path.contains("kit") || path.contains("beat"))
        return "Drums";

    if (path.contains("mallet") || path.contains("bell") || path.contains("marimba") || path.contains("vibes"))
        return "Chromatic Perc";

    if (path.contains("fx") || path.contains("effect"))
        return "FX";

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
    if (ext == ".txt" || ext == ".pdf" || ext == ".jpg" || ext == ".png" || ext == ".xml" || ext == ".nkc" || ext == ".nkx")
        return true;

    return false;
}
} // namespace mm8
