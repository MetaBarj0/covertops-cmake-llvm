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

add_executable(Tests "nocoverage.cpp")

set_property(TARGET Tests PROPERTY CXX_STANDARD 20)

target_link_libraries(Tests PRIVATE Lib PRIVATE Catch2::Catch2)
target_compile_options(Tests PRIVATE
                       -Wall -Wextra -Wconversion -Wsign-conversion)

include(Catch)
catch_discover_tests(Tests)

if(${ENABLE_COVERAGE_WITH_LLVM})
  # specific flags to build the covered project. Enable source based Coverage
  # see:
  # https://releases.llvm.org/10.0.0/tools/clang/docs/SourceBasedCodeCoverage.html
  target_compile_options(Lib PRIVATE
                         -fprofile-instr-generate -fcoverage-mapping)
  target_link_options(Lib PRIVATE
                      -fprofile-instr-generate -fcoverage-mapping)
  target_compile_options(Tests PRIVATE
                         -fprofile-instr-generate -fcoverage-mapping)
  target_link_options(Tests PRIVATE
                      -fprofile-instr-generate -fcoverage-mapping)

  # Useful variables used later, specific to llvm tools path and output
  # directory
  get_filename_component(llvmBinPath ${CMAKE_CXX_COMPILER} DIRECTORY)
  set(llvmProfData ${llvmBinPath}/llvm-profdata)
  set(llvmCov ${llvmBinPath}/llvm-cov)
  get_target_property(testsBinaryDir Tests BINARY_DIR)

  # An internal custom command used as dependency of exposed targets to
  # generate coverage data
  add_custom_command(OUTPUT default.profdata
                     DEPENDS .testSuite.executed
                     COMMAND ${llvmProfData} merge -sparse
                       ${testsBinaryDir}/default.profraw -o
                       ${testsBinaryDir}/default.profdata)

  # An internal command used as dependency for exposed targets. Ensures that
  # the test suite has been executed with latest modifications and latest
  # coverage data.
  add_custom_command(OUTPUT .testSuite.executed
                     DEPENDS Lib Tests
                     COMMAND $<TARGET_FILE:Tests>
                     COMMAND ${CMAKE_COMMAND}
                     ARGS -E touch .testSuite.executed)

  # A target to generate detailed coverage information in json format. To get
  # help on how to exploit it, see:
  # https://stackoverflow.com/questions/56013927/how-to-read-llvm-cov-json-format
  # https://llvm.org/doxygen/structllvm_1_1coverage_1_1CoverageSegment.html
  # https://llvm.org/doxygen/structllvm_1_1coverage_1_1CounterMappingRegion.html
  add_custom_target(reportCoverageDetails
                    DEPENDS default.covdata.json)

  # An internal command used to generate detailed coverage information in a
  # file
  add_custom_command(OUTPUT default.covdata.json
                     DEPENDS default.profdata
                     COMMAND ${llvmCov} export --format=text
                       $<TARGET_FILE:Tests>
                       --instr-profile=${testsBinaryDir}/default.profdata
                       > ${testsBinaryDir}/default.covdata.json
                       VERBATIM)
endif()
