# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_10_10_191745) do
  create_table "employees", force: :cascade do |t|
    t.string "employee_code", null: false
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "email", null: false
    t.string "department", null: false
    t.string "job_title", null: false
    t.string "country", null: false
    t.string "currency", limit: 3, null: false
    t.decimal "base_salary", precision: 14, scale: 2, null: false
    t.decimal "bonus", precision: 14, scale: 2, default: "0.0", null: false
    t.date "effective_date", null: false
    t.string "status", default: "active", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["country"], name: "index_employees_on_country"
    t.index ["currency"], name: "index_employees_on_currency"
    t.index ["department", "country", "status"], name: "index_employees_on_department_and_country_and_status"
    t.index ["department"], name: "index_employees_on_department"
    t.index ["email"], name: "index_employees_on_email", unique: true
    t.index ["employee_code"], name: "index_employees_on_employee_code", unique: true
    t.index ["last_name", "first_name"], name: "index_employees_on_last_name_and_first_name"
    t.index ["status"], name: "index_employees_on_status"
  end

  create_table "exchange_rates", force: :cascade do |t|
    t.string "from_currency", limit: 3, null: false
    t.string "to_currency", limit: 3, default: "USD", null: false
    t.decimal "rate", precision: 12, scale: 6, null: false
    t.integer "fiscal_year", default: 2026, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["from_currency", "to_currency"], name: "index_exchange_rates_on_from_currency_and_to_currency", unique: true
  end

  create_table "salary_histories", force: :cascade do |t|
    t.integer "employee_id", null: false
    t.decimal "previous_base_salary", precision: 14, scale: 2
    t.decimal "new_base_salary", precision: 14, scale: 2, null: false
    t.decimal "previous_bonus", precision: 14, scale: 2
    t.decimal "new_bonus", precision: 14, scale: 2, null: false
    t.string "currency", limit: 3, null: false
    t.string "change_reason", null: false
    t.text "notes"
    t.date "effective_date", null: false
    t.string "created_by", default: "HR Manager", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["change_reason"], name: "index_salary_histories_on_change_reason"
    t.index ["effective_date"], name: "index_salary_histories_on_effective_date"
    t.index ["employee_id"], name: "index_salary_histories_on_employee_id"
  end

  add_foreign_key "salary_histories", "employees"
end
