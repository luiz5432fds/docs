#include "PluginScanner.h"

namespace mm8
{
PluginScanner::PluginScanner()
{
    setDefaultPluginFolders();
}

void PluginScanner::setDefaultPluginFolders()
{
    searchPath = {};
    searchPath.add(juce::File("C:/Program Files/Common Files/VST3"));
    searchPath.add(juce::File("C:/Program Files/VstPlugins"));
    searchPath.add(juce::File("C:/Program Files (x86)/VstPlugins"));
}

void PluginScanner::addCustomFolder(const juce::File& folder)
{
    searchPath.add(folder);
}

const juce::FileSearchPath& PluginScanner::getSearchPath() const
{
    return searchPath;
}
} // namespace mm8
