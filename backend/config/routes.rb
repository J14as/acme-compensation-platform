Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      resources :employees, only: [:index, :show, :create] do
        member do
          patch :salary, to: "employees#update_salary"
        end
      end

      namespace :analytics do
        get :overview
        get :by_department
        get :by_country
        get :salary_bands
        get :insights
      end
    end
  end
end
