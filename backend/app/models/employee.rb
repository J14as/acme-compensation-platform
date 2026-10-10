class Employee < ApplicationRecord
  has_many :salary_histories, -> { order(effective_date: :desc, id: :desc) }, dependent: :destroy

  DEPARTMENTS = [
    "Engineering",
    "Product",
    "Design",
    "Sales",
    "Marketing",
    "Customer Success",
    "HR & People",
    "Finance & Legal",
    "Operations"
  ].freeze

  COUNTRIES = %w[US GB IN DE CA SG AU].freeze

  COUNTRY_CURRENCY_MAP = {
    "US" => "USD",
    "GB" => "GBP",
    "IN" => "INR",
    "DE" => "EUR",
    "CA" => "CAD",
    "SG" => "SGD",
    "AU" => "AUD"
  }.freeze

  STATUSES = %w[active on_leave terminated].freeze

  validates :employee_code, presence: true, uniqueness: { case_sensitive: false }
  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :email, presence: true, uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :department, presence: true, inclusion: { in: DEPARTMENTS }
  validates :job_title, presence: true
  validates :country, presence: true, inclusion: { in: COUNTRIES }
  validates :currency, presence: true, inclusion: { in: ExchangeRate::VALID_CURRENCIES }
  validates :base_salary, presence: true, numericality: { greater_than: 0 }
  validates :bonus, numericality: { greater_than_or_equal_to: 0 }
  validates :effective_date, presence: true
  validates :status, presence: true, inclusion: { in: STATUSES }

  # Scopes for performant querying over 10,000 records
  scope :active_only, -> { where(status: "active") }
  scope :by_department, ->(dept) { where(department: dept) if dept.present? }
  scope :by_country, ->(cntry) { where(country: cntry) if cntry.present? }
  scope :by_currency, ->(curr) { where(currency: curr) if curr.present? }
  scope :by_status, ->(stat) { where(status: stat) if stat.present? }
  scope :search_query, ->(query) {
    if query.present?
      q = "%#{query.strip.downcase}%"
      where(
        "LOWER(first_name) LIKE ? OR LOWER(last_name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(employee_code) LIKE ? OR LOWER(job_title) LIKE ?",
        q, q, q, q, q
      )
    end
  }

  def full_name
    "#{first_name} #{last_name}".strip
  end

  def total_compensation
    (base_salary || 0) + (bonus || 0)
  end

  def base_salary_usd
    ExchangeRate.to_usd(base_salary, currency)
  end

  def total_compensation_usd
    ExchangeRate.to_usd(total_compensation, currency)
  end

  # Atomic, transactional salary adjustment with audit log creation
  def update_salary!(new_base_salary:, new_bonus: nil, change_reason:, effective_date:, notes: nil, changed_by: "HR Manager")
    bonus_value = new_bonus.presence || bonus || 0

    transaction do
      prev_base = base_salary
      prev_bonus = bonus

      # Build and validate audit history
      salary_histories.create!(
        previous_base_salary: prev_base,
        new_base_salary: new_base_salary,
        previous_bonus: prev_bonus,
        new_bonus: bonus_value,
        currency: currency,
        change_reason: change_reason,
        notes: notes,
        effective_date: effective_date,
        created_by: changed_by
      )

      # Update current employee record
      update!(
        base_salary: new_base_salary,
        bonus: bonus_value,
        effective_date: effective_date
      )
    end
  end

  # Log initial salary history upon creation if not already present
  after_create :ensure_initial_salary_history, unless: -> { salary_histories.any? }

  private

  def ensure_initial_salary_history
    salary_histories.create!(
      previous_base_salary: nil,
      new_base_salary: base_salary,
      previous_bonus: nil,
      new_bonus: bonus || 0,
      currency: currency,
      change_reason: "Starting Salary",
      notes: "Initial employee onboarding compensation record",
      effective_date: effective_date,
      created_by: "System / Onboarding"
    )
  end
end
