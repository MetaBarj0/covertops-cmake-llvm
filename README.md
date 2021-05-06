# cmake-llvm-coverage

Visual code coverage indicators for source code files of a Cmake project
using Llvm capabilities.

This extension will show all regions of code that are not covered for the
currently edited source code file.

The primary purpose of this extension is to help the developer to ensure
she/he is following the Test Driven Development discipline correctly by
reporting any region of the code that is not covered by a test.

`Insert gif here`

## Features

Easily accessible from the editor title menu : get coverage info with one
click!

`insert image here`

Shows both summary information with coverage percentage and precise uncovered
region of code for the current source code file.

`insert image here`

## Requirement

This extension utilize source based coverage feature of Llvm and cmake
capabilities. You will need :

- A recent version of cmake installed on your system
- The Llvm toolchain version greater or equal to 10

### Note for Visual Studio 2019 users on Windows

You can install a recent version of the Llvm toolchain with the visual studio
installer. As well, you can install a recent version of CMake directly from
the Visual Studio 2019 installer program.

## Recommended extensions

Following are extensions that are complementary to this one. You may use them
immoderatly to get proficient with C++ and Visual Studio Code.

- C/C++ (ms-vscode.cpptools)
- Clangd (llvm-vs-code-extensions.vscode-clangd)
- CMake (twxs.cmake)
- CMake Tools (ms-vscode.cmake-tools)

## Extension settings

The behavior of this extension can be set thanks to the following settings:

- `cmake-llvm-coverage.cmakeCommand`: The command to invoke cmake. May be an
absolute path on the file system or just `cmake` if this latter is in your
`$PATH` environment variable.
- `cmake-llvm-coverage.buildTreeDirectory`: The build tree root directory of
your cmake project, relative to your workspace directory. This directory must
exist, thus, ensure you generated your cmake project beforehand.
- `cmake-llvm-coverage.cmakeTarget`: The target that generates coverage
information in a json format file. This file may be generated in the build
directory specified in the `cmake-llvm-coverage.buildTreeDirectory` setting.
The specified target must exist.
- `cmake-llvm-coverage.coverageInfoFileName`: The name of the json file
containing coverage information. This file will be searched within the
`buildTreeDirectory` hierarchy. This file must be unique.
- `cmake-llvm-coverage.additionalCmakeOptions`: Additional options to pass to
`cmake`, for instance, variable definitions indicating which compiler to use,
preprocessor defines, the generator, etc.

## Default color

One can customize the background color for the decoration associated to an
uncovered region of code. Check the
`cmakeLlvmCoverage.uncoveredCodeRegionBackground` color when editing
`workbench: colorCustomization` in your settings.json file. The default
value is `#FF0055` for all dark, light or high contrast themes.

## Designing simple code coverage targets with cmake

Following is a small guide on how to design code coverage target for cmake
that are useable with this extension. This target rely on 2 distinct
projects:

- A static library project named whose the target name is `Lib`
- A test project whose the target name is `Tests`

The coverage reporting target is named `generateCoverageInfoJsonFile`.

**To verify**: This target may be added in its very own sub directory and used
from a main CMakeLists.txt file.

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
  # specific flags to build the covered project. Enable source based Coverage
  # see:
  # https://releases.llvm.org/10.0.0/tools/clang/docs/SourceBasedCodeCoverage.html
  target_compile_options(Lib PRIVATE
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
  add_custom_target(generateCoverageInfoJsonFile
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
```

## Known Issues

This extension has just been released. Issues are expected, please report
them in its repository.

## Release Notes

Details are in the CHANGELOG.md file
