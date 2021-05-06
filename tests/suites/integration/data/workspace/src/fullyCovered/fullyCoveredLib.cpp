#include "fullyCoveredLib.hpp"

namespace fully_covered_lib {
my_sleek_lib::my_sleek_lib() noexcept : field_{42} {}

int my_sleek_lib::sleek_api_method() const noexcept { return field_; }
} // namespace fully_covered_lib