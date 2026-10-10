module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_request!, only: [:login]

      # POST /api/v1/auth/login
      def login
        email = params[:email].to_s.strip.downcase
        password = params[:password].to_s

        if email == "hr@acme-corp.internal" && password == "Password123!"
          render json: {
            token: ApplicationController::HR_TOKEN,
            user: {
              name: "Sarah Jenkins",
              email: "sarah.jenkins@acme-corp.internal",
              role: "hr_manager"
            }
          }
        elsif email == "employee@acme-corp.internal" && password == "Password123!"
          render json: {
            token: ApplicationController::EMPLOYEE_TOKEN,
            user: {
              name: "Alex Mercer",
              email: "alex.mercer@acme-corp.internal",
              role: "employee"
            }
          }
        else
          render json: { error: "Invalid email or password." }, status: :unauthorized
        end
      end

      # GET /api/v1/auth/me
      def me
        render json: { user: current_user }
      end

      # DELETE /api/v1/auth/logout
      def logout
        render json: { message: "Logged out successfully." }
      end
    end
  end
end
