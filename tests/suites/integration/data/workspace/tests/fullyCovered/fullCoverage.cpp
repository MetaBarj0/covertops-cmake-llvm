#define CATCH_CONFIG_MAIN

#include <catch2/catch.hpp>

#include "fullyCoveredLib.hpp"

TEST_CASE("A test that tests nothing") {
  fully_covered_lib::my_sleek_lib lib;

  REQUIRE(lib.sleek_api_method() == 42);
}