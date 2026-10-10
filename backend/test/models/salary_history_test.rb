require "test_helper"

class SalaryHistoryTest < ActiveSupport::TestCase
  setup do
    @employee = Employee.create!(
      employee_code: "TEST-HIST-001",
      first_name: "Alice",
      last_name: "Smith",
      email: "alice.smith@acme-corp.internal",
      department: "Engineering",
      job_title: "Senior Backend Engineer",
      country: "US",
      currency: "USD",
      base_salary: 120_000,
      bonus: 10_000,
      effective_date: Date.current,
      status: "active"
    )
  end

  test "enforces audit log immutability against updates" do
    history = @employee.salary_histories.first
    assert_not_nil history

    history.new_base_salary = 150_000
    assert_not history.save
    assert_includes history.errors[:base], "Salary audit history records are immutable and cannot be updated."
  end

  test "enforces audit log immutability against deletion" do
    history = @employee.salary_histories.first
    assert_not_nil history

    assert_no_difference "SalaryHistory.count" do
      history.destroy
    end
    assert_includes history.errors[:base], "Salary audit history records cannot be deleted."
  end
end
