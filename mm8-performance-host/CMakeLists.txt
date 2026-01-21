cmake_minimum_required(VERSION 3.21)

project(MM8WorkstationPerformanceHost VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Set JUCE path via -DJUCE_DIR=... when configuring.
if (NOT JUCE_DIR)
    message(FATAL_ERROR "JUCE_DIR is not set. Configure with -DJUCE_DIR=path/to/JUCE")
endif()

add_subdirectory(${JUCE_DIR} juce)

juce_add_gui_app(MM8WorkstationPerformanceHostApp
    PRODUCT_NAME "MM8 Workstation Performance Host"
    COMPANY_NAME "MM8 Tools"
)

juce_generate_juce_header(MM8WorkstationPerformanceHostApp)

set(APP_SOURCES
    src/Main.cpp
    src/ui/MainComponent.cpp
    src/ui/MainComponent.h
    src/ui/LookAndFeel.cpp
    src/ui/LookAndFeel.h
    src/ui/PartsGrid.cpp
    src/ui/PartsGrid.h
    src/core/AppState.cpp
    src/core/AppState.h
    src/core/Logger.cpp
    src/core/Logger.h
    src/core/Settings.cpp
    src/core/Settings.h
    src/core/Persistence.cpp
    src/core/Persistence.h
    src/core/PerformanceEngine.cpp
    src/core/PerformanceEngine.h
    src/core/PerformanceStore.cpp
    src/core/PerformanceStore.h
    src/core/PerformanceTypes.h
    src/core/FactoryBank.cpp
    src/core/FactoryBank.h
    src/core/MidiScheduler.cpp
    src/core/MidiScheduler.h
    src/core/AppConfig.cpp
    src/core/AppConfig.h
    src/audio/AudioDeviceManager.cpp
    src/audio/AudioDeviceManager.h
    src/audio/EngineHost.cpp
    src/audio/EngineHost.h
    src/audio/LayerRouter.cpp
    src/audio/LayerRouter.h
    src/audio/Mixer.cpp
    src/audio/Mixer.h
    src/midi/MidiDeviceManager.cpp
    src/midi/MidiDeviceManager.h
    src/midi/MM8Profile.cpp
    src/midi/MM8Profile.h
    src/midi/XPS10Profile.cpp
    src/midi/XPS10Profile.h
    src/midi/MappingEngine.cpp
    src/midi/MappingEngine.h
    src/midi/ActionDispatcher.cpp
    src/midi/ActionDispatcher.h
    src/plugins/PluginScanner.cpp
    src/plugins/PluginScanner.h
    src/plugins/PluginCache.cpp
    src/plugins/PluginCache.h
    src/plugins/EngineRegistry.cpp
    src/plugins/EngineRegistry.h
    src/presets/PresetScanner.cpp
    src/presets/PresetScanner.h
    src/presets/PresetIndex.cpp
    src/presets/PresetIndex.h
    src/presets/PresetRules.cpp
    src/presets/PresetRules.h
    src/presets/SnapshotManager.cpp
    src/presets/SnapshotManager.h
)

source_group(TREE ${CMAKE_CURRENT_SOURCE_DIR} FILES ${APP_SOURCES})

target_sources(MM8WorkstationPerformanceHostApp PRIVATE ${APP_SOURCES})

juce_add_binary_data(MM8WorkstationPerformanceHostResources
    SOURCES
        Resources/mm8-placeholder.txt
        Resources/mm8-factory-order.json
)

target_compile_definitions(MM8WorkstationPerformanceHostApp PRIVATE
    JUCE_DISPLAY_SPLASH_SCREEN=0
    JUCE_USE_CURL=0
    JUCE_WEB_BROWSER=0
    JUCE_PLUGINHOST_VST3=1
    JUCE_PLUGINHOST_AU=0
    JUCE_PLUGINHOST_LV2=0
)

if (JUCE_VST2_SDK_PATH)
    target_compile_definitions(MM8WorkstationPerformanceHostApp PRIVATE
        JUCE_PLUGINHOST_VST=1
    )
endif()

target_link_libraries(MM8WorkstationPerformanceHostApp PRIVATE
    juce::juce_audio_utils
    juce::juce_audio_processors
    juce::juce_audio_devices
    juce::juce_gui_extra
    MM8WorkstationPerformanceHostResources
)

option(MM8_BUILD_TESTS "Build MM8 Workstation Performance Host tests" ON)
if (MM8_BUILD_TESTS)
    enable_testing()
    add_executable(MM8WorkstationPerformanceHostTests
        tests/PresetRulesTests.cpp
        src/presets/PresetRules.cpp
        src/presets/PresetRules.h
    )
    target_link_libraries(MM8WorkstationPerformanceHostTests PRIVATE
        juce::juce_core
    )
    add_test(NAME MM8PresetRulesTests COMMAND MM8WorkstationPerformanceHostTests)

    add_executable(MM8WorkstationPerformanceHostPluginCacheTests
        tests/PluginCacheTests.cpp
        src/plugins/PluginCache.cpp
        src/plugins/PluginCache.h
    )
    target_link_libraries(MM8WorkstationPerformanceHostPluginCacheTests PRIVATE
        juce::juce_core
    )
    add_test(NAME MM8PluginCacheTests COMMAND MM8WorkstationPerformanceHostPluginCacheTests)

    add_executable(MM8WorkstationPerformanceHostPresetIndexTests
        tests/PresetIndexTests.cpp
        src/presets/PresetIndex.cpp
        src/presets/PresetIndex.h
    )
    target_link_libraries(MM8WorkstationPerformanceHostPresetIndexTests PRIVATE
        juce::juce_core
    )
    add_test(NAME MM8PresetIndexTests COMMAND MM8WorkstationPerformanceHostPresetIndexTests)
endif()
