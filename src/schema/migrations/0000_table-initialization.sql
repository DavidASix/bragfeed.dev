CREATE TYPE "public"."event_types" AS ENUM(
	'fetch_reviews',
	'update_reviews',
	'fetch_stats',
	'update_stats'
);

--> statement-breakpoint
CREATE TABLE
	"account" (
		"userId" text NOT NULL,
		"type" text NOT NULL,
		"provider" text NOT NULL,
		"providerAccountId" text NOT NULL,
		"refresh_token" text,
		"access_token" text,
		"expires_at" integer,
		"token_type" text,
		"scope" text,
		"id_token" text,
		"session_state" text,
		CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY ("provider", "providerAccountId")
	);

--> statement-breakpoint
CREATE TABLE
	"api_keys" (
		"id" serial PRIMARY KEY NOT NULL,
		"key" text NOT NULL,
		"user_id" text NOT NULL,
		"created_at" timestamp with time zone DEFAULT now(),
		"expired" boolean DEFAULT false
	);

--> statement-breakpoint
CREATE TABLE
	"authenticator" (
		"credentialID" text NOT NULL,
		"userId" text NOT NULL,
		"providerAccountId" text NOT NULL,
		"credentialPublicKey" text NOT NULL,
		"counter" integer NOT NULL,
		"credentialDeviceType" text NOT NULL,
		"credentialBackedUp" boolean NOT NULL,
		"transports" text,
		CONSTRAINT "authenticator_userId_credentialID_pk" PRIMARY KEY ("userId", "credentialID"),
		CONSTRAINT "authenticator_credentialID_unique" UNIQUE ("credentialID")
	);

--> statement-breakpoint
CREATE TABLE
	"business_stats" (
		"id" serial PRIMARY KEY NOT NULL,
		"business_id" uuid NOT NULL,
		"review_count" integer,
		"review_score" real,
		"created_at" timestamp with time zone DEFAULT now()
	);

--> statement-breakpoint
CREATE TABLE
	"businesses" (
		"id" uuid PRIMARY KEY NOT NULL,
		"user_id" text NOT NULL,
		"name" text,
		"place_id" varchar(256),
		"address" text
	);

--> statement-breakpoint
CREATE TABLE
	"events" (
		"id" serial PRIMARY KEY NOT NULL,
		"event" "event_types",
		"user_id" text NOT NULL,
		"metadata" jsonb,
		"timestamp" timestamp with time zone DEFAULT now()
	);

--> statement-breakpoint
CREATE TABLE
	"rate_limit_events" (
		"id" serial PRIMARY KEY NOT NULL,
		"user_id" text NOT NULL,
		"event_type" text NOT NULL,
		"timestamp" timestamp with time zone DEFAULT now() NOT NULL
	);

--> statement-breakpoint
CREATE TABLE
	"reviews" (
		"id" uuid PRIMARY KEY NOT NULL,
		"business_id" uuid NOT NULL,
		"lookup_id" text,
		"author_name" text,
		"author_image" text,
		"datetime" timestamp,
		"link" text,
		"rating" integer,
		"comments" text,
		"created_at" timestamp with time zone DEFAULT now()
	);

--> statement-breakpoint
CREATE TABLE
	"session" (
		"sessionToken" text PRIMARY KEY NOT NULL,
		"userId" text NOT NULL,
		"expires" timestamp NOT NULL
	);

--> statement-breakpoint
CREATE TABLE
	"subscription_payments" (
		"id" serial PRIMARY KEY NOT NULL,
		"user_id" text NOT NULL,
		"stripe_customer_id" text,
		"invoice_id" text NOT NULL,
		"amount" integer,
		"currency" text,
		"billing_reason" text,
		"subscription_start" timestamp with time zone NOT NULL,
		"subscription_end" timestamp with time zone NOT NULL,
		"created_at" timestamp with time zone NOT NULL
	);

--> statement-breakpoint
CREATE TABLE
	"user" (
		"id" text PRIMARY KEY NOT NULL,
		"name" text,
		"email" text,
		"emailVerified" timestamp,
		"image" text,
		"stripe_customer_id" text,
		"has_active_subscription" boolean DEFAULT false NOT NULL,
		CONSTRAINT "user_email_unique" UNIQUE ("email"),
		CONSTRAINT "user_stripe_customer_id_unique" UNIQUE ("stripe_customer_id")
	);

--> statement-breakpoint
CREATE TABLE
	"verificationToken" (
		"identifier" text NOT NULL,
		"token" text NOT NULL,
		"expires" timestamp NOT NULL,
		CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY ("identifier", "token")
	);

--> statement-breakpoint
ALTER TABLE "account"
ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user" ("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE "api_keys"
ADD CONSTRAINT "api_keys_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user" ("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE "authenticator"
ADD CONSTRAINT "authenticator_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user" ("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE "business_stats"
ADD CONSTRAINT "business_stats_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses" ("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE "businesses"
ADD CONSTRAINT "businesses_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user" ("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE "events"
ADD CONSTRAINT "events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user" ("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE "rate_limit_events"
ADD CONSTRAINT "rate_limit_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user" ("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE "reviews"
ADD CONSTRAINT "reviews_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses" ("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE "session"
ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user" ("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE "subscription_payments"
ADD CONSTRAINT "subscription_payments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user" ("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
CREATE INDEX "idx_rate_limit_events_user_event_time" ON "rate_limit_events" USING btree ("user_id", "event_type", "timestamp");