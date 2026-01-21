#include "MidiScheduler.h"

namespace mm8
{
MidiScheduler::MidiScheduler()
{
    resetBootTimer();
}

void MidiScheduler::setBootDelayMs(int delayMs)
{
    bootDelayMs = delayMs;
}

void MidiScheduler::setRateLimitPerSecond(int messagesPerSecond)
{
    rateLimitPerSecond = messagesPerSecond;
}

void MidiScheduler::resetBootTimer()
{
    bootStartMs = juce::Time::getMillisecondCounter();
}

void MidiScheduler::enqueue(const juce::MidiMessage& message, MidiPriority priority)
{
    queue.push_back({ message, priority });
}

void MidiScheduler::flush(std::function<void(const juce::MidiMessage&)> sendMessage)
{
    const auto elapsed = static_cast<int>(juce::Time::getMillisecondCounter() - bootStartMs);
    if (elapsed < bootDelayMs)
        return;

    std::stable_sort(queue.begin(), queue.end(), [](const auto& a, const auto& b)
    {
        return static_cast<int>(a.priority) < static_cast<int>(b.priority);
    });

    const int maxMessages = juce::jmax(1, rateLimitPerSecond);
    const int sendCount = juce::jmin(static_cast<int>(queue.size()), maxMessages);

    for (int index = 0; index < sendCount; ++index)
        sendMessage(queue[index].message);

    queue.erase(queue.begin(), queue.begin() + sendCount);
}
} // namespace mm8
