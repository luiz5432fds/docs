#pragma once

#include <juce_audio_basics/juce_audio_basics.h>

namespace mm8
{
enum class MidiPriority
{
    Note = 0,
    Sustain = 1,
    PitchMod = 2,
    OtherCC = 3,
    BankProgram = 4,
    SysEx = 5
};

struct ScheduledMidi
{
    juce::MidiMessage message;
    MidiPriority priority = MidiPriority::OtherCC;
};

class MidiScheduler
{
public:
    MidiScheduler();

    void setBootDelayMs(int delayMs);
    void setRateLimitPerSecond(int messagesPerSecond);
    void resetBootTimer();
    void enqueue(const juce::MidiMessage& message, MidiPriority priority);
    void flush(std::function<void(const juce::MidiMessage&)> sendMessage);

private:
    int bootDelayMs = 6500;
    int rateLimitPerSecond = 500;
    juce::int64 bootStartMs = 0;
    std::vector<ScheduledMidi> queue;
};
} // namespace mm8
