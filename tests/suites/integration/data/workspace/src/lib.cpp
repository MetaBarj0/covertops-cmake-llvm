// https://clang.llvm.org/docs/SourceBasedCodeCoverage.html#id10
extern "C" int __llvm_profile_runtime;

#include "lib.hpp"

namespace lib {
my_fancy_lib::my_fancy_lib() noexcept : field_{42} {}

int my_fancy_lib::fancy_api_method() const noexcept { return field_; }
} // namespace lib