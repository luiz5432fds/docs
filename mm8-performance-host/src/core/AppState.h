#pragma once

#include "Logger.h"
#include "Settings.h"
#include "Persistence.h"
#include "PerformanceStore.h"
#include "PerformanceEngine.h"

namespace mm8
{
class AppState
{
public:
    AppState();

    void initialise();

    Logger& getLogger();
    Settings& getSettings();
    Persistence& getPersistence();
    PerformanceStore& getPerformanceStore();
    PerformanceEngine& getPerformanceEngine();

private:
    Logger& logger;
    Settings settings;
    Persistence persistence;
    PerformanceStore performanceStore;
    PerformanceEngine performanceEngine;
};
} // namespace mm8
