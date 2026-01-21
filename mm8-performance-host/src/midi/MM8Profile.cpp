#include "MM8Profile.h"

namespace mm8
{
MM8Profile::MM8Profile()
{
    mappings.add({ "performance_next", 0x5C, 1 });
    mappings.add({ "performance_prev", 0x5B, 1 });
    mappings.add({ "bank_next", 0x5E, 1 });
    mappings.add({ "bank_prev", 0x5D, 1 });
    mappings.add({ "panic", 0x78, 0 });
}

const juce::Array<MM8ControlMapping>& MM8Profile::getMappings() const
{
    return mappings;
}
} // namespace mm8
