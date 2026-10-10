require "test_helper"

class Api::V1::EmployeesControllerTest < ActionDispatch::IntegrationTest
  setup do
    ExchangeRate.find_or_create_by!(from_currency: "USD", to_currency: "USD") do |r|
      r.rate = 1.0
      r.fiscal_year = 2026
    end
    ExchangeRate.clear_cache!

    @employee = Employee.create!(
      employee_code: "CTRL-TEST-01",
      first_name: "Morgan",
      last_name: "Freeman",
      email: "morgan.freeman@acme-corp.internal",
      department: "Marketing",
      job_title: "Brand Marketing Director",
      country: "US",
      currency: "USD",
      base_salary: 135_000,
      bonus: 15_000,
      effective_date: Date.current,
      status: "active"
    )
  end

  test "GET /api/v1/employees returns paginated list with filter options" do
    get api_v1_employees_url, as: :json
    assert_response :success

    json = JSON.parse(response.body)
    assert json.key?("employees")
    assert json.key?("pagination")
    assert json.key?("filters")
    assert_operator json["employees"].size, :>, 0
  end

  test "GET /api/v1/employees filters by search query" do
    get api_v1_employees_url(search: "Morgan"), as: :json
    assert_response :success

    json = JSON.parse(response.body)
    assert_equal 1, json["employees"].size
    assert_equal "CTRL-TEST-01", json["employees"].first["employee_code"]
  end

  test "GET /api/v1/employees/:id returns employee and full salary history" do
    get api_v1_employee_url(@employee), as: :json
    assert_response :success

    json = JSON.parse(response.body)
    assert_equal @employee.id, json["employee"]["id"]
    assert_equal "Morgan Freeman", json["employee"]["full_name"]
    assert_equal 1, json["salary_history"].size
    assert_equal "Starting Salary", json["salary_history"].first["change_reason"]
  end

  test "POST /api/v1/employees creates a new employee" do
    payload = {
      employee: {
        employee_code: "CTRL-TEST-NEW",
        first_name: "Grace",
        last_name: "Hopper",
        email: "grace.hopper@acme-corp.internal",
        department: "Engineering",
        job_title: "Principal Architect",
        country: "US",
        currency: "USD",
        base_salary: 190_000,
        bonus: 25_000,
        effective_date: Date.current,
        status: "active"
      }
    }

    assert_difference("Employee.count", 1) do
      post api_v1_employees_url, params: payload, as: :json
    end

    assert_response :created
    json = JSON.parse(response.body)
    assert_equal "Grace Hopper", json["employee"]["full_name"]
    assert_equal 1, json["salary_history"].size
  end

  test "PATCH /api/v1/employees/:id/salary updates salary and adds audit history" do
    patch salary_api_v1_employee_url(@employee), params: {
      new_base_salary: 155_000,
      new_bonus: 20_000,
      change_reason: "Annual Review",
      notes: "Exceptional marketing campaign metrics."
    }, as: :json

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal 155_000.0, json["employee"]["base_salary"]
    assert_equal 2, json["salary_history"].size
    assert_equal "Annual Review", json["salary_history"].first["change_reason"]
  end

  test "PATCH /api/v1/employees/:id/salary validates input params" do
    patch salary_api_v1_employee_url(@employee), params: {
      new_base_salary: nil,
      change_reason: ""
    }, as: :json

    assert_response :bad_request
  end
end
