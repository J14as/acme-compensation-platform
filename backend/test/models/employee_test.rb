require "test_helper"

class EmployeeTest < ActiveSupport::TestCase
  test "validates required fields and salary numericality" do
    emp = Employee.new(
      employee_code: "EMP-X",
      first_name: "Jane",
      last_name: "Doe",
      email: "invalid-email",
      department: "InvalidDept",
      country: "ZZ",
      currency: "XYZ",
      base_salary: -500,
      status: "unknown"
    )

    assert_not emp.valid?
    assert_includes emp.errors[:email], "is invalid"
    assert_includes emp.errors[:department], "is not included in the list"
    assert_includes emp.errors[:country], "is not included in the list"
    assert_includes emp.errors[:currency], "is not included in the list"
    assert_includes emp.errors[:base_salary], "must be greater than 0"
    assert_includes emp.errors[:status], "is not included in the list"
  end

  test "automatically creates initial salary history on creation" do
    emp = Employee.create!(
      employee_code: "EMP-AUTO-01",
      first_name: "John",
      last_name: "Smith",
      email: "john.auto@acme-corp.internal",
      department: "Engineering",
      job_title: "Fullstack Engineer",
      country: "US",
      currency: "USD",
      base_salary: 110_000,
      bonus: 10_000,
      effective_date: Date.current,
      status: "active"
    )

    assert_equal 1, emp.salary_histories.count
    history = emp.salary_histories.first
    assert_equal "Starting Salary", history.change_reason
    assert_equal 110_000.0, history.new_base_salary.to_f
    assert_nil history.previous_base_salary
  end

  test "update_salary! transaction updates employee and appends to salary history" do
    emp = Employee.create!(
      employee_code: "EMP-UPDATE-01",
      first_name: "Sarah",
      last_name: "Connor",
      email: "sarah.connor@acme-corp.internal",
      department: "Engineering",
      job_title: "Lead Architect",
      country: "US",
      currency: "USD",
      base_salary: 150_000,
      bonus: 15_000,
      effective_date: Date.new(2025, 1, 1),
      status: "active"
    )

    new_effective_date = Date.new(2026, 1, 1)
    emp.update_salary!(
      new_base_salary: 175_000,
      new_bonus: 25_000,
      change_reason: "Promotion",
      effective_date: new_effective_date,
      notes: "Promoted to Principal Architect",
      changed_by: "VP of People"
    )

    emp.reload
    assert_equal 175_000.0, emp.base_salary.to_f
    assert_equal 25_000.0, emp.bonus.to_f
    assert_equal new_effective_date, emp.effective_date
    assert_equal 2, emp.salary_histories.count

    latest_history = emp.salary_histories.first
    assert_equal 150_000.0, latest_history.previous_base_salary.to_f
    assert_equal 175_000.0, latest_history.new_base_salary.to_f
    assert_equal "Promotion", latest_history.change_reason
    assert_equal "VP of People", latest_history.created_by
  end

  test "update_salary! rolls back transaction if validation fails" do
    emp = Employee.create!(
      employee_code: "EMP-FAIL-01",
      first_name: "Kyle",
      last_name: "Reese",
      email: "kyle.reese@acme-corp.internal",
      department: "Operations",
      job_title: "Operations Lead",
      country: "US",
      currency: "USD",
      base_salary: 90_000,
      bonus: 5_000,
      effective_date: Date.current,
      status: "active"
    )

    assert_raises(ActiveRecord::RecordInvalid) do
      emp.update_salary!(
        new_base_salary: -1000, # Invalid negative salary
        new_bonus: 2_000,
        change_reason: "Merit Increase",
        effective_date: Date.current
      )
    end

    emp.reload
    assert_equal 90_000.0, emp.base_salary.to_f
    assert_equal 1, emp.salary_histories.count
  end
end
