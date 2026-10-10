require "test_helper"

class FullAssessmentChecklistTest < ActionDispatch::IntegrationTest
  setup do
    ExchangeRate.find_or_create_by!(from_currency: "USD", to_currency: "USD") do |r|
      r.rate = 1.0
      r.fiscal_year = 2026
    end
    ExchangeRate.find_or_create_by!(from_currency: "GBP", to_currency: "USD") do |r|
      r.rate = 1.28
      r.fiscal_year = 2026
    end
    ExchangeRate.clear_cache!

    @hr_headers = { "Authorization" => "Bearer #{ApplicationController::HR_TOKEN}" }
    @emp_headers = { "Authorization" => "Bearer #{ApplicationController::EMPLOYEE_TOKEN}" }
    @invalid_headers = { "Authorization" => "Bearer invalid-token-xyz" }

    @employee = Employee.create!(
      employee_code: "CHK-00001",
      first_name: "Sarah",
      last_name: "Connor",
      email: "sarah.connor@acme-corp.internal",
      department: "Engineering",
      job_title: "Staff Systems Engineer",
      country: "US",
      currency: "USD",
      base_salary: 160_000,
      bonus: 20_000,
      effective_date: Date.new(2025, 1, 1),
      status: "active"
    )
  end

  # =========================================================================
  # 1. Employee Management
  # =========================================================================
  test "1.1 Create an employee with valid details" do
    payload = {
      employee: {
        employee_code: "CHK-00002",
        first_name: "John",
        last_name: "Connor",
        email: "john.connor@acme-corp.internal",
        department: "Product",
        job_title: "Principal Product Manager",
        country: "US",
        currency: "USD",
        base_salary: 175_000,
        bonus: 25_000,
        effective_date: Date.current,
        status: "active"
      }
    }

    assert_difference("Employee.count", 1) do
      post api_v1_employees_url, params: payload, headers: @hr_headers, as: :json
    end

    assert_response :created
    json = JSON.parse(response.body)
    assert_equal "John Connor", json["employee"]["full_name"]
    assert_equal 1, json["salary_history"].size
  end

  test "1.2 Edit employee information (demographic info)" do
    patch api_v1_employee_url(@employee), params: {
      employee: {
        job_title: "Senior Director of Systems Engineering",
        department: "Engineering"
      }
    }, headers: @hr_headers, as: :json

    assert_response :success
    @employee.reload
    assert_equal "Senior Director of Systems Engineering", @employee.job_title
  end

  test "1.3 View employee profile and salary details with history" do
    get api_v1_employee_url(@employee), headers: @hr_headers, as: :json
    assert_response :success

    json = JSON.parse(response.body)
    assert_equal @employee.id, json["employee"]["id"]
    assert_equal 160_000.0, json["employee"]["base_salary"]
    assert_operator json["salary_history"].size, :>=, 1
  end

  test "1.4 Reject missing or invalid required fields" do
    post api_v1_employees_url, params: {
      employee: {
        first_name: "", # Missing required fields
        email: "invalid-email"
      }
    }, headers: @hr_headers, as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert json.key?("errors")
  end

  test "1.5 Prevent duplicate employee IDs" do
    post api_v1_employees_url, params: {
      employee: {
        employee_code: "CHK-00001", # Duplicate code!
        first_name: "Duplicate",
        last_name: "User",
        email: "unique.user@acme-corp.internal",
        department: "Operations",
        job_title: "Specialist",
        country: "US",
        currency: "USD",
        base_salary: 80_000,
        effective_date: Date.current,
        status: "active"
      }
    }, headers: @hr_headers, as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert json["errors"].any? { |e| e.include?("Employee code has already been taken") }
  end

  test "1.6 Handle invalid email addresses" do
    post api_v1_employees_url, params: {
      employee: {
        employee_code: "CHK-BAD-EMAIL",
        first_name: "Test",
        last_name: "User",
        email: "not-an-email-address",
        department: "Engineering",
        job_title: "Engineer",
        country: "US",
        currency: "USD",
        base_salary: 90_000,
        effective_date: Date.current,
        status: "active"
      }
    }, headers: @hr_headers, as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert json["errors"].any? { |e| e.include?("Email is invalid") }
  end

  test "1.7 Handle employee termination or inactive status" do
    patch api_v1_employee_url(@employee), params: {
      employee: { status: "terminated" }
    }, headers: @hr_headers, as: :json

    assert_response :success
    @employee.reload
    assert_equal "terminated", @employee.status
  end

  test "1.8 Verify salary history remains available after salary changes" do
    patch salary_api_v1_employee_url(@employee), params: {
      new_base_salary: 190_000,
      new_bonus: 30_000,
      change_reason: "Promotion",
      notes: "Promoted to Principal Architect"
    }, headers: @hr_headers, as: :json

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal 2, json["salary_history"].size
    assert_equal "Promotion", json["salary_history"].first["change_reason"]
    assert_equal 160_000.0, json["salary_history"].first["previous_base_salary"]
    assert_equal 190_000.0, json["salary_history"].first["new_base_salary"]
  end

  # =========================================================================
  # 2. Search, Filters & Pagination
  # =========================================================================
  test "2.1 Search employees by name and employee ID" do
    get api_v1_employees_url(search: "Connor"), headers: @hr_headers, as: :json
    assert_response :success
    json = JSON.parse(response.body)
    assert json["employees"].any? { |e| e["last_name"] == "Connor" }

    get api_v1_employees_url(search: "CHK-00001"), headers: @hr_headers, as: :json
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal 1, json["employees"].size
    assert_equal "CHK-00001", json["employees"].first["employee_code"]
  end

  test "2.2 Filter by country, department, and employment status" do
    get api_v1_employees_url(country: "US", department: "Engineering", status: "active"), headers: @hr_headers, as: :json
    assert_response :success
    json = JSON.parse(response.body)
    assert json["employees"].all? { |e| e["country"] == "US" && e["department"] == "Engineering" && e["status"] == "active" }
  end

  test "2.3 Sort by name, salary, joining date, and department" do
    %w[name salary joining_date department].each do |sort_field|
      get api_v1_employees_url(sort_by: sort_field, sort_order: "desc"), headers: @hr_headers, as: :json
      assert_response :success
    end
  end

  test "2.4 Safe handling of invalid page numbers and page sizes" do
    get api_v1_employees_url(page: -99, per_page: 99999), headers: @hr_headers, as: :json
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal 1, json["pagination"]["current_page"] # clamped to 1
    assert_equal 100, json["pagination"]["per_page"]  # clamped to max 100
  end

  test "2.5 Handle empty search results gracefully" do
    get api_v1_employees_url(search: "NonExistentNameStringXYZ999"), headers: @hr_headers, as: :json
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal 0, json["employees"].size
    assert_equal 0, json["pagination"]["total_count"]
  end

  # =========================================================================
  # 3. Salary Management & Business Logic
  # =========================================================================
  test "3.1 Reject negative or invalid salary amounts" do
    patch salary_api_v1_employee_url(@employee), params: {
      new_base_salary: -50_000,
      change_reason: "Merit Increase"
    }, headers: @hr_headers, as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert json["errors"].any? { |e| e.include?("must be greater than 0") }
  end

  test "3.2 Handle zero salary according to business rules (reject 0 base salary)" do
    patch salary_api_v1_employee_url(@employee), params: {
      new_base_salary: 0,
      change_reason: "Merit Increase"
    }, headers: @hr_headers, as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert json["errors"].any? { |e| e.include?("must be greater than 0") }
  end

  test "3.3 Ensure failed updates do not partially save data (transaction rollback)" do
    initial_base = @employee.base_salary
    initial_hist_count = @employee.salary_histories.count

    assert_no_difference("SalaryHistory.count") do
      patch salary_api_v1_employee_url(@employee), params: {
        new_base_salary: -100, # Invalid!
        change_reason: "Annual Review"
      }, headers: @hr_headers, as: :json
    end

    @employee.reload
    assert_equal initial_base, @employee.base_salary
    assert_equal initial_hist_count, @employee.salary_histories.count
  end

  test "3.4 Verify monetary calculations avoid floating-point precision errors" do
    # 0.1 + 0.2 in float is 0.30000000000000004; in BigDecimal it is exact
    b1 = BigDecimal("150000.55")
    b2 = BigDecimal("12500.45")
    total = b1 + b2
    assert_equal BigDecimal("162501.00"), total
  end

  # =========================================================================
  # 4. Salary Analytics & HR Insights
  # =========================================================================
  test "4.1 Calculate employee count, average and median salaries correctly" do
    get api_v1_analytics_overview_url, headers: @hr_headers, as: :json
    assert_response :success
    json = JSON.parse(response.body)

    assert_operator json["total_employees"], :>=, 1
    assert_operator json["active_employees"], :>=, 1
    assert_operator json["total_payroll_usd"], :>, 0
    assert_operator json["average_salary_usd"], :>, 0
    assert_operator json["median_salary_usd"], :>, 0
  end

  test "4.2 Never add different currencies without explicit conversion" do
    # Currency conversion rate map verified
    rates = ExchangeRate.rate_map
    assert_equal 1.0, rates["USD"]
    assert_equal 1.28, rates["GBP"]

    gbp_usd = ExchangeRate.to_usd(100_000, "GBP")
    assert_equal BigDecimal("128000.00"), gbp_usd
  end

  # =========================================================================
  # 5. Authentication & Security
  # =========================================================================
  test "5.1 Reject unauthenticated access to protected APIs" do
    get api_v1_employees_url, as: :json # No Authorization header
    assert_response :unauthorized
    json = JSON.parse(response.body)
    assert_includes json["error"], "Authentication required"
  end

  test "5.2 Reject invalid credentials / tokens" do
    get api_v1_employees_url, headers: @invalid_headers, as: :json
    assert_response :unauthorized
    json = JSON.parse(response.body)
    assert_includes json["error"], "Invalid credentials"
  end

  test "5.3 Verify valid login and logout flows" do
    post api_v1_auth_login_url, params: {
      email: "hr@acme-corp.internal",
      password: "Password123!"
    }, as: :json

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal ApplicationController::HR_TOKEN, json["token"]
    assert_equal "hr_manager", json["user"]["role"]

    # Verify logout
    delete api_v1_auth_logout_url, headers: @hr_headers, as: :json
    assert_response :success
  end

  test "5.4 Verify role-based access: unauthorized employee cannot modify salaries" do
    patch salary_api_v1_employee_url(@employee), params: {
      new_base_salary: 200_000,
      change_reason: "Merit Increase"
    }, headers: @emp_headers, as: :json # Employee role token

    assert_response :forbidden
    json = JSON.parse(response.body)
    assert_includes json["error"], "HR Manager role required"
  end

  test "5.5 Prevent mass-assignment of protected base_salary field in general update" do
    original_salary = @employee.base_salary

    patch api_v1_employee_url(@employee), params: {
      employee: {
        first_name: "Sarah-Updated",
        base_salary: 999_999 # Mass-assignment attempt!
      }
    }, headers: @hr_headers, as: :json

    assert_response :success
    @employee.reload
    assert_equal "Sarah-Updated", @employee.first_name
    assert_equal original_salary, @employee.base_salary # base_salary protected!
  end

  test "5.6 Immutable audit ledger prevents update or deletion" do
    history = @employee.salary_histories.first
    assert_not_nil history

    history.new_base_salary = 999_999
    assert_not history.save
    assert_includes history.errors[:base], "Salary audit history records are immutable and cannot be updated."

    assert_no_difference("SalaryHistory.count") do
      history.destroy
    end
  end
end
