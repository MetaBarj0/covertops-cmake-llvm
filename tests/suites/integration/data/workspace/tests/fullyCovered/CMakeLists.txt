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

add_executable(FullyCoveredTests "fullCoverage.cpp")

set_property(TARGET FullyCoveredTests PROPERTY CXX_STANDARD 20)

target_compile_options(FullyCoveredTests PRIVATE
                       -Wall -Wextra -Wconversion -Wsign-conversion)
target_link_libraries(FullyCoveredTests PRIVATE FullyCoveredLib PRIVATE Catch2::Catch2)

include(Catch)
catch_discover_tests(FullyCoveredTests)
