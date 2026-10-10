class SalaryHistory < ApplicationRecord
  belongs_to :employee

  CHANGE_REASONS = [
    "Starting Salary",
    "Annual Review",
    "Promotion",
    "Market Adjustment",
    "Equity Correction",
    "Merit Increase"
  ].freeze

  validates :new_base_salary, presence: true, numericality: { greater_than: 0 }
  validates :new_bonus, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :currency, presence: true, inclusion: { in: ExchangeRate::VALID_CURRENCIES }
  validates :change_reason, presence: true, inclusion: { in: CHANGE_REASONS }
  validates :effective_date, presence: true
  validates :created_by, presence: true

  # Immutability guarantees: Audit logs cannot be mutated or deleted
  before_update :prevent_update
  before_destroy :prevent_destroy

  private

  def prevent_update
    errors.add(:base, "Salary audit history records are immutable and cannot be updated.")
    throw(:abort)
  end

  def prevent_destroy
    errors.add(:base, "Salary audit history records cannot be deleted.")
    throw(:abort)
  end
end
