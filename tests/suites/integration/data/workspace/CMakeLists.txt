cmake_minimum_required (VERSION 3.18)

project ("example project leveraging llvm source based coverage" LANGUAGES CXX VERSION 0.1.0)

subdirs("src" "tests")

include(CTest)

if((${CMAKE_CXX_COMPILER_ID} STREQUAL "Clang"))
  if((${CMAKE_CXX_COMPILER_VERSION} VERSION_EQUAL 11) OR
     (${CMAKE_CXX_COMPILER_VERSION} VERSION_GREATER 11))
      set(EXPOSE_COVERAGE_TARGET TRUE CACHE BOOL
        "A 'coverage' target will be created and can be used to create a `coverage.json` file containing coverage information in the build tree directory.")
  endif()
endif()

subdirs("coverage")