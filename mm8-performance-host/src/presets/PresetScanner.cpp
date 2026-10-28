#include "PresetScanner.h"
#include "PresetRules.h"

namespace mm8
{
juce::Array<juce::File> PresetScanner::presetRoots() const
{
    juce::Array<juce::File> roots;
    roots.add(juce::File::getSpecialLocation(juce::File::userDocumentsDirectory)
                  .getChildFile("VST3 Presets"));
    roots.add(juce::File::getSpecialLocation(juce::File::commonApplicationDataDirectory)
                  .getChildFile("VST3 Presets"));
    roots.add(juce::File("C:/Program Files/Vital"));
    roots.add(juce::File("C:/Program Files/Native Instruments"));
    roots.add(juce::File("C:/Program Files/Steinberg"));
    roots.add(juce::File("D:/kontakt/001-NOVAS GUITARRAS LOOPS PARA KONTAKT"));
    roots.add(juce::File("D:/kontakt/014_StandardKit1 Samples"));
    roots.add(juce::File("D:/kontakt/AC - JAIRINHO JUNINO"));
    roots.add(juce::File("D:/kontakt/AC - JAIRINHO JUNINO -FRASES"));
    roots.add(juce::File("D:/kontakt/Acordeon Junino 2024"));
    roots.add(juce::File("D:/kontakt/ACORDEON LOOP VANERA LC"));
    roots.add(juce::File("D:/kontakt/Acoustic Drums Library"));
    roots.add(juce::File("D:/kontakt/Analog Dreams Library"));
    roots.add(juce::File("D:/kontakt/B1 BRINDE CLUBE DO VS 2"));
    roots.add(juce::File("D:/kontakt/BAIXOS"));
    roots.add(juce::File("D:/kontakt/BASS FORRÓ 2.1"));
    roots.add(juce::File("D:/kontakt/Bass Music Essentials Library"));
    roots.add(juce::File("D:/kontakt/BATERA SERTANEJA V1 DR"));
    roots.add(juce::File("D:/kontakt/BATERIA  CLEY TECLAS Samples"));
    roots.add(juce::File("D:/kontakt/BATERIA - IB"));
    roots.add(juce::File("D:/kontakt/Bateria Vaneira G.Som"));
    roots.add(juce::File("D:/kontakt/BIT BREGA FUNK"));
    roots.add(juce::File("D:/kontakt/BULLDOG METALEIRA"));
    roots.add(juce::File("D:/kontakt/BULLDOG PERCUSSION"));
    roots.add(juce::File("D:/kontakt/BULLDOG SAX"));
    roots.add(juce::File("D:/kontakt/BULLDOG SAX V2"));
    roots.add(juce::File("D:/kontakt/BULLDOG STAGE"));
    roots.add(juce::File("D:/kontakt/Chris Hein - Orchestral Brass Compact"));
    roots.add(juce::File("D:/kontakt/Chris Hein - Orchestral Winds Vol. 5 - Deep Flutes [Best Service]"));
    roots.add(juce::File("D:/kontakt/Deviant Drums 1.0.2 [Chaos Tones]"));
    roots.add(juce::File("D:/kontakt/Ethereal Earth Library"));
    roots.add(juce::File("D:/kontakt/GTR - BREGA RECIFER"));
    roots.add(juce::File("D:/kontakt/GUITARRA LOOP FORRÓ - FA MUSIC STUDIO"));
    roots.add(juce::File("D:/kontakt/GUITARRA LOOP VANERA 1"));
    roots.add(juce::File("D:/kontakt/GUITARRA PIZEIRO (LOOP)"));
    roots.add(juce::File("D:/kontakt/Hypha"));
    roots.add(juce::File("D:/kontakt/Hypha Library"));
    roots.add(juce::File("D:/kontakt/IB TUTORIAIS xote"));
    roots.add(juce::File("D:/kontakt/Irish Harp Library"));
    roots.add(juce::File("D:/kontakt/Jacob Collier Audience Choir Library"));
    roots.add(juce::File("D:/kontakt/KONTAKT - KITS - CLUBE DO VS"));
    roots.add(juce::File("D:/kontakt/Kontakt Factory Selection 2 Library"));
    roots.add(juce::File("D:/kontakt/LEVADAS FORRÓ - IB"));
    roots.add(juce::File("D:/kontakt/LL Guitarra Calypso"));
    roots.add(juce::File("D:/kontakt/LOOP ACORDEON FORRO"));
    roots.add(juce::File("D:/kontakt/LOOP BASS VANEIRA 2024 LC"));
    roots.add(juce::File("D:/kontakt/loop cavaco frevo"));
    roots.add(juce::File("D:/kontakt/loop frevo bateria"));
    roots.add(juce::File("D:/kontakt/LOOP SERTÃO"));
    roots.add(juce::File("D:/kontakt/LOOP VIOLÃO REMIX"));
    roots.add(juce::File("D:/kontakt/material frevo"));
    roots.add(juce::File("D:/kontakt/METAL IB - 2024"));
    roots.add(juce::File("D:/kontakt/METAL IB TUTORIAIS"));
    roots.add(juce::File("D:/kontakt/Mirrors [Slate + Ash - Orchestral Tools]"));
    roots.add(juce::File("D:/kontakt/NORD STAGE SYNTHs"));
    roots.add(juce::File("D:/kontakt/Orchestra Complete, The 4.0.0 [Sonuscore]"));
    roots.add(juce::File("D:/kontakt/Orchestral Tools - Berlin Woodwinds Soloists 1"));
    roots.add(juce::File("D:/kontakt/Pe de Serra WAV"));
    roots.add(juce::File("D:/kontakt/percussão"));
    roots.add(juce::File("D:/kontakt/Percussao G.Som"));
    roots.add(juce::File("D:/kontakt/SANFONA BALANÇO-IB TUTORIAIS"));
    roots.add(juce::File("D:/kontakt/Sanfona Forrozão"));
    roots.add(juce::File("D:/kontakt/SANFONA LOOP - DAW"));
    roots.add(juce::File("D:/kontakt/SHAKER PERCUSSÃO - IB"));
    roots.add(juce::File("D:/kontakt/TIMBRES BREGA"));
    roots.add(juce::File("D:/kontakt/UDU IB"));
    roots.add(juce::File("D:/kontakt/Update Loop Prático Arrasta-Pé 6.5.2"));
    roots.add(juce::File("D:/kontakt/violão 3x4 loop (LC)"));
    roots.add(juce::File("D:/kontakt/VIOLÃO BASE LOOPS 1.0"));
    roots.add(juce::File("D:/kontakt/VIOLAO STUDIO3"));
    roots.add(juce::File("D:/kontakt/Violao Takamine G.Som"));
    roots.add(juce::File("D:/kontakt/VIOLÃO TOP -DAW"));
    roots.add(juce::File("D:/kontakt/Virtual Acustic Scandalli Super VI Vintage"));
    roots.add(juce::File("D:/kontakt/XAXADO IB"));
    roots.add(juce::File("D:/kontakt/Yangqin"));
    roots.add(juce::File("D:/kontakt/ZABUMBA E BERIMBAU"));
    roots.add(juce::File("D:/kontakt/zabumba solo Samples"));
    return roots;
}

void PresetScanner::scanDirectory(const juce::File& root, juce::Array<PresetEntry>& entries) const
{
    if (!root.exists())
        return;

    juce::DirectoryIterator iter(root, true, "*.vstpreset;*.fxp;*.fxb;*.vitalpreset;*.vitalbank;*.nki", juce::File::findFiles);
    while (iter.next())
    {
        auto file = iter.getFile();
        if (PresetRules::shouldIgnoreFile(file))
            continue;
        PresetEntry entry;
        entry.name = file.getFileNameWithoutExtension();
        entry.engineId = file.getParentDirectory().getFileName();
        entry.path = file.getFullPathName();
        entry.category = PresetRules::categoryForPath(file);
        entries.add(entry);
    }
}

juce::Array<PresetEntry> PresetScanner::scan()
{
    juce::Array<PresetEntry> entries;
    for (const auto& root : presetRoots())
        scanDirectory(root, entries);

    return entries;
}
} // namespace mm8
