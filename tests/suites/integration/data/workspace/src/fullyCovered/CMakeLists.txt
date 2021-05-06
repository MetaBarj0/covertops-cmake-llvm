add_library(FullyCoveredLib SHARED "fullyCoveredLib.cpp" "fullyCoveredLib.hpp")

set_property(TARGET FullyCoveredLib PROPERTY CXX_STANDARD 20)

include(GenerateExportHeader)

generate_export_header(FullyCoveredLib)

target_include_directories(FullyCoveredLib PUBLIC "${CMAKE_CURRENT_SOURCE_DIR}"
                           "${CMAKE_CURRENT_BINARY_DIR}")
                           
target_compile_options(FullyCoveredLib PRIVATE 
                       -Wall -Wextra -Wconversion -Wsign-conversion)