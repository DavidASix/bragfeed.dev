CREATE TYPE "public"."health_check_services" AS ENUM('database', 'local-business-data');--> statement-breakpoint
CREATE TABLE "health_checks" (
	"id" serial PRIMARY KEY NOT NULL,
	"service" "health_check_services" NOT NULL,
	"healthy" boolean NOT NULL,
	"message" text,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_health_checks_service_checked_at" ON "health_checks" USING btree ("service","checked_at");