Include(FetchContent)

FetchContent_Declare(
  Catch2
  GIT_REPOSITORY https://github.com/catchorg/Catch2.git
  GIT_TAG        v2.13.5)

FetchContent_MakeAvailable(Catch2)

set(CATCH2_MODULE_PATH ${catch2_SOURCE_DIR}/contrib/
  CACHE INTERNAL
  "Path to downloaded Catch2 modules"
  FORCE)

list(APPEND CMAKE_MODULE_PATH ${CATCH2_MODULE_PATH})

add_executable(PartiallyCoveredTests "partialcoverage.cpp")

set_property(TARGET PartiallyCoveredTests PROPERTY CXX_STANDARD 20)

target_compile_options(PartiallyCoveredTests PRIVATE
                       -Wall -Wextra -Wconversion -Wsign-conversion)
target_link_libraries(PartiallyCoveredTests PRIVATE PartiallyCoveredLib PRIVATE Catch2::Catch2)

include(Catch)
catch_discover_tests(PartiallyCoveredTests)
