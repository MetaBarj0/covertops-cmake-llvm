cmake_minimum_required (VERSION 3.18)

project ("lib" LANGUAGES CXX VERSION 0.1.0)

if((${CMAKE_CXX_COMPILER_ID} STREQUAL "Clang"))
  if((${CMAKE_CXX_COMPILER_VERSION} VERSION_EQUAL 10) OR
     (${CMAKE_CXX_COMPILER_VERSION} VERSION_GREATER 10))
      set(ENABLE_COVERAGE_WITH_LLVM TRUE CACHE BOOL
        "Enable testing coverage with Llvm compiler infrastructure")
    endif()
endif()

subdirs("src" "tests")

include(CTest)