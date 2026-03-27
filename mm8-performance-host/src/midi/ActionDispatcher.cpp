#include "ActionDispatcher.h"
#include "../core/Logger.h"

namespace mm8
{
void ActionDispatcher::dispatch(const juce::String& action)
{
    Logger::get().log("Dispatch action: " + action);
}
} // namespace mm8
