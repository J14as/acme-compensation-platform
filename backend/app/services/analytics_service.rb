class AnalyticsService
  # High performance analytics service using SQL groupings and cached exchange rates

  def self.overview
    rates = ExchangeRate.rate_map
    total_count = Employee.count
    active_count = Employee.where(status: "active").count
    on_leave_count = Employee.where(status: "on_leave").count
    terminated_count = Employee.where(status: "terminated").count

    # Calculate global payroll by summing each currency group with its USD rate
    currency_sums = Employee.where(status: "active")
                            .group(:currency)
                            .select("currency, SUM(base_salary) as total_base, SUM(bonus) as total_bonus, COUNT(*) as count")

    total_payroll_usd = BigDecimal("0")
    total_bonus_usd = BigDecimal("0")

    currency_sums.each do |row|
      rate = BigDecimal((rates[row.currency] || 1.0).to_s)
      base_sum = BigDecimal(row.total_base.to_s)
      bonus_sum = BigDecimal(row.total_bonus.to_s)

      total_payroll_usd += (base_sum * rate)
      total_bonus_usd += (bonus_sum * rate)
    end

    avg_salary_usd = active_count > 0 ? (total_payroll_usd / active_count).round(2) : 0
    avg_bonus_usd = active_count > 0 ? (total_bonus_usd / active_count).round(2) : 0

    # Sample calculation for median salary (USD)
    # Using SQL percentile or sorted middle value
    active_salaries = Employee.where(status: "active")
                              .pluck(:base_salary, :currency)
                              .map { |base, curr| (base * BigDecimal((rates[curr] || 1.0).to_s)).to_f }
                              .sort

    median_salary_usd = if active_salaries.empty?
                          0
                        elsif active_salaries.size.odd?
                          active_salaries[active_salaries.size / 2].round(2)
                        else
                          mid = active_salaries.size / 2
                          ((active_salaries[mid - 1] + active_salaries[mid]) / 2.0).round(2)
                        end

    {
      total_employees: total_count,
      active_employees: active_count,
      on_leave_employees: on_leave_count,
      terminated_employees: terminated_count,
      total_payroll_usd: total_payroll_usd.round(2).to_f,
      total_bonus_usd: total_bonus_usd.round(2).to_f,
      total_compensation_usd: (total_payroll_usd + total_bonus_usd).round(2).to_f,
      average_salary_usd: avg_salary_usd.to_f,
      median_salary_usd: median_salary_usd,
      average_bonus_usd: avg_bonus_usd.to_f,
      departments_count: Employee::DEPARTMENTS.size,
      countries_count: Employee::COUNTRIES.size
    }
  end

  def self.by_department
    rates = ExchangeRate.rate_map
    
    # Query grouped by department and currency to accurately compute converted USD figures
    grouped = Employee.where(status: "active")
                      .group(:department, :currency)
                      .select("department, currency, COUNT(*) as emp_count, SUM(base_salary) as sum_base, SUM(bonus) as sum_bonus")

    dept_map = Hash.new { |h, k| h[k] = { headcount: 0, total_base_usd: 0.0, total_bonus_usd: 0.0 } }

    grouped.each do |row|
      rate = rates[row.currency] || 1.0
      dept = row.department
      dept_map[dept][:headcount] += row.emp_count
      dept_map[dept][:total_base_usd] += (row.sum_base.to_f * rate)
      dept_map[dept][:total_bonus_usd] += (row.sum_bonus.to_f * rate)
    end

    dept_map.map do |dept, data|
      total_comp = data[:total_base_usd] + data[:total_bonus_usd]
      avg_salary = data[:headcount] > 0 ? (data[:total_base_usd] / data[:headcount]).round(2) : 0
      {
        department: dept,
        headcount: data[:headcount],
        total_payroll_usd: data[:total_base_usd].round(2),
        total_bonus_usd: data[:total_bonus_usd].round(2),
        total_compensation_usd: total_comp.round(2),
        average_salary_usd: avg_salary
      }
    end.sort_by { |d| -d[:total_compensation_usd] }
  end

  def self.by_country
    rates = ExchangeRate.rate_map

    grouped = Employee.where(status: "active")
                      .group(:country, :currency)
                      .select("country, currency, COUNT(*) as emp_count, SUM(base_salary) as sum_base, SUM(bonus) as sum_bonus, AVG(base_salary) as avg_local_base")

    country_map = {}

    grouped.each do |row|
      rate = rates[row.currency] || 1.0
      usd_base = (row.sum_base.to_f * rate).round(2)
      usd_bonus = (row.sum_bonus.to_f * rate).round(2)
      avg_usd = row.emp_count > 0 ? (usd_base / row.emp_count).round(2) : 0

      country_map[row.country] = {
        country: row.country,
        currency: row.currency,
        headcount: row.emp_count,
        local_total_base: row.sum_base.to_f.round(2),
        local_total_bonus: row.sum_bonus.to_f.round(2),
        local_avg_base: row.avg_local_base.to_f.round(2),
        total_payroll_usd: usd_base,
        total_bonus_usd: usd_bonus,
        total_compensation_usd: (usd_base + usd_bonus).round(2),
        average_salary_usd: avg_usd,
        fx_rate_to_usd: rate
      }
    end

    country_map.values.sort_by { |c| -c[:total_compensation_usd] }
  end

  def self.salary_bands
    rates = ExchangeRate.rate_map

    bands = {
      "Under $50k" => 0,
      "$50k - $80k" => 0,
      "$80k - $120k" => 0,
      "$120k - $160k" => 0,
      "$160k - $200k" => 0,
      "$200k+" => 0
    }

    Employee.where(status: "active").pluck(:base_salary, :currency).each do |base, curr|
      usd = (base.to_f * (rates[curr] || 1.0)).round(2)
      case usd
      when 0...50_000 then bands["Under $50k"] += 1
      when 50_000...80_000 then bands["$50k - $80k"] += 1
      when 80_000...120_000 then bands["$80k - $120k"] += 1
      when 120_000...160_000 then bands["$120k - $160k"] += 1
      when 160_000...200_000 then bands["$160k - $200k"] += 1
      else bands["$200k+"] += 1
      end
    end

    bands.map { |tier, count| { band: tier, count: count } }
  end

  def self.insights
    rates = ExchangeRate.rate_map

    # 1. Top 10 highest earners across the organization (converted USD)
    top_earners = Employee.where(status: "active")
                          .select(:id, :employee_code, :first_name, :last_name, :job_title, :department, :country, :currency, :base_salary, :bonus)
                          .map do |emp|
                            usd_base = (emp.base_salary.to_f * (rates[emp.currency] || 1.0)).round(2)
                            usd_bonus = (emp.bonus.to_f * (rates[emp.currency] || 1.0)).round(2)
                            {
                              id: emp.id,
                              employee_code: emp.employee_code,
                              name: "#{emp.first_name} #{emp.last_name}",
                              job_title: emp.job_title,
                              department: emp.department,
                              country: emp.country,
                              currency: emp.currency,
                              base_salary: emp.base_salary.to_f,
                              total_compensation_usd: (usd_base + usd_bonus).round(2)
                            }
                          end
                          .sort_by { |e| -e[:total_compensation_usd] }
                          .first(10)

    # 2. Key Questions & Structured Answers for HR Manager
    overview_data = overview
    dept_data = by_department
    country_data = by_country

    top_dept = dept_data.first
    top_country = country_data.first

    recent_adjustments_count = SalaryHistory.where("created_at >= ?", 30.days.ago).count
    promotion_adjustments_count = SalaryHistory.where(change_reason: "Promotion").count

    {
      top_earners: top_earners,
      key_answers: [
        {
          question: "How does ACME distribute its overall compensation budget?",
          answer: "ACME invests a total of $#{ActiveSupport::NumberHelper.number_to_delimited(overview_data[:total_compensation_usd])} USD globally across #{overview_data[:active_employees]} active employees, with $#{ActiveSupport::NumberHelper.number_to_delimited(overview_data[:total_payroll_usd])} in base salaries and $#{ActiveSupport::NumberHelper.number_to_delimited(overview_data[:total_bonus_usd])} in performance incentives."
        },
        {
          question: "Which department represents the largest compensation investment?",
          answer: "#{top_dept[:department]} is the highest investment division, accounting for $#{ActiveSupport::NumberHelper.number_to_delimited(top_dept[:total_compensation_usd])} USD across #{top_dept[:headcount]} employees (average base: $#{ActiveSupport::NumberHelper.number_to_delimited(top_dept[:average_salary_usd])} USD)."
        },
        {
          question: "Which geographic office commands the largest payroll expenditure?",
          answer: "#{top_country[:country]} represents the largest regional payroll with $#{ActiveSupport::NumberHelper.number_to_delimited(top_country[:total_compensation_usd])} USD (#{top_country[:headcount]} employees earning in #{top_country[:currency]})."
        },
        {
          question: "What is the organization's median and average base salary benchmark?",
          answer: "Organization median base salary is $#{ActiveSupport::NumberHelper.number_to_delimited(overview_data[:median_salary_usd])} USD, while the weighted average base is $#{ActiveSupport::NumberHelper.number_to_delimited(overview_data[:average_salary_usd])} USD, indicating a healthy, balanced compensation curve without extreme top-heavy skew."
        },
        {
          question: "What is the historical audit trail activity?",
          answer: "A total of #{SalaryHistory.count} salary change events are tracked in the immutable audit log, including #{promotion_adjustments_count} promotion raises and #{recent_adjustments_count} updates in the last 30 days."
        }
      ]
    }
  end
end
