require "test_helper"

class Api::V1::AnalyticsControllerTest < ActionDispatch::IntegrationTest
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

    @headers = { "Authorization" => "Bearer #{ApplicationController::HR_TOKEN}" }

    Employee.create!(
      employee_code: "ANALYTICS-01",
      first_name: "Bruce",
      last_name: "Wayne",
      email: "bruce.wayne@acme-corp.internal",
      department: "Finance & Legal",
      job_title: "Finance Director",
      country: "US",
      currency: "USD",
      base_salary: 200_000,
      bonus: 30_000,
      effective_date: Date.current,
      status: "active"
    )

    Employee.create!(
      employee_code: "ANALYTICS-02",
      first_name: "Alfred",
      last_name: "Pennyworth",
      email: "alfred.pennyworth@acme-corp.internal",
      department: "Operations",
      job_title: "VP of Operations",
      country: "GB",
      currency: "GBP",
      base_salary: 100_000,
      bonus: 10_000,
      effective_date: Date.current,
      status: "active"
    )
  end

  test "GET /api/v1/analytics/overview returns aggregate KPIs" do
    get api_v1_analytics_overview_url, headers: @headers, as: :json
    assert_response :success

    json = JSON.parse(response.body)
    assert json["total_employees"] >= 2
    assert json["active_employees"] >= 2
    assert_operator json["total_payroll_usd"], :>, 0
    assert_operator json["average_salary_usd"], :>, 0
  end

  test "GET /api/v1/analytics/by_department returns department breakdowns" do
    get api_v1_analytics_by_department_url, headers: @headers, as: :json
    assert_response :success

    json = JSON.parse(response.body)
    assert json.is_a?(Array)
    dept_names = json.map { |d| d["department"] }
    assert_includes dept_names, "Finance & Legal"
    assert_includes dept_names, "Operations"
  end

  test "GET /api/v1/analytics/by_country returns converted regional summaries" do
    get api_v1_analytics_by_country_url, headers: @headers, as: :json
    assert_response :success

    json = JSON.parse(response.body)
    assert json.is_a?(Array)
    countries = json.map { |c| c["country"] }
    assert_includes countries, "US"
    assert_includes countries, "GB"
  end

  test "GET /api/v1/analytics/salary_bands returns distribution tiers" do
    get api_v1_analytics_salary_bands_url, headers: @headers, as: :json
    assert_response :success

    json = JSON.parse(response.body)
    assert json.is_a?(Array)
    tier_names = json.map { |b| b["band"] }
    assert_includes tier_names, "$200k+"
  end

  test "GET /api/v1/analytics/insights returns executive questions and top earners" do
    get api_v1_analytics_insights_url, headers: @headers, as: :json
    assert_response :success

    json = JSON.parse(response.body)
    assert json.key?("top_earners")
    assert json.key?("key_answers")
    assert_operator json["top_earners"].size, :>, 0
    assert_operator json["key_answers"].size, :>, 0
  end
end
