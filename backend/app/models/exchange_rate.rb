class ExchangeRate < ApplicationRecord
  VALID_CURRENCIES = %w[USD EUR GBP INR CAD SGD AUD].freeze

  validates :from_currency, presence: true, inclusion: { in: VALID_CURRENCIES }
  validates :to_currency, presence: true, inclusion: { in: VALID_CURRENCIES }
  validates :rate, presence: true, numericality: { greater_than: 0 }
  validates :fiscal_year, presence: true, numericality: { only_integer: true }
  validates :from_currency, uniqueness: { scope: [:to_currency, :fiscal_year] }

  # Corporate Planning Benchmark Rates (Fallback cache)
  DEFAULT_USD_RATES = {
    "USD" => 1.0,
    "EUR" => 1.09,
    "GBP" => 1.28,
    "INR" => 0.012,
    "CAD" => 0.74,
    "SGD" => 0.75,
    "AUD" => 0.66
  }.freeze

  def self.rate_map
    @rate_map ||= begin
      rates = where(to_currency: "USD").pluck(:from_currency, :rate).to_h
      DEFAULT_USD_RATES.merge(rates.transform_values(&:to_f))
    end
  end

  def self.clear_cache!
    @rate_map = nil
  end

  def self.to_usd(amount, from_curr)
    return BigDecimal("0") if amount.blank? || amount.to_f.zero?
    return BigDecimal(amount.to_s) if from_curr == "USD"

    r = rate_map[from_curr.to_s.upcase] || DEFAULT_USD_RATES[from_curr.to_s.upcase] || 1.0
    (BigDecimal(amount.to_s) * BigDecimal(r.to_s)).round(2)
  end
end
