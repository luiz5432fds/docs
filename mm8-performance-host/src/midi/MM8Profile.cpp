#include "MM8Profile.h"

namespace mm8
{
MM8Profile::MM8Profile()
{
    // --- Controlos de Navegação (Transporte/Utility) ---
    mappings.add({ "performance_next", 0x5C, 1 }); // Inc / Yes
    mappings.add({ "performance_prev", 0x5B, 1 }); // Dec / No
    mappings.add({ "bank_next", 0x5E, 1 });        // Page Up (Mapeado para Bank Up)
    mappings.add({ "bank_prev", 0x5D, 1 });        // Page Down
    mappings.add({ "panic", 0x78, 0 });            // CC 120 (All Sound Off) - Standard MIDI

    // --- Knobs em Tempo Real (Norma Yamaha) ---
    mappings.add({ "cutoff", 74, -1 });    // Brightness/Cutoff
    mappings.add({ "resonance", 71, -1 }); // Harmonic Content/Resonance
    mappings.add({ "attack", 73, -1 });    // EG Attack Time
    mappings.add({ "release", 72, -1 });   // EG Release Time

    // --- Effect Sends ---
    mappings.add({ "reverb", 91, -1 }); // Reverb Send Level
    mappings.add({ "chorus", 93, -1 }); // Chorus Send Level

    // --- Expressão / Volume ---
    mappings.add({ "volume", 7, -1 });     // Channel Volume
    mappings.add({ "expression", 11, -1 }); // Expression Pedal
}

const juce::Array<MM8ControlMapping>& MM8Profile::getMappings() const
{
    return mappings;
}
} // namespace mm8
