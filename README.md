# cpp-llvm-coverage

Visual code coverage indicators for C++ files using Llvm and cmake
capabilities.

This extension will show all regions of code that are not covered for the
currently edited C++ file.

`Insert gif here`

## Features

Easily accessible from the editor title menu : get coverage info with one
click!

`insert image here`

Shows both summary information with coverage percentage and precise uncovered
region of code for the current c++ file

`insert image here`

## Requirement

This extension utilize source based coverage feature of Llvm and cmake
capabilities. You will need :

- A recent version of cmake installed on your system
- The Llvm toolchain version greater or equal to 10

### Note for Visual Studio 2019 users on Windows

You can install the Llvm toolchain version 10 with the visual studio
installer.
As well, you can install a recent version of CMake directly from the Visual
Studio 2019 installer program.

## Recommended extensions

Following are extensions that are complementary to this one. You may use them
immoderatly to get proficient with C++ and Visual Studio Code.

- C/C++ (ms-vscode.cpptools)
- Clangd (llvm-vs-code-extensions.vscode-clangd)
- CMake (twxs.cmake)
- CMake Tools (ms-vscode.cmake-tools)

## Extension settings

The behavior of this extension can be set thanks to the following configuration switches:

- `cpp-llvm-coverage.cmakeCommand`: The command to invoke cmake. May be an
absolute path on the file system or just `cmake` if this latter is in your
`$PATH` environment variable.
- `cpp-llvm-coverage.buildTreeDirectory`: The build tree root directory of
your cmake project, relative to your workspace directory.
- `cpp-llvm-coverage.cmakeTarget`: The target that generates coverage
information in json format files. Those files may be generated in the build
directory specified in the `cpp-llvm-coverage.buildTreeDirectory` setting.
The specified target must exist.
- `cpp-llvm-coverage.coverageInfoFileNamePatterns`: Regular expression
patterns to use in order to find coverage information files from the build
tree root directory. At least one file name is expected to be resolved using
specified patterns.

## Designing simple code coverage targets with cmake

Following is a small guide on how to design code coverage target for cmake
that are useable with this extension. This guide is extracted from the
<https://gitlab.com/troctsch.cpp/adventofcode> repository.

### Conditional coverage

First, it is advisable to create a cmake cache variable to conditionally
enable or disable coverage reporting targets. In your root `CMakeLists.txt`
file at the root of your project, add the following section :

```cmake
if((${CMAKE_CXX_COMPILER_ID} STREQUAL "Clang"))
  if((${CMAKE_CXX_COMPILER_VERSION} VERSION_EQUAL 10) OR
     (${CMAKE_CXX_COMPILER_VERSION} VERSION_GREATER 10))
      set(ENABLE_COVERAGE_WITH_LLVM TRUE CACHE BOOL
          "Enable testing coverage  Llvm tools")
    endif()
endif()
```

Once the cache variable is defined, you can at ease enable or disable the
code instrumentation aiming to provide coverage reports by modifying the
value stored in the `ENABLE_COVERAGE_WITH_LLVM` cache variable.

### Test suite coverage target

Given a test suite sub directory, one way to proceed is to create a special
target aiming to generate precise coverage information in a json file :

```cmake
# given conditional coverage reporting is enabled
if(${ENABLE_COVERAGE_WITH_LLVM})
  # specific flags to build the covered project (here AdventOfCode). Enable
  # source based Coverage see:
  # https://releases.llvm.org/10.0.0/tools/clang/docs/SourceBasedCodeCoverage.html
  target_compile_options(AdventOfCode PRIVATE
                         -fprofile-instr-generate -fcoverage-mapping)

  # Useful variables used later, specific to llvm tools path and output
  # directory (here, it is the output directory of the Tests target)
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
                     DEPENDS AdventOfCode Tests
                     COMMAND $<TARGET_FILE:Tests>
                     COMMAND ${CMAKE_COMMAND}
                     ARGS -E touch .testSuite.executed)

  # A target to generate detailed coverage information in json format. This is
  # a target needed by the extension which will utilize the produced
  # default.covdata.json output file. To get help on how to exploit it, see:
  # https://stackoverflow.com/questions/56013927/how-to-read-llvm-cov-json-format
  # https://llvm.org/doxygen/structllvm_1_1coverage_1_1CoverageSegment.html
  # https://llvm.org/doxygen/structllvm_1_1coverage_1_1CounterMappingRegion.html
  add_custom_target(reportCoverageDetails
                    DEPENDS default.covdata.json)

  # An internal command used to generate detailed coverage information in a
  # file. This command is also mandatory as it is responsible to create the
  # json file containing coverage info.
  add_custom_command(OUTPUT default.covdata.json
                     DEPENDS default.profdata
                     COMMAND ${llvmCov} export --format=text
                       $<TARGET_FILE:Tests>
                       --instr-profile=${testsBinaryDir}/default.profdata
                       > ${testsBinaryDir}/default.covdata.json
                       VERBATIM)

  # following section shows some useful targets and commands that are not
  # mandatory for the extension to work.

  # A target to generate a coverage summary. It will be output to the standard
  # output (OPTIONAL: This one is not strictly required for the extension to
  # work)
  add_custom_target(reportCoverageSummary
                    DEPENDS default.profdata
                    COMMAND ${llvmCov} report $<TARGET_FILE:Tests>
                      -instr-profile=${testsBinaryDir}/default.profdata)

  # A post build internal command executed each time the reportCoverageDetails
  # target is executed and reporting where is located the file containing
  # detailled coverage information. Not strictly necessary for the extension
  # but convenient.
  add_custom_command(TARGET reportCoverageDetails
                     POST_BUILD
                     COMMAND ${CMAKE_COMMAND}
                       -E echo "Coverage data generated"
                               "in ${testsBinaryDir}/default.covdata.json")
endif()
```

## Known Issues

This extension has just been released. Issues are expected, please report
them in its repository.

## Release Notes

Details are in the CHANGELOG.md file
