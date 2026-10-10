module Api
  module V1
    class AnalyticsController < ApplicationController
      # GET /api/v1/analytics/overview
      def overview
        render json: AnalyticsService.overview
      end

      # GET /api/v1/analytics/by_department
      def by_department
        render json: AnalyticsService.by_department
      end

      # GET /api/v1/analytics/by_country
      def by_country
        render json: AnalyticsService.by_country
      end

      # GET /api/v1/analytics/salary_bands
      def salary_bands
        render json: AnalyticsService.salary_bands
      end

      # GET /api/v1/analytics/insights
      def insights
        render json: AnalyticsService.insights
      end
    end
  end
end
