cmake_minimum_required(VERSION 3.21)

project(MM8XPSPerformanceManager VERSION 0.2.0)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Set JUCE path via -DJUCE_DIR=... when configuring.
if (NOT JUCE_DIR)
    message(FATAL_ERROR "JUCE_DIR is not set. Configure with -DJUCE_DIR=path/to/JUCE")
endif()

add_subdirectory(${JUCE_DIR} juce)

juce_add_gui_app(MM8XPSPerformanceManagerApp
    PRODUCT_NAME "MM8-XPS Performance Manager"
    COMPANY_NAME "MM8 Tools"
)

juce_generate_juce_header(MM8XPSPerformanceManagerApp)

set(APP_SOURCES
    Source/Main.cpp
    Source/MainComponent.cpp
    Source/MainComponent.h
    Source/Ui/LookAndFeel.cpp
    Source/Ui/LookAndFeel.h
    Source/Ui/PartsGrid.cpp
    Source/Ui/PartsGrid.h
    Source/Engine/FactoryBank.cpp
    Source/Engine/FactoryBank.h
    Source/Engine/AppConfig.cpp
    Source/Engine/AppConfig.h
    Source/Engine/MidiScheduler.cpp
    Source/Engine/MidiScheduler.h
    Source/Engine/PerformanceEngine.cpp
    Source/Engine/PerformanceEngine.h
    Source/Engine/PerformanceTypes.h
    Source/Engine/PluginScanner.cpp
    Source/Engine/PluginScanner.h
    Source/Engine/PerformanceStore.cpp
    Source/Engine/PerformanceStore.h
)

source_group(TREE ${CMAKE_CURRENT_SOURCE_DIR} FILES ${APP_SOURCES})

target_sources(MM8XPSPerformanceManagerApp PRIVATE ${APP_SOURCES})

juce_add_binary_data(MM8XPSPerformanceManagerResources
    SOURCES
        Resources/mm8-placeholder.txt
        Resources/mm8-factory-order.json
)

set(PLUGIN_FORMATS VST3)
if (JUCE_VST2_SDK_PATH)
    list(APPEND PLUGIN_FORMATS VST)
endif()

juce_add_plugin_client(MM8PluginClient) # Enables AudioPluginFormatManager VST3/VST2 in the app.

target_compile_definitions(MM8XPSPerformanceManagerApp PRIVATE
    JUCE_DISPLAY_SPLASH_SCREEN=0
    JUCE_USE_CURL=0
    JUCE_WEB_BROWSER=0
)

target_link_libraries(MM8XPSPerformanceManagerApp PRIVATE
    juce::juce_audio_utils
    juce::juce_audio_processors
    juce::juce_audio_devices
    juce::juce_gui_extra
    MM8XPSPerformanceManagerResources
)
