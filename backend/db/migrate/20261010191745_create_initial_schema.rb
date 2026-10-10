class CreateInitialSchema < ActiveRecord::Migration[8.1]
  def change
    create_table :exchange_rates do |t|
      t.string :from_currency, null: false, limit: 3
      t.string :to_currency, null: false, default: "USD", limit: 3
      t.decimal :rate, precision: 12, scale: 6, null: false
      t.integer :fiscal_year, default: 2026, null: false

      t.timestamps
    end
    add_index :exchange_rates, [:from_currency, :to_currency], unique: true

    create_table :employees do |t|
      t.string :employee_code, null: false
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :email, null: false
      t.string :department, null: false
      t.string :job_title, null: false
      t.string :country, null: false
      t.string :currency, null: false, limit: 3
      t.decimal :base_salary, precision: 14, scale: 2, null: false
      t.decimal :bonus, precision: 14, scale: 2, default: 0.0, null: false
      t.date :effective_date, null: false
      t.string :status, default: "active", null: false

      t.timestamps
    end

    add_index :employees, :employee_code, unique: true
    add_index :employees, :email, unique: true
    add_index :employees, :department
    add_index :employees, :country
    add_index :employees, :currency
    add_index :employees, :status
    add_index :employees, [:department, :country, :status]
    add_index :employees, [:last_name, :first_name]

    create_table :salary_histories do |t|
      t.references :employee, null: false, foreign_key: true, index: true
      t.decimal :previous_base_salary, precision: 14, scale: 2
      t.decimal :new_base_salary, precision: 14, scale: 2, null: false
      t.decimal :previous_bonus, precision: 14, scale: 2
      t.decimal :new_bonus, precision: 14, scale: 2, null: false
      t.string :currency, null: false, limit: 3
      t.string :change_reason, null: false
      t.text :notes
      t.date :effective_date, null: false
      t.string :created_by, default: "HR Manager", null: false

      t.timestamps
    end

    add_index :salary_histories, :change_reason
    add_index :salary_histories, :effective_date
  end
end
