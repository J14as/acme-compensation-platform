class ApplicationController < ActionController::API
  # Authentication and Role-Based Authorization
  HR_TOKEN = "acme-hr-sec-token-2026"
  EMPLOYEE_TOKEN = "acme-emp-sec-token-2026"

  before_action :authenticate_request!

  attr_reader :current_user

  private

  def authenticate_request!
    # Allow health check without auth
    return if request.path == "/up"

    token = extract_token

    if token.blank?
      render json: { error: "Authentication required: Please provide a valid Bearer token." }, status: :unauthorized
      return
    end

    if token == HR_TOKEN
      @current_user = { name: "Sarah Jenkins", email: "sarah.jenkins@acme-corp.internal", role: "hr_manager" }
    elsif token == EMPLOYEE_TOKEN
      @current_user = { name: "Alex Mercer", email: "alex.mercer@acme-corp.internal", role: "employee" }
    else
      render json: { error: "Invalid credentials: The provided token is invalid or expired." }, status: :unauthorized
    end
  end

  def authorize_hr_manager!
    unless current_user && current_user[:role] == "hr_manager"
      render json: { error: "Forbidden: HR Manager role required for this compensation operation." }, status: :forbidden
    end
  end

  def extract_token
    auth_header = request.headers["Authorization"]
    return auth_header.split(" ").last if auth_header.present? && auth_header.start_with?("Bearer ")

    # Also support custom header for API clients
    request.headers["X-API-Token"].presence
  end
end
