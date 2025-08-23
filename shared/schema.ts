import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  decimal,
  serial,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Helper function for Brazil timezone timestamps
const brazilNow = () => sql`(now() AT TIME ZONE 'America/Sao_Paulo')`;

// Pending registrations table - for storing data before payment confirmation
export const pendingRegistrations = pgTable("pending_registrations", {
  id: serial("id").primaryKey(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).unique().notNull(),
  establishmentName: varchar("establishment_name", { length: 200 }).notNull(),
  ownerName: varchar("owner_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  whatsappNumber: varchar("whatsapp_number", { length: 20 }).notNull(),
  segment: varchar("segment", { length: 100 }).notNull(),
  address: text("address").notNull(),
  userName: varchar("user_name", { length: 100 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  planId: integer("plan_id").notNull(),
  status: varchar("status", { length: 50 }).default("pending"), // pending, completed, expired
  expiresAt: timestamp("expires_at").notNull(), // 24h expiration
  createdAt: timestamp("created_at").default(brazilNow()),
});

// Establishments table (multi-tenant)
export const establishments = pgTable("establishments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  ownerName: varchar("owner_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  whatsappNumber: varchar("whatsapp_number", { length: 20 }).notNull(),
  logo: text("logo"), // URL or base64 encoded image
  segment: varchar("segment", { length: 100 }).notNull(), // salão de beleza, barbearia, etc.
  address: text("address").notNull(),
  planId: integer("plan_id").default(1), // Default to basic plan
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }), // Stripe customer ID
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }), // Stripe subscription ID
  subscriptionStatus: varchar("subscription_status", { length: 50 }).default("trial"), // active, canceled, trial, etc.
  termsAcceptedAt: timestamp("terms_accepted_at"), // When terms were accepted
  privacyPolicyAcceptedAt: timestamp("privacy_policy_accepted_at"), // When privacy policy was accepted
  termsVersion: varchar("terms_version", { length: 20 }).default("1.0"), // Version of terms accepted
  privacyPolicyVersion: varchar("privacy_policy_version", { length: 20 }).default("1.0"), // Version of privacy policy accepted
  timezone: varchar("timezone", { length: 50 }).default("America/Sao_Paulo"), // Timezone configuration
  createdAt: timestamp("created_at").default(brazilNow()),
  updatedAt: timestamp("updated_at").default(brazilNow()),
});

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).default("admin"), // "admin" or "staff"
  staffId: integer("staff_id").references(() => staff.id), // For staff members
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(brazilNow()),
  updatedAt: timestamp("updated_at").default(brazilNow()),
});

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").default(brazilNow()),
});

// Clients table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  notes: text("notes"),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0"),
  lastVisit: timestamp("last_visit"),
  createdAt: timestamp("created_at").default(brazilNow()),
});

// Staff table
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  password: varchar("password", { length: 255 }), // For staff login
  role: varchar("role", { length: 100 }),
  specialties: text("specialties"),
  salaryType: varchar("salary_type", { length: 20 }).default("fixed"),
  salaryAmount: decimal("salary_amount", { precision: 10, scale: 2 }),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }),
  isAvailable: boolean("is_available").default(true),
  isActive: boolean("is_active").default(true),
  hasSystemAccess: boolean("has_system_access").default(false), // Can login to system
  createdAt: timestamp("created_at").default(brazilNow()),
});

// Staff vacations/time off table
export const staffVacations = pgTable("staff_vacations", {
  id: serial("id").primaryKey(),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
  staffId: integer("staff_id").references(() => staff.id).notNull(),
  startDate: varchar("start_date", { length: 10 }).notNull(), // YYYY-MM-DD format
  endDate: varchar("end_date", { length: 10 }).notNull(), // YYYY-MM-DD format
  type: varchar("type", { length: 20 }).default("vacation"), // vacation, sick_leave, time_off
  reason: text("reason"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(brazilNow()),
  updatedAt: timestamp("updated_at").default(brazilNow()),
});

// Service categories table
export const serviceCategories = pgTable("service_categories", {
  id: serial("id").primaryKey(),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(brazilNow()),
});

// Services table
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(), // in minutes
  category: varchar("category", { length: 50 }),
  staffIds: text("staff_ids"), // JSON array of staff IDs who can perform this service
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(brazilNow()),
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  staffId: integer("staff_id").references(() => staff.id).notNull(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  dataFim: timestamp("data_fim"),
  duration: integer("duration").notNull(), // in minutes
  status: varchar("status", { length: 50 }).default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(brazilNow()),
  updatedAt: timestamp("updated_at").default(brazilNow()),
});

// Products table for inventory
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  sku: varchar("sku", { length: 50 }),
  category: varchar("category", { length: 50 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  stock: integer("stock").default(0),
  minStock: integer("min_stock").default(5),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(brazilNow()),
});

// Transactions table for financial records
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  clientId: integer("client_id").references(() => clients.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  category: varchar("category", { length: 50 }),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  description: text("description"),
  notes: text("notes"),
  transactionDate: timestamp("transaction_date").default(brazilNow()),
  createdAt: timestamp("created_at").default(brazilNow()),
});

// Business settings table
export const businessSettings = pgTable("business_settings", {
  id: serial("id").primaryKey(),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
  businessName: varchar("business_name", { length: 255 }),
  businessAddress: text("business_address"),
  businessSegment: varchar("business_segment", { length: 100 }),
  businessPhone: varchar("business_phone", { length: 20 }),
  businessEmail: varchar("business_email", { length: 255 }),
  businessLogo: varchar("business_logo", { length: 500 }),
  workingHours: text("working_hours"), // JSON string
  whatsappApiUrl: varchar("whatsapp_api_url", { length: 500 }),
  whatsappPhoneNumber: varchar("whatsapp_phone_number", { length: 20 }),
  whatsappWelcomeMessage: text("whatsapp_welcome_message"),
  whatsappAutoReply: boolean("whatsapp_auto_reply").default(false),
  twoFactorAuth: boolean("two_factor_auth").default(false),
  sessionTimeout: integer("session_timeout").default(30),
  createdAt: timestamp("created_at").default(brazilNow()),
  updatedAt: timestamp("updated_at").default(brazilNow()),
});

// Business hours table for structured working hours
export const businessHours = pgTable("business_hours", {
  id: serial("id").primaryKey(),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  openTime: varchar("open_time", { length: 5 }), // HH:MM format
  closeTime: varchar("close_time", { length: 5 }), // HH:MM format
  isOpen: boolean("is_open").default(true),
  isHoliday: boolean("is_holiday").default(false), // For special holiday hours
  createdAt: timestamp("created_at").default(brazilNow()),
  updatedAt: timestamp("updated_at").default(brazilNow()),
});

// Plans table
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  maxStaffMembers: integer("max_staff_members").notNull(),
  maxMonthlyAppointments: integer("max_monthly_appointments"), // null = unlimited
  hasFinancialModule: boolean("has_financial_module").default(false),
  hasInventoryModule: boolean("has_inventory_module").default(false),
  hasWhatsappIntegration: boolean("has_whatsapp_integration").default(true),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(brazilNow()),
  updatedAt: timestamp("updated_at").default(brazilNow()),
});

// N8N Integration settings
export const n8nIntegrations = pgTable("n8n_integrations", {
  id: serial("id").primaryKey(),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(), // Nome da integração
  webhookUrl: text("webhook_url").notNull(), // URL do webhook n8n
  apiKey: varchar("api_key", { length: 255 }), // API key para autenticação
  triggerEvents: text("trigger_events").array().notNull(), // Eventos que disparam o webhook
  isActive: boolean("is_active").default(true),
  lastTriggered: timestamp("last_triggered"),
  createdAt: timestamp("created_at").default(brazilNow()),
  updatedAt: timestamp("updated_at").default(brazilNow()),
});

// Webhook logs for debugging
export const webhookLogs = pgTable("webhook_logs", {
  id: serial("id").primaryKey(),
  integrationId: integer("integration_id").references(() => n8nIntegrations.id).notNull(),
  event: varchar("event", { length: 100 }).notNull(),
  payload: text("payload"), // JSON payload enviado
  response: text("response"), // Resposta recebida
  status: varchar("status", { length: 20 }).notNull(), // success, error, pending
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").default(brazilNow()),
});

// Evolution API connections status
export const evolutionApiConnections = pgTable("evolution_api_connections", {
  id: serial("id").primaryKey(),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
  instanceName: varchar("instance_name", { length: 100 }).notNull(), // Nome da instância
  apiUrl: text("api_url").notNull(), // URL da Evolution API
  apiKey: varchar("api_key", { length: 255 }).notNull(), // API key da Evolution API
  status: varchar("status", { length: 20 }).default("disconnected"), // connected, disconnected, connecting, error
  qrCode: text("qr_code"), // QR Code base64 ou URL
  qrCodeExpiration: timestamp("qr_code_expiration"), // Expiração do QR Code
  lastStatusCheck: timestamp("last_status_check"),
  connectionData: text("connection_data"), // JSON com dados da conexão
  errorMessage: text("error_message"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(brazilNow()),
  updatedAt: timestamp("updated_at").default(brazilNow()),
});

// Staff working hours table for individual staff schedules
export const staffWorkingHours = pgTable("staff_working_hours", {
  id: serial("id").primaryKey(),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
  staffId: integer("staff_id").references(() => staff.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  openTime: varchar("open_time", { length: 5 }), // HH:MM format
  closeTime: varchar("close_time", { length: 5 }), // HH:MM format
  isAvailable: boolean("is_available").default(true), // If staff works on this day
  createdAt: timestamp("created_at").default(brazilNow()),
  updatedAt: timestamp("updated_at").default(brazilNow()),
});

// Notifications table for appointment notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).default("appointment"), // appointment, reminder, etc.
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").default(brazilNow()),
});

// Push Subscriptions table
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
  subscription: text("subscription").notNull(), // JSON string with subscription details
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(brazilNow()),
  updatedAt: timestamp("updated_at").default(brazilNow()),
});

// Zod schemas for validation
export const insertEstablishmentSchema = createInsertSchema(establishments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
  createdAt: true,
});

export const insertServiceCategorySchema = createInsertSchema(serviceCategories).omit({
  id: true,
  createdAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertBusinessSettingsSchema = createInsertSchema(businessSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBusinessHoursSchema = createInsertSchema(businessHours).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertN8nIntegrationSchema = createInsertSchema(n8nIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastTriggered: true,
});

export const insertWebhookLogSchema = createInsertSchema(webhookLogs).omit({
  id: true,
  createdAt: true,
});

export const insertStaffWorkingHoursSchema = createInsertSchema(staffWorkingHours).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffVacationSchema = createInsertSchema(staffVacations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEvolutionApiConnectionSchema = createInsertSchema(evolutionApiConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastStatusCheck: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type Establishment = typeof establishments.$inferSelect;
export type InsertEstablishment = z.infer<typeof insertEstablishmentSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Staff = typeof staff.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;

export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type InsertServiceCategory = z.infer<typeof insertServiceCategorySchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type BusinessSettings = typeof businessSettings.$inferSelect;
export type InsertBusinessSettings = z.infer<typeof insertBusinessSettingsSchema>;

export type BusinessHours = typeof businessHours.$inferSelect;
export type InsertBusinessHours = z.infer<typeof insertBusinessHoursSchema>;

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;

export type N8nIntegration = typeof n8nIntegrations.$inferSelect;
export type InsertN8nIntegration = z.infer<typeof insertN8nIntegrationSchema>;

export type WebhookLog = typeof webhookLogs.$inferSelect;
export type InsertWebhookLog = z.infer<typeof insertWebhookLogSchema>;

export type EvolutionApiConnection = typeof evolutionApiConnections.$inferSelect;
export type InsertEvolutionApiConnection = z.infer<typeof insertEvolutionApiConnectionSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;

export type StaffWorkingHours = typeof staffWorkingHours.$inferSelect;
export type InsertStaffWorkingHours = z.infer<typeof insertStaffWorkingHoursSchema>;

export type StaffVacation = typeof staffVacations.$inferSelect;
export type InsertStaffVacation = z.infer<typeof insertStaffVacationSchema>;

// N8N Webhook Data table - stores QR code and API data from N8N
export const n8nWebhookData = pgTable("n8n_webhook_data", {
  id: serial("id").primaryKey(),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
  establishmentName: varchar("establishment_name", { length: 255 }), // Nome do estabelecimento
  qrCodeBase64: text("qr_code_base64"),
  apiKey: varchar("api_key", { length: 255 }),
  instanceId: varchar("instance_id", { length: 255 }),
  isActive: boolean("is_active").default(true), // Only one active record per establishment
  createdAt: timestamp("created_at").default(brazilNow()),
  updatedAt: timestamp("updated_at").default(brazilNow()),
});

// N8N Webhook Data schemas
export const insertN8nWebhookDataSchema = createInsertSchema(n8nWebhookData).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type N8nWebhookData = typeof n8nWebhookData.$inferSelect;
export type InsertN8nWebhookData = z.infer<typeof insertN8nWebhookDataSchema>;

// Loyalty Programs table
export const loyaltyPrograms = pgTable("loyalty_programs", {
  id: serial("id").primaryKey(),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
  name: varchar("name", { length: 100 }).notNull().default("Programa Fidelidade"),
  pointsPerService: integer("points_per_service").notNull().default(1), // Pontos por serviço realizado
  pointsToReward: integer("points_to_reward").notNull().default(10), // Pontos necessários para ganhar recompensa
  rewardDescription: varchar("reward_description", { length: 255 }).notNull().default("Serviço gratuito"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(brazilNow()),
  updatedAt: timestamp("updated_at").default(brazilNow()),
});

// Loyalty Program Services (which services participate in loyalty)
export const loyaltyProgramServices = pgTable("loyalty_program_services", {
  id: serial("id").primaryKey(),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
  loyaltyProgramId: integer("loyalty_program_id").references(() => loyaltyPrograms.id).notNull(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  createdAt: timestamp("created_at").default(brazilNow()),
});

// Client Loyalty Points
export const clientLoyaltyPoints = pgTable("client_loyalty_points", {
  id: serial("id").primaryKey(),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  loyaltyProgramId: integer("loyalty_program_id").references(() => loyaltyPrograms.id).notNull(),
  totalPoints: integer("total_points").notNull().default(0),
  usedPoints: integer("used_points").notNull().default(0),
  availablePoints: integer("available_points").notNull().default(0),
  lastEarnedAt: timestamp("last_earned_at"),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").default(brazilNow()),
  updatedAt: timestamp("updated_at").default(brazilNow()),
});

// Loyalty Point Transactions (history of points earned/used)
export const loyaltyPointTransactions = pgTable("loyalty_point_transactions", {
  id: serial("id").primaryKey(),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  loyaltyProgramId: integer("loyalty_program_id").references(() => loyaltyPrograms.id).notNull(),
  appointmentId: integer("appointment_id").references(() => appointments.id), // Linked to appointment
  points: integer("points").notNull(), // Positive for earned, negative for used
  type: varchar("type", { length: 20 }).notNull(), // "earned" or "used"
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("created_at").default(brazilNow()),
});

// Insert schemas for loyalty tables
export const insertLoyaltyProgramSchema = createInsertSchema(loyaltyPrograms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLoyaltyProgramServiceSchema = createInsertSchema(loyaltyProgramServices).omit({
  id: true,
  createdAt: true,
});

export const insertClientLoyaltyPointsSchema = createInsertSchema(clientLoyaltyPoints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLoyaltyPointTransactionSchema = createInsertSchema(loyaltyPointTransactions).omit({
  id: true,
  createdAt: true,
});

// Type exports for loyalty
export type LoyaltyProgram = typeof loyaltyPrograms.$inferSelect;
export type InsertLoyaltyProgram = z.infer<typeof insertLoyaltyProgramSchema>;

export type LoyaltyProgramService = typeof loyaltyProgramServices.$inferSelect;
export type InsertLoyaltyProgramService = z.infer<typeof insertLoyaltyProgramServiceSchema>;

export type ClientLoyaltyPoints = typeof clientLoyaltyPoints.$inferSelect;
export type InsertClientLoyaltyPoints = z.infer<typeof insertClientLoyaltyPointsSchema>;

export type LoyaltyPointTransaction = typeof loyaltyPointTransactions.$inferSelect;
export type InsertLoyaltyPointTransaction = z.infer<typeof insertLoyaltyPointTransactionSchema>;

// Agenda Release Policies - configuração de liberação de agenda
export const agendaReleasePolicies = pgTable("agenda_release_policies", {
  id: serial("id").primaryKey(),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
  releaseInterval: integer("release_interval").notNull(), // 1, 2, 3... 12 meses
  releaseDay: integer("release_day").notNull(), // 1-31 dia do mês
  releasedMonths: text("released_months").array().default([]), // ["2025-09", "2025-10"] - meses liberados
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(brazilNow()),
  updatedAt: timestamp("updated_at").default(brazilNow()),
});

// Agenda Releases - histórico de liberações realizadas
export const agendaReleases = pgTable("agenda_releases", {
  id: serial("id").primaryKey(),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
  releaseDate: timestamp("release_date").notNull(), // Quando foi liberado
  releasedMonths: text("released_months").array().notNull(), // ["2025-09", "2025-10"]
  type: varchar("type", { length: 20 }).default("automatic"), // "automatic" ou "manual"
  createdAt: timestamp("created_at").default(brazilNow()),
});

// Insert schemas para agenda
export const insertAgendaReleasePolicySchema = createInsertSchema(agendaReleasePolicies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgendaReleaseSchema = createInsertSchema(agendaReleases).omit({
  id: true,
  createdAt: true,
});

// Type exports para agenda
export type AgendaReleasePolicy = typeof agendaReleasePolicies.$inferSelect;
export type InsertAgendaReleasePolicy = z.infer<typeof insertAgendaReleasePolicySchema>;

export type AgendaRelease = typeof agendaReleases.$inferSelect;
export type InsertAgendaRelease = z.infer<typeof insertAgendaReleaseSchema>;