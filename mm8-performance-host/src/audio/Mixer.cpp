#include "Mixer.h"

namespace mm8
{
void Mixer::updateMixSettings(const std::vector<PartState>& parts)
{
    gains.clear();
    pans.clear();
    gains.reserve(parts.size());
    pans.reserve(parts.size());

    for (const auto& part : parts)
    {
        gains.push_back(part.volume);
        pans.push_back(part.pan);
    }
}

float Mixer::getLayerGain(size_t index) const
{
    if (index < gains.size())
        return gains[index];

    return 1.0f;
}

float Mixer::getLayerPan(size_t index) const
{
    if (index < pans.size())
        return pans[index];

    return 0.0f;
}
} // namespace mm8
