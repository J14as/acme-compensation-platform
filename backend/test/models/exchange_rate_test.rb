require "test_helper"

class ExchangeRateTest < ActiveSupport::TestCase
  setup do
    ExchangeRate.clear_cache!
  end

  test "validates required attributes and positive rate" do
    rate = ExchangeRate.new(from_currency: "GBP", to_currency: "USD", rate: -1.0, fiscal_year: 2026)
    assert_not rate.valid?
    assert_includes rate.errors[:rate], "must be greater than 0"

    rate.rate = 1.28
    assert rate.valid?
  end

  test "converts currencies to USD correctly using rate map" do
    ExchangeRate.find_or_create_by!(from_currency: "GBP", to_currency: "USD") do |r|
      r.rate = 1.28
      r.fiscal_year = 2026
    end
    ExchangeRate.clear_cache!

    usd_amount = ExchangeRate.to_usd(1000, "GBP")
    assert_equal BigDecimal("1280.0"), usd_amount

    # Identity conversion for USD
    assert_equal BigDecimal("500.0"), ExchangeRate.to_usd(500, "USD")
  end
end
