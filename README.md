# Covert Ops (with cmake and llvm flavour)

![Continuous integration](https://github.com/metabarj0/covertops-cmake-llvm/actions/workflows/cicd.yml/badge.svg)

Get a precise report of uncovered regions of your code handled by cmake and
using a recent version of the llvm toolchain as easy as **hello world!**

This extension is pretty simple in its essence. It gives the ability to display
precisely locations in your production code that are not covered by at least one
test.

To get this report, open a vscode window on a file that is actually handled by a
build system generator (here `cmake`) and hit the button at the top right corner
of the editor window.

The primary purpose of this extension is to help the developer to ensure
she/he is following the Test Driven Development discipline correctly by
reporting any region of the code that is not covered by a test.

It's designed to be run very frequently (each tests run), to get quick and
precise feedback on code coverage.

<img src="https://github.com/MetaBarj0/covertops-cmake-llvm/raw/master/images/full-demo.gif" alt="full demo gif">

## Features

Easily accessible from the editor title menu : get coverage info with one
click!

<img src="https://github.com/MetaBarj0/covertops-cmake-llvm/raw/master/images/one-menu.png" alt="one menu png">

Shows both summary information with coverage percentage for the currently edited
file (in the output window) and precise uncovered regions of code reporting for
the current source code file in a read-only editor window.

<img src="https://github.com/MetaBarj0/covertops-cmake-llvm/raw/master/images/settings.png" alt="settings png">

Great flexibility in its configuration, allowing you to override any setting to
be perfectly suitable to your development environment.

## Requirement

This extension utilizes source based coverage feature of the Llvm and cmake
capabilities. You will need :

- A recent version of cmake installed on your system
- A recent version of the Ninja build system
- The Llvm toolchain version greater or equal to 11, 12 is fully supported too

*Note*: Moreover, this first release need an existing target that creates coverage
information in a json file. You'll find below a detailled how-to to help you in
creating such a target.

Future iterations may provide a wizard to help you configure the coverage target
creation in a fluent manner. Multi root workspace support has also been thinking
about (planned for a future iteration)

### Note for Visual Studio users on Windows

You can install a recent version of the Llvm toolchain with the visual studio
installer. As well, you can install a recent version of CMake directly from
the Visual Studio 2019 installer program.
You can also safely use the Visual Studio 2022 Preview version, actually, the
extension is developped and tested with this version.

## Recommended extensions

Following are extensions that are complementary to this one. You may use them
immoderatly to get proficient with C++ and Visual Studio Code.

- C/C++ (ms-vscode.cpptools)
- Clangd (llvm-vs-code-extensions.vscode-clangd)
- CMake (twxs.cmake)
- CMake Tools (ms-vscode.cmake-tools)

## Extension settings

The behavior of this extension can be set thanks to the following settings:

- `covertops-cmake-llvm.cmakeCommand`: The command to invoke the build system
generator (cmake). May be an absolute path on the file system or just `cmake` if
this latter is in your `$PATH` environment variable.
- `covertops-cmake-llvm.buildTreeDirectory`: The build tree root directory of your
project, relative to your workspace directory. Designed to be the target of the
output of the build system generator.
- `covertops-cmake-llvm.cmakeTarget`: The target that generates coverage information
in a json format file. This file may be generated in the build directory
specified in the `Build Tree Directory` setting. The specified target must
exist. It may actually have to be created by your hand intially (guide to
achieve that is below)
- `covertops-cmake-llvm.coverageInfoFileName`: The name of the json file containing
coverage information. This file will be searched within the `buildTreeDirectory`
hierarchy. This file must exist and be unique.
- `covertops-cmake-llvm.additionalCmakeOptions`: Additional options to pass to build
system generator (cmake), for instance, variable definitions indicating which
compiler / generator to use, preprocessor defines, etc.

## Default colors

One can customize the background color for the decoration associated to an
uncovered region of code. Check the `covCmakeLlvm.uncoveredCodeRegionBackground`
color when editing `workbench: colorCustomization` in your settings.json file.
The default values are `#ff7a7a7f`, `#ff00007f` and `#ff0000` for dark, light
or high contrast themes, respectively.
When it turns out that coverage information decorations are outdated, the color
specified by `covCmakeLlvm.outdatedUncoveredCodeRegionBackground`. Default
values for outdated uncovered code regions colors are `#7f7f7fff`, `#7f7f7fff`
and `#0000ff` for dark, light or high contrast themes, respectively.

## Designing a simple code coverage target with cmake

Following is a small guide on how to design code coverage target for cmake
that are useable with this extension.
The output of this guide is a fully functional `coverage` target that will
produce a `coverage.json` file within your build tree directory ready to be
processed by this extension.

### A sample project

Considering a project organized as following:

``` txt
<project root directory>
|
`-src/
| |
| `-lib.cpp
| `-lib.hpp
| `-CMakeLists.txt
`-tests/
| `-lib.cpp
| `-CMakeLists.txt
`-CMakeLists.txt
```

This template exposes:

- a `src` directory, containing all the production code built with the `Lib` target.
- a `tests` directory containing one suite of tests designed to cover code in
  the `src` directory. This test project is built with the `Tests` target.

At the end of this guide, you should have such a directory structure:

``` txt
<project root directory>
|
`-coverage/
| |
| `-CMakeLists.txt
`-src/
| |
| `-lib.cpp
| `-lib.hpp
| `-CMakeLists.txt
`-tests/
| `-lib.cpp
| `-CMakeLists.txt
`-CMakeLists.txt
```

*Note* You can see the apparition of the `coverage` sub directory.

### First step: Edit your root CMakeLists.txt file

Quite easy; the purpose is to ensure that a recent `llvm` toolchain is usable on
your system. The nature of the modification is appending the following code in
your root `CMakeLists.txt` file:

```cmake
if((${CMAKE_CXX_COMPILER_ID} STREQUAL "Clang"))
  if((${CMAKE_CXX_COMPILER_VERSION} VERSION_EQUAL 11) OR
     (${CMAKE_CXX_COMPILER_VERSION} VERSION_GREATER 11))
      set(EXPOSE_COVERAGE_TARGET TRUE CACHE BOOL
        "A 'coverage' target will be created and can be used to create a `coverage.json` file containing coverage information in the build tree directory.")
  endif()
endif()

subdirs("coverage")
```

### Second step: The `coverage` sub-directory

The purpose is to create this sub-directory that will contain a single
`CMakeLists.txt` file. This file will expose a `coverage` target responsible for
generating a `coverage.json` file, that will contain all coverage information
for your code that is covered by one or several suites of tests (or not, though
it's not the point of this extension :) ).

Following is the content to put within the `CMakeLists.txt` file specifically
suited for this project template. By your side, you may have to modify this
content, depending on the structure, the complexity and various other factors of
your project but it should be quite simple as you'll see:

```cmake
if(${EXPOSE_COVERAGE_TARGET})
  # specific flags to build the covered project. Enable source based Coverage
  # see:
  # https://releases.llvm.org/11.0.0/tools/clang/docs/SourceBasedCodeCoverage.html
  target_compile_options(Lib PRIVATE
                         -fprofile-instr-generate -fcoverage-mapping)
  target_link_options(Lib PRIVATE
                      -fprofile-instr-generate -fcoverage-mapping)

  # Useful variables used later, specific to llvm tools path and output
  # directory
  get_filename_component(llvmBinPath ${CMAKE_CXX_COMPILER} DIRECTORY)
  set(llvmProfData ${llvmBinPath}/llvm-profdata)
  set(llvmCov ${llvmBinPath}/llvm-cov)

  # An internal custom command used as dependency of exposed targets to
  # generate coverage data
  add_custom_command(OUTPUT default.profdata
                     DEPENDS .testSuites.executed
                     COMMAND ${llvmProfData}
                       ARGS merge 
                       -sparse
                       $<TARGET_NAME_IF_EXISTS:Tests>.profraw
                       -o default.profdata)

  # An internal command used as dependency for exposed targets. Ensures that
  # test suites have been executed with latest modifications and latest
  # coverage data.
  add_custom_command(OUTPUT .testSuites.executed
                     DEPENDS
                       Lib Tests
                     COMMAND ${CMAKE_COMMAND}
                       ARGS -E copy $<TARGET_FILE:Lib> $<TARGET_FILE_DIR:Tests>
                     COMMAND $<TARGET_FILE:Tests>
                     COMMAND ${CMAKE_COMMAND}
                       ARGS -E rename default.profraw $<TARGET_NAME_IF_EXISTS:Tests>.profraw
                     COMMAND ${CMAKE_COMMAND}
                       ARGS -E touch .testSuites.executed
                     VERBATIM
                     USES_TERMINAL)

  # A target to generate detailed coverage information in json format. To get
  # a grab on ow it is structured, see:
  # https://stackoverflow.com/questions/56013927/how-to-read-llvm-cov-json-format
  # https://llvm.org/doxygen/structllvm_1_1coverage_1_1CoverageSegment.html
  # https://llvm.org/doxygen/structllvm_1_1coverage_1_1CounterMappingRegion.html
  # https://github.com/llvm/llvm-project/blob/aa4e6a609acdd00e06b54f525054bd5cf3624f0f/llvm/tools/llvm-cov/CoverageExporterJson.cpp#L15
  add_custom_target(coverage
                    DEPENDS coverage.json)

  # An internal command used to generate detailed coverage information in a
  # file
  add_custom_command(OUTPUT coverage.json
                     DEPENDS default.profdata
                     COMMAND ${llvmCov}
                       ARGS export --format=text
                       --object=$<TARGET_FILE:Lib>
                       --instr-profile=default.profdata
                       > coverage.json
                     VERBATIM
                     USES_TERMINAL)
endif()
```

The main thing to notice here is how are used both `Lib` and `Tests` targets.

If you want to see a more elaborate though simple example, you can take a look
in the integration test suite data of this extension in
`tests/suites/integration/data/workspace` folder. In summary, there are 2 shared
libraries (the production code) and 2 suites of tests demonstrating the creation
of a single file containing all coverage information the extension need to
report.

*Reminder*: It is scheduled in a future iteration to expose a wizard for the
`coverage` target creation task.

## Known Issues

There is an unexpected behavior regarding the display of outdated decorations
when you re-compute coverage info: fresh and outdated decorations stack until
you close the editor and ask again for coverage info for the file.

## Contribution guideline and design information

First and foremost, feel free to fork the repository by your side.
That being said the philosophy of this extension is pretty simple and can be
summarized as :

- one click and easy to use once initialized
- use it often to get fast feedback
- help you to keep track on the way of TDD

Contributing would be awesome. The code base has been developing using the ATDD
methodology. It makes it easy to test at all layers (from unit to integration
passing through acceptance tests), to read, understand and maintain.

## Release Notes

Details are in the CHANGELOG.md file
