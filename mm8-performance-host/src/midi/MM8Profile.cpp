#include "MM8Profile.h"

namespace mm8
{
MM8Profile::MM8Profile()
{
    // --- Navegação (Transporte/Utility) ---
    mappings.add({ "performance_next", 0x5C, 1 }); // Inc
    mappings.add({ "performance_prev", 0x5B, 1 }); // Dec
    mappings.add({ "bank_next", 0x5E, 1 });        // Page Up
    mappings.add({ "bank_prev", 0x5D, 1 });        // Page Down
    mappings.add({ "panic", 0x78, 0 });            // CC 120 (Panic)

    // --- Knobs de Performance (Yamaha Standard) ---
    mappings.add({ "cutoff", 74, -1 });    // Filter Cutoff
    mappings.add({ "resonance", 71, -1 }); // Filter Resonance
    mappings.add({ "attack", 73, -1 });    // Amp Attack
    mappings.add({ "release", 72, -1 });   // Amp Release

    // --- Controlo de Mistura ---
    mappings.add({ "reverb", 91, -1 }); // Reverb Send
    mappings.add({ "chorus", 93, -1 }); // Chorus Send
    mappings.add({ "volume", 7, -1 });
    mappings.add({ "expression", 11, -1 });
}

const juce::Array<MM8ControlMapping>& MM8Profile::getMappings() const
{
    return mappings;
}
} // namespace mm8
