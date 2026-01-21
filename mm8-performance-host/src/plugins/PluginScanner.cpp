#include "PluginScanner.h"
#include "../core/Logger.h"
#include <juce_events/juce_events.h>

namespace mm8
{
PluginScanner::PluginScanner()
{
    formatManager.addDefaultFormats();
}

void PluginScanner::loadPluginPaths(const juce::File& configFile)
{
    if (!configFile.existsAsFile())
    {
        writeDefaultPluginConfig(configFile);
        searchPath = defaultPluginPaths();
        return;
    }

    auto json = juce::JSON::parse(configFile);
    auto* array = json.getArray();
    if (!array)
        return;

    searchPath = {};
    for (const auto& item : *array)
        searchPath.add(juce::File(item.toString()));
}

void PluginScanner::setPluginPaths(const juce::FileSearchPath& paths)
{
    searchPath = paths;
}

const juce::FileSearchPath& PluginScanner::getSearchPath() const
{
    return searchPath;
}

juce::FileSearchPath PluginScanner::defaultPluginPaths() const
{
    juce::FileSearchPath defaults;
    defaults.add(juce::File("C:/Program Files/Image-Line/FL Studio 2025/Plugins/Fruity/Generators"));
    defaults.add(juce::File("C:/Program Files/Vital"));
    defaults.add(juce::File("C:/Program Files/VSTPlugins"));
    defaults.add(juce::File("C:/Program Files/KORG"));
    defaults.add(juce::File("C:/Program Files/Native Instruments"));
    defaults.add(juce::File("C:/Program Files/Roland Cloud"));
    defaults.add(juce::File("C:/Program Files/Roland VS"));
    defaults.add(juce::File("C:/Program Files/Steinberg"));
    return defaults;
}

void PluginScanner::writeDefaultPluginConfig(const juce::File& configFile) const
{
    auto defaults = defaultPluginPaths();
    juce::Array<juce::var> items;
    for (int i = 0; i < defaults.getNumPaths(); ++i)
        items.add(defaults[i].getFullPathName());

    configFile.getParentDirectory().createDirectory();
    configFile.replaceWithText(juce::JSON::toString(items, true));
}

juce::Array<juce::File> PluginScanner::collectPluginFiles() const
{
    juce::Array<juce::File> files;
    for (int i = 0; i < searchPath.getNumPaths(); ++i)
    {
        auto root = searchPath[i];
        if (!root.isDirectory())
            continue;

        juce::DirectoryIterator iter(root, true, "*.vst3;*.dll", juce::File::findFiles);
        while (iter.next())
            files.add(iter.getFile());
    }
    return files;
}

juce::Array<CachedPlugin> PluginScanner::loadCachedEntries(const juce::File& cacheFile) const
{
    PluginCache cache;
    cache.load(cacheFile);
    return cache.getEntries();
}

CachedPlugin PluginScanner::toCachedPlugin(const juce::PluginDescription& description, const juce::File& file) const
{
    CachedPlugin entry;
    entry.name = description.name;
    entry.vendor = description.manufacturerName;
    entry.format = description.pluginFormatName;
    entry.path = file.getFullPathName();
    entry.uniqueId = juce::String(description.uid);
    entry.lastModified = file.getLastModificationTime().toMilliseconds();
    entry.fileSize = file.getSize();
    return entry;
}

juce::Array<CachedPlugin> PluginScanner::scan(const juce::File& cacheFile, bool rescanAll)
{
    auto cached = loadCachedEntries(cacheFile);
    auto files = collectPluginFiles();

    juce::Array<CachedPlugin> results;

    auto getCachedByPath = [&cached](const juce::String& path) -> const CachedPlugin*
    {
        for (const auto& entry : cached)
            if (entry.path == path)
                return &entry;
        return nullptr;
    };

    juce::StringArray failedFiles;

    for (const auto& file : files)
    {
        auto lastModified = file.getLastModificationTime().toMilliseconds();
        auto path = file.getFullPathName();
        auto* cachedEntry = getCachedByPath(path);

        auto fileSize = file.getSize();
        if (cachedEntry && !rescanAll && cachedEntry->lastModified == lastModified && cachedEntry->fileSize == fileSize)
        {
            results.add(*cachedEntry);
            continue;
        }

        bool scanned = false;
        for (int i = 0; i < formatManager.getNumFormats(); ++i)
        {
            auto* format = formatManager.getFormat(i);
            if (!format->fileMightContainThisPluginType(file.getFullPathName()))
                continue;

            juce::OwnedArray<juce::PluginDescription> descriptions;
            format->findAllTypesForFile(descriptions, file.getFullPathName());
            if (descriptions.isEmpty())
                continue;

            results.add(toCachedPlugin(*descriptions[0], file));
            scanned = true;
            break;
        }

        if (!scanned)
            failedFiles.add(path);
    }

    PluginCache cache;
    cache.setEntries(results);
    cache.save(cacheFile);

    if (failedFiles.isEmpty())
        Logger::get().log("Plugin scan completed with " + juce::String(results.size()) + " engines.");
    else
        Logger::get().log("Plugin scan completed with failures: " + failedFiles.joinIntoString(", "));

    return results;
}

void PluginScanner::scanAsync(juce::ThreadPool& pool,
                              const juce::File& cacheFile,
                              bool rescanAll,
                              std::function<void(ScanResult)> onComplete)
{
    class ScanJob final : public juce::ThreadPoolJob
    {
    public:
        ScanJob(const juce::FileSearchPath& pathToScan,
                const juce::File& cacheFileToUse,
                bool rescan,
                std::function<void(ScanResult)> callback)
            : juce::ThreadPoolJob("MM8PluginScan")
            , searchPath(pathToScan)
            , cacheFile(cacheFileToUse)
            , rescanAll(rescan)
            , onComplete(std::move(callback))
        {
            formatManager.addDefaultFormats();
        }

        JobStatus runJob() override
        {
            PluginCache cache;
            cache.load(cacheFile);
            auto cached = cache.getEntries();

            auto getCachedByPath = [&cached](const juce::String& path) -> const CachedPlugin*
            {
                for (const auto& entry : cached)
                    if (entry.path == path)
                        return &entry;
                return nullptr;
            };

            ScanResult result;
            for (int i = 0; i < searchPath.getNumPaths(); ++i)
            {
                if (shouldExit())
                    return jobHasFinished;

                auto root = searchPath[i];
                if (!root.isDirectory())
                    continue;

                juce::DirectoryIterator iter(root, true, "*.vst3;*.dll", juce::File::findFiles);
                while (iter.next())
                {
                    if (shouldExit())
                        return jobHasFinished;

                    auto file = iter.getFile();
                    auto lastModified = file.getLastModificationTime().toMilliseconds();
                    auto fileSize = file.getSize();
                    auto path = file.getFullPathName();
                    auto* cachedEntry = getCachedByPath(path);

                    if (cachedEntry && !rescanAll && cachedEntry->lastModified == lastModified && cachedEntry->fileSize == fileSize)
                    {
                        result.entries.add(*cachedEntry);
                        continue;
                    }

                    bool scanned = false;
                    for (int formatIndex = 0; formatIndex < formatManager.getNumFormats(); ++formatIndex)
                    {
                        auto* format = formatManager.getFormat(formatIndex);
                        if (!format->fileMightContainThisPluginType(file.getFullPathName()))
                            continue;

                        juce::OwnedArray<juce::PluginDescription> descriptions;
                        format->findAllTypesForFile(descriptions, file.getFullPathName());
                        if (descriptions.isEmpty())
                            continue;

                        CachedPlugin entry;
                        entry.name = descriptions[0]->name;
                        entry.vendor = descriptions[0]->manufacturerName;
                        entry.format = descriptions[0]->pluginFormatName;
                        entry.path = file.getFullPathName();
                        entry.uniqueId = juce::String(descriptions[0]->uid);
                        entry.lastModified = lastModified;
                        entry.fileSize = fileSize;
                        result.entries.add(entry);
                        scanned = true;
                        break;
                    }

                    if (!scanned)
                        result.failures.add(path);
                }
            }

            PluginCache updatedCache;
            updatedCache.setEntries(result.entries);
            updatedCache.save(cacheFile);

            if (onComplete)
            {
                auto callbackCopy = onComplete;
                juce::MessageManager::callAsync([callbackCopy, result]() mutable
                {
                    callbackCopy(result);
                });
            }

            return jobHasFinished;
        }

    private:
        juce::FileSearchPath searchPath;
        juce::File cacheFile;
        bool rescanAll = false;
        std::function<void(ScanResult)> onComplete;
        juce::AudioPluginFormatManager formatManager;
    };

    pool.addJob(new ScanJob(searchPath, cacheFile, rescanAll, std::move(onComplete)), true);
}
} // namespace mm8
