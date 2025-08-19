CREATE TABLE "establishments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"owner_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"whatsapp_number" varchar(20) NOT NULL,
	"logo" text,
	"segment" varchar(100) NOT NULL,
	"address" text NOT NULL,
	"created_at" timestamp DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
	"updated_at" timestamp DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
	CONSTRAINT "establishments_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "establishment_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "business_settings" ADD COLUMN "establishment_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "establishment_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "establishment_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "service_categories" ADD COLUMN "establishment_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "establishment_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "staff" ADD COLUMN "establishment_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "establishment_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "establishment_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_establishment_id_establishments_id_fk" FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_settings" ADD CONSTRAINT "business_settings_establishment_id_establishments_id_fk" FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_establishment_id_establishments_id_fk" FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_establishment_id_establishments_id_fk" FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_categories" ADD CONSTRAINT "service_categories_establishment_id_establishments_id_fk" FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_establishment_id_establishments_id_fk" FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_establishment_id_establishments_id_fk" FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_establishment_id_establishments_id_fk" FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_establishment_id_establishments_id_fk" FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE no action ON UPDATE no action;