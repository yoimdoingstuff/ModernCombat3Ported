cmake_minimum_required(VERSION 3.20)

project(mc3ported
    VERSION 0.1.0
    LANGUAGES C CXX
)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Ensure all binaries output to a consistent bin directory across all platforms and generators
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY_RELEASE ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY_DEBUG ${CMAKE_BINARY_DIR}/bin)

option(MC3_ENABLE_TESTS "Build MC3 Ported tests" ON)
option(MC3_ENABLE_TOOLS "Build MC3 Ported developer tools" ON)
option(MC3_ENABLE_DYNARMIC "Enable the ARMv7 JIT backend" OFF)

# Dynarmic only supports x86_64 host architectures
if(MC3_ENABLE_DYNARMIC)
    if(NOT (CMAKE_SYSTEM_PROCESSOR MATCHES "amd64|x86_64|AMD64" OR CMAKE_HOST_SYSTEM_PROCESSOR MATCHES "amd64|x86_64|AMD64"))
        message(STATUS "Dynarmic JIT disabled: Host (${CMAKE_SYSTEM_PROCESSOR}) is not x86_64. Built-in interpreter will be used.")
        set(MC3_ENABLE_DYNARMIC OFF CACHE BOOL "Enable Dynarmic" FORCE)
    endif()
endif()

function(mc3_set_target_options TARGET_NAME)
    if(MSVC)
        target_compile_options(${TARGET_NAME} PRIVATE /W4)
        target_compile_definitions(${TARGET_NAME} PRIVATE _CRT_SECURE_NO_WARNINGS)
    else()
        target_compile_options(${TARGET_NAME} PRIVATE -Wall -Wextra)
    endif()
endfunction()

add_library(mc3_miniz STATIC
    third_party/miniz/miniz.c
    third_party/miniz/miniz_zip.c
    third_party/miniz/miniz_tdef.c
    third_party/miniz/miniz_tinfl.c
)

target_include_directories(mc3_miniz
    PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}/third_party/miniz
)

if(MC3_ENABLE_DYNARMIC)
    include(cmake/Dependencies.cmake)
endif()

add_library(mc3_runtime
    src/runtime/config.cpp
    src/runtime/apk_archive.cpp
    src/runtime/game_data.cpp
    src/runtime/log.cpp
    src/runtime/arm/arm_runtime.cpp
    src/runtime/arm/guest_cpu.cpp
    src/runtime/arm/jni_bridge.cpp
    src/runtime/arm/android_fs_bridge.cpp
    src/runtime/arm/libc_bridge.cpp
    src/runtime/arm/dlfcn_bridge.cpp
    src/runtime/arm/asset_bridge.cpp
    src/runtime/arm/pthread_bridge.cpp
    src/runtime/net/multiplayer.cpp
    src/runtime/mods/mod_manager.cpp
    src/runtime/platform/sdl_platform.cpp
    src/runtime/input/input_manager.cpp
    src/runtime/audio/audio_engine.cpp
    src/runtime/loader/elf32.cpp
    src/runtime/loader/imports.cpp
    src/runtime/loader/memory.cpp
)

target_include_directories(mc3_runtime
    PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}/include
)

target_link_libraries(mc3_runtime PUBLIC mc3_miniz)
mc3_set_target_options(mc3_runtime)

if(MC3_ENABLE_DYNARMIC)
    target_compile_definitions(mc3_runtime PUBLIC MC3_HAVE_DYNARMIC=1)
    target_link_libraries(mc3_runtime PUBLIC dynarmic)
endif()

add_executable(mc3
    src/main.cpp
)

target_link_libraries(mc3 PRIVATE mc3_runtime)
mc3_set_target_options(mc3)

if(WIN32)
    target_compile_definitions(mc3_runtime PUBLIC MC3_PLATFORM_WINDOWS=1)
endif()

if(MC3_ENABLE_TOOLS)
    add_executable(mc3inspect
        tools/mc3inspect/main.cpp
    )
    target_link_libraries(mc3inspect PRIVATE mc3_runtime)
    mc3_set_target_options(mc3inspect)

    add_executable(mc3builder
        tools/mc3builder/main.cpp
    )
    target_link_libraries(mc3builder PRIVATE mc3_runtime)
    mc3_set_target_options(mc3builder)
endif()

if(MC3_ENABLE_TESTS)
    enable_testing()

    add_executable(mc3_runtime_tests
        tests/runtime_tests.cpp
    )
    target_link_libraries(mc3_runtime_tests PRIVATE mc3_runtime)
    mc3_set_target_options(mc3_runtime_tests)

    add_test(NAME mc3_runtime_tests COMMAND mc3_runtime_tests)
endif()

install(TARGETS mc3 DESTINATION bin)

if(MC3_ENABLE_TOOLS)
    install(TARGETS mc3inspect mc3builder DESTINATION bin)
endif()
