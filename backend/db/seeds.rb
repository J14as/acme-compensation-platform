# Deterministic Seeding Script for 10,000 Employees across 7 Countries
# Fixed seed ensures 100% reproducible test data without any external dependencies.

puts "== Starting Seed Process =="
start_time = Process.clock_gettime(Process::CLOCK_MONOTONIC)

# Clear existing records
SalaryHistory.delete_all
Employee.delete_all
ExchangeRate.delete_all

# 1. Seed Corporate Planning Exchange Rates
puts "Seeding Exchange Rates..."
exchange_rates_data = [
  { from_currency: "USD", to_currency: "USD", rate: 1.000000, fiscal_year: 2026 },
  { from_currency: "EUR", to_currency: "USD", rate: 1.090000, fiscal_year: 2026 },
  { from_currency: "GBP", to_currency: "USD", rate: 1.280000, fiscal_year: 2026 },
  { from_currency: "INR", to_currency: "USD", rate: 0.012000, fiscal_year: 2026 },
  { from_currency: "CAD", to_currency: "USD", rate: 0.740000, fiscal_year: 2026 },
  { from_currency: "SGD", to_currency: "USD", rate: 0.750000, fiscal_year: 2026 },
  { from_currency: "AUD", to_currency: "USD", rate: 0.660000, fiscal_year: 2026 }
]
now = Time.current
ExchangeRate.insert_all(exchange_rates_data.map { |r| r.merge(created_at: now, updated_at: now) })
ExchangeRate.clear_cache!

# 2. Reference Catalogs
FIRST_NAMES = %w[
  James Mary John Patricia Robert Jennifer Michael Linda William Elizabeth
  David Barbara Richard Susan Joseph Jessica Thomas Sarah Charles Karen
  Christopher Nancy Daniel Lisa Matthew Betty Anthony Margaret Mark Sandra
  Aarav Priya Rohan Ananya Vikram Neha Rajesh Kavita Amit Pooja
  Suresh Sneha Arjun Divya Rahul Shreya Sanjay Deepa Manoj Ritu
  Liam Emma Noah Olivia Oliver Ava Lucas Sophia Leo Isabella
  Mateo Mia Max Charlotte Felix Amelie Hugo Zoe Julian Chloe
  Chen Wei Mei Jun Lin Yan Tao Jing Bo Feng
  Hans Stefan Petra Klaus Monika Wolfgang Ursula Jurgen Brigitte Dieter
  Oliver Charlotte Jack Amelia Harry Isla George Mia Noah Grace
].freeze

LAST_NAMES = %w[
  Smith Johnson Williams Brown Jones Garcia Miller Davis Rodriguez Martinez
  Hernandez Lopez Gonzalez Wilson Anderson Thomas Taylor Moore Jackson Martin
  Sharma Patel Kumar Singh Gupta Verma Rao Joshi Reddy Mehta
  Nair Chopra Das Malhotra Kapoor Bhatia Sengupta Bhattacharya Chatterjee Jain
  Mueller Schmidt Schneider Fischer Weber Meyer Wagner Becker Schulz Hoffmann
  Davies Evans Taylor Thomas Roberts Walker Wright Robinson Thompson White
  Tremblay Roy Gagnon Bouchard Gauthier Morin Lavoie Fortin Gagnon Ouellet
  Tan Lim Lee Ng Ong Goh Koh Low Sim Teo
].freeze

DEPARTMENTS_CONFIG = {
  "Engineering" => [
    "Staff Software Engineer", "Senior Backend Engineer", "Senior Frontend Engineer",
    "Fullstack Engineer", "DevOps Engineer", "QA Automation Engineer",
    "Engineering Manager", "Data Engineer", "Security Engineer", "Principal Architect"
  ],
  "Product" => [
    "Lead Product Manager", "Senior Technical Product Manager", "Product Owner",
    "Associate Product Manager", "Director of Product"
  ],
  "Design" => [
    "Lead UX Designer", "Product Designer", "UI/UX Specialist",
    "Design Systems Lead", "User Researcher"
  ],
  "Sales" => [
    "Enterprise Account Executive", "Sales Development Representative",
    "Strategic Account Director", "Sales Operations Analyst", "VP of Global Sales"
  ],
  "Marketing" => [
    "Growth Marketing Manager", "Content Strategist", "Performance Marketing Specialist",
    "Brand Marketing Director", "Lifecycle Marketing Specialist"
  ],
  "Customer Success" => [
    "Customer Success Manager", "Technical Account Manager",
    "Implementation Consultant", "Support Operations Lead", "Director of CS"
  ],
  "HR & People" => [
    "Senior People Partner", "Talent Acquisition Specialist", "Compensation & Benefits Analyst",
    "People Operations Coordinator", "Head of People Operations"
  ],
  "Finance & Legal" => [
    "Senior Financial Analyst", "Corporate Controller", "Billing Specialist",
    "Legal Counsel", "Finance Director"
  ],
  "Operations" => [
    "Business Operations Manager", "Procurement Specialist", "IT Support Specialist",
    "Workplace Experience Lead", "VP of Operations"
  ]
}.freeze

COUNTRY_SPECS = [
  { code: "US", currency: "USD", weight: 35, base_min: 75_000, base_max: 230_000, bonus_pct_min: 0.05, bonus_pct_max: 0.25 },
  { code: "IN", currency: "INR", weight: 25, base_min: 1_200_000, base_max: 5_200_000, bonus_pct_min: 0.08, bonus_pct_max: 0.25 },
  { code: "GB", currency: "GBP", weight: 12, base_min: 45_000, base_max: 135_000, bonus_pct_min: 0.05, bonus_pct_max: 0.20 },
  { code: "DE", currency: "EUR", weight: 12, base_min: 52_000, base_max: 145_000, bonus_pct_min: 0.05, bonus_pct_max: 0.20 },
  { code: "CA", currency: "CAD", weight: 8, base_min: 68_000, base_max: 180_000, bonus_pct_min: 0.05, bonus_pct_max: 0.20 },
  { code: "SG", currency: "SGD", weight: 4, base_min: 68_000, base_max: 200_000, bonus_pct_min: 0.05, bonus_pct_max: 0.20 },
  { code: "AU", currency: "AUD", weight: 4, base_min: 78_000, base_max: 210_000, bonus_pct_min: 0.05, bonus_pct_max: 0.20 }
].freeze

# Weighted lookup table for country distribution
WEIGHTED_COUNTRIES = COUNTRY_SPECS.flat_map { |spec| [spec] * spec[:weight] }.freeze
DEPARTMENTS_LIST = DEPARTMENTS_CONFIG.keys.freeze

# Deterministic Pseudo-Random Generator (Seed: 42)
rng = Random.new(42)

TOTAL_EMPLOYEES = 10_000
CHUNK_SIZE = 1_000

puts "Generating #{TOTAL_EMPLOYEES} deterministic employee records..."

employees_data = []
all_inserted_employees = []
base_date = Date.new(2023, 1, 15)

1.upto(TOTAL_EMPLOYEES) do |i|
  code = format("ACM-%05d", i)
  fname = FIRST_NAMES[rng.rand(FIRST_NAMES.size)]
  lname = LAST_NAMES[rng.rand(LAST_NAMES.size)]
  dept = DEPARTMENTS_LIST[rng.rand(DEPARTMENTS_LIST.size)]
  titles = DEPARTMENTS_CONFIG[dept]
  title = titles[rng.rand(titles.size)]

  spec = WEIGHTED_COUNTRIES[rng.rand(WEIGHTED_COUNTRIES.size)]
  country = spec[:code]
  currency = spec[:currency]

  # Base salary stepped by 500 or 10,000 for realistic figures
  step = currency == "INR" ? 25_000 : 1_000
  raw_base = rng.rand(spec[:base_min]..spec[:base_max])
  base_salary = (raw_base / step * step).round(2)

  bonus_rate = rng.rand(spec[:bonus_pct_min]..spec[:bonus_pct_max])
  bonus = ((base_salary * bonus_rate) / 100).round * 100.0

  # Email sanitized and guaranteed unique by appending index
  email_name = "#{fname}.#{lname}#{i}".downcase.gsub(/[^a-z0-9]/, "")
  email = "#{email_name}@acme-corp.internal"

  # Status distribution: 92% active, 5% on_leave, 3% terminated
  status_rand = rng.rand(100)
  status = if status_rand < 92
             "active"
           elsif status_rand < 97
             "on_leave"
           else
             "terminated"
           end

  days_offset = rng.rand(0..1100)
  effective_date = base_date + days_offset.days

  employees_data << {
    employee_code: code,
    first_name: fname,
    last_name: lname,
    email: email,
    department: dept,
    job_title: title,
    country: country,
    currency: currency,
    base_salary: base_salary,
    bonus: bonus,
    effective_date: effective_date,
    status: status,
    created_at: now,
    updated_at: now
  }
end

# Insert employees in batches
puts "Inserting employees into SQLite database..."
employees_data.each_slice(CHUNK_SIZE).with_index do |slice, idx|
  Employee.insert_all(slice)
  print "."
end
puts "\nDone inserting employees."

# Build initial salary history records directly
puts "Seeding Initial Salary Histories..."
# Fetch generated ids and necessary attributes
employee_records = Employee.pluck(:id, :base_salary, :bonus, :currency, :effective_date)
initial_histories = employee_records.map do |emp_id, base, bon, curr, eff_date|
  {
    employee_id: emp_id,
    previous_base_salary: nil,
    new_base_salary: base,
    previous_bonus: nil,
    new_bonus: bon,
    currency: curr,
    change_reason: "Starting Salary",
    notes: "Initial onboarding compensation record",
    effective_date: eff_date,
    created_by: "System / Onboarding",
    created_at: now - 30.days,
    updated_at: now - 30.days
  }
end

initial_histories.each_slice(CHUNK_SIZE) do |slice|
  SalaryHistory.insert_all(slice)
  print "."
end
puts "\nDone seeding initial salary histories."

# 3. Add Promotion / Annual Review adjustments for a subset (e.g., 2,500 employees)
puts "Seeding historical salary promotion events..."
additional_histories = []
sample_ids = employee_records.sample(2500, random: rng)

sample_ids.each do |emp_id, curr_base, curr_bonus, curr, eff_date|
  # Pretend current base was from a promotion
  h_reason = ["Annual Review", "Promotion", "Market Adjustment", "Merit Increase"].sample(random: rng)
  prev_base = (curr_base * BigDecimal("0.88")).round(2)
  prev_bonus = (curr_bonus * BigDecimal("0.85")).round(2)
  h_date = eff_date - rng.rand(180..365).days

  additional_histories << {
    employee_id: emp_id,
    previous_base_salary: prev_base,
    new_base_salary: curr_base,
    previous_bonus: prev_bonus,
    new_bonus: curr_bonus,
    currency: curr,
    change_reason: h_reason,
    notes: "Performance rating: Exceeds Expectations. Approved by HR Committee.",
    effective_date: eff_date,
    created_by: "HR Compensation Board",
    created_at: now,
    updated_at: now
  }
end

additional_histories.each_slice(CHUNK_SIZE) do |slice|
  SalaryHistory.insert_all(slice)
  print "."
end

end_time = Process.clock_gettime(Process::CLOCK_MONOTONIC)
elapsed = (end_time - start_time).round(2)

total_emp = Employee.count
total_hist = SalaryHistory.count
total_rates = ExchangeRate.count

puts "\n=========================================="
puts "Seed Complete in #{elapsed}s!"
puts "Total Employees: #{total_emp}"
puts "Total Salary Histories: #{total_hist}"
puts "Total Exchange Rates: #{total_rates}"
puts "=========================================="
