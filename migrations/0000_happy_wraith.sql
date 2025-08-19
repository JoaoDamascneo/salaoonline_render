CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"staff_id" integer NOT NULL,
	"service_id" integer NOT NULL,
	"appointment_date" timestamp NOT NULL,
	"data_fim" timestamp,
	"duration" integer NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"notes" text,
	"created_at" timestamp DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
	"updated_at" timestamp DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);
--> statement-breakpoint
CREATE TABLE "business_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_name" varchar(255),
	"business_address" text,
	"business_segment" varchar(100),
	"business_phone" varchar(20),
	"business_email" varchar(255),
	"business_logo" varchar(500),
	"working_hours" text,
	"whatsapp_api_url" varchar(500),
	"whatsapp_phone_number" varchar(20),
	"whatsapp_welcome_message" text,
	"whatsapp_auto_reply" boolean DEFAULT false,
	"two_factor_auth" boolean DEFAULT false,
	"session_timeout" integer DEFAULT 30,
	"created_at" timestamp DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
	"updated_at" timestamp DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"phone" varchar(20),
	"email" varchar(255),
	"notes" text,
	"total_spent" numeric(10, 2) DEFAULT '0',
	"last_visit" timestamp,
	"created_at" timestamp DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"sku" varchar(50),
	"category" varchar(50),
	"price" numeric(10, 2) NOT NULL,
	"cost" numeric(10, 2),
	"stock" integer DEFAULT 0,
	"min_stock" integer DEFAULT 5,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);
--> statement-breakpoint
CREATE TABLE "service_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"duration" integer NOT NULL,
	"category" varchar(50),
	"staff_ids" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"phone" varchar(20),
	"email" varchar(255),
	"role" varchar(100),
	"specialties" text,
	"salary_type" varchar(20) DEFAULT 'fixed',
	"salary_amount" numeric(10, 2),
	"commission_rate" numeric(5, 2),
	"is_available" boolean DEFAULT true,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"appointment_id" integer,
	"client_id" integer,
	"amount" numeric(10, 2) NOT NULL,
	"type" varchar(50) NOT NULL,
	"category" varchar(50),
	"payment_method" varchar(50) NOT NULL,
	"description" text,
	"notes" text,
	"transaction_date" timestamp DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
	"created_at" timestamp DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'admin',
	"created_at" timestamp DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
	"updated_at" timestamp DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;