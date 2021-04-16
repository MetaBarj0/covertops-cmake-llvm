#define CATCH_CONFIG_MAIN

#include <catch2/catch.hpp>

#include "lib.hpp"

// https://clang.llvm.org/docs/SourceBasedCodeCoverage.html#id10
extern "C" {
void __llvm_profile_initialize_file(void);
int __llvm_profile_write_file(void);
}

TEST_CASE("Initializing coverage information file") {
  __llvm_profile_initialize_file();
}

TEST_CASE("A test that tests almost nothing") {
  const lib::my_fancy_lib lib;
  const auto *const p_lib = &lib;

  REQUIRE(&lib == p_lib);
}

TEST_CASE("Writing coverage information file") { __llvm_profile_write_file(); }