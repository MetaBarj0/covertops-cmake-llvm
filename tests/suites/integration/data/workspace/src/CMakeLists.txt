add_library(Lib STATIC "lib.cpp" "lib.hpp")

set_property(TARGET Lib PROPERTY CXX_STANDARD 20)

include(GenerateExportHeader)

generate_export_header(Lib)

target_include_directories(Lib PUBLIC "${CMAKE_CURRENT_SOURCE_DIR}"
                           "${CMAKE_CURRENT_BINARY_DIR}")
                           
target_compile_options(Lib PRIVATE 
                       -Wall -Wextra -Wconversion -Wsign-conversion)