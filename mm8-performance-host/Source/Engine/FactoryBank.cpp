#include "FactoryBank.h"

#include <juce_core/juce_core.h>
#include <juce_data_structures/juce_data_structures.h>
#include <BinaryData.h>

namespace mm8
{
FactoryBank::FactoryBank()
{
    loadFromResource();
}

const std::vector<FactoryProgram>& FactoryBank::getPrograms() const
{
    return programs;
}

std::vector<juce::String> FactoryBank::getCategoryNames() const
{
    std::vector<juce::String> categories;
    juce::StringArray unique;
    for (const auto& program : programs)
        unique.addIfNotAlreadyThere(program.category);

    for (const auto& name : unique)
        categories.push_back(name);

    return categories;
}

void FactoryBank::loadFromResource()
{
    programs.clear();
    const auto* data = BinaryData::mm8_factory_order_json;
    const auto dataSize = BinaryData::mm8_factory_order_jsonSize;
    if (data == nullptr || dataSize == 0)
        return;

    auto content = juce::String::fromUTF8(data, static_cast<int>(dataSize));
    auto json = juce::JSON::parse(content);
    auto* object = json.getDynamicObject();
    if (object == nullptr)
        return;

    auto entries = object->getProperty("entries");
    if (!entries.isArray())
        return;

    for (const auto& entry : *entries.getArray())
    {
        if (auto* entryObj = entry.getDynamicObject())
        {
            FactoryProgram program;
            program.category = entryObj->getProperty("category").toString();
            program.name = entryObj->getProperty("name").toString();
            program.msb = static_cast<int>(entryObj->getProperty("msb"));
            program.lsb = static_cast<int>(entryObj->getProperty("lsb"));
            program.program = static_cast<int>(entryObj->getProperty("program"));
            programs.push_back(program);
        }
    }
}
} // namespace mm8
