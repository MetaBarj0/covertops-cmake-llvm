#include "fullycoveredlib_export.h"
namespace fully_covered_lib {
class FULLYCOVEREDLIB_EXPORT my_sleek_lib {
public:
  my_sleek_lib() noexcept;

  my_sleek_lib &operator=(my_sleek_lib const &) = delete;
  my_sleek_lib &operator=(my_sleek_lib &&) = delete;

  int sleek_api_method() const noexcept;

private:
  int field_{};
};
} // namespace fully_covered_lib