#include "partiallycoveredlib_export.h"
namespace partially_covered_lib {
class PARTIALLYCOVEREDLIB_EXPORT my_fancy_lib {
public:
  my_fancy_lib() noexcept;

  int fancy_api_method() const noexcept;

private:
  int field_{};
};
} // namespace partially_covered_lib