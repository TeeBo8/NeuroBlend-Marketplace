ALTER TABLE "users" ADD COLUMN "demo_sandbox_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_seed" boolean DEFAULT false NOT NULL;