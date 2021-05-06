add_library(PartiallyCoveredLib SHARED "partiallyCoveredLib.cpp" "partiallyCoveredLib.hpp")

set_property(TARGET PartiallyCoveredLib PROPERTY CXX_STANDARD 20)

include(GenerateExportHeader)

generate_export_header(PartiallyCoveredLib)

target_include_directories(PartiallyCoveredLib PUBLIC "${CMAKE_CURRENT_SOURCE_DIR}"
                           "${CMAKE_CURRENT_BINARY_DIR}")
                           
target_compile_options(PartiallyCoveredLib PRIVATE 
                       -Wall -Wextra -Wconversion -Wsign-conversion)