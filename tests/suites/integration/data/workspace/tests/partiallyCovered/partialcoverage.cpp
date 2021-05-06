#define CATCH_CONFIG_MAIN

#include <catch2/catch.hpp>

#include "partiallyCoveredLib.hpp"

TEST_CASE("A test that tests almost nothing") {
  const partially_covered_lib::my_fancy_lib lib;
  const auto *const p_lib = &lib;

  REQUIRE(&lib == p_lib);
}