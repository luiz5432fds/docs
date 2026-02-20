#include "AppState.h"

namespace mm8
{
AppState::AppState()
    : logger(Logger::get())
{
}

void AppState::initialise()
{
    logger.initialise();
    settings.load();
    performanceStore.loadFromDisk();
}

Logger& AppState::getLogger()
{
    return logger;
}

Settings& AppState::getSettings()
{
    return settings;
}

Persistence& AppState::getPersistence()
{
    return persistence;
}

PerformanceStore& AppState::getPerformanceStore()
{
    return performanceStore;
}

PerformanceEngine& AppState::getPerformanceEngine()
{
    return performanceEngine;
}
} // namespace mm8
