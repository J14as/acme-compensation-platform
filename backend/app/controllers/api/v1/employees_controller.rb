module Api
  module V1
    class EmployeesController < ApplicationController
      before_action :authorize_hr_manager!, only: [:create, :update, :update_salary]
      before_action :set_employee, only: [:show, :update, :update_salary]

      # GET /api/v1/employees
      def index
        # Safe pagination bounds
        page = [params[:page].to_i, 1].max
        per_page = [[params[:per_page].to_i, 10].max, 100].min
        per_page = 25 if params[:per_page].blank?

        scope = Employee.all

        # Multi-dimensional Filtering
        scope = scope.search_query(params[:search])
        scope = scope.by_department(params[:department])
        scope = scope.by_country(params[:country])
        scope = scope.by_currency(params[:currency])
        scope = scope.by_status(params[:status])

        # Safe Sorting
        sort_by = params[:sort_by].presence || "id"
        sort_order = params[:sort_order].to_s.downcase == "desc" ? :desc : :asc

        allowed_sorts = {
          "id" => "id",
          "name" => "last_name",
          "employee_code" => "employee_code",
          "department" => "department",
          "country" => "country",
          "base_salary" => "base_salary",
          "salary" => "base_salary",
          "effective_date" => "effective_date",
          "joining_date" => "effective_date",
          "status" => "status"
        }

        sort_column = allowed_sorts[sort_by] || "id"
        total_count = scope.count
        total_pages = (total_count.to_f / per_page).ceil

        employees = scope.order(sort_column => sort_order)
                         .offset((page - 1) * per_page)
                         .limit(per_page)

        render json: {
          employees: employees.map { |e| serialize_employee_summary(e) },
          pagination: {
            current_page: page,
            per_page: per_page,
            total_pages: [total_pages, 1].max,
            total_count: total_count
          },
          filters: {
            departments: Employee::DEPARTMENTS,
            countries: Employee::COUNTRIES,
            currencies: ExchangeRate::VALID_CURRENCIES,
            statuses: Employee::STATUSES
          }
        }
      end

      # GET /api/v1/employees/:id
      def show
        render json: {
          employee: serialize_employee_detail(@employee),
          salary_history: @employee.salary_histories.map { |h| serialize_salary_history(h) }
        }
      end

      # POST /api/v1/employees
      def create
        employee = Employee.new(employee_create_params)

        if employee.save
          render json: {
            employee: serialize_employee_detail(employee),
            salary_history: employee.salary_histories.map { |h| serialize_salary_history(h) }
          }, status: :created
        else
          render json: { errors: employee.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH /api/v1/employees/:id (Demographic / Info Update)
      def update
        if @employee.update(employee_update_params)
          render json: {
            message: "Employee updated successfully.",
            employee: serialize_employee_detail(@employee)
          }
        else
          render json: { errors: @employee.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH /api/v1/employees/:id/salary
      def update_salary
        new_base = params[:new_base_salary]
        new_bonus = params[:new_bonus]
        reason = params[:change_reason]
        effective_date = params[:effective_date].presence || Date.current
        notes = params[:notes]
        changed_by = current_user ? current_user[:name] : "HR Manager"

        if new_base.blank? || reason.blank?
          return render json: { errors: ["New base salary and change reason are required."] }, status: :bad_request
        end

        begin
          @employee.update_salary!(
            new_base_salary: BigDecimal(new_base.to_s),
            new_bonus: new_bonus.present? ? BigDecimal(new_bonus.to_s) : nil,
            change_reason: reason,
            effective_date: effective_date,
            notes: notes,
            changed_by: changed_by
          )

          render json: {
            message: "Salary updated successfully and recorded in audit log.",
            employee: serialize_employee_detail(@employee.reload),
            salary_history: @employee.salary_histories.reload.map { |h| serialize_salary_history(h) }
          }
        rescue ActiveRecord::RecordInvalid => e
          render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
        rescue StandardError => e
          render json: { errors: [e.message] }, status: :unprocessable_entity
        end
      end

      private

      def set_employee
        @employee = Employee.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Employee not found." }, status: :not_found
      end

      # Create params includes initial salary
      def employee_create_params
        params.require(:employee).permit(
          :employee_code, :first_name, :last_name, :email,
          :department, :job_title, :country, :currency,
          :base_salary, :bonus, :effective_date, :status
        )
      end

      # Update params protects base_salary from mass-assignment (must use update_salary for audit)
      def employee_update_params
        params.require(:employee).permit(
          :first_name, :last_name, :email,
          :department, :job_title, :country, :status
        )
      end

      def serialize_employee_summary(emp)
        {
          id: emp.id,
          employee_code: emp.employee_code,
          first_name: emp.first_name,
          last_name: emp.last_name,
          full_name: emp.full_name,
          email: emp.email,
          department: emp.department,
          job_title: emp.job_title,
          country: emp.country,
          currency: emp.currency,
          base_salary: emp.base_salary.to_f,
          bonus: emp.bonus.to_f,
          total_compensation: emp.total_compensation.to_f,
          base_salary_usd: emp.base_salary_usd.to_f,
          total_compensation_usd: emp.total_compensation_usd.to_f,
          effective_date: emp.effective_date.to_s,
          status: emp.status
        }
      end

      def serialize_employee_detail(emp)
        serialize_employee_summary(emp).merge(
          created_at: emp.created_at,
          updated_at: emp.updated_at
        )
      end

      def serialize_salary_history(hist)
        {
          id: hist.id,
          previous_base_salary: hist.previous_base_salary&.to_f,
          new_base_salary: hist.new_base_salary.to_f,
          previous_bonus: hist.previous_bonus&.to_f,
          new_bonus: hist.new_bonus.to_f,
          currency: hist.currency,
          change_reason: hist.change_reason,
          notes: hist.notes,
          effective_date: hist.effective_date.to_s,
          created_by: hist.created_by,
          created_at: hist.created_at
        }
      end
    end
  end
end
