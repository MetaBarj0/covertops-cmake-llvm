namespace lib {
class my_fancy_lib {
public:
  my_fancy_lib() noexcept;

  int fancy_api_method() const noexcept;

private:
  int field_{};
};
} // namespace lib