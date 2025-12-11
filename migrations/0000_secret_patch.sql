CREATE TABLE "achievements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(50) NOT NULL,
	"icon" varchar(50) NOT NULL,
	"color" varchar(20) NOT NULL,
	"requirement_type" varchar(50) NOT NULL,
	"requirement_value" integer NOT NULL,
	"requirement_meta" jsonb,
	"points" integer DEFAULT 0 NOT NULL,
	"required_tier" varchar(20) DEFAULT 'free' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "achievements_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "activity_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"event_category" varchar(50) NOT NULL,
	"event_action" varchar(100) NOT NULL,
	"event_label" varchar(255),
	"event_value" integer,
	"page_path" varchar(255),
	"tool_id" varchar(100),
	"tool_category" varchar(50),
	"payload" jsonb,
	"occurred_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "addon_purchases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"addon_type" varchar(30) NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'GBP' NOT NULL,
	"credits_granted" integer DEFAULT 0 NOT NULL,
	"valid_from" timestamp DEFAULT now() NOT NULL,
	"valid_until" timestamp,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"stripe_payment_intent_id" text,
	"stripe_subscription_id" text,
	"status" varchar(20) DEFAULT 'completed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" varchar NOT NULL,
	"admin_email" varchar NOT NULL,
	"action" varchar(100) NOT NULL,
	"action_category" varchar(50) NOT NULL,
	"target_type" varchar(30) NOT NULL,
	"target_id" varchar,
	"target_email" varchar,
	"previous_value" jsonb,
	"new_value" jsonb,
	"reason" text,
	"ip_address" varchar(50),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_exports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"export_type" varchar(50) NOT NULL,
	"format" varchar(10) DEFAULT 'csv' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"file_name" varchar(255),
	"file_size" integer,
	"file_url" text,
	"filters" jsonb,
	"record_count" integer,
	"error_message" text,
	"requested_by" varchar NOT NULL,
	"completed_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"type" varchar(50) DEFAULT 'info' NOT NULL,
	"target_type" varchar(50) DEFAULT 'all' NOT NULL,
	"target_value" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"scheduled_at" timestamp,
	"sent_at" timestamp,
	"recipient_count" integer DEFAULT 0,
	"read_count" integer DEFAULT 0,
	"click_count" integer DEFAULT 0,
	"action_url" text,
	"action_text" varchar(100),
	"expires_at" timestamp,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_action_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"action_type" varchar(100) NOT NULL,
	"action_category" varchar(50) NOT NULL,
	"parameters" jsonb,
	"status" varchar(20) NOT NULL,
	"result" jsonb,
	"error_message" text,
	"ip_address" varchar(45),
	"user_agent" text,
	"session_id" varchar(255),
	"execution_time_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_interview_responses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"question_id" varchar(20) NOT NULL,
	"section_number" integer NOT NULL,
	"criterion" varchar(20) NOT NULL,
	"agent" varchar(20) NOT NULL,
	"question_text" text NOT NULL,
	"answer" text NOT NULL,
	"answer_length" integer DEFAULT 0 NOT NULL,
	"quality_score" integer DEFAULT 0 NOT NULL,
	"completeness_score" integer DEFAULT 0 NOT NULL,
	"relevance_score" integer DEFAULT 0 NOT NULL,
	"ai_feedback" text,
	"improvement_suggestions" jsonb,
	"score_impact" integer DEFAULT 0 NOT NULL,
	"revision_count" integer DEFAULT 0 NOT NULL,
	"previous_answers" jsonb,
	"time_to_answer" integer,
	"answered_at" timestamp DEFAULT now() NOT NULL,
	"last_updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_interview_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"business_plan_id" varchar,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"current_agent" varchar(20) DEFAULT 'nova' NOT NULL,
	"current_section" integer DEFAULT 1 NOT NULL,
	"current_question_index" integer DEFAULT 0 NOT NULL,
	"total_questions_answered" integer DEFAULT 0 NOT NULL,
	"total_questions" integer DEFAULT 475 NOT NULL,
	"session_duration" integer DEFAULT 0 NOT NULL,
	"innovation_score" integer DEFAULT 0 NOT NULL,
	"viability_score" integer DEFAULT 0 NOT NULL,
	"scalability_score" integer DEFAULT 0 NOT NULL,
	"overall_readiness" integer DEFAULT 0 NOT NULL,
	"approval_probability" integer DEFAULT 0 NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"last_activity_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"conversation_context" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_pending_confirmations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"action_type" varchar(100) NOT NULL,
	"action_category" varchar(50) NOT NULL,
	"parameters" jsonb,
	"confirmation_message" text NOT NULL,
	"warning_level" varchar(20) DEFAULT 'normal' NOT NULL,
	"requires_typed_confirmation" boolean DEFAULT false NOT NULL,
	"confirmation_phrase" varchar(100),
	"expires_at" timestamp NOT NULL,
	"confirmed" boolean DEFAULT false NOT NULL,
	"confirmed_at" timestamp,
	"cancelled" boolean DEFAULT false NOT NULL,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_rate_limits" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"action_type" varchar(100) NOT NULL,
	"window_start" timestamp NOT NULL,
	"window_end" timestamp NOT NULL,
	"action_count" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tier" varchar(20) NOT NULL,
	"business_name" text NOT NULL,
	"industry" text NOT NULL,
	"problem" text NOT NULL,
	"uniqueness" text NOT NULL,
	"technology" text NOT NULL,
	"experience" text NOT NULL,
	"funding" integer NOT NULL,
	"revenue" text NOT NULL,
	"job_creation" integer NOT NULL,
	"expansion" text NOT NULL,
	"vision" text NOT NULL,
	"innovation_stage" varchar(50) NOT NULL,
	"product_status" text NOT NULL,
	"existing_customers" text,
	"beta_testers" text,
	"traction_evidence" text,
	"tech_stack" text NOT NULL,
	"data_architecture" text NOT NULL,
	"ai_methodology" text NOT NULL,
	"compliance_design" text NOT NULL,
	"patent_status" text NOT NULL,
	"founder_education" text NOT NULL,
	"founder_work_history" text NOT NULL,
	"founder_achievements" text NOT NULL,
	"relevant_projects" text NOT NULL,
	"monthly_projections" text NOT NULL,
	"cac" integer NOT NULL,
	"ltv" integer NOT NULL,
	"payback_period" integer NOT NULL,
	"funding_sources" text NOT NULL,
	"detailed_costs" text NOT NULL,
	"competitors" text NOT NULL,
	"competitive_differentiation" text NOT NULL,
	"customer_interviews" text NOT NULL,
	"letters_of_intent" text,
	"willingness_to_pay" text NOT NULL,
	"market_size" text NOT NULL,
	"regulatory_requirements" text NOT NULL,
	"compliance_timeline" text NOT NULL,
	"compliance_budget" integer NOT NULL,
	"hiring_plan" text NOT NULL,
	"specific_regions" text NOT NULL,
	"international_plan" text,
	"target_endorser" text NOT NULL,
	"contact_points_strategy" text NOT NULL,
	"supporting_evidence" text,
	"generated_content" text,
	"pdf_url" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"current_generation_stage" text,
	"stripe_session_id" text,
	"user_id" varchar,
	"is_demo_data" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_connections" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"provider" varchar(50) NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"token_expiry" timestamp,
	"calendar_id" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"connection_id" varchar,
	"external_event_id" varchar(255),
	"title" varchar(255) NOT NULL,
	"description" text,
	"event_type" varchar(50) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"is_all_day" boolean DEFAULT false NOT NULL,
	"source_type" varchar(50),
	"source_id" varchar,
	"is_synced" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"certificate_number" varchar(50) NOT NULL,
	"verification_url" text,
	"is_shareable" boolean DEFAULT true NOT NULL,
	"linkedin_share_url" text,
	"metadata" jsonb,
	CONSTRAINT "certificates_certificate_number_unique" UNIQUE("certificate_number")
);
--> statement-breakpoint
CREATE TABLE "credit_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar(30) NOT NULL,
	"credits_change" integer NOT NULL,
	"credits_type" varchar(20) DEFAULT 'plan' NOT NULL,
	"balance_after" integer NOT NULL,
	"reference_id" varchar,
	"reference_type" varchar(30),
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_reviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"document_id" varchar,
	"document_name" varchar(255) NOT NULL,
	"document_type" varchar(50) NOT NULL,
	"document_content" text,
	"overall_score" integer,
	"strengths_found" jsonb,
	"weaknesses_found" jsonb,
	"suggestions" jsonb,
	"endorser_alignment" integer,
	"innovation_score" integer,
	"viability_score" integer,
	"scalability_score" integer,
	"ai_provider" varchar(50),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "document_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"content" text NOT NULL,
	"placeholders" jsonb,
	"usage_guide" text,
	"example_filled" text,
	"required_tier" varchar(20) DEFAULT 'premium' NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"rating" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eligibility_assessments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"business_concept" text NOT NULL,
	"industry_slug" varchar(50) NOT NULL,
	"target_market" text,
	"problem_statement" text,
	"proposed_solution" text,
	"innovation_score" integer NOT NULL,
	"scalability_score" integer NOT NULL,
	"viability_score" integer NOT NULL,
	"overall_score" integer NOT NULL,
	"ai_analysis" jsonb,
	"eligibility_band" varchar(30) NOT NULL,
	"disqualifiers" jsonb,
	"enhancement_suggestions" jsonb,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"can_proceed" boolean DEFAULT false NOT NULL,
	"access_token" varchar(64),
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "eligibility_assessments_access_token_unique" UNIQUE("access_token")
);
--> statement-breakpoint
CREATE TABLE "email_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_email" varchar(255) NOT NULL,
	"recipient_name" varchar(255),
	"subject" varchar(500) NOT NULL,
	"email_type" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"provider" varchar(50),
	"message_id" varchar(255),
	"error_message" text,
	"user_id" varchar,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"delivered_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "error_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"error_type" varchar(50) NOT NULL,
	"error_code" varchar(50),
	"message" text NOT NULL,
	"stack" text,
	"user_id" varchar,
	"user_email" varchar,
	"endpoint" varchar(255),
	"method" varchar(10),
	"status_code" integer,
	"tool_id" varchar(100),
	"page_url" text,
	"request_body" jsonb,
	"request_headers" jsonb,
	"user_agent" text,
	"browser_info" jsonb,
	"severity" varchar(20) DEFAULT 'error' NOT NULL,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"resolved_at" timestamp,
	"resolved_by" varchar,
	"resolution" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "floating_feedback" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"type" varchar(20) NOT NULL,
	"subject" varchar(200),
	"message" text NOT NULL,
	"email" varchar NOT NULL,
	"page_url" text,
	"browser_info" text,
	"screen_size" varchar(20),
	"status" varchar(20) DEFAULT 'new' NOT NULL,
	"priority" varchar(20) DEFAULT 'normal',
	"admin_notes" text,
	"resolved_at" timestamp,
	"resolved_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "immigration_lawyers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"profile_image_url" text,
	"oisc_level" varchar(10),
	"oisc_registration_number" varchar(50),
	"sra_number" varchar(50),
	"firm_name" varchar(255),
	"specializations" jsonb,
	"years_experience" integer,
	"success_rate" integer,
	"is_available" boolean DEFAULT true NOT NULL,
	"max_concurrent_reviews" integer DEFAULT 5 NOT NULL,
	"current_review_count" integer DEFAULT 0 NOT NULL,
	"total_reviews_completed" integer DEFAULT 0 NOT NULL,
	"average_rating" integer,
	"average_turnaround_hours" integer,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"verified_at" timestamp,
	"bio" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "immigration_lawyers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "industry_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(50) NOT NULL,
	"label" varchar(100) NOT NULL,
	"category" varchar(50) NOT NULL,
	"description" text,
	"visa_critical_factors" jsonb NOT NULL,
	"required_sections" jsonb NOT NULL,
	"optional_sections" jsonb,
	"hidden_sections" jsonb,
	"field_overrides" jsonb,
	"innovation_examples" jsonb,
	"recommended_endorsers" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "industry_profiles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "innovation_coaching_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"business_plan_id" varchar,
	"eligibility_assessment_id" varchar,
	"current_section" varchar(50),
	"interactions" jsonb,
	"current_innovation_score" integer DEFAULT 0,
	"previous_innovation_score" integer DEFAULT 0,
	"score_history" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_activity_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_milestones" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"session_id" varchar,
	"milestone_id" varchar(50) NOT NULL,
	"milestone_type" varchar(30) NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"icon" varchar(50) NOT NULL,
	"tier" varchar(20) DEFAULT 'bronze' NOT NULL,
	"xp_reward" integer DEFAULT 0 NOT NULL,
	"earned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"session_type" varchar(50) NOT NULL,
	"duration" integer,
	"overall_score" integer,
	"confidence_score" integer,
	"clarity_score" integer,
	"content_score" integer,
	"feedback" jsonb,
	"strengths" jsonb,
	"areas_for_improvement" jsonb,
	"recording_url" text,
	"transcript" text,
	"questions_asked" jsonb,
	"responses_given" jsonb,
	"status" varchar(20) DEFAULT 'in_progress' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "lawyer_document_reviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_plan_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"lawyer_id" varchar,
	"document_type" varchar(50) DEFAULT 'business_plan' NOT NULL,
	"priority" varchar(20) DEFAULT 'normal' NOT NULL,
	"tier" varchar(20) NOT NULL,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"assigned_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"due_date" timestamp,
	"sla_hours" integer,
	"is_overdue" boolean DEFAULT false NOT NULL,
	"overall_verdict" varchar(30),
	"confidence_score" integer,
	"compliance_score" integer,
	"readiness_score" integer,
	"executive_summary" text,
	"key_strengths" jsonb,
	"critical_issues" jsonb,
	"recommendations" jsonb,
	"internal_notes" text,
	"user_rating" integer,
	"user_feedback" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lawyer_review_comments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" varchar NOT NULL,
	"lawyer_id" varchar NOT NULL,
	"section" varchar(100) NOT NULL,
	"page_number" integer,
	"line_reference" varchar(50),
	"comment_type" varchar(30) NOT NULL,
	"severity" varchar(20) DEFAULT 'medium' NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"suggested_fix" text,
	"example_text" text,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"resolved_at" timestamp,
	"resolved_by" varchar,
	"resolution_note" text,
	"is_visible_to_user" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lawyer_review_status_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" varchar NOT NULL,
	"from_status" varchar(30),
	"to_status" varchar(30) NOT NULL,
	"changed_by" varchar NOT NULL,
	"changed_by_role" varchar(20) NOT NULL,
	"reason" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketing_campaigns" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"type" varchar(50) DEFAULT 'promotional' NOT NULL,
	"target_audience" varchar(50) DEFAULT 'all' NOT NULL,
	"target_criteria" jsonb,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"promo_code_ids" text[],
	"impressions" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"conversions" integer DEFAULT 0,
	"revenue_generated" integer DEFAULT 0,
	"is_ab_test" boolean DEFAULT false,
	"ab_variants" jsonb,
	"winning_variant" varchar(10),
	"created_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_articles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" varchar(100),
	"source_name" varchar(255) NOT NULL,
	"source_url" text,
	"title" text NOT NULL,
	"description" text,
	"content" text,
	"author" varchar(255),
	"url" text NOT NULL,
	"image_url" text,
	"category" varchar(50) DEFAULT 'general' NOT NULL,
	"tags" text[],
	"relevance_score" integer DEFAULT 50,
	"published_at" timestamp NOT NULL,
	"fetched_at" timestamp DEFAULT now() NOT NULL,
	"ai_summary" text,
	"key_points" text[],
	"is_active" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "news_articles_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "news_fetch_log" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_source" varchar(50) NOT NULL,
	"endpoint" text,
	"articles_found" integer DEFAULT 0 NOT NULL,
	"articles_added" integer DEFAULT 0 NOT NULL,
	"articles_duplicate" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'success' NOT NULL,
	"error_message" text,
	"fetched_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"weekly_digest" boolean DEFAULT true NOT NULL,
	"deadline_reminders" boolean DEFAULT true NOT NULL,
	"breaking_news_alerts" boolean DEFAULT true NOT NULL,
	"tool_completion_celebrations" boolean DEFAULT true NOT NULL,
	"progress_milestones" boolean DEFAULT true NOT NULL,
	"digest_frequency" varchar(20) DEFAULT 'weekly' NOT NULL,
	"preferred_time" varchar(5) DEFAULT '09:00',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "page_views" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"page_path" varchar(255) NOT NULL,
	"page_title" varchar(255),
	"page_url" text,
	"referrer_path" varchar(255),
	"navigation_type" varchar(20),
	"view_started_at" timestamp DEFAULT now() NOT NULL,
	"view_ended_at" timestamp,
	"time_on_page_seconds" integer,
	"scroll_depth_percent" integer DEFAULT 0,
	"click_count" integer DEFAULT 0,
	"page_load_time_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"stripe_payment_id" varchar(255),
	"stripe_invoice_id" varchar(255),
	"type" varchar(50) NOT NULL,
	"tier" varchar(20),
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'GBP' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"promo_code_id" varchar,
	"referral_code_id" varchar,
	"discount_amount" integer DEFAULT 0,
	"metadata" jsonb,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payout_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'GBP' NOT NULL,
	"payment_method" varchar(50) NOT NULL,
	"payment_details" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"processed_by" varchar,
	"processed_at" timestamp,
	"notes" text,
	"transaction_ref" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "performance_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lcp" integer,
	"fid" integer,
	"cls" integer,
	"fcp" integer,
	"ttfb" integer,
	"inp" integer,
	"page_url" text NOT NULL,
	"page_path" varchar(255) NOT NULL,
	"device_type" varchar(20),
	"browser_name" varchar(50),
	"browser_version" varchar(20),
	"connection_type" varchar(20),
	"user_id" varchar,
	"session_id" varchar(100),
	"navigation_type" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promo_codes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(30) NOT NULL,
	"owner_id" varchar,
	"name" text NOT NULL,
	"description" text,
	"discount_type" varchar(20) NOT NULL,
	"discount_value" integer NOT NULL,
	"eligible_tiers" text[],
	"min_purchase_amount" integer,
	"max_total_uses" integer,
	"max_uses_per_user" integer DEFAULT 1,
	"current_uses" integer DEFAULT 0 NOT NULL,
	"valid_from" timestamp DEFAULT now() NOT NULL,
	"valid_until" timestamp,
	"stripe_coupon_id" text,
	"stripe_promotion_code_id" text,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "promo_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "promo_redemptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"promo_code_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"order_id" text,
	"discount_applied" integer NOT NULL,
	"original_amount" integer NOT NULL,
	"final_amount" integer NOT NULL,
	"applied_at" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_codes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"code" varchar(20) NOT NULL,
	"reward_type" varchar(20) DEFAULT 'percentage' NOT NULL,
	"reward_value" integer DEFAULT 10 NOT NULL,
	"referee_discount" integer DEFAULT 10 NOT NULL,
	"stripe_coupon_id" text,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"max_uses" integer,
	"total_referrals" integer DEFAULT 0 NOT NULL,
	"successful_referrals" integer DEFAULT 0 NOT NULL,
	"pending_referrals" integer DEFAULT 0 NOT NULL,
	"total_earnings" integer DEFAULT 0 NOT NULL,
	"paid_earnings" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referral_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "referral_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referral_code_id" varchar NOT NULL,
	"referrer_id" varchar NOT NULL,
	"referee_id" varchar,
	"referee_email" varchar,
	"status" varchar(20) DEFAULT 'visited' NOT NULL,
	"visited_at" timestamp DEFAULT now() NOT NULL,
	"signed_up_at" timestamp,
	"qualified_at" timestamp,
	"rewarded_at" timestamp,
	"landing_page" text,
	"user_agent" text,
	"ip_hash" varchar(64),
	"reward_amount" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_rewards" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"referral_event_id" varchar NOT NULL,
	"type" varchar(20) NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'GBP' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"payout_method" varchar(20),
	"payout_reference" text,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_visits" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referral_code_id" varchar,
	"promo_code_id" varchar,
	"visitor_hash" varchar(64) NOT NULL,
	"source" varchar(50),
	"landing_page" text,
	"user_agent" text,
	"converted" boolean DEFAULT false NOT NULL,
	"converted_user_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"tool_id" text NOT NULL,
	"channel" varchar(20) NOT NULL,
	"session_token" varchar(36),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduled_notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"scheduled_for" timestamp NOT NULL,
	"sent_at" timestamp,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "score_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"innovation_score" integer NOT NULL,
	"viability_score" integer NOT NULL,
	"scalability_score" integer NOT NULL,
	"overall_readiness" integer NOT NULL,
	"trigger_type" varchar(30) NOT NULL,
	"question_id" varchar(20),
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "security_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"severity" varchar(20) DEFAULT 'low' NOT NULL,
	"user_id" varchar,
	"user_email" varchar,
	"ip_address" varchar(50),
	"user_agent" text,
	"description" text NOT NULL,
	"metadata" jsonb,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"resolved_at" timestamp,
	"resolved_by" varchar,
	"resolution" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_handoffs" (
	"token" varchar(36) PRIMARY KEY NOT NULL,
	"tool_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"expires_at" timestamp NOT NULL,
	"consumed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_feedback" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"rating" integer NOT NULL,
	"comment" text,
	"page_url" text,
	"time_spent_minutes" integer,
	"user_email" varchar,
	"user_name" varchar,
	"user_tier" varchar(20),
	"browser_info" text,
	"screen_size" varchar(20),
	"referrer" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "success_stories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"applicant_alias" varchar(100) NOT NULL,
	"industry" varchar(100) NOT NULL,
	"endorser_body" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"summary" text NOT NULL,
	"full_story" text NOT NULL,
	"time_to_approval" integer,
	"investment_amount" varchar(50),
	"jobs_created" integer,
	"key_success_factors" jsonb,
	"challenges_overcome" jsonb,
	"advice_given" jsonb,
	"timeline_breakdown" jsonb,
	"required_tier" varchar(20) DEFAULT 'premium' NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_sla" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tier" varchar(20) NOT NULL,
	"first_response_time" integer NOT NULL,
	"resolution_time" integer NOT NULL,
	"priority_level" integer NOT NULL,
	"dedicated_agent" boolean DEFAULT false NOT NULL,
	"callback_available" boolean DEFAULT false NOT NULL,
	"live_chat" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "support_sla_tier_unique" UNIQUE("tier")
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"email" varchar NOT NULL,
	"topic" varchar(50) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"priority" varchar(20) DEFAULT 'normal',
	"assigned_to" varchar,
	"resolved_at" timestamp,
	"response" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_announcements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"type" varchar(30) DEFAULT 'info' NOT NULL,
	"target_tiers" jsonb DEFAULT '["all"]'::jsonb,
	"target_user_ids" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"show_on_dashboard" boolean DEFAULT true NOT NULL,
	"show_as_popup" boolean DEFAULT false NOT NULL,
	"starts_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"created_by" varchar NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"dismissed_by" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" jsonb NOT NULL,
	"category" varchar(50) NOT NULL,
	"description" text,
	"data_type" varchar(30) DEFAULT 'string' NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"last_modified_by" varchar,
	"last_modified_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "tool_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"tool_id" text NOT NULL,
	"action" varchar(50) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tool_progress" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"tool_id" varchar(100) NOT NULL,
	"progress_data" jsonb NOT NULL,
	"completion_percent" integer DEFAULT 0,
	"status" varchar(20) DEFAULT 'in_progress' NOT NULL,
	"last_exported_at" timestamp,
	"export_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "uploaded_files" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"tool_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_type" varchar(50) NOT NULL,
	"file_size" integer NOT NULL,
	"blob_url" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"achievement_id" varchar NOT NULL,
	"earned_at" timestamp DEFAULT now() NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"is_complete" boolean DEFAULT false NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "user_activity_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"activity_type" varchar(50) NOT NULL,
	"activity_data" jsonb,
	"tool_id" varchar(100),
	"tool_category" varchar(50),
	"session_id" varchar(100),
	"ip_address" varchar(50),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_documents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(50) NOT NULL,
	"description" text,
	"file_url" text NOT NULL,
	"file_type" varchar(50) NOT NULL,
	"file_size" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"notes" text,
	"expiry_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_notification_reads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"notification_id" varchar NOT NULL,
	"read_at" timestamp DEFAULT now() NOT NULL,
	"clicked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"session_token" varchar(100) NOT NULL,
	"session_started_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	"session_ended_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"user_agent" text,
	"device_type" varchar(20),
	"browser_name" varchar(50),
	"browser_version" varchar(30),
	"os_name" varchar(50),
	"os_version" varchar(30),
	"screen_resolution" varchar(20),
	"ip_address" varchar(50),
	"country" varchar(100),
	"country_code" varchar(5),
	"region" varchar(100),
	"city" varchar(100),
	"timezone" varchar(50),
	"connection_type" varchar(20),
	"page_view_count" integer DEFAULT 0 NOT NULL,
	"event_count" integer DEFAULT 0 NOT NULL,
	"total_duration_seconds" integer DEFAULT 0 NOT NULL,
	"entry_page" varchar(255),
	"current_page" varchar(255),
	"exit_page" varchar(255),
	"referrer_url" text,
	"referrer_source" varchar(50),
	"utm_source" varchar(100),
	"utm_medium" varchar(100),
	"utm_campaign" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_template_downloads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"template_id" varchar NOT NULL,
	"downloaded_at" timestamp DEFAULT now() NOT NULL,
	"customizations" jsonb
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"password" text,
	"google_id" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"verification_token" text,
	"token_expiry" timestamp,
	"reset_token" text,
	"reset_token_expiry" timestamp,
	"is_admin" boolean DEFAULT false NOT NULL,
	"has_completed_onboarding" boolean DEFAULT false NOT NULL,
	"onboarding_completed_at" timestamp,
	"plan_credits" integer DEFAULT 0 NOT NULL,
	"bonus_credits" integer DEFAULT 0 NOT NULL,
	"credits_used" integer DEFAULT 0 NOT NULL,
	"last_credit_refresh" timestamp,
	"has_ultimate_assurance" boolean DEFAULT false NOT NULL,
	"previous_tier" varchar(20),
	"tier_upgraded_at" timestamp,
	"total_spent" integer DEFAULT 0 NOT NULL,
	"subscription_tier" varchar(20) DEFAULT 'free' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"subscription_status" varchar(20) DEFAULT 'inactive',
	"is_banned" boolean DEFAULT false NOT NULL,
	"suspended_until" timestamp,
	"suspended_reason" text,
	"admin_notes" text,
	"last_activity_at" timestamp,
	"tier_expires_at" timestamp,
	"tier_override_by" varchar,
	"tier_override_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_session_id_user_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."user_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_exports" ADD CONSTRAINT "admin_exports_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_notifications" ADD CONSTRAINT "admin_notifications_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_action_logs" ADD CONSTRAINT "ai_action_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_interview_responses" ADD CONSTRAINT "ai_interview_responses_session_id_ai_interview_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."ai_interview_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_interview_responses" ADD CONSTRAINT "ai_interview_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_interview_sessions" ADD CONSTRAINT "ai_interview_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_pending_confirmations" ADD CONSTRAINT "ai_pending_confirmations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_rate_limits" ADD CONSTRAINT "ai_rate_limits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eligibility_assessments" ADD CONSTRAINT "eligibility_assessments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "error_logs" ADD CONSTRAINT "error_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "error_logs" ADD CONSTRAINT "error_logs_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "floating_feedback" ADD CONSTRAINT "floating_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "floating_feedback" ADD CONSTRAINT "floating_feedback_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "innovation_coaching_sessions" ADD CONSTRAINT "innovation_coaching_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_milestones" ADD CONSTRAINT "interview_milestones_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_milestones" ADD CONSTRAINT "interview_milestones_session_id_ai_interview_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."ai_interview_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_session_id_user_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."user_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_promo_code_id_promo_codes_id_fk" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_referral_code_id_referral_codes_id_fk" FOREIGN KEY ("referral_code_id") REFERENCES "public"."referral_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_history" ADD CONSTRAINT "score_history_session_id_ai_interview_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."ai_interview_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_history" ADD CONSTRAINT "score_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_feedback" ADD CONSTRAINT "site_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_announcements" ADD CONSTRAINT "system_announcements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_last_modified_by_users_id_fk" FOREIGN KEY ("last_modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_progress" ADD CONSTRAINT "tool_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity_logs" ADD CONSTRAINT "user_activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notification_reads" ADD CONSTRAINT "user_notification_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notification_reads" ADD CONSTRAINT "user_notification_reads_notification_id_admin_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."admin_notifications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_event_session" ON "activity_events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_event_user" ON "activity_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_event_type" ON "activity_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_event_category" ON "activity_events" USING btree ("event_category");--> statement-breakpoint
CREATE INDEX "idx_event_occurred" ON "activity_events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "idx_event_tool" ON "activity_events" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "idx_addon_purchases_user" ON "addon_purchases" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_addon_purchases_type" ON "addon_purchases" USING btree ("addon_type");--> statement-breakpoint
CREATE INDEX "idx_addon_purchases_status" ON "addon_purchases" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_audit_admin" ON "admin_audit_logs" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "idx_audit_action" ON "admin_audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_target" ON "admin_audit_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "idx_audit_date" ON "admin_audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_export_status" ON "admin_exports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_export_type" ON "admin_exports" USING btree ("export_type");--> statement-breakpoint
CREATE INDEX "idx_export_user" ON "admin_exports" USING btree ("requested_by");--> statement-breakpoint
CREATE INDEX "idx_export_date" ON "admin_exports" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_notification_status" ON "admin_notifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_notification_type" ON "admin_notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_notification_target" ON "admin_notifications" USING btree ("target_type");--> statement-breakpoint
CREATE INDEX "idx_notification_date" ON "admin_notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_ai_logs_user" ON "ai_action_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ai_logs_action" ON "ai_action_logs" USING btree ("action_type");--> statement-breakpoint
CREATE INDEX "idx_ai_logs_status" ON "ai_action_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_ai_logs_created" ON "ai_action_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_response_session" ON "ai_interview_responses" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_response_user" ON "ai_interview_responses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_response_question" ON "ai_interview_responses" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_response_criterion" ON "ai_interview_responses" USING btree ("criterion");--> statement-breakpoint
CREATE INDEX "idx_ai_interview_user" ON "ai_interview_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ai_interview_status" ON "ai_interview_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_ai_interview_agent" ON "ai_interview_sessions" USING btree ("current_agent");--> statement-breakpoint
CREATE INDEX "idx_ai_confirm_user" ON "ai_pending_confirmations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ai_confirm_expires" ON "ai_pending_confirmations" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_ai_confirm_status" ON "ai_pending_confirmations" USING btree ("confirmed","cancelled");--> statement-breakpoint
CREATE INDEX "idx_ai_rate_user_action" ON "ai_rate_limits" USING btree ("user_id","action_type");--> statement-breakpoint
CREATE INDEX "idx_ai_rate_window" ON "ai_rate_limits" USING btree ("window_end");--> statement-breakpoint
CREATE INDEX "idx_calendar_user" ON "calendar_connections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_cal_event_user" ON "calendar_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_cal_event_date" ON "calendar_events" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "idx_certificate_user" ON "certificates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_credit_transactions_user" ON "credit_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_credit_transactions_type" ON "credit_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_credit_transactions_created" ON "credit_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_doc_review_user" ON "document_reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_doc_review_status" ON "document_reviews" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_template_category" ON "document_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_template_tier" ON "document_templates" USING btree ("required_tier");--> statement-breakpoint
CREATE INDEX "idx_eligibility_user" ON "eligibility_assessments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_eligibility_industry" ON "eligibility_assessments" USING btree ("industry_slug");--> statement-breakpoint
CREATE INDEX "idx_eligibility_band" ON "eligibility_assessments" USING btree ("eligibility_band");--> statement-breakpoint
CREATE INDEX "idx_eligibility_token" ON "eligibility_assessments" USING btree ("access_token");--> statement-breakpoint
CREATE INDEX "idx_eligibility_status" ON "eligibility_assessments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_email_recipient" ON "email_logs" USING btree ("recipient_email");--> statement-breakpoint
CREATE INDEX "idx_email_type" ON "email_logs" USING btree ("email_type");--> statement-breakpoint
CREATE INDEX "idx_email_status" ON "email_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_email_sent_at" ON "email_logs" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "idx_email_user" ON "email_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_error_type" ON "error_logs" USING btree ("error_type");--> statement-breakpoint
CREATE INDEX "idx_error_severity" ON "error_logs" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "idx_error_user" ON "error_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_error_date" ON "error_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_error_resolved" ON "error_logs" USING btree ("is_resolved");--> statement-breakpoint
CREATE INDEX "idx_floating_feedback_type" ON "floating_feedback" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_floating_feedback_status" ON "floating_feedback" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_floating_feedback_date" ON "floating_feedback" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_lawyer_email" ON "immigration_lawyers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_lawyer_status" ON "immigration_lawyers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_lawyer_available" ON "immigration_lawyers" USING btree ("is_available");--> statement-breakpoint
CREATE INDEX "idx_industry_slug" ON "industry_profiles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_industry_category" ON "industry_profiles" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_industry_active" ON "industry_profiles" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_coaching_user" ON "innovation_coaching_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_coaching_plan" ON "innovation_coaching_sessions" USING btree ("business_plan_id");--> statement-breakpoint
CREATE INDEX "idx_coaching_active" ON "innovation_coaching_sessions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_milestone_user" ON "interview_milestones" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_milestone_type" ON "interview_milestones" USING btree ("milestone_type");--> statement-breakpoint
CREATE INDEX "idx_interview_user" ON "interview_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_interview_status" ON "interview_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_ldr_business_plan" ON "lawyer_document_reviews" USING btree ("business_plan_id");--> statement-breakpoint
CREATE INDEX "idx_ldr_user" ON "lawyer_document_reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ldr_lawyer" ON "lawyer_document_reviews" USING btree ("lawyer_id");--> statement-breakpoint
CREATE INDEX "idx_ldr_status" ON "lawyer_document_reviews" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_ldr_priority" ON "lawyer_document_reviews" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_ldr_due_date" ON "lawyer_document_reviews" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "idx_lrc_review" ON "lawyer_review_comments" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "idx_lrc_lawyer" ON "lawyer_review_comments" USING btree ("lawyer_id");--> statement-breakpoint
CREATE INDEX "idx_lrc_section" ON "lawyer_review_comments" USING btree ("section");--> statement-breakpoint
CREATE INDEX "idx_lrc_type" ON "lawyer_review_comments" USING btree ("comment_type");--> statement-breakpoint
CREATE INDEX "idx_lrc_resolved" ON "lawyer_review_comments" USING btree ("is_resolved");--> statement-breakpoint
CREATE INDEX "idx_lrsh_review" ON "lawyer_review_status_history" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "idx_lrsh_created" ON "lawyer_review_status_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_campaign_status" ON "marketing_campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_campaign_type" ON "marketing_campaigns" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_campaign_dates" ON "marketing_campaigns" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "idx_news_published" ON "news_articles" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "idx_news_category" ON "news_articles" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_news_relevance" ON "news_articles" USING btree ("relevance_score");--> statement-breakpoint
CREATE INDEX "idx_news_featured" ON "news_articles" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "idx_news_active" ON "news_articles" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_fetch_log_source" ON "news_fetch_log" USING btree ("api_source");--> statement-breakpoint
CREATE INDEX "idx_fetch_log_time" ON "news_fetch_log" USING btree ("fetched_at");--> statement-breakpoint
CREATE INDEX "idx_notif_pref_user" ON "notification_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_pageview_session" ON "page_views" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_pageview_user" ON "page_views" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_pageview_path" ON "page_views" USING btree ("page_path");--> statement-breakpoint
CREATE INDEX "idx_pageview_started" ON "page_views" USING btree ("view_started_at");--> statement-breakpoint
CREATE INDEX "idx_payment_user" ON "payment_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_payment_status" ON "payment_transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payment_type" ON "payment_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_payment_date" ON "payment_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_payment_stripe" ON "payment_transactions" USING btree ("stripe_payment_id");--> statement-breakpoint
CREATE INDEX "idx_payout_user" ON "payout_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_payout_status" ON "payout_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_perf_page_path" ON "performance_metrics" USING btree ("page_path");--> statement-breakpoint
CREATE INDEX "idx_perf_created_at" ON "performance_metrics" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_perf_device" ON "performance_metrics" USING btree ("device_type");--> statement-breakpoint
CREATE INDEX "idx_promo_codes_code" ON "promo_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_promo_codes_status" ON "promo_codes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_promo_codes_owner" ON "promo_codes" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_promo_redemptions_code" ON "promo_redemptions" USING btree ("promo_code_id");--> statement-breakpoint
CREATE INDEX "idx_promo_redemptions_user" ON "promo_redemptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_referral_codes_user" ON "referral_codes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_referral_codes_code" ON "referral_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_referral_codes_status" ON "referral_codes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_referral_events_code" ON "referral_events" USING btree ("referral_code_id");--> statement-breakpoint
CREATE INDEX "idx_referral_events_referrer" ON "referral_events" USING btree ("referrer_id");--> statement-breakpoint
CREATE INDEX "idx_referral_events_referee" ON "referral_events" USING btree ("referee_id");--> statement-breakpoint
CREATE INDEX "idx_referral_events_status" ON "referral_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_referral_rewards_user" ON "referral_rewards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_referral_rewards_status" ON "referral_rewards" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_referral_visits_code" ON "referral_visits" USING btree ("referral_code_id");--> statement-breakpoint
CREATE INDEX "idx_referral_visits_promo" ON "referral_visits" USING btree ("promo_code_id");--> statement-breakpoint
CREATE INDEX "idx_referral_visits_visitor" ON "referral_visits" USING btree ("visitor_hash");--> statement-breakpoint
CREATE INDEX "idx_sched_notif_user" ON "scheduled_notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sched_notif_status" ON "scheduled_notifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_sched_notif_scheduled" ON "scheduled_notifications" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "idx_score_history_session" ON "score_history" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_score_history_user" ON "score_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_security_type" ON "security_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_security_severity" ON "security_events" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "idx_security_ip" ON "security_events" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "idx_security_date" ON "security_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_security_resolved" ON "security_events" USING btree ("is_resolved");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "idx_success_industry" ON "success_stories" USING btree ("industry");--> statement-breakpoint
CREATE INDEX "idx_success_endorser" ON "success_stories" USING btree ("endorser_body");--> statement-breakpoint
CREATE INDEX "idx_success_published" ON "success_stories" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "idx_support_user" ON "support_tickets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_support_status" ON "support_tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_tool_progress_user" ON "tool_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_tool_progress_tool" ON "tool_progress" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "idx_tool_progress_status" ON "tool_progress" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_user_achievement_user" ON "user_achievements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_achievement_complete" ON "user_achievements" USING btree ("is_complete");--> statement-breakpoint
CREATE INDEX "idx_activity_user" ON "user_activity_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_activity_type" ON "user_activity_logs" USING btree ("activity_type");--> statement-breakpoint
CREATE INDEX "idx_activity_tool" ON "user_activity_logs" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "idx_activity_date" ON "user_activity_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_document_user" ON "user_documents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_document_category" ON "user_documents" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_user_notif_read" ON "user_notification_reads" USING btree ("user_id","notification_id");--> statement-breakpoint
CREATE INDEX "idx_session_user" ON "user_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_session_active" ON "user_sessions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_session_started" ON "user_sessions" USING btree ("session_started_at");--> statement-breakpoint
CREATE INDEX "idx_session_last_seen" ON "user_sessions" USING btree ("last_seen_at");--> statement-breakpoint
CREATE INDEX "idx_session_country" ON "user_sessions" USING btree ("country_code");--> statement-breakpoint
CREATE INDEX "idx_session_device" ON "user_sessions" USING btree ("device_type");--> statement-breakpoint
CREATE INDEX "idx_template_dl_user" ON "user_template_downloads" USING btree ("user_id");