var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  agendaReleasePolicies: () => agendaReleasePolicies,
  agendaReleases: () => agendaReleases,
  appointments: () => appointments,
  businessHours: () => businessHours,
  businessSettings: () => businessSettings,
  clientLoyaltyPoints: () => clientLoyaltyPoints,
  clients: () => clients,
  establishments: () => establishments,
  evolutionApiConnections: () => evolutionApiConnections,
  insertAgendaReleasePolicySchema: () => insertAgendaReleasePolicySchema,
  insertAgendaReleaseSchema: () => insertAgendaReleaseSchema,
  insertAppointmentSchema: () => insertAppointmentSchema,
  insertBusinessHoursSchema: () => insertBusinessHoursSchema,
  insertBusinessSettingsSchema: () => insertBusinessSettingsSchema,
  insertClientLoyaltyPointsSchema: () => insertClientLoyaltyPointsSchema,
  insertClientSchema: () => insertClientSchema,
  insertEstablishmentSchema: () => insertEstablishmentSchema,
  insertEvolutionApiConnectionSchema: () => insertEvolutionApiConnectionSchema,
  insertLoyaltyPointTransactionSchema: () => insertLoyaltyPointTransactionSchema,
  insertLoyaltyProgramSchema: () => insertLoyaltyProgramSchema,
  insertLoyaltyProgramServiceSchema: () => insertLoyaltyProgramServiceSchema,
  insertN8nIntegrationSchema: () => insertN8nIntegrationSchema,
  insertN8nWebhookDataSchema: () => insertN8nWebhookDataSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertPlanSchema: () => insertPlanSchema,
  insertProductSchema: () => insertProductSchema,
  insertPushSubscriptionSchema: () => insertPushSubscriptionSchema,
  insertServiceCategorySchema: () => insertServiceCategorySchema,
  insertServiceSchema: () => insertServiceSchema,
  insertStaffSchema: () => insertStaffSchema,
  insertStaffVacationSchema: () => insertStaffVacationSchema,
  insertStaffWorkingHoursSchema: () => insertStaffWorkingHoursSchema,
  insertTransactionSchema: () => insertTransactionSchema,
  insertUserSchema: () => insertUserSchema,
  insertWebhookLogSchema: () => insertWebhookLogSchema,
  loyaltyPointTransactions: () => loyaltyPointTransactions,
  loyaltyProgramServices: () => loyaltyProgramServices,
  loyaltyPrograms: () => loyaltyPrograms,
  n8nIntegrations: () => n8nIntegrations,
  n8nWebhookData: () => n8nWebhookData,
  notifications: () => notifications,
  passwordResetTokens: () => passwordResetTokens,
  pendingRegistrations: () => pendingRegistrations,
  plans: () => plans,
  products: () => products,
  pushSubscriptions: () => pushSubscriptions,
  serviceCategories: () => serviceCategories,
  services: () => services,
  staff: () => staff,
  staffVacations: () => staffVacations,
  staffWorkingHours: () => staffWorkingHours,
  transactions: () => transactions,
  users: () => users,
  webhookLogs: () => webhookLogs
});
import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  decimal,
  serial,
  boolean
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var brazilNow, pendingRegistrations, establishments, users, passwordResetTokens, clients, staff, staffVacations, serviceCategories, services, appointments, products, transactions, businessSettings, businessHours, plans, n8nIntegrations, webhookLogs, evolutionApiConnections, staffWorkingHours, notifications, pushSubscriptions, insertEstablishmentSchema, insertUserSchema, insertClientSchema, insertStaffSchema, insertServiceCategorySchema, insertServiceSchema, insertAppointmentSchema, insertProductSchema, insertTransactionSchema, insertBusinessSettingsSchema, insertBusinessHoursSchema, insertPlanSchema, insertN8nIntegrationSchema, insertWebhookLogSchema, insertStaffWorkingHoursSchema, insertStaffVacationSchema, insertEvolutionApiConnectionSchema, insertNotificationSchema, insertPushSubscriptionSchema, n8nWebhookData, insertN8nWebhookDataSchema, loyaltyPrograms, loyaltyProgramServices, clientLoyaltyPoints, loyaltyPointTransactions, insertLoyaltyProgramSchema, insertLoyaltyProgramServiceSchema, insertClientLoyaltyPointsSchema, insertLoyaltyPointTransactionSchema, agendaReleasePolicies, agendaReleases, insertAgendaReleasePolicySchema, insertAgendaReleaseSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    brazilNow = () => sql`(now() AT TIME ZONE 'America/Sao_Paulo')`;
    pendingRegistrations = pgTable("pending_registrations", {
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
      status: varchar("status", { length: 50 }).default("pending"),
      // pending, completed, expired
      expiresAt: timestamp("expires_at").notNull(),
      // 24h expiration
      createdAt: timestamp("created_at").default(brazilNow())
    });
    establishments = pgTable("establishments", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 200 }).notNull(),
      ownerName: varchar("owner_name", { length: 100 }).notNull(),
      email: varchar("email", { length: 255 }).unique().notNull(),
      phone: varchar("phone", { length: 20 }).notNull(),
      whatsappNumber: varchar("whatsapp_number", { length: 20 }).notNull(),
      logo: text("logo"),
      // URL or base64 encoded image
      segment: varchar("segment", { length: 100 }).notNull(),
      // salão de beleza, barbearia, etc.
      address: text("address").notNull(),
      planId: integer("plan_id").default(1),
      // Default to basic plan
      stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
      // Stripe customer ID
      stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
      // Stripe subscription ID
      subscriptionStatus: varchar("subscription_status", { length: 50 }).default("trial"),
      // active, canceled, trial, etc.
      termsAcceptedAt: timestamp("terms_accepted_at"),
      // When terms were accepted
      privacyPolicyAcceptedAt: timestamp("privacy_policy_accepted_at"),
      // When privacy policy was accepted
      termsVersion: varchar("terms_version", { length: 20 }).default("1.0"),
      // Version of terms accepted
      privacyPolicyVersion: varchar("privacy_policy_version", { length: 20 }).default("1.0"),
      // Version of privacy policy accepted
      timezone: varchar("timezone", { length: 50 }).default("America/Sao_Paulo"),
      // Timezone configuration
      createdAt: timestamp("created_at").default(brazilNow()),
      updatedAt: timestamp("updated_at").default(brazilNow())
    });
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
      email: varchar("email", { length: 255 }).unique().notNull(),
      name: varchar("name", { length: 100 }).notNull(),
      password: varchar("password", { length: 255 }).notNull(),
      role: varchar("role", { length: 50 }).default("admin"),
      // "admin" or "staff"
      staffId: integer("staff_id").references(() => staff.id),
      // For staff members
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").default(brazilNow()),
      updatedAt: timestamp("updated_at").default(brazilNow())
    });
    passwordResetTokens = pgTable("password_reset_tokens", {
      id: serial("id").primaryKey(),
      email: varchar("email", { length: 255 }).notNull(),
      token: varchar("token", { length: 255 }).unique().notNull(),
      expiresAt: timestamp("expires_at").notNull(),
      used: boolean("used").default(false),
      createdAt: timestamp("created_at").default(brazilNow())
    });
    clients = pgTable("clients", {
      id: serial("id").primaryKey(),
      establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
      name: varchar("name", { length: 100 }).notNull(),
      phone: varchar("phone", { length: 20 }),
      email: varchar("email", { length: 255 }),
      notes: text("notes"),
      totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0"),
      lastVisit: timestamp("last_visit"),
      createdAt: timestamp("created_at").default(brazilNow())
    });
    staff = pgTable("staff", {
      id: serial("id").primaryKey(),
      establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
      name: varchar("name", { length: 100 }).notNull(),
      phone: varchar("phone", { length: 20 }),
      email: varchar("email", { length: 255 }),
      password: varchar("password", { length: 255 }),
      // For staff login
      role: varchar("role", { length: 100 }),
      specialties: text("specialties"),
      salaryType: varchar("salary_type", { length: 20 }).default("fixed"),
      salaryAmount: decimal("salary_amount", { precision: 10, scale: 2 }),
      commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }),
      isAvailable: boolean("is_available").default(true),
      isActive: boolean("is_active").default(true),
      hasSystemAccess: boolean("has_system_access").default(false),
      // Can login to system
      createdAt: timestamp("created_at").default(brazilNow())
    });
    staffVacations = pgTable("staff_vacations", {
      id: serial("id").primaryKey(),
      establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
      staffId: integer("staff_id").references(() => staff.id).notNull(),
      startDate: varchar("start_date", { length: 10 }).notNull(),
      // YYYY-MM-DD format
      endDate: varchar("end_date", { length: 10 }).notNull(),
      // YYYY-MM-DD format
      type: varchar("type", { length: 20 }).default("vacation"),
      // vacation, sick_leave, time_off
      reason: text("reason"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").default(brazilNow()),
      updatedAt: timestamp("updated_at").default(brazilNow())
    });
    serviceCategories = pgTable("service_categories", {
      id: serial("id").primaryKey(),
      establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
      name: varchar("name", { length: 100 }).notNull(),
      description: text("description"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").default(brazilNow())
    });
    services = pgTable("services", {
      id: serial("id").primaryKey(),
      establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
      name: varchar("name", { length: 100 }).notNull(),
      description: text("description"),
      price: decimal("price", { precision: 10, scale: 2 }).notNull(),
      duration: integer("duration").notNull(),
      // in minutes
      category: varchar("category", { length: 50 }),
      staffIds: text("staff_ids"),
      // JSON array of staff IDs who can perform this service
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").default(brazilNow())
    });
    appointments = pgTable("appointments", {
      id: serial("id").primaryKey(),
      establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
      clientId: integer("client_id").references(() => clients.id).notNull(),
      staffId: integer("staff_id").references(() => staff.id).notNull(),
      serviceId: integer("service_id").references(() => services.id).notNull(),
      appointmentDate: timestamp("appointment_date").notNull(),
      dataFim: timestamp("data_fim"),
      duration: integer("duration").notNull(),
      // in minutes
      status: varchar("status", { length: 50 }).default("pending"),
      notes: text("notes"),
      createdAt: timestamp("created_at").default(brazilNow()),
      updatedAt: timestamp("updated_at").default(brazilNow())
    });
    products = pgTable("products", {
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
      createdAt: timestamp("created_at").default(brazilNow())
    });
    transactions = pgTable("transactions", {
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
      createdAt: timestamp("created_at").default(brazilNow())
    });
    businessSettings = pgTable("business_settings", {
      id: serial("id").primaryKey(),
      establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
      businessName: varchar("business_name", { length: 255 }),
      businessAddress: text("business_address"),
      businessSegment: varchar("business_segment", { length: 100 }),
      businessPhone: varchar("business_phone", { length: 20 }),
      businessEmail: varchar("business_email", { length: 255 }),
      businessLogo: varchar("business_logo", { length: 500 }),
      workingHours: text("working_hours"),
      // JSON string
      whatsappApiUrl: varchar("whatsapp_api_url", { length: 500 }),
      whatsappPhoneNumber: varchar("whatsapp_phone_number", { length: 20 }),
      whatsappWelcomeMessage: text("whatsapp_welcome_message"),
      whatsappAutoReply: boolean("whatsapp_auto_reply").default(false),
      twoFactorAuth: boolean("two_factor_auth").default(false),
      sessionTimeout: integer("session_timeout").default(30),
      createdAt: timestamp("created_at").default(brazilNow()),
      updatedAt: timestamp("updated_at").default(brazilNow())
    });
    businessHours = pgTable("business_hours", {
      id: serial("id").primaryKey(),
      establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
      dayOfWeek: integer("day_of_week").notNull(),
      // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      openTime: varchar("open_time", { length: 5 }),
      // HH:MM format
      closeTime: varchar("close_time", { length: 5 }),
      // HH:MM format
      isOpen: boolean("is_open").default(true),
      isHoliday: boolean("is_holiday").default(false),
      // For special holiday hours
      createdAt: timestamp("created_at").default(brazilNow()),
      updatedAt: timestamp("updated_at").default(brazilNow())
    });
    plans = pgTable("plans", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 100 }).notNull(),
      price: decimal("price", { precision: 10, scale: 2 }).notNull(),
      maxStaffMembers: integer("max_staff_members").notNull(),
      maxMonthlyAppointments: integer("max_monthly_appointments"),
      // null = unlimited
      hasFinancialModule: boolean("has_financial_module").default(false),
      hasInventoryModule: boolean("has_inventory_module").default(false),
      hasWhatsappIntegration: boolean("has_whatsapp_integration").default(true),
      description: text("description"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").default(brazilNow()),
      updatedAt: timestamp("updated_at").default(brazilNow())
    });
    n8nIntegrations = pgTable("n8n_integrations", {
      id: serial("id").primaryKey(),
      establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
      name: varchar("name", { length: 100 }).notNull(),
      // Nome da integração
      webhookUrl: text("webhook_url").notNull(),
      // URL do webhook n8n
      apiKey: varchar("api_key", { length: 255 }),
      // API key para autenticação
      triggerEvents: text("trigger_events").array().notNull(),
      // Eventos que disparam o webhook
      isActive: boolean("is_active").default(true),
      lastTriggered: timestamp("last_triggered"),
      createdAt: timestamp("created_at").default(brazilNow()),
      updatedAt: timestamp("updated_at").default(brazilNow())
    });
    webhookLogs = pgTable("webhook_logs", {
      id: serial("id").primaryKey(),
      integrationId: integer("integration_id").references(() => n8nIntegrations.id).notNull(),
      event: varchar("event", { length: 100 }).notNull(),
      payload: text("payload"),
      // JSON payload enviado
      response: text("response"),
      // Resposta recebida
      status: varchar("status", { length: 20 }).notNull(),
      // success, error, pending
      errorMessage: text("error_message"),
      createdAt: timestamp("created_at").default(brazilNow())
    });
    evolutionApiConnections = pgTable("evolution_api_connections", {
      id: serial("id").primaryKey(),
      establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
      instanceName: varchar("instance_name", { length: 100 }).notNull(),
      // Nome da instância
      apiUrl: text("api_url").notNull(),
      // URL da Evolution API
      apiKey: varchar("api_key", { length: 255 }).notNull(),
      // API key da Evolution API
      status: varchar("status", { length: 20 }).default("disconnected"),
      // connected, disconnected, connecting, error
      qrCode: text("qr_code"),
      // QR Code base64 ou URL
      qrCodeExpiration: timestamp("qr_code_expiration"),
      // Expiração do QR Code
      lastStatusCheck: timestamp("last_status_check"),
      connectionData: text("connection_data"),
      // JSON com dados da conexão
      errorMessage: text("error_message"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").default(brazilNow()),
      updatedAt: timestamp("updated_at").default(brazilNow())
    });
    staffWorkingHours = pgTable("staff_working_hours", {
      id: serial("id").primaryKey(),
      establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
      staffId: integer("staff_id").references(() => staff.id).notNull(),
      dayOfWeek: integer("day_of_week").notNull(),
      // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      openTime: varchar("open_time", { length: 5 }),
      // HH:MM format
      closeTime: varchar("close_time", { length: 5 }),
      // HH:MM format
      isAvailable: boolean("is_available").default(true),
      // If staff works on this day
      createdAt: timestamp("created_at").default(brazilNow()),
      updatedAt: timestamp("updated_at").default(brazilNow())
    });
    notifications = pgTable("notifications", {
      id: serial("id").primaryKey(),
      establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
      appointmentId: integer("appointment_id").references(() => appointments.id),
      title: varchar("title", { length: 255 }).notNull(),
      message: text("message").notNull(),
      type: varchar("type", { length: 50 }).default("appointment"),
      // appointment, reminder, etc.
      isRead: boolean("is_read").default(false),
      createdAt: timestamp("created_at").default(brazilNow())
    });
    pushSubscriptions = pgTable("push_subscriptions", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id).notNull(),
      establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
      subscription: text("subscription").notNull(),
      // JSON string with subscription details
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").default(brazilNow()),
      updatedAt: timestamp("updated_at").default(brazilNow())
    });
    insertEstablishmentSchema = createInsertSchema(establishments).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertClientSchema = createInsertSchema(clients).omit({
      id: true,
      createdAt: true
    });
    insertStaffSchema = createInsertSchema(staff).omit({
      id: true,
      createdAt: true
    });
    insertServiceCategorySchema = createInsertSchema(serviceCategories).omit({
      id: true,
      createdAt: true
    });
    insertServiceSchema = createInsertSchema(services).omit({
      id: true,
      createdAt: true
    });
    insertAppointmentSchema = createInsertSchema(appointments).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertProductSchema = createInsertSchema(products).omit({
      id: true,
      createdAt: true
    });
    insertTransactionSchema = createInsertSchema(transactions).omit({
      id: true,
      createdAt: true
    });
    insertBusinessSettingsSchema = createInsertSchema(businessSettings).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertBusinessHoursSchema = createInsertSchema(businessHours).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertPlanSchema = createInsertSchema(plans).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertN8nIntegrationSchema = createInsertSchema(n8nIntegrations).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      lastTriggered: true
    });
    insertWebhookLogSchema = createInsertSchema(webhookLogs).omit({
      id: true,
      createdAt: true
    });
    insertStaffWorkingHoursSchema = createInsertSchema(staffWorkingHours).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertStaffVacationSchema = createInsertSchema(staffVacations).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertEvolutionApiConnectionSchema = createInsertSchema(evolutionApiConnections).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      lastStatusCheck: true
    });
    insertNotificationSchema = createInsertSchema(notifications).omit({
      id: true,
      createdAt: true
    });
    insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    n8nWebhookData = pgTable("n8n_webhook_data", {
      id: serial("id").primaryKey(),
      establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
      establishmentName: varchar("establishment_name", { length: 255 }),
      // Nome do estabelecimento
      qrCodeBase64: text("qr_code_base64"),
      apiKey: varchar("api_key", { length: 255 }),
      instanceId: varchar("instance_id", { length: 255 }),
      isActive: boolean("is_active").default(true),
      // Only one active record per establishment
      createdAt: timestamp("created_at").default(brazilNow()),
      updatedAt: timestamp("updated_at").default(brazilNow())
    });
    insertN8nWebhookDataSchema = createInsertSchema(n8nWebhookData).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    loyaltyPrograms = pgTable("loyalty_programs", {
      id: serial("id").primaryKey(),
      establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
      name: varchar("name", { length: 100 }).notNull().default("Programa Fidelidade"),
      pointsPerService: integer("points_per_service").notNull().default(1),
      // Pontos por serviço realizado
      pointsToReward: integer("points_to_reward").notNull().default(10),
      // Pontos necessários para ganhar recompensa
      rewardDescription: varchar("reward_description", { length: 255 }).notNull().default("Servi\xE7o gratuito"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").default(brazilNow()),
      updatedAt: timestamp("updated_at").default(brazilNow())
    });
    loyaltyProgramServices = pgTable("loyalty_program_services", {
      id: serial("id").primaryKey(),
      establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
      loyaltyProgramId: integer("loyalty_program_id").references(() => loyaltyPrograms.id).notNull(),
      serviceId: integer("service_id").references(() => services.id).notNull(),
      createdAt: timestamp("created_at").default(brazilNow())
    });
    clientLoyaltyPoints = pgTable("client_loyalty_points", {
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
      updatedAt: timestamp("updated_at").default(brazilNow())
    });
    loyaltyPointTransactions = pgTable("loyalty_point_transactions", {
      id: serial("id").primaryKey(),
      establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
      clientId: integer("client_id").references(() => clients.id).notNull(),
      loyaltyProgramId: integer("loyalty_program_id").references(() => loyaltyPrograms.id).notNull(),
      appointmentId: integer("appointment_id").references(() => appointments.id),
      // Linked to appointment
      points: integer("points").notNull(),
      // Positive for earned, negative for used
      type: varchar("type", { length: 20 }).notNull(),
      // "earned" or "used"
      description: varchar("description", { length: 255 }),
      createdAt: timestamp("created_at").default(brazilNow())
    });
    insertLoyaltyProgramSchema = createInsertSchema(loyaltyPrograms).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertLoyaltyProgramServiceSchema = createInsertSchema(loyaltyProgramServices).omit({
      id: true,
      createdAt: true
    });
    insertClientLoyaltyPointsSchema = createInsertSchema(clientLoyaltyPoints).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertLoyaltyPointTransactionSchema = createInsertSchema(loyaltyPointTransactions).omit({
      id: true,
      createdAt: true
    });
    agendaReleasePolicies = pgTable("agenda_release_policies", {
      id: serial("id").primaryKey(),
      establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
      releaseInterval: integer("release_interval").notNull(),
      // 1, 2, 3... 12 meses
      releaseDay: integer("release_day").notNull(),
      // 1-31 dia do mês
      releasedMonths: text("released_months").array().default([]),
      // ["2025-09", "2025-10"] - meses liberados
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").default(brazilNow()),
      updatedAt: timestamp("updated_at").default(brazilNow())
    });
    agendaReleases = pgTable("agenda_releases", {
      id: serial("id").primaryKey(),
      establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
      releaseDate: timestamp("release_date").notNull(),
      // Quando foi liberado
      releasedMonths: text("released_months").array().notNull(),
      // ["2025-09", "2025-10"]
      type: varchar("type", { length: 20 }).default("automatic"),
      // "automatic" ou "manual"
      createdAt: timestamp("created_at").default(brazilNow())
    });
    insertAgendaReleasePolicySchema = createInsertSchema(agendaReleasePolicies).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertAgendaReleaseSchema = createInsertSchema(agendaReleases).omit({
      id: true,
      createdAt: true
    });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  closeDatabase: () => closeDatabase,
  db: () => db,
  initializeDatabase: () => initializeDatabase,
  pool: () => pool
});
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
async function initializeDatabase() {
  try {
    const result = await pool.query("SELECT NOW() as current_time");
    const tableCheck = await pool.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    return true;
  } catch (error) {
    console.error("\u274C Database initialization failed:", error);
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
async function closeDatabase() {
  try {
    await pool.end();
  } catch (error) {
    console.error("\u274C Error closing database:", error);
  }
}
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    neonConfig.poolQueryViaFetch = true;
    neonConfig.useSecureWebSocket = true;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 3e4,
      connectionTimeoutMillis: 3e4
    });
    pool.on("error", (err) => {
      console.error("\u274C Database pool error:", err);
    });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  DatabaseStorage: () => DatabaseStorage,
  storage: () => storage
});
import { eq, and, gte, lte, gt, sql as sql2, like, desc, or, count } from "drizzle-orm";
import bcrypt from "bcrypt";
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    DatabaseStorage = class {
      // Establishment operations
      async getEstablishment(id) {
        const [establishment] = await db.select().from(establishments).where(eq(establishments.id, id));
        return establishment || void 0;
      }
      async getEstablishmentByEmail(email) {
        const [establishment] = await db.select().from(establishments).where(eq(establishments.email, email));
        return establishment || void 0;
      }
      async createEstablishment(insertEstablishment) {
        const [establishment] = await db.insert(establishments).values(insertEstablishment).returning();
        return establishment;
      }
      // User operations
      async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user || void 0;
      }
      async getUserByEmail(email) {
        const normalizedEmail = email.toLowerCase();
        const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail));
        return user || void 0;
      }
      async createUser(insertUser) {
        const hashedPassword = await bcrypt.hash(insertUser.password, 10);
        const [user] = await db.insert(users).values({
          ...insertUser,
          email: insertUser.email.toLowerCase(),
          password: hashedPassword
        }).returning();
        return user;
      }
      // Client operations
      async getClients(establishmentId) {
        return await db.select().from(clients).where(eq(clients.establishmentId, establishmentId));
      }
      async getClient(id, establishmentId) {
        const [client] = await db.select().from(clients).where(and(eq(clients.id, id), eq(clients.establishmentId, establishmentId)));
        return client;
      }
      async createClient(insertClient) {
        const [client] = await db.insert(clients).values(insertClient).returning();
        return client;
      }
      async updateClient(id, updateData, establishmentId) {
        const [client] = await db.update(clients).set(updateData).where(and(eq(clients.id, id), eq(clients.establishmentId, establishmentId))).returning();
        return client;
      }
      async deleteClient(id, establishmentId) {
        const clientAppointments = await db.select({ id: appointments.id }).from(appointments).where(eq(appointments.clientId, id));
        for (const appointment of clientAppointments) {
          await db.delete(transactions).where(eq(transactions.appointmentId, appointment.id));
        }
        for (const appointment of clientAppointments) {
          await db.delete(notifications).where(eq(notifications.appointmentId, appointment.id));
        }
        await db.delete(loyaltyPointTransactions).where(eq(loyaltyPointTransactions.clientId, id));
        await db.delete(clientLoyaltyPoints).where(eq(clientLoyaltyPoints.clientId, id));
        await db.delete(appointments).where(eq(appointments.clientId, id));
        await db.delete(clients).where(and(eq(clients.id, id), eq(clients.establishmentId, establishmentId)));
      }
      async searchClients(query, establishmentId) {
        return await db.select().from(clients).where(and(like(clients.name, `%${query}%`), eq(clients.establishmentId, establishmentId)));
      }
      async checkClientPhoneExists(phone, establishmentId) {
        const result = await db.select({ id: clients.id }).from(clients).where(and(
          eq(clients.establishmentId, establishmentId),
          eq(clients.phone, phone)
        )).limit(1);
        return result.length > 0;
      }
      // Staff operations
      async getStaff(establishmentId) {
        return await db.select().from(staff).where(and(eq(staff.isActive, true), eq(staff.establishmentId, establishmentId)));
      }
      async getStaffMember(id, establishmentId) {
        const [staffMember] = await db.select().from(staff).where(and(eq(staff.id, id), eq(staff.establishmentId, establishmentId)));
        return staffMember;
      }
      async getStaffByUserId(userId, establishmentId) {
        try {
          const user = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
          if (!user || user.length === 0) {
            return void 0;
          }
          const [staffMember] = await db.select().from(staff).where(and(
            eq(staff.email, user[0].email),
            eq(staff.establishmentId, establishmentId)
          ));
          return staffMember;
        } catch (error) {
          console.error("Error in getStaffByUserId:", error);
          return void 0;
        }
      }
      async createStaff(insertStaff) {
        const [staffMember] = await db.insert(staff).values(insertStaff).returning();
        return staffMember;
      }
      async updateStaff(id, updateData) {
        const [staffMember] = await db.update(staff).set(updateData).where(eq(staff.id, id)).returning();
        return staffMember;
      }
      async deleteStaff(id) {
        const staffAppointments = await db.select({ id: appointments.id }).from(appointments).where(eq(appointments.staffId, id));
        for (const appointment of staffAppointments) {
          await db.delete(loyaltyPointTransactions).where(eq(loyaltyPointTransactions.appointmentId, appointment.id));
        }
        for (const appointment of staffAppointments) {
          await db.delete(transactions).where(eq(transactions.appointmentId, appointment.id));
        }
        for (const appointment of staffAppointments) {
          await db.delete(notifications).where(eq(notifications.appointmentId, appointment.id));
        }
        await db.update(users).set({ staffId: null }).where(eq(users.staffId, id));
        await db.delete(appointments).where(eq(appointments.staffId, id));
        await db.delete(staffWorkingHours).where(eq(staffWorkingHours.staffId, id));
        await db.delete(staffVacations).where(eq(staffVacations.staffId, id));
        await db.delete(staff).where(eq(staff.id, id));
      }
      // Service operations
      async getServices(establishmentId) {
        return await db.select().from(services).where(and(eq(services.isActive, true), eq(services.establishmentId, establishmentId)));
      }
      async getService(id, establishmentId) {
        const [service] = await db.select().from(services).where(and(eq(services.id, id), eq(services.establishmentId, establishmentId)));
        return service;
      }
      async createService(insertService) {
        const [service] = await db.insert(services).values(insertService).returning();
        return service;
      }
      async updateService(id, updateData) {
        const [service] = await db.update(services).set(updateData).where(eq(services.id, id)).returning();
        return service;
      }
      async deleteService(id) {
        const serviceAppointments = await db.select({ id: appointments.id }).from(appointments).where(eq(appointments.serviceId, id));
        for (const appointment of serviceAppointments) {
          await db.delete(transactions).where(eq(transactions.appointmentId, appointment.id));
        }
        for (const appointment of serviceAppointments) {
          await db.delete(notifications).where(eq(notifications.appointmentId, appointment.id));
        }
        await db.delete(loyaltyProgramServices).where(eq(loyaltyProgramServices.serviceId, id));
        await db.delete(appointments).where(eq(appointments.serviceId, id));
        await db.delete(services).where(eq(services.id, id));
      }
      // Service Category operations
      async getServiceCategories(establishmentId) {
        return await db.select().from(serviceCategories).where(eq(serviceCategories.establishmentId, establishmentId));
      }
      async getServiceCategory(id, establishmentId) {
        const [category] = await db.select().from(serviceCategories).where(and(eq(serviceCategories.id, id), eq(serviceCategories.establishmentId, establishmentId)));
        return category || void 0;
      }
      async createServiceCategory(insertCategory) {
        const [category] = await db.insert(serviceCategories).values(insertCategory).returning();
        return category;
      }
      async deleteServiceCategory(id, establishmentId) {
        await db.update(services).set({ category: null }).where(eq(services.category, String(id)));
        await db.delete(serviceCategories).where(and(eq(serviceCategories.id, id), eq(serviceCategories.establishmentId, establishmentId)));
      }
      // Appointment operations
      async getAppointments(establishmentId) {
        return await db.select({
          id: appointments.id,
          appointmentDate: appointments.appointmentDate,
          duration: appointments.duration,
          status: appointments.status,
          notes: appointments.notes,
          staffId: appointments.staffId,
          clientId: appointments.clientId,
          clientName: clients.name,
          staffName: staff.name,
          serviceName: services.name,
          servicePrice: services.price
        }).from(appointments).leftJoin(clients, eq(appointments.clientId, clients.id)).leftJoin(staff, eq(appointments.staffId, staff.id)).leftJoin(services, eq(appointments.serviceId, services.id)).where(and(
          eq(clients.establishmentId, establishmentId),
          eq(staff.establishmentId, establishmentId),
          eq(services.establishmentId, establishmentId)
        )).orderBy(appointments.appointmentDate);
      }
      async getAppointmentsByClientId(clientId, establishmentId) {
        return await db.select({
          id: appointments.id,
          appointmentDate: appointments.appointmentDate,
          duration: appointments.duration,
          status: appointments.status,
          notes: appointments.notes,
          clientId: appointments.clientId,
          staffId: appointments.staffId,
          serviceId: appointments.serviceId,
          clientName: clients.name,
          clientPhone: clients.phone,
          clientEmail: clients.email,
          staffName: staff.name,
          serviceName: services.name,
          servicePrice: services.price,
          createdAt: appointments.createdAt
        }).from(appointments).leftJoin(clients, eq(appointments.clientId, clients.id)).leftJoin(staff, eq(appointments.staffId, staff.id)).leftJoin(services, eq(appointments.serviceId, services.id)).where(and(
          eq(appointments.clientId, clientId),
          eq(clients.establishmentId, establishmentId),
          eq(staff.establishmentId, establishmentId),
          eq(services.establishmentId, establishmentId)
        )).orderBy(desc(appointments.appointmentDate));
      }
      async getAppointmentsByStaff(establishmentId, staffId) {
        return await db.select({
          id: appointments.id,
          appointmentDate: appointments.appointmentDate,
          duration: appointments.duration,
          status: appointments.status,
          notes: appointments.notes,
          clientId: appointments.clientId,
          staffId: appointments.staffId,
          serviceId: appointments.serviceId,
          clientName: clients.name,
          clientPhone: clients.phone,
          clientEmail: clients.email,
          staffName: staff.name,
          serviceName: services.name,
          servicePrice: services.price,
          createdAt: appointments.createdAt
        }).from(appointments).leftJoin(clients, eq(appointments.clientId, clients.id)).leftJoin(staff, eq(appointments.staffId, staff.id)).leftJoin(services, eq(appointments.serviceId, services.id)).where(and(
          eq(appointments.staffId, staffId),
          eq(appointments.establishmentId, establishmentId)
        )).orderBy(desc(appointments.appointmentDate));
      }
      async getAppointmentsRaw() {
        return await db.select().from(appointments).orderBy(appointments.appointmentDate);
      }
      async getAppointment(id, establishmentId) {
        const [appointment] = await db.select().from(appointments).where(
          and(
            eq(appointments.id, id),
            eq(appointments.establishmentId, establishmentId)
          )
        );
        return appointment;
      }
      // For N8N endpoints - gets appointment by ID without establishmentId restriction
      async getAppointmentById(id) {
        const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
        return appointment;
      }
      async createAppointment(insertAppointment) {
        const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
        const [client, service, staffMember] = await Promise.all([
          this.getClient(appointment.clientId, appointment.establishmentId),
          this.getService(appointment.serviceId, appointment.establishmentId),
          this.getStaffMember(appointment.staffId, appointment.establishmentId)
        ]);
        const appointmentDate = new Date(appointment.appointmentDate);
        const formattedDate = appointmentDate.toLocaleDateString("pt-BR");
        const formattedTime = appointmentDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        const formattedPrice = service?.price ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseFloat(service.price)) : "Valor n\xE3o informado";
        const notification = {
          establishmentId: appointment.establishmentId,
          appointmentId: appointment.id,
          title: "Novo Agendamento",
          message: `Cliente: ${client?.name || "Cliente"}
Servi\xE7o: ${service?.name || "Servi\xE7o"}
Profissional: ${staffMember?.name || "Profissional"}
Data: ${formattedDate}
Hora: ${formattedTime}
Dura\xE7\xE3o: ${appointment.duration || service?.duration || 30} minutos
Valor: ${formattedPrice}`,
          type: "appointment",
          isRead: false
        };
        await this.createNotification(notification);
        return appointment;
      }
      async updateAppointment(id, updateData) {
        const [appointment] = await db.update(appointments).set(updateData).where(eq(appointments.id, id)).returning();
        return appointment;
      }
      async deleteAppointment(id) {
        await db.delete(notifications).where(eq(notifications.appointmentId, id));
        await db.delete(appointments).where(eq(appointments.id, id));
      }
      async getTodaysAppointments(establishmentId) {
        return await db.select({
          id: appointments.id,
          appointmentDate: appointments.appointmentDate,
          duration: appointments.duration,
          status: appointments.status,
          clientName: clients.name,
          staffId: appointments.staffId,
          staffName: staff.name,
          serviceName: services.name,
          servicePrice: services.price
        }).from(appointments).leftJoin(clients, eq(appointments.clientId, clients.id)).leftJoin(staff, eq(appointments.staffId, staff.id)).leftJoin(services, eq(appointments.serviceId, services.id)).where(
          and(
            eq(appointments.establishmentId, establishmentId),
            sql2`DATE(${appointments.appointmentDate}) = CURRENT_DATE`,
            or(
              eq(appointments.status, "confirmed"),
              eq(appointments.status, "scheduled")
            )
          )
        ).orderBy(appointments.appointmentDate);
      }
      async getPendingAppointments(establishmentId) {
        const result = await db.select({
          id: appointments.id,
          appointmentDate: appointments.appointmentDate,
          duration: appointments.duration,
          status: appointments.status,
          notes: appointments.notes,
          clientName: clients.name,
          clientPhone: clients.phone,
          clientEmail: clients.email,
          staffName: staff.name,
          staffId: staff.id,
          serviceName: services.name,
          servicePrice: services.price,
          createdAt: appointments.createdAt
        }).from(appointments).leftJoin(clients, eq(appointments.clientId, clients.id)).leftJoin(staff, eq(appointments.staffId, staff.id)).leftJoin(services, eq(appointments.serviceId, services.id)).where(and(
          eq(appointments.status, "pending"),
          eq(clients.establishmentId, establishmentId),
          eq(staff.establishmentId, establishmentId),
          eq(services.establishmentId, establishmentId)
        )).orderBy(desc(appointments.createdAt));
        return result;
      }
      // Get pending appointments for a specific staff member
      async getPendingAppointmentsForStaff(establishmentId, staffId) {
        const result = await db.select({
          id: appointments.id,
          appointmentDate: appointments.appointmentDate,
          duration: appointments.duration,
          status: appointments.status,
          notes: appointments.notes,
          clientName: clients.name,
          clientPhone: clients.phone,
          clientEmail: clients.email,
          staffName: staff.name,
          staffId: staff.id,
          serviceName: services.name,
          servicePrice: services.price,
          createdAt: appointments.createdAt
        }).from(appointments).leftJoin(clients, eq(appointments.clientId, clients.id)).leftJoin(staff, eq(appointments.staffId, staff.id)).leftJoin(services, eq(appointments.serviceId, services.id)).where(and(
          eq(appointments.status, "pending"),
          eq(appointments.staffId, staffId),
          eq(clients.establishmentId, establishmentId),
          eq(staff.establishmentId, establishmentId),
          eq(services.establishmentId, establishmentId)
        )).orderBy(desc(appointments.createdAt));
        return result;
      }
      async getRecentAppointments(establishmentId) {
        const today = /* @__PURE__ */ new Date();
        const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1e3);
        return await db.select({
          id: appointments.id,
          appointmentDate: appointments.appointmentDate,
          duration: appointments.duration,
          status: appointments.status,
          notes: appointments.notes,
          clientName: clients.name,
          clientPhone: clients.phone,
          clientEmail: clients.email,
          staffName: staff.name,
          serviceName: services.name,
          servicePrice: services.price,
          createdAt: appointments.createdAt
        }).from(appointments).leftJoin(clients, eq(appointments.clientId, clients.id)).leftJoin(staff, eq(appointments.staffId, staff.id)).leftJoin(services, eq(appointments.serviceId, services.id)).where(and(
          eq(clients.establishmentId, establishmentId),
          eq(staff.establishmentId, establishmentId),
          eq(services.establishmentId, establishmentId),
          gte(appointments.appointmentDate, threeDaysAgo)
        )).orderBy(desc(appointments.appointmentDate));
      }
      // Paginated appointment operations (COST OPTIMIZATION)
      async getPaginatedAppointments(establishmentId, offset, limit, month, statusFilter) {
        const conditions = [eq(appointments.establishmentId, establishmentId)];
        if (month) {
          const [year, monthNum] = month.split("-").map(Number);
          const startDate = new Date(year, monthNum - 1, 1);
          const endDate = new Date(year, monthNum, 0, 23, 59, 59);
          conditions.push(gte(appointments.appointmentDate, startDate));
          conditions.push(lte(appointments.appointmentDate, endDate));
        }
        if (statusFilter && statusFilter !== "all") {
          if (statusFilter === "scheduled") {
            const scheduledCondition = or(
              eq(appointments.status, "scheduled"),
              eq(appointments.status, "agendado"),
              eq(appointments.status, "confirmed")
            );
            if (scheduledCondition) conditions.push(scheduledCondition);
          } else if (statusFilter === "completed") {
            const completedCondition = or(
              eq(appointments.status, "completed"),
              eq(appointments.status, "realizado")
            );
            if (completedCondition) conditions.push(completedCondition);
          }
        }
        const whereConditions = and(...conditions);
        const [totalResult] = await db.select({ count: count() }).from(appointments).where(whereConditions);
        const total = totalResult.count;
        const paginatedAppointments = await db.select({
          id: appointments.id,
          appointmentDate: appointments.appointmentDate,
          dataFim: appointments.dataFim,
          duration: appointments.duration,
          status: appointments.status,
          notes: appointments.notes,
          clientId: appointments.clientId,
          staffId: appointments.staffId,
          serviceId: appointments.serviceId,
          establishmentId: appointments.establishmentId,
          createdAt: appointments.createdAt,
          clientName: clients.name,
          clientPhone: clients.phone,
          staffName: staff.name,
          serviceName: services.name,
          servicePrice: services.price
        }).from(appointments).leftJoin(clients, eq(appointments.clientId, clients.id)).leftJoin(staff, eq(appointments.staffId, staff.id)).leftJoin(services, eq(appointments.serviceId, services.id)).where(whereConditions).orderBy(desc(appointments.appointmentDate)).limit(limit).offset(offset);
        return {
          appointments: paginatedAppointments,
          total
        };
      }
      // Paginated staff appointment operations (COST OPTIMIZATION)
      async getPaginatedStaffAppointments(establishmentId, staffId, offset, limit, month, statusFilter) {
        let whereConditions = and(
          eq(appointments.establishmentId, establishmentId),
          eq(appointments.staffId, staffId)
        );
        if (month) {
          const [year, monthNum] = month.split("-").map(Number);
          const startDate = new Date(year, monthNum - 1, 1);
          const endDate = new Date(year, monthNum, 0, 23, 59, 59);
          whereConditions = and(
            whereConditions,
            gte(appointments.appointmentDate, startDate),
            lte(appointments.appointmentDate, endDate)
          );
        }
        if (statusFilter && statusFilter !== "all") {
          if (statusFilter === "scheduled") {
            whereConditions = and(
              whereConditions,
              or(eq(appointments.status, "scheduled"), eq(appointments.status, "agendado"), eq(appointments.status, "confirmed"))
            );
          } else if (statusFilter === "completed") {
            whereConditions = and(
              whereConditions,
              or(eq(appointments.status, "completed"), eq(appointments.status, "realizado"))
            );
          }
        }
        const [totalResult] = await db.select({ count: count() }).from(appointments).where(whereConditions);
        const total = totalResult.count;
        const paginatedAppointments = await db.select({
          id: appointments.id,
          appointmentDate: appointments.appointmentDate,
          dataFim: appointments.dataFim,
          duration: appointments.duration,
          status: appointments.status,
          notes: appointments.notes,
          clientId: appointments.clientId,
          staffId: appointments.staffId,
          serviceId: appointments.serviceId,
          establishmentId: appointments.establishmentId,
          createdAt: appointments.createdAt,
          clientName: clients.name,
          clientPhone: clients.phone,
          staffName: staff.name,
          serviceName: services.name,
          servicePrice: services.price
        }).from(appointments).leftJoin(clients, eq(appointments.clientId, clients.id)).leftJoin(staff, eq(appointments.staffId, staff.id)).leftJoin(services, eq(appointments.serviceId, services.id)).where(whereConditions).orderBy(desc(appointments.appointmentDate)).limit(limit).offset(offset);
        return {
          appointments: paginatedAppointments,
          total
        };
      }
      async updateAppointmentStatus(id, status, establishmentId) {
        const [appointment] = await db.update(appointments).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(appointments.id, id), eq(appointments.establishmentId, establishmentId))).returning();
        return appointment;
      }
      // Product operations
      async getProducts(establishmentId) {
        return await db.select().from(products).where(and(eq(products.isActive, true), eq(products.establishmentId, establishmentId)));
      }
      async getProduct(id, establishmentId) {
        const [product] = await db.select().from(products).where(and(eq(products.id, id), eq(products.establishmentId, establishmentId)));
        return product;
      }
      async createProduct(insertProduct) {
        const [product] = await db.insert(products).values(insertProduct).returning();
        return product;
      }
      async updateProduct(id, updateData, establishmentId) {
        const [product] = await db.update(products).set(updateData).where(and(eq(products.id, id), eq(products.establishmentId, establishmentId))).returning();
        return product;
      }
      async deleteProduct(id, establishmentId) {
        await db.delete(products).where(and(eq(products.id, id), eq(products.establishmentId, establishmentId)));
      }
      // Transaction operations
      async getTransactions(establishmentId) {
        return await db.select({
          id: transactions.id,
          amount: transactions.amount,
          type: transactions.type,
          category: transactions.category,
          paymentMethod: transactions.paymentMethod,
          description: transactions.description,
          transactionDate: transactions.transactionDate,
          clientName: clients.name
        }).from(transactions).leftJoin(clients, eq(transactions.clientId, clients.id)).where(eq(transactions.establishmentId, establishmentId)).orderBy(desc(transactions.transactionDate));
      }
      // Paginated transaction operations (COST OPTIMIZATION)
      async getPaginatedTransactions(establishmentId, offset, limit) {
        const [totalResult] = await db.select({ count: count() }).from(transactions).where(eq(transactions.establishmentId, establishmentId));
        const total = totalResult.count;
        const paginatedTransactions = await db.select({
          id: transactions.id,
          amount: transactions.amount,
          type: transactions.type,
          category: transactions.category,
          paymentMethod: transactions.paymentMethod,
          description: transactions.description,
          transactionDate: transactions.transactionDate,
          clientName: clients.name
        }).from(transactions).leftJoin(clients, eq(transactions.clientId, clients.id)).where(eq(transactions.establishmentId, establishmentId)).orderBy(desc(transactions.transactionDate)).limit(limit).offset(offset);
        return {
          transactions: paginatedTransactions,
          total
        };
      }
      // Paginated transactions for staff (only commission/salary related)
      async getPaginatedTransactionsForStaff(establishmentId, staffId, offset, limit) {
        const [totalResult] = await db.select({ count: count() }).from(transactions).innerJoin(appointments, eq(transactions.appointmentId, appointments.id)).where(
          and(
            eq(transactions.establishmentId, establishmentId),
            eq(appointments.staffId, staffId),
            eq(transactions.category, "Sal\xE1rios e Comiss\xF5es")
          )
        );
        const total = totalResult.count;
        const paginatedTransactions = await db.select({
          id: transactions.id,
          amount: transactions.amount,
          type: transactions.type,
          category: transactions.category,
          paymentMethod: transactions.paymentMethod,
          description: transactions.description,
          transactionDate: transactions.transactionDate,
          clientName: clients.name
        }).from(transactions).innerJoin(appointments, eq(transactions.appointmentId, appointments.id)).leftJoin(clients, eq(transactions.clientId, clients.id)).where(
          and(
            eq(transactions.establishmentId, establishmentId),
            eq(appointments.staffId, staffId),
            eq(transactions.category, "Sal\xE1rios e Comiss\xF5es")
          )
        ).orderBy(desc(transactions.transactionDate)).limit(limit).offset(offset);
        return {
          transactions: paginatedTransactions,
          total
        };
      }
      async getTransactionsByDate(establishmentId, date) {
        const result = await db.execute(sql2`
      SELECT 
        t.id,
        t.amount,
        t.type,
        t.category,
        t.payment_method as "paymentMethod",
        t.description,
        t.transaction_date as "transactionDate",
        c.name as "clientName"
      FROM transactions t
      LEFT JOIN clients c ON t.client_id = c.id
      WHERE t.establishment_id = ${establishmentId}
        AND DATE(t.transaction_date AT TIME ZONE 'America/Sao_Paulo') = ${date}::date
      ORDER BY t.transaction_date DESC
    `);
        return result.rows;
      }
      async createTransaction(insertTransaction) {
        const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
        return transaction;
      }
      async deleteTransaction(id) {
        await db.delete(transactions).where(eq(transactions.id, id));
      }
      async getFinancialStats(establishmentId) {
        try {
          const now = /* @__PURE__ */ new Date();
          const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
          const brazilToday = brazilTime.toISOString().split("T")[0];
          const brazilYear = brazilTime.getFullYear();
          const brazilMonth = brazilTime.getMonth() + 1;
          const todayStats = await db.execute(sql2`
        SELECT 
          SUM(CASE WHEN type = 'income' AND DATE(transaction_date AT TIME ZONE 'America/Sao_Paulo') = ${brazilToday}::date THEN amount::decimal ELSE 0 END) as today_income,
          SUM(CASE WHEN type = 'expense' AND DATE(transaction_date AT TIME ZONE 'America/Sao_Paulo') = ${brazilToday}::date THEN amount::decimal ELSE 0 END) as today_expenses,
          SUM(CASE WHEN type = 'income' AND EXTRACT(YEAR FROM transaction_date AT TIME ZONE 'America/Sao_Paulo') = ${brazilYear} AND EXTRACT(MONTH FROM transaction_date AT TIME ZONE 'America/Sao_Paulo') = ${brazilMonth} THEN amount::decimal ELSE 0 END) as month_income,
          SUM(CASE WHEN type = 'expense' AND EXTRACT(YEAR FROM transaction_date AT TIME ZONE 'America/Sao_Paulo') = ${brazilYear} AND EXTRACT(MONTH FROM transaction_date AT TIME ZONE 'America/Sao_Paulo') = ${brazilMonth} THEN amount::decimal ELSE 0 END) as month_expenses
        FROM transactions 
        WHERE establishment_id = ${establishmentId}
      `);
          const stats = todayStats.rows[0];
          return {
            todayIncome: parseFloat(String(stats.today_income || "0")),
            todayExpenses: parseFloat(String(stats.today_expenses || "0")),
            monthIncome: parseFloat(String(stats.month_income || "0")),
            monthExpenses: parseFloat(String(stats.month_expenses || "0"))
          };
        } catch (error) {
          console.error("Error in getFinancialStats:", error);
          return {
            todayIncome: 0,
            todayExpenses: 0,
            monthIncome: 0,
            monthExpenses: 0
          };
        }
      }
      async getRevenueStats() {
        const today = /* @__PURE__ */ new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const [todaysRevenue] = await db.select({ total: sql2`COALESCE(SUM(${transactions.amount}), 0)` }).from(transactions).where(gte(transactions.transactionDate, startOfDay));
        const [monthlyRevenue] = await db.select({ total: sql2`COALESCE(SUM(${transactions.amount}), 0)` }).from(transactions).where(gte(transactions.transactionDate, startOfMonth));
        return {
          todaysRevenue: todaysRevenue.total,
          monthlyRevenue: monthlyRevenue.total
        };
      }
      async getDashboardStats(establishmentId) {
        try {
          const dashboardStats = await db.execute(
            sql2`SELECT 
          COALESCE(SUM(CASE WHEN type = 'income' AND DATE(created_at) = CURRENT_DATE THEN amount::decimal ELSE 0 END), 0) as todays_revenue,
          COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as todays_appointments_count
        FROM transactions 
        WHERE establishment_id = ${establishmentId}`
          );
          const stats = dashboardStats.rows[0];
          const [todaysAppointments, totalClients, activeServices, lowStockProducts] = await Promise.all([
            // Today's appointments count
            db.execute(sql2`SELECT COUNT(*) as count FROM appointments 
          WHERE establishment_id = ${establishmentId} 
          AND DATE(appointment_date) = CURRENT_DATE`),
            // Total clients
            db.execute(sql2`SELECT COUNT(*) as count FROM clients 
          WHERE establishment_id = ${establishmentId}`),
            // Active services
            db.execute(sql2`SELECT COUNT(*) as count FROM services 
          WHERE establishment_id = ${establishmentId} AND is_active = true`),
            // Low stock products
            db.execute(sql2`SELECT COUNT(*) as count FROM products 
          WHERE establishment_id = ${establishmentId} 
          AND is_active = true AND stock <= min_stock`)
          ]);
          return {
            todaysRevenue: stats.todays_revenue || "0",
            todaysAppointments: todaysAppointments.rows[0].count || "0",
            totalClients: totalClients.rows[0].count || "0",
            activeServices: activeServices.rows[0].count || "0",
            lowStockProducts: lowStockProducts.rows[0].count || "0"
          };
        } catch (error) {
          console.error("Get dashboard stats error:", error);
          return {
            todaysRevenue: 0,
            todaysAppointments: 0,
            totalClients: 0,
            activeServices: 0,
            lowStockProducts: 0
          };
        }
      }
      // Get complete staff data including next appointment
      async getCompleteStaffData(establishmentId, staffId) {
        try {
          const appointmentsQuery = await db.execute(
            sql2`SELECT 
          COUNT(CASE WHEN DATE(a.appointment_date) = CURRENT_DATE AND (a.status = 'confirmed' OR a.status = 'scheduled') THEN 1 END) as today_upcoming_appointments,
          COUNT(CASE WHEN DATE(a.appointment_date) = CURRENT_DATE AND a.status = 'completed' THEN 1 END) as today_completed_appointments
        FROM appointments a
        WHERE a.establishment_id = ${establishmentId} 
        AND a.staff_id = ${staffId}`
          );
          const appointmentResult = appointmentsQuery.rows[0];
          return {
            todayUpcomingAppointments: parseInt(appointmentResult?.today_upcoming_appointments || 0),
            todayCompletedAppointments: parseInt(appointmentResult?.today_completed_appointments || 0)
          };
        } catch (error) {
          console.error("Error getting complete staff data:", error);
          return {
            todayUpcomingAppointments: 0,
            todayCompletedAppointments: 0
          };
        }
      }
      // Staff-specific dashboard stats
      async getDashboardStatsForStaff(establishmentId, staffId) {
        try {
          const staffStats = await db.execute(
            sql2`SELECT 
          COUNT(CASE WHEN DATE(a.appointment_date) = CURRENT_DATE AND (a.status = 'confirmed' OR a.status = 'scheduled') THEN 1 END) as todays_appointments_count,
          COUNT(CASE WHEN DATE(a.appointment_date) = CURRENT_DATE AND a.status = 'completed' THEN 1 END) as completed_appointments_count
        FROM appointments a
        WHERE a.establishment_id = ${establishmentId} 
        AND a.staff_id = ${staffId}`
          );
          const establishment = await this.getEstablishment(establishmentId);
          const timezone = establishment?.timezone || "America/Sao_Paulo";
          const currentTimeInTimezone = await db.execute(
            sql2`SELECT NOW() AT TIME ZONE ${timezone} as current_time`
          );
          const currentTime = currentTimeInTimezone.rows[0]?.current_time;
          const nextAppointment = await db.execute(
            sql2`SELECT 
          a.appointment_date,
          c.name as client_name,
          a.status
        FROM appointments a
        LEFT JOIN clients c ON a.client_id = c.id
        WHERE a.establishment_id = ${establishmentId} 
        AND a.staff_id = ${staffId}
        AND a.appointment_date >= ${currentTime}
        AND (a.status = 'confirmed' OR a.status = 'scheduled')
        ORDER BY a.appointment_date ASC
        LIMIT 1`
          );
          const debugAppointments = await db.execute(
            sql2`SELECT 
          a.id,
          a.appointment_date,
          c.name as client_name,
          a.status,
          NOW() AT TIME ZONE ${timezone} as current_time_local,
          a.appointment_date AT TIME ZONE ${timezone} as appointment_time_local,
          CASE 
            WHEN DATE(a.appointment_date AT TIME ZONE ${timezone}) = DATE(NOW() AT TIME ZONE ${timezone}) 
                 AND a.appointment_date >= (NOW() AT TIME ZONE ${timezone}) THEN 'TODAY_FUTURE'
            WHEN DATE(a.appointment_date AT TIME ZONE ${timezone}) = DATE(NOW() AT TIME ZONE ${timezone}) 
                 AND a.appointment_date < (NOW() AT TIME ZONE ${timezone}) THEN 'TODAY_PAST'
            WHEN DATE(a.appointment_date AT TIME ZONE ${timezone}) > DATE(NOW() AT TIME ZONE ${timezone}) THEN 'FUTURE_DAYS'
            ELSE 'PAST'
          END as time_category
        FROM appointments a
        LEFT JOIN clients c ON a.client_id = c.id
        WHERE a.establishment_id = ${establishmentId} 
        AND a.staff_id = ${staffId}
        AND (a.status = 'confirmed' OR a.status = 'scheduled')
        ORDER BY a.appointment_date ASC
        LIMIT 5`
          );
          const stats = staffStats.rows[0];
          const nextAppt = nextAppointment.rows[0];
          const result = {
            todaysAppointmentsCount: parseInt(String(stats.todays_appointments_count)) || 0,
            completedAppointmentsCount: parseInt(String(stats.completed_appointments_count)) || 0,
            nextAppointmentTime: nextAppt ? new Date(String(nextAppt.appointment_date)).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit"
            }) : null,
            nextAppointmentClient: nextAppt ? String(nextAppt.client_name) : null,
            nextAppointmentDate: nextAppt ? new Date(String(nextAppt.appointment_date)).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit"
            }) : null,
            // Staff members don't see global stats
            totalClients: 0,
            activeServices: 0,
            lowStockProducts: 0
          };
          return result;
        } catch (error) {
          console.error("Get staff dashboard stats error:", error);
          return {
            todaysAppointmentsCount: 0,
            completedAppointmentsCount: 0,
            nextAppointmentTime: null,
            nextAppointmentClient: null,
            totalClients: 0,
            activeServices: 0,
            lowStockProducts: 0
          };
        }
      }
      // Staff-specific financial stats
      async getFinancialStatsForStaff(establishmentId, staffId) {
        try {
          const staffFinancialStats = await db.execute(sql2`
        SELECT 
          COALESCE(SUM(CASE WHEN t.type = 'income' AND DATE(t.created_at) = CURRENT_DATE THEN t.amount::decimal ELSE 0 END), 0) as today_income,
          COALESCE(SUM(CASE WHEN t.type = 'expense' AND DATE(t.created_at) = CURRENT_DATE THEN t.amount::decimal ELSE 0 END), 0) as today_expenses,
          COALESCE(SUM(CASE WHEN t.type = 'income' AND EXTRACT(MONTH FROM t.created_at) = EXTRACT(MONTH FROM NOW()) AND EXTRACT(YEAR FROM t.created_at) = EXTRACT(YEAR FROM NOW()) THEN t.amount::decimal ELSE 0 END), 0) as month_income,
          COALESCE(SUM(CASE WHEN t.type = 'expense' AND EXTRACT(MONTH FROM t.created_at) = EXTRACT(MONTH FROM NOW()) AND EXTRACT(YEAR FROM t.created_at) = EXTRACT(YEAR FROM NOW()) THEN t.amount::decimal ELSE 0 END), 0) as month_expenses
        FROM appointments a
        LEFT JOIN transactions t ON t.appointment_id = a.id
        WHERE a.establishment_id = ${establishmentId}
        AND a.staff_id = ${staffId}
      `);
          const stats = staffFinancialStats.rows[0];
          return {
            todayIncome: parseFloat(String(stats.today_income || "0")),
            todayExpenses: parseFloat(String(stats.today_expenses || "0")),
            monthIncome: parseFloat(String(stats.month_income || "0")),
            monthExpenses: parseFloat(String(stats.month_expenses || "0"))
          };
        } catch (error) {
          console.error("Error in getFinancialStatsForStaff:", error);
          return {
            todayIncome: 0,
            todayExpenses: 0,
            monthIncome: 0,
            monthExpenses: 0
          };
        }
      }
      // Staff-specific today's appointments - for dashboard shows all confirmed/scheduled for today
      async getTodaysAppointmentsForStaff(establishmentId, staffId) {
        return await db.select({
          id: appointments.id,
          appointmentDate: appointments.appointmentDate,
          duration: appointments.duration,
          status: appointments.status,
          notes: appointments.notes,
          clientId: appointments.clientId,
          staffId: appointments.staffId,
          serviceId: appointments.serviceId,
          clientName: clients.name,
          clientPhone: clients.phone,
          clientEmail: clients.email,
          staffName: staff.name,
          serviceName: services.name,
          servicePrice: services.price,
          createdAt: appointments.createdAt
        }).from(appointments).leftJoin(clients, eq(appointments.clientId, clients.id)).leftJoin(staff, eq(appointments.staffId, staff.id)).leftJoin(services, eq(appointments.serviceId, services.id)).where(and(
          eq(appointments.establishmentId, establishmentId),
          eq(appointments.staffId, staffId),
          sql2`DATE(${appointments.appointmentDate}) = CURRENT_DATE`,
          or(
            eq(appointments.status, "confirmed"),
            eq(appointments.status, "scheduled")
          )
        )).orderBy(appointments.appointmentDate);
      }
      // Staff-specific recent appointments
      async getNextAppointmentForStaff(establishmentId, staffId) {
        const now = /* @__PURE__ */ new Date();
        const brazilNow2 = new Date(now.getTime() - 3 * 60 * 60 * 1e3);
        const [nextAppointment] = await db.select({
          id: appointments.id,
          appointmentDate: appointments.appointmentDate,
          duration: appointments.duration,
          status: appointments.status,
          clientName: clients.name,
          serviceName: services.name,
          servicePrice: services.price
        }).from(appointments).leftJoin(clients, eq(appointments.clientId, clients.id)).leftJoin(services, eq(appointments.serviceId, services.id)).where(and(
          eq(appointments.establishmentId, establishmentId),
          eq(appointments.staffId, staffId),
          sql2`${appointments.appointmentDate} > ${brazilNow2.toISOString()}`,
          or(
            eq(appointments.status, "scheduled"),
            eq(appointments.status, "confirmed")
          )
        )).orderBy(appointments.appointmentDate).limit(1);
        return nextAppointment || null;
      }
      async getRecentAppointmentsForStaff(establishmentId, staffId) {
        return await db.select({
          id: appointments.id,
          appointmentDate: appointments.appointmentDate,
          duration: appointments.duration,
          status: appointments.status,
          notes: appointments.notes,
          clientId: appointments.clientId,
          staffId: appointments.staffId,
          serviceId: appointments.serviceId,
          clientName: clients.name,
          clientPhone: clients.phone,
          clientEmail: clients.email,
          staffName: staff.name,
          serviceName: services.name,
          servicePrice: services.price,
          createdAt: appointments.createdAt
        }).from(appointments).leftJoin(clients, eq(appointments.clientId, clients.id)).leftJoin(staff, eq(appointments.staffId, staff.id)).leftJoin(services, eq(appointments.serviceId, services.id)).where(and(
          eq(appointments.establishmentId, establishmentId),
          eq(appointments.staffId, staffId)
        )).orderBy(desc(appointments.appointmentDate)).limit(10);
      }
      async checkAppointmentConflict(staffId, dataInicio, dataFim) {
        try {
          const existingAppointments = await db.select().from(appointments).leftJoin(services, eq(appointments.serviceId, services.id)).where(eq(appointments.staffId, staffId));
          for (const aptData of existingAppointments) {
            const apt = aptData.appointments;
            const service = aptData.services;
            if (!apt || !service) continue;
            const existingStart = new Date(apt.appointmentDate);
            const existingEnd = new Date(existingStart.getTime() + service.duration * 6e4 - 6e4);
            if (dataInicio <= existingEnd && dataFim >= existingStart) {
              return true;
            }
          }
          return false;
        } catch (error) {
          console.error("Check appointment conflict error:", error);
          return false;
        }
      }
      async getUpcomingTodaysAppointments() {
        const scheduledAppointments = await db.select({
          id: appointments.id,
          appointmentDate: appointments.appointmentDate,
          duration: appointments.duration,
          status: appointments.status,
          notes: appointments.notes,
          clientName: clients.name,
          staffName: staff.name,
          serviceName: services.name,
          servicePrice: services.price
        }).from(appointments).leftJoin(clients, eq(appointments.clientId, clients.id)).leftJoin(staff, eq(appointments.staffId, staff.id)).leftJoin(services, eq(appointments.serviceId, services.id)).where(eq(appointments.status, "scheduled")).orderBy(appointments.appointmentDate).limit(5);
        return scheduledAppointments;
      }
      async getScheduledAppointments() {
        const scheduledAppointments = await db.select({
          id: appointments.id,
          appointmentDate: appointments.appointmentDate,
          duration: appointments.duration,
          status: appointments.status,
          notes: appointments.notes,
          clientName: clients.name,
          staffName: staff.name,
          serviceName: services.name,
          servicePrice: services.price
        }).from(appointments).leftJoin(clients, eq(appointments.clientId, clients.id)).leftJoin(staff, eq(appointments.staffId, staff.id)).leftJoin(services, eq(appointments.serviceId, services.id)).where(eq(appointments.status, "scheduled")).orderBy(appointments.appointmentDate);
        return scheduledAppointments;
      }
      // Business settings operations
      async getBusinessSettings(establishmentId) {
        const [settings] = await db.select().from(businessSettings).where(eq(businessSettings.establishmentId, establishmentId)).limit(1);
        return settings || void 0;
      }
      async updateBusinessSettings(settingsData, establishmentId) {
        const existingSettings = await this.getBusinessSettings(establishmentId);
        if (existingSettings) {
          const [updated] = await db.update(businessSettings).set({
            ...settingsData,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(businessSettings.id, existingSettings.id)).returning();
          return updated;
        } else {
          const [created] = await db.insert(businessSettings).values({
            ...settingsData,
            establishmentId
          }).returning();
          return created;
        }
      }
      // Business hours operations
      async getBusinessHours(establishmentId) {
        return await db.select().from(businessHours).where(eq(businessHours.establishmentId, establishmentId)).orderBy(businessHours.dayOfWeek);
      }
      async updateBusinessHours(hours, establishmentId) {
        await db.delete(businessHours).where(eq(businessHours.establishmentId, establishmentId));
        if (hours && Array.isArray(hours) && hours.length > 0) {
          const hoursWithEstablishment = hours.map((hour) => ({
            ...hour,
            establishmentId
          }));
          await db.insert(businessHours).values(hoursWithEstablishment);
        }
        return await this.getBusinessHours(establishmentId);
      }
      // Establishment operations for settings
      async updateEstablishment(id, data) {
        const [updated] = await db.update(establishments).set({
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(establishments.id, id)).returning();
        return updated;
      }
      // User operations for security settings
      async updateUserEmail(id, email) {
        const [updated] = await db.update(users).set({
          email,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, id)).returning();
        return updated;
      }
      // Plan operations
      async getPlans() {
        return await db.select().from(plans).where(eq(plans.isActive, true));
      }
      async getPlan(id) {
        const [plan] = await db.select().from(plans).where(eq(plans.id, id));
        return plan;
      }
      async getEstablishmentPlan(establishmentId) {
        const establishment = await this.getEstablishment(establishmentId);
        if (!establishment?.planId) return void 0;
        return await this.getPlan(establishment.planId);
      }
      async updateEstablishmentPlan(establishmentId, planId) {
        const [updated] = await db.update(establishments).set({
          planId,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(establishments.id, establishmentId)).returning();
        return updated;
      }
      // Plan validation helpers
      async checkStaffLimit(establishmentId) {
        const plan = await this.getEstablishmentPlan(establishmentId);
        const currentStaff = await this.getStaff(establishmentId);
        return {
          isWithinLimit: currentStaff.length < (plan?.maxStaffMembers || 2),
          currentCount: currentStaff.length,
          maxAllowed: plan?.maxStaffMembers || 2
        };
      }
      async hasFinancialAccess(establishmentId) {
        const plan = await this.getEstablishmentPlan(establishmentId);
        return plan?.hasFinancialModule || false;
      }
      async hasInventoryAccess(establishmentId) {
        const plan = await this.getEstablishmentPlan(establishmentId);
        return plan?.hasInventoryModule || false;
      }
      async hasLoyaltyAccess(establishmentId) {
        const plan = await this.getEstablishmentPlan(establishmentId);
        return plan?.name === "Core" || plan?.name === "Expert";
      }
      async updateUserPassword(id, password) {
        const [updated] = await db.update(users).set({
          password,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, id)).returning();
        return updated;
      }
      async calculateStaffCommission(staffId, startDate, endDate, establishmentId) {
        const staffMember = await this.getStaffMember(staffId, establishmentId);
        if (!staffMember) {
          throw new Error("Colaborador n\xE3o encontrado");
        }
        const appointmentsList = await db.select({
          id: appointments.id,
          appointmentDate: appointments.appointmentDate,
          serviceName: services.name,
          servicePrice: services.price,
          clientName: clients.name
        }).from(appointments).innerJoin(services, eq(appointments.serviceId, services.id)).innerJoin(clients, eq(appointments.clientId, clients.id)).where(
          and(
            eq(appointments.staffId, staffId),
            eq(appointments.status, "completed"),
            eq(services.establishmentId, establishmentId),
            eq(clients.establishmentId, establishmentId),
            gte(appointments.appointmentDate, new Date(startDate)),
            lte(appointments.appointmentDate, new Date(endDate))
          )
        );
        const totalServices = appointmentsList.length;
        const totalServiceValue = appointmentsList.reduce((sum, apt) => sum + parseFloat(apt.servicePrice), 0);
        const commissionRate = parseFloat(staffMember.commissionRate || "0");
        const commissionValue = totalServiceValue * commissionRate / 100;
        const fixedSalary = parseFloat(staffMember.salaryAmount || "0");
        const servicesData = appointmentsList.map((apt) => ({
          date: apt.appointmentDate,
          clientName: apt.clientName,
          serviceName: apt.serviceName,
          price: parseFloat(apt.servicePrice),
          commissionAmount: parseFloat(apt.servicePrice) * commissionRate / 100
        }));
        return {
          staffName: staffMember.name,
          fixedSalary,
          commission: commissionRate,
          totalServices,
          totalServiceValue,
          commissionValue,
          services: servicesData,
          hasData: totalServices > 0 || fixedSalary > 0,
          message: totalServices === 0 && commissionRate > 0 ? "Nenhum agendamento encontrado no per\xEDodo selecionado" : null
        };
      }
      // N8N Integration operations
      async getN8nIntegrations(establishmentId) {
        const result = await db.select().from(n8nIntegrations).where(eq(n8nIntegrations.establishmentId, establishmentId)).orderBy(desc(n8nIntegrations.createdAt));
        return result;
      }
      async getN8nIntegration(id, establishmentId) {
        const result = await db.select().from(n8nIntegrations).where(and(
          eq(n8nIntegrations.id, id),
          eq(n8nIntegrations.establishmentId, establishmentId)
        )).limit(1);
        return result[0];
      }
      async createN8nIntegration(insertN8nIntegration) {
        const result = await db.insert(n8nIntegrations).values(insertN8nIntegration).returning();
        return result[0];
      }
      async updateN8nIntegration(id, updateData, establishmentId) {
        const result = await db.update(n8nIntegrations).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(and(
          eq(n8nIntegrations.id, id),
          eq(n8nIntegrations.establishmentId, establishmentId)
        )).returning();
        return result[0];
      }
      async deleteN8nIntegration(id, establishmentId) {
        await db.delete(n8nIntegrations).where(and(
          eq(n8nIntegrations.id, id),
          eq(n8nIntegrations.establishmentId, establishmentId)
        ));
      }
      async createWebhookLog(insertWebhookLog) {
        const result = await db.insert(webhookLogs).values(insertWebhookLog).returning();
        return result[0];
      }
      async getWebhookLogs(integrationId) {
        const result = await db.select().from(webhookLogs).where(eq(webhookLogs.integrationId, integrationId)).orderBy(desc(webhookLogs.createdAt)).limit(50);
        return result;
      }
      async triggerN8nWebhook(event, data, establishmentId) {
        const integrations = await db.select().from(n8nIntegrations).where(and(
          eq(n8nIntegrations.establishmentId, establishmentId),
          eq(n8nIntegrations.isActive, true)
        ));
        for (const integration of integrations) {
          if (integration.triggerEvents.includes(event)) {
            try {
              const payload = {
                establishments_id: establishmentId,
                event,
                data,
                timestamp: (/* @__PURE__ */ new Date()).toISOString()
              };
              const headers = {
                "Content-Type": "application/json"
              };
              if (integration.apiKey) {
                headers["Authorization"] = `Bearer ${integration.apiKey}`;
              }
              const response = await fetch(integration.webhookUrl, {
                method: "POST",
                headers,
                body: JSON.stringify(payload)
              });
              const responseText = await response.text();
              await this.createWebhookLog({
                integrationId: integration.id,
                event,
                payload: JSON.stringify(payload),
                response: responseText,
                status: response.ok ? "success" : "error",
                errorMessage: response.ok ? null : `HTTP ${response.status}: ${response.statusText}`
              });
              await db.update(n8nIntegrations).set({ lastTriggered: /* @__PURE__ */ new Date() }).where(eq(n8nIntegrations.id, integration.id));
            } catch (error) {
              console.error("N8N webhook error:", error);
              await this.createWebhookLog({
                integrationId: integration.id,
                event,
                payload: JSON.stringify({ event, data, establishmentId }),
                response: null,
                status: "error",
                errorMessage: error instanceof Error ? error.message : "Unknown error"
              });
            }
          }
        }
      }
      // Evolution API Connection operations
      async getEvolutionApiConnections(establishmentId) {
        const result = await db.select().from(evolutionApiConnections).where(eq(evolutionApiConnections.establishmentId, establishmentId)).orderBy(desc(evolutionApiConnections.createdAt));
        return result;
      }
      async getEvolutionApiConnection(id, establishmentId) {
        const result = await db.select().from(evolutionApiConnections).where(and(
          eq(evolutionApiConnections.id, id),
          eq(evolutionApiConnections.establishmentId, establishmentId)
        )).limit(1);
        return result[0];
      }
      async createEvolutionApiConnection(insertConnection) {
        const result = await db.insert(evolutionApiConnections).values(insertConnection).returning();
        return result[0];
      }
      async updateEvolutionApiConnection(id, updateData, establishmentId) {
        const result = await db.update(evolutionApiConnections).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(and(
          eq(evolutionApiConnections.id, id),
          eq(evolutionApiConnections.establishmentId, establishmentId)
        )).returning();
        return result[0];
      }
      async deleteEvolutionApiConnection(id, establishmentId) {
        await db.delete(evolutionApiConnections).where(and(
          eq(evolutionApiConnections.id, id),
          eq(evolutionApiConnections.establishmentId, establishmentId)
        ));
      }
      async updateConnectionStatus(id, status, qrCode, errorMessage) {
        const updateData = {
          status,
          lastStatusCheck: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        if (qrCode !== void 0) {
          updateData.qrCode = qrCode;
          if (qrCode) {
            updateData.qrCodeExpiration = new Date(Date.now() + 2 * 60 * 1e3);
          } else {
            updateData.qrCodeExpiration = null;
          }
        }
        if (errorMessage !== void 0) {
          updateData.errorMessage = errorMessage;
        }
        const result = await db.update(evolutionApiConnections).set(updateData).where(eq(evolutionApiConnections.id, id)).returning();
        return result[0];
      }
      // N8N Webhook Data operations
      async getN8nWebhookData(establishmentId) {
        const result = await db.select().from(n8nWebhookData).where(and(
          eq(n8nWebhookData.establishmentId, establishmentId),
          eq(n8nWebhookData.isActive, true)
        )).orderBy(desc(n8nWebhookData.createdAt)).limit(1);
        return result[0];
      }
      async saveN8nWebhookData(data) {
        await db.update(n8nWebhookData).set({ isActive: false, updatedAt: /* @__PURE__ */ new Date() }).where(eq(n8nWebhookData.establishmentId, data.establishmentId));
        const result = await db.insert(n8nWebhookData).values({ ...data, isActive: true }).returning();
        return result[0];
      }
      async updateN8nWebhookQRCode(establishmentId, qrCodeBase64) {
        const existingRecord = await db.select().from(n8nWebhookData).where(and(
          eq(n8nWebhookData.establishmentId, establishmentId),
          eq(n8nWebhookData.isActive, true)
        )).orderBy(desc(n8nWebhookData.createdAt)).limit(1);
        if (existingRecord.length === 0) {
          return null;
        }
        const updated = await db.update(n8nWebhookData).set({
          qrCodeBase64,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(n8nWebhookData.id, existingRecord[0].id)).returning();
        return updated[0];
      }
      async getN8nWebhookDataByInstanceId(instanceId) {
        const result = await db.select().from(n8nWebhookData).where(and(
          eq(n8nWebhookData.instanceId, instanceId),
          eq(n8nWebhookData.isActive, true)
        )).orderBy(desc(n8nWebhookData.createdAt)).limit(1);
        return result[0];
      }
      async clearN8nWebhookData(establishmentId) {
        await db.update(n8nWebhookData).set({ isActive: false, updatedAt: /* @__PURE__ */ new Date() }).where(and(
          eq(n8nWebhookData.establishmentId, establishmentId),
          eq(n8nWebhookData.isActive, true)
        ));
      }
      async deleteN8nWebhookData(establishmentId) {
        await db.delete(n8nWebhookData).where(eq(n8nWebhookData.establishmentId, establishmentId));
      }
      // Notification methods
      async createNotification(notification) {
        const [result] = await db.insert(notifications).values(notification).returning();
        return result;
      }
      async getNotifications(establishmentId) {
        const results = await db.select().from(notifications).where(eq(notifications.establishmentId, establishmentId)).orderBy(desc(notifications.createdAt));
        return results;
      }
      async getUnreadNotifications(establishmentId) {
        const results = await db.select().from(notifications).where(and(
          eq(notifications.establishmentId, establishmentId),
          eq(notifications.isRead, false)
        )).orderBy(desc(notifications.createdAt));
        return results;
      }
      // Get unread notifications for a specific staff member (filtered by appointment staffId)
      async getUnreadNotificationsForStaff(establishmentId, staffId) {
        const results = await db.select({
          id: notifications.id,
          establishmentId: notifications.establishmentId,
          appointmentId: notifications.appointmentId,
          type: notifications.type,
          title: notifications.title,
          message: notifications.message,
          isRead: notifications.isRead,
          createdAt: notifications.createdAt,
          staffId: appointments.staffId
        }).from(notifications).leftJoin(appointments, eq(notifications.appointmentId, appointments.id)).where(and(
          eq(notifications.establishmentId, establishmentId),
          eq(notifications.isRead, false),
          // Only show notifications for appointments assigned to this staff member
          eq(appointments.staffId, staffId)
        )).orderBy(desc(notifications.createdAt));
        return results;
      }
      async markNotificationAsRead(id, establishmentId) {
        await db.update(notifications).set({ isRead: true }).where(and(
          eq(notifications.id, id),
          eq(notifications.establishmentId, establishmentId)
        ));
      }
      async markAllNotificationsAsRead(establishmentId) {
        await db.update(notifications).set({ isRead: true }).where(eq(notifications.establishmentId, establishmentId));
      }
      // Monthly appointment limit methods
      async getMonthlyAppointmentCount(establishmentId, year, month) {
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59);
        const [result] = await db.select({ count: sql2`COUNT(*)` }).from(appointments).where(
          and(
            eq(appointments.establishmentId, establishmentId),
            gte(appointments.appointmentDate, startOfMonth),
            lte(appointments.appointmentDate, endOfMonth)
          )
        );
        return parseInt(result.count);
      }
      async checkMonthlyAppointmentLimit(establishmentId) {
        const today = /* @__PURE__ */ new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        const currentCount = await this.getMonthlyAppointmentCount(establishmentId, currentYear, currentMonth);
        const establishment = await this.getEstablishment(establishmentId);
        if (!establishment) {
          return { canCreate: false, currentCount, maxCount: null };
        }
        const plan = await this.getPlan(establishment.planId || 1);
        if (!plan) {
          return { canCreate: false, currentCount, maxCount: null };
        }
        const maxCount = plan.maxMonthlyAppointments;
        if (maxCount === null) {
          return { canCreate: true, currentCount, maxCount: null };
        }
        return {
          canCreate: currentCount < maxCount,
          currentCount,
          maxCount
        };
      }
      // Staff working hours operations
      async getStaffWorkingHours(staffId, establishmentId) {
        return await db.select().from(staffWorkingHours).where(
          and(
            eq(staffWorkingHours.staffId, staffId),
            eq(staffWorkingHours.establishmentId, establishmentId)
          )
        );
      }
      async createStaffWorkingHours(workingHours) {
        const [result] = await db.insert(staffWorkingHours).values(workingHours).returning();
        return result;
      }
      async updateStaffWorkingHours(id, workingHoursData) {
        const [result] = await db.update(staffWorkingHours).set({ ...workingHoursData, updatedAt: sql2`(now() AT TIME ZONE 'America/Sao_Paulo')` }).where(eq(staffWorkingHours.id, id)).returning();
        return result;
      }
      async deleteStaffWorkingHours(staffId, establishmentId) {
        await db.delete(staffWorkingHours).where(
          and(
            eq(staffWorkingHours.staffId, staffId),
            eq(staffWorkingHours.establishmentId, establishmentId)
          )
        );
      }
      async setStaffWorkingHours(staffId, establishmentId, workingHoursData) {
        await this.deleteStaffWorkingHours(staffId, establishmentId);
        for (const dayHours of workingHoursData) {
          if (dayHours.isAvailable) {
            await this.createStaffWorkingHours({
              establishmentId,
              staffId,
              dayOfWeek: dayHours.dayOfWeek,
              openTime: dayHours.openTime,
              closeTime: dayHours.closeTime,
              isAvailable: dayHours.isAvailable
            });
          }
        }
      }
      // Loyalty Program operations
      async getLoyaltyPrograms(establishmentId) {
        return await db.select().from(loyaltyPrograms).where(eq(loyaltyPrograms.establishmentId, establishmentId));
      }
      async getLoyaltyProgram(id, establishmentId) {
        const [program] = await db.select().from(loyaltyPrograms).where(
          and(eq(loyaltyPrograms.id, id), eq(loyaltyPrograms.establishmentId, establishmentId))
        );
        return program;
      }
      async createLoyaltyProgram(program) {
        const [result] = await db.insert(loyaltyPrograms).values(program).returning();
        return result;
      }
      async updateLoyaltyProgram(id, program, establishmentId) {
        const [result] = await db.update(loyaltyPrograms).set({ ...program, updatedAt: sql2`(now() AT TIME ZONE 'America/Sao_Paulo')` }).where(and(eq(loyaltyPrograms.id, id), eq(loyaltyPrograms.establishmentId, establishmentId))).returning();
        return result;
      }
      async deleteLoyaltyProgram(id, establishmentId) {
        await db.delete(loyaltyPrograms).where(
          and(eq(loyaltyPrograms.id, id), eq(loyaltyPrograms.establishmentId, establishmentId))
        );
      }
      // Loyalty Program Services operations
      async getLoyaltyProgramServices(programId, establishmentId) {
        return await db.select().from(loyaltyProgramServices).where(
          and(
            eq(loyaltyProgramServices.loyaltyProgramId, programId),
            eq(loyaltyProgramServices.establishmentId, establishmentId)
          )
        );
      }
      async addServiceToLoyaltyProgram(programService) {
        const [result] = await db.insert(loyaltyProgramServices).values(programService).returning();
        return result;
      }
      async removeServiceFromLoyaltyProgram(programId, serviceId, establishmentId) {
        await db.delete(loyaltyProgramServices).where(
          and(
            eq(loyaltyProgramServices.loyaltyProgramId, programId),
            eq(loyaltyProgramServices.serviceId, serviceId),
            eq(loyaltyProgramServices.establishmentId, establishmentId)
          )
        );
      }
      // Client Loyalty Points operations
      async getClientLoyaltyPoints(clientId, establishmentId) {
        const [points] = await db.select().from(clientLoyaltyPoints).where(
          and(
            eq(clientLoyaltyPoints.clientId, clientId),
            eq(clientLoyaltyPoints.establishmentId, establishmentId)
          )
        );
        return points;
      }
      async createClientLoyaltyPoints(points) {
        const [result] = await db.insert(clientLoyaltyPoints).values(points).returning();
        return result;
      }
      async updateClientLoyaltyPoints(clientId, programId, points, establishmentId) {
        const [result] = await db.update(clientLoyaltyPoints).set({
          availablePoints: points,
          updatedAt: sql2`(now() AT TIME ZONE 'America/Sao_Paulo')`
        }).where(
          and(
            eq(clientLoyaltyPoints.clientId, clientId),
            eq(clientLoyaltyPoints.loyaltyProgramId, programId),
            eq(clientLoyaltyPoints.establishmentId, establishmentId)
          )
        ).returning();
        return result;
      }
      async addLoyaltyPoints(clientId, programId, points, appointmentId, establishmentId) {
        let clientPoints = await this.getClientLoyaltyPoints(clientId, establishmentId);
        if (!clientPoints) {
          clientPoints = await this.createClientLoyaltyPoints({
            clientId,
            loyaltyProgramId: programId,
            establishmentId,
            totalPoints: points,
            usedPoints: 0,
            availablePoints: points
          });
        } else {
          await db.update(clientLoyaltyPoints).set({
            totalPoints: sql2`${clientLoyaltyPoints.totalPoints} + ${points}`,
            availablePoints: sql2`${clientLoyaltyPoints.availablePoints} + ${points}`,
            lastEarnedAt: sql2`(now() AT TIME ZONE 'America/Sao_Paulo')`,
            updatedAt: sql2`(now() AT TIME ZONE 'America/Sao_Paulo')`
          }).where(eq(clientLoyaltyPoints.id, clientPoints.id));
        }
        await this.createLoyaltyPointTransaction({
          clientId,
          loyaltyProgramId: programId,
          establishmentId,
          appointmentId,
          points,
          type: "earned",
          description: `Pontos ganhos por servi\xE7o realizado`
        });
      }
      async addLoyaltyPointsForCompletedService(clientId, serviceId, appointmentId, establishmentId) {
        const programs = await db.select().from(loyaltyPrograms).where(eq(loyaltyPrograms.establishmentId, establishmentId));
        if (programs.length === 0) {
          return;
        }
        for (const program of programs) {
          const eligibleServices = await db.select().from(loyaltyProgramServices).where(
            and(
              eq(loyaltyProgramServices.loyaltyProgramId, program.id),
              eq(loyaltyProgramServices.serviceId, serviceId)
            )
          );
          if (eligibleServices.length > 0) {
            await this.addLoyaltyPoints(
              clientId,
              program.id,
              program.pointsPerService,
              appointmentId,
              establishmentId
            );
          }
        }
      }
      async useLoyaltyPoints(clientId, programId, points, establishmentId) {
        const clientPoints = await this.getClientLoyaltyPoints(clientId, establishmentId);
        if (!clientPoints || clientPoints.availablePoints < points) {
          throw new Error("Pontos insuficientes");
        }
        await db.update(clientLoyaltyPoints).set({
          usedPoints: sql2`${clientLoyaltyPoints.usedPoints} + ${points}`,
          availablePoints: sql2`${clientLoyaltyPoints.availablePoints} - ${points}`,
          lastUsedAt: sql2`(now() AT TIME ZONE 'America/Sao_Paulo')`,
          updatedAt: sql2`(now() AT TIME ZONE 'America/Sao_Paulo')`
        }).where(eq(clientLoyaltyPoints.id, clientPoints.id));
        await this.createLoyaltyPointTransaction({
          clientId,
          loyaltyProgramId: programId,
          establishmentId,
          points: -points,
          type: "used",
          description: `Pontos utilizados para recompensa`
        });
      }
      // Loyalty Point Transactions operations
      async getLoyaltyPointTransactions(clientId, establishmentId) {
        return await db.select().from(loyaltyPointTransactions).where(
          and(
            eq(loyaltyPointTransactions.clientId, clientId),
            eq(loyaltyPointTransactions.establishmentId, establishmentId)
          )
        ).orderBy(desc(loyaltyPointTransactions.createdAt));
      }
      async createLoyaltyPointTransaction(transaction) {
        const [result] = await db.insert(loyaltyPointTransactions).values(transaction).returning();
        return result;
      }
      // Loyalty system helpers
      async checkClientEligibleForReward(clientId, programId, establishmentId) {
        const clientPoints = await this.getClientLoyaltyPoints(clientId, establishmentId);
        const program = await this.getLoyaltyProgram(programId, establishmentId);
        if (!clientPoints || !program) return false;
        return clientPoints.availablePoints >= program.pointsToReward;
      }
      async getClientsWithAvailableRewards(establishmentId) {
        const results = await db.select({
          clientId: clientLoyaltyPoints.clientId,
          clientName: clients.name,
          availablePoints: clientLoyaltyPoints.availablePoints,
          pointsToReward: loyaltyPrograms.pointsToReward,
          rewardDescription: loyaltyPrograms.rewardDescription
        }).from(clientLoyaltyPoints).innerJoin(clients, eq(clients.id, clientLoyaltyPoints.clientId)).innerJoin(loyaltyPrograms, eq(loyaltyPrograms.id, clientLoyaltyPoints.loyaltyProgramId)).where(
          and(
            eq(clientLoyaltyPoints.establishmentId, establishmentId),
            sql2`${clientLoyaltyPoints.availablePoints} >= ${loyaltyPrograms.pointsToReward}`
          )
        );
        return results;
      }
      async getClientsWithRewards(establishmentId) {
        try {
          const results = await db.select({
            clientId: clientLoyaltyPoints.clientId,
            clientName: clients.name,
            totalPoints: clientLoyaltyPoints.availablePoints,
            pointsToReward: loyaltyPrograms.pointsToReward,
            rewardDescription: loyaltyPrograms.rewardDescription,
            canRedeem: sql2`${clientLoyaltyPoints.availablePoints} >= ${loyaltyPrograms.pointsToReward}`,
            programName: loyaltyPrograms.name
          }).from(clientLoyaltyPoints).innerJoin(clients, eq(clients.id, clientLoyaltyPoints.clientId)).innerJoin(loyaltyPrograms, eq(loyaltyPrograms.id, clientLoyaltyPoints.loyaltyProgramId)).where(
            and(
              eq(clientLoyaltyPoints.establishmentId, establishmentId),
              gt(clientLoyaltyPoints.availablePoints, 0)
            )
          );
          return results;
        } catch (error) {
          console.error("Erro ao buscar clientes com pontos:", error);
          throw error;
        }
      }
      // Agenda Release Policies
      async getAgendaReleasePolicy(establishmentId) {
        const [policy] = await db.select().from(agendaReleasePolicies).where(and(
          eq(agendaReleasePolicies.establishmentId, establishmentId),
          eq(agendaReleasePolicies.isActive, true)
        ));
        return policy || void 0;
      }
      // Calcular automaticamente os meses que devem estar liberados baseado na política
      async calculateReleasedMonths(establishmentId) {
        const policy = await this.getAgendaReleasePolicy(establishmentId);
        if (!policy) {
          return [];
        }
        const currentDate = /* @__PURE__ */ new Date();
        const currentDay = currentDate.getDate();
        const releaseDay = policy.releaseDay;
        const releaseInterval = policy.releaseInterval;
        const releasedMonths = [];
        let startMonth;
        if (currentDay >= releaseDay) {
          startMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        } else {
          startMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        }
        for (let i = 0; i < releaseInterval; i++) {
          const monthToRelease = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
          const monthString = `${monthToRelease.getFullYear()}-${(monthToRelease.getMonth() + 1).toString().padStart(2, "0")}`;
          releasedMonths.push(monthString);
        }
        return releasedMonths;
      }
      async createOrUpdateAgendaReleasePolicy(policyData) {
        const existingPolicy = await this.getAgendaReleasePolicy(policyData.establishmentId);
        if (existingPolicy) {
          const [updated] = await db.update(agendaReleasePolicies).set({
            ...policyData,
            updatedAt: sql2`(now() AT TIME ZONE 'America/Sao_Paulo')`
          }).where(eq(agendaReleasePolicies.id, existingPolicy.id)).returning();
          return updated;
        } else {
          const [created] = await db.insert(agendaReleasePolicies).values(policyData).returning();
          return created;
        }
      }
      async createOrUpdateAgendaReleasePolicyOld(policy) {
        await db.update(agendaReleasePolicies).set({ isActive: false }).where(eq(agendaReleasePolicies.establishmentId, policy.establishmentId));
        const [newPolicy] = await db.insert(agendaReleasePolicies).values(policy).returning();
        return newPolicy;
      }
      async getAgendaReleases(establishmentId) {
        const releases = await db.select().from(agendaReleases).where(eq(agendaReleases.establishmentId, establishmentId)).orderBy(desc(agendaReleases.releaseDate));
        return releases;
      }
      async createAgendaRelease(release) {
        const [newRelease] = await db.insert(agendaReleases).values(release).returning();
        return newRelease;
      }
      async updateEstablishmentTimezone(establishmentId, timezone) {
        await db.update(establishments).set({ timezone }).where(eq(establishments.id, establishmentId));
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/websocket.ts
var websocket_exports = {};
__export(websocket_exports, {
  initializeWebSocket: () => initializeWebSocket,
  wsManager: () => wsManager
});
import { WebSocketServer, WebSocket } from "ws";
function initializeWebSocket(server) {
  wsManager = new WebSocketManager(server);
  return wsManager;
}
var WebSocketManager, wsManager;
var init_websocket = __esm({
  "server/websocket.ts"() {
    "use strict";
    WebSocketManager = class {
      wss;
      clients = /* @__PURE__ */ new Set();
      constructor(server) {
        this.wss = new WebSocketServer({ server, path: "/ws" });
        this.wss.on("connection", (ws2, req) => {
          const client = { ws: ws2 };
          this.clients.add(client);
          ws2.on("message", (data) => {
            try {
              const message = JSON.parse(data.toString());
              if (message.type === "auth") {
                client.establishmentId = message.establishmentId;
                client.userId = message.userId;
                client.userRole = message.userRole;
              }
            } catch (error) {
              console.error("Erro ao processar mensagem WebSocket:", error);
            }
          });
          ws2.on("close", () => {
            this.clients.delete(client);
          });
          ws2.on("error", (error) => {
            console.error("Erro WebSocket:", error);
            this.clients.delete(client);
          });
        });
      }
      // Notifica sobre mudanças nos agendamentos
      notifyAppointmentChange(establishmentId, data) {
        const message = JSON.stringify({
          type: "appointment_change",
          data: data || {}
        });
        this.broadcastToEstablishment(establishmentId, message);
      }
      // Notifica sobre mudanças financeiras
      notifyFinancialChange(establishmentId, data) {
        const message = JSON.stringify({
          type: "financial_change",
          data: data || {}
        });
        this.broadcastToEstablishment(establishmentId, message);
      }
      // Notifica sobre novas notificações
      notifyNewNotification(establishmentId, data) {
        const message = JSON.stringify({
          type: "new_notification",
          data: data || {}
        });
        this.broadcastToEstablishment(establishmentId, message);
      }
      // Notifica sobre mudanças no dashboard (stats)
      notifyDashboardChange(establishmentId, data) {
        const message = JSON.stringify({
          type: "dashboard_change",
          data: data || {}
        });
        this.broadcastToEstablishment(establishmentId, message);
      }
      // Notifica sobre mudanças em clientes
      notifyClientChange(establishmentId, data) {
        const message = JSON.stringify({
          type: "client_change",
          data: data || {}
        });
        this.broadcastToEstablishment(establishmentId, message);
      }
      // Notifica sobre mudanças no estoque
      notifyInventoryChange(establishmentId, data) {
        const message = JSON.stringify({
          type: "inventory_change",
          data: data || {}
        });
        this.broadcastToEstablishment(establishmentId, message);
      }
      // Notifica sobre mudanças específicas do dashboard
      notifyDashboardStatsChange(establishmentId, data) {
        const message = JSON.stringify({
          type: "dashboard_change",
          data: data || {}
        });
        this.broadcastToEstablishment(establishmentId, message);
      }
      // Notifica sobre mudanças específicas do dashboard do staff
      notifyStaffDashboardChange(establishmentId, staffId, data) {
        const message = JSON.stringify({
          type: "staff_dashboard_change",
          staffId,
          data: data || {}
        });
        this.broadcastToEstablishment(establishmentId, message);
      }
      // Notifica especificamente um staff member sobre novo agendamento
      notifyStaffAppointment(establishmentId, staffId, data) {
        const message = JSON.stringify({
          type: "staff_appointment_notification",
          staffId,
          data: data || {}
        });
        this.broadcastToStaff(establishmentId, staffId, message);
      }
      // Envia mensagem para todos os clientes de um estabelecimento
      broadcastToEstablishment(establishmentId, message) {
        this.clients.forEach((client) => {
          if (client.establishmentId === establishmentId && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(message);
          }
        });
      }
      // Envia mensagem apenas para um staff específico
      broadcastToStaff(establishmentId, staffId, message) {
        this.clients.forEach((client) => {
          if (client.establishmentId === establishmentId && client.userRole === "staff" && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(message);
          }
        });
      }
      // Envia mensagem para um usuário específico
      broadcastToUser(userId, message) {
        this.clients.forEach((client) => {
          if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(message);
          }
        });
      }
    };
  }
});

// server/index.ts
init_db();
import express2 from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

// server/routes.ts
init_storage();
init_db();
init_schema();
init_schema();
import { createServer } from "http";
import { eq as eq2, and as and2, gte as gte2, sql as sql3 } from "drizzle-orm";
import bcrypt2 from "bcrypt";
import Stripe from "stripe";

// server/emailService.ts
import nodemailer from "nodemailer";
function createProfessionalTransporter() {
  if (process.env.PROFESSIONAL_SMTP_HOST && process.env.PROFESSIONAL_SMTP_USER && process.env.PROFESSIONAL_SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.PROFESSIONAL_SMTP_HOST,
      port: parseInt(process.env.PROFESSIONAL_SMTP_PORT || "587"),
      secure: process.env.PROFESSIONAL_SMTP_PORT === "465",
      auth: {
        user: process.env.PROFESSIONAL_SMTP_USER,
        // contato@salaoonline.site
        pass: process.env.PROFESSIONAL_SMTP_PASS
      }
    });
  }
  return null;
}
function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}
async function sendEmail(params) {
  const transporter = createTransporter();
  if (!transporter) {
    return false;
  }
  try {
    await transporter.sendMail({
      from: params.from,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html
    });
    return true;
  } catch (error) {
    return false;
  }
}
async function sendAppointmentNotification(establishmentEmail, appointmentData) {
  const professionalTransporter = createProfessionalTransporter();
  const transporter = professionalTransporter || createTransporter();
  if (!transporter) {
    return false;
  }
  const fromEmail = process.env.PROFESSIONAL_SMTP_USER || process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@salaoonline.com";
  const isFromProfessionalEmail = fromEmail.includes("@salaoonline.site");
  const subject = `\u{1F5D3}\uFE0F Novo Agendamento - ${appointmentData.establishmentName}`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #4F46E5; }
            .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>\u{1F4C5} Novo Agendamento Recebido</h1>
                <p>${appointmentData.establishmentName}</p>
            </div>
            <div class="content">
                <p>Ol\xE1! Voc\xEA recebeu um novo agendamento no seu sal\xE3o:</p>
                
                <div class="appointment-details">
                    <h3>\u{1F4CB} Detalhes do Agendamento</h3>
                    
                    <div class="detail-row">
                        <span class="label">Cliente:</span>
                        <span>${appointmentData.clientName}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="label">Servi\xE7o:</span>
                        <span>${appointmentData.serviceName}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="label">Profissional:</span>
                        <span>${appointmentData.staffName}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="label">Data:</span>
                        <span>${appointmentData.appointmentDate}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="label">Hor\xE1rio:</span>
                        <span>${appointmentData.appointmentTime}</span>
                    </div>
                    
                    ${appointmentData.clientPhone ? `
                    <div class="detail-row">
                        <span class="label">Telefone:</span>
                        <span>${appointmentData.clientPhone}</span>
                    </div>
                    ` : ""}
                </div>
                
                <p><strong>\u{1F468}\u200D\u{1F4BC} A\xE7\xE3o Necess\xE1ria:</strong></p>
                <ul>
                    <li>Acesse o Sal\xE3o Online para confirmar o agendamento</li>
                    <li>Entre em contato com o cliente se necess\xE1rio</li>
                    <li>Prepare-se para o atendimento na data e hor\xE1rio marcados</li>
                </ul>
            </div>
            
            <div class="footer">
                <p>Este email foi gerado automaticamente pelo Sal\xE3o Online</p>
                <p>Sistema de Gest\xE3o para Sal\xF5es de Beleza</p>
            </div>
        </div>
    </body>
    </html>
  `;
  const textContent = `
NOVO AGENDAMENTO - ${appointmentData.establishmentName}

Detalhes do Agendamento:
- Cliente: ${appointmentData.clientName}
- Servi\xE7o: ${appointmentData.serviceName}
- Profissional: ${appointmentData.staffName}
- Data: ${appointmentData.appointmentDate}
- Hor\xE1rio: ${appointmentData.appointmentTime}
${appointmentData.clientPhone ? `- Telefone: ${appointmentData.clientPhone}` : ""}

Acesse o Sal\xE3o Online para confirmar o agendamento.

---
Este email foi gerado automaticamente pelo Sal\xE3o Online
Sistema de Gest\xE3o para Sal\xF5es de Beleza
  `;
  try {
    await transporter.sendMail({
      from: `"Sal\xE3o Online" <${fromEmail}>`,
      to: establishmentEmail,
      subject,
      text: textContent,
      html: htmlContent
    });
    return true;
  } catch (error) {
    return false;
  }
}
async function sendPasswordResetEmail(email, resetToken, establishmentName) {
  const baseUrl = process.env.REPL_OWNER ? process.env.BASE_URL || "http://localhost:5000" : process.env.FRONTEND_URL || "http://localhost:5000";
  const resetUrl = `${baseUrl}/redefinir-senha?token=${resetToken}`;
  const subject = "\u{1F510} Redefinir Senha - Sal\xE3o Online";
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .reset-button { 
                display: inline-block; 
                background: #4F46E5; 
                color: white; 
                padding: 15px 30px; 
                text-decoration: none; 
                border-radius: 8px; 
                margin: 20px 0;
                font-weight: bold;
            }
            .warning { background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>\u{1F510} Redefinir Senha</h1>
                <p>Sal\xE3o Online${establishmentName ? ` - ${establishmentName}` : ""}</p>
            </div>
            <div class="content">
                <p>Ol\xE1!</p>
                
                <p>Recebemos uma solicita\xE7\xE3o para redefinir a senha da sua conta. Para continuar, clique no bot\xE3o abaixo:</p>
                
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="reset-button">Redefinir Minha Senha</a>
                </div>
                
                <div class="warning">
                    <strong>\u26A0\uFE0F Importante:</strong>
                    <ul>
                        <li>Este link \xE9 v\xE1lido por apenas 1 hora</li>
                        <li>Se voc\xEA n\xE3o solicitou esta redefini\xE7\xE3o, ignore este email</li>
                        <li>Sua senha atual permanecer\xE1 ativa at\xE9 que seja alterada</li>
                    </ul>
                </div>
                
                <p>Se o bot\xE3o n\xE3o funcionar, copie e cole este link no seu navegador:</p>
                <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 4px; font-family: monospace;">
                    ${resetUrl}
                </p>
                
                <div class="footer">
                    <p>Este email foi enviado automaticamente pelo sistema Sal\xE3o Online.</p>
                    <p>Se voc\xEA n\xE3o solicitou esta redefini\xE7\xE3o, pode ignorar este email com seguran\xE7a.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
  const textContent = `
Redefinir Senha - Sal\xE3o Online

Ol\xE1!

Recebemos uma solicita\xE7\xE3o para redefinir a senha da sua conta.

Para redefinir sua senha, acesse o link abaixo:
${resetUrl}

IMPORTANTE:
- Este link \xE9 v\xE1lido por apenas 1 hora
- Se voc\xEA n\xE3o solicitou esta redefini\xE7\xE3o, ignore este email
- Sua senha atual permanecer\xE1 ativa at\xE9 que seja alterada

Este email foi enviado automaticamente pelo sistema Sal\xE3o Online.
  `;
  return await sendEmail({
    to: email,
    from: process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@salaoonline.com",
    subject,
    text: textContent,
    html: htmlContent
  });
}

// server/routes.ts
import { nanoid } from "nanoid";
var userContextCache = /* @__PURE__ */ new Map();
var CONTEXT_CACHE_DURATION = 5 * 60 * 1e3;
function getUserContext(req) {
  const userId = req.session?.userId || req.headers["x-user-id"];
  const establishmentId = req.session?.establishmentId || req.headers["x-establishment-id"];
  const role = req.session?.role || req.headers["x-user-role"];
  if (!userId || !establishmentId) {
    throw new Error("Authentication required");
  }
  const cacheKey = `${userId}-${establishmentId}-${role}`;
  const now = Date.now();
  const cached = userContextCache.get(cacheKey);
  if (cached && now - cached.timestamp < CONTEXT_CACHE_DURATION) {
    return cached.context;
  }
  const context = {
    userId: parseInt(String(userId)),
    establishmentId: parseInt(String(establishmentId)),
    role: String(role || "admin"),
    userRole: String(role || "admin")
    // Alias para compatibilidade
  };
  userContextCache.set(cacheKey, { context, timestamp: now });
  if (userContextCache.size > 1e3) {
    const entries = Array.from(userContextCache.entries());
    entries.forEach(([key, value]) => {
      if (now - value.timestamp > CONTEXT_CACHE_DURATION) {
        userContextCache.delete(key);
      }
    });
  }
  return context;
}
function requireAuth(req, res, next) {
  try {
    getUserContext(req);
    next();
  } catch (error) {
    res.status(401).json({ message: "Authentication required" });
  }
}
function requireAdmin(req, res, next) {
  try {
    const { userRole } = getUserContext(req);
    if (userRole !== "admin" && userRole !== "manager" && userRole !== "owner") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: "Authentication required" });
  }
}
var stripeKey = process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY or STRIPE_TEST_SECRET_KEY");
}
var stripe = new Stripe(stripeKey, {
  apiVersion: "2023-08-16"
});
async function registerRoutes(app2) {
  app2.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ authenticated: false, message: "Not authenticated" });
      }
      const { userId, establishmentId } = getUserContext(req);
      const user = await storage.getUser(userId);
      const establishment = await storage.getEstablishment(establishmentId);
      if (!user) {
        return res.status(404).json({ authenticated: false, message: "User not found" });
      }
      res.json({
        authenticated: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          establishmentId: user.establishmentId,
          establishment: establishment ? {
            id: establishment.id,
            name: establishment.name,
            planId: establishment.planId
          } : null
        }
      });
    } catch (error) {
      console.error("Get auth/me error:", error);
      res.status(401).json({ authenticated: false, message: "Authentication failed" });
    }
  });
  app2.get("/api/auth/user", requireAuth, async (req, res) => {
    try {
      const { userId, establishmentId } = getUserContext(req);
      const user = await storage.getUser(userId);
      const establishment = await storage.getEstablishment(establishmentId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        establishmentId: user.establishmentId,
        establishment: establishment ? {
          id: establishment.id,
          name: establishment.name,
          planId: establishment.planId
        } : null
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to fetch user data" });
    }
  });
  app2.get("/api/plans", async (req, res) => {
    try {
      const availablePlans = await db.select().from(plans).where(eq2(plans.isActive, true));
      res.json(availablePlans);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar planos" });
    }
  });
  app2.post("/api/create-subscription", async (req, res) => {
    try {
      const {
        establishmentName,
        ownerName,
        email,
        phone,
        whatsappNumber,
        segment,
        address,
        userName,
        password,
        planId
      } = req.body;
      const [selectedPlan] = await db.select().from(plans).where(eq2(plans.id, planId));
      if (!selectedPlan) {
        return res.status(400).json({ error: "Plano n\xE3o encontrado" });
      }
      const customer = await stripe.customers.create({
        email,
        name: ownerName,
        metadata: {
          establishment_name: establishmentName,
          plan_id: planId.toString()
        }
      });
      const baseUrl = process.env.BASE_URL || "http://localhost:5000";
      const encodedEmail = encodeURIComponent(email);
      const stripeLinks = {
        1: `https://buy.stripe.com/00w8wQ6Y83eq2un3EBfIs00?locked_prefilled_email=${encodedEmail}&success_url=${baseUrl}/pagamento-callback?success=true&session_id={CHECKOUT_SESSION_ID}&cancel_url=${baseUrl}/pagamento-callback?canceled=true`,
        // Base (produção)
        2: `https://buy.stripe.com/8x2cN60zK9CO2unejffIs01?locked_prefilled_email=${encodedEmail}`,
        // Core
        3: `https://buy.stripe.com/5kQcN6fuEeX85Gz4IFfIs02?locked_prefilled_email=${encodedEmail}`
        // Expert
      };
      const paymentLink = stripeLinks[planId];
      if (!paymentLink) {
        return res.status(400).json({ error: "Link de pagamento n\xE3o encontrado para este plano" });
      }
      const hashedPassword = await bcrypt2.hash(password, 10);
      const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1e3);
      await db.insert(pendingRegistrations).values({
        stripeCustomerId: customer.id,
        establishmentName,
        ownerName,
        email,
        phone,
        whatsappNumber,
        segment,
        address,
        userName,
        password: hashedPassword,
        planId,
        expiresAt: expirationTime
      });
      res.json({
        paymentLink,
        customerId: customer.id
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar assinatura: " + error.message });
    }
  });
  app2.post("/api/complete-registration", async (req, res) => {
    try {
      const { stripeCustomerId } = req.body;
      const [pendingReg] = await db.select().from(pendingRegistrations).where(and2(
        eq2(pendingRegistrations.stripeCustomerId, stripeCustomerId),
        eq2(pendingRegistrations.status, "pending")
      ));
      if (!pendingReg) {
        return res.status(404).json({ error: "Registro pendente n\xE3o encontrado" });
      }
      if (/* @__PURE__ */ new Date() > pendingReg.expiresAt) {
        return res.status(400).json({ error: "Registro expirado" });
      }
      const [establishment] = await db.insert(establishments).values({
        name: pendingReg.establishmentName,
        ownerName: pendingReg.ownerName,
        email: pendingReg.email,
        phone: pendingReg.phone,
        whatsappNumber: pendingReg.whatsappNumber,
        segment: pendingReg.segment,
        address: pendingReg.address,
        planId: pendingReg.planId,
        stripeCustomerId: pendingReg.stripeCustomerId,
        subscriptionStatus: "active"
      }).returning();
      await storage.createUser({
        establishmentId: establishment.id,
        email: pendingReg.email,
        name: pendingReg.userName,
        password: pendingReg.password,
        // já está hasheado
        role: "admin"
      });
      await db.update(pendingRegistrations).set({ status: "completed" }).where(eq2(pendingRegistrations.id, pendingReg.id));
      res.json({ success: true, establishmentId: establishment.id });
    } catch (error) {
      res.status(500).json({ error: "Erro ao completar registro: " + error.message });
    }
  });
  async function processCompletedPayment(stripeCustomerId) {
    let pendingRegs = await db.select().from(pendingRegistrations).where(and2(
      eq2(pendingRegistrations.stripeCustomerId, stripeCustomerId),
      eq2(pendingRegistrations.status, "pending")
    ));
    if (pendingRegs.length === 0) {
      try {
        const stripeCustomer = await stripe.customers.retrieve(stripeCustomerId);
        if (stripeCustomer && !stripeCustomer.deleted && stripeCustomer.email) {
          pendingRegs = await db.select().from(pendingRegistrations).where(and2(
            eq2(pendingRegistrations.email, stripeCustomer.email),
            eq2(pendingRegistrations.status, "pending")
          ));
          if (pendingRegs.length > 0) {
            await db.update(pendingRegistrations).set({ stripeCustomerId }).where(eq2(pendingRegistrations.id, pendingRegs[0].id));
          }
        }
      } catch (error) {
      }
    }
    const [pendingReg] = pendingRegs;
    if (!pendingReg) {
      throw new Error("Registro pendente n\xE3o encontrado");
    }
    if (/* @__PURE__ */ new Date() > pendingReg.expiresAt) {
      throw new Error("Registro expirado");
    }
    const [establishment] = await db.insert(establishments).values({
      name: pendingReg.establishmentName,
      ownerName: pendingReg.ownerName,
      email: pendingReg.email,
      phone: pendingReg.phone,
      whatsappNumber: pendingReg.whatsappNumber,
      segment: pendingReg.segment,
      address: pendingReg.address,
      planId: pendingReg.planId,
      stripeCustomerId: pendingReg.stripeCustomerId,
      subscriptionStatus: "active"
    }).returning();
    await storage.createUser({
      establishmentId: establishment.id,
      email: pendingReg.email,
      name: pendingReg.userName,
      password: pendingReg.password,
      // já está hasheado
      role: "admin"
    });
    await db.update(pendingRegistrations).set({ status: "completed" }).where(eq2(pendingRegistrations.id, pendingReg.id));
    return establishment;
  }
  app2.post("/api/confirm-payment-manual", async (req, res) => {
    try {
      const { stripeCustomerId } = req.body;
      if (!stripeCustomerId) {
        return res.status(400).json({ error: "Customer ID \xE9 obrigat\xF3rio" });
      }
      const establishment = await processCompletedPayment(stripeCustomerId);
      res.json({
        success: true,
        message: "Conta criada com sucesso!",
        establishmentId: establishment.id
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao confirmar pagamento: " + error.message });
    }
  });
  app2.get("/api/staff/:staffId/available-days", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const staffId = parseInt(req.params.staffId);
      const { month, year } = req.query;
      const staffWorkingHours3 = await storage.getStaffWorkingHours(staffId, establishmentId);
      if (!staffWorkingHours3 || staffWorkingHours3.length === 0) {
        return res.json({ availableDays: [] });
      }
      if (month && year) {
        const targetMonth = parseInt(month);
        const targetYear = parseInt(year);
        const staffVacationsData = await db.select().from(staffVacations).where(and2(
          eq2(staffVacations.staffId, staffId),
          eq2(staffVacations.establishmentId, establishmentId),
          eq2(staffVacations.isActive, true)
        ));
        const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
        const availableSpecificDays = [];
        const now = /* @__PURE__ */ new Date();
        const currentDay = now.getDate();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        let startDay = 1;
        if (targetMonth === currentMonth && targetYear === currentYear) {
          startDay = currentDay;
        }
        for (let day = startDay; day <= daysInMonth; day++) {
          const date = new Date(targetYear, targetMonth - 1, day);
          const dayOfWeek = date.getDay();
          const dateStr = `${targetYear}-${targetMonth.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
          const workingDay = staffWorkingHours3.find((h) => h.dayOfWeek === dayOfWeek && h.isAvailable);
          if (workingDay) {
            const isOnVacation = staffVacationsData.some((vacation) => {
              const vacationStart = new Date(vacation.startDate);
              const vacationEnd = new Date(vacation.endDate);
              const checkDate = new Date(dateStr);
              vacationStart.setHours(0, 0, 0, 0);
              vacationEnd.setHours(23, 59, 59, 999);
              checkDate.setHours(12, 0, 0, 0);
              return checkDate >= vacationStart && checkDate <= vacationEnd;
            });
            if (!isOnVacation) {
              availableSpecificDays.push({
                day,
                dayOfWeek,
                date: dateStr,
                formattedDate: `${day.toString().padStart(2, "0")}/${targetMonth.toString().padStart(2, "0")}/${targetYear}`,
                dayName: ["Domingo", "Segunda", "Ter\xE7a", "Quarta", "Quinta", "Sexta", "S\xE1bado"][dayOfWeek],
                openTime: workingDay.openTime,
                closeTime: workingDay.closeTime
              });
            }
          }
        }
        return res.json({
          staffId,
          month: targetMonth,
          year: targetYear,
          availableDays: availableSpecificDays
        });
      }
      const availableDays = staffWorkingHours3.filter((hours) => hours.isAvailable).map((hours) => ({
        dayOfWeek: hours.dayOfWeek,
        dayName: ["Domingo", "Segunda", "Ter\xE7a", "Quarta", "Quinta", "Sexta", "S\xE1bado"][hours.dayOfWeek],
        openTime: hours.openTime,
        closeTime: hours.closeTime
      }));
      res.json({
        staffId,
        availableDays
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar dias dispon\xEDveis" });
    }
  });
  app2.get("/api/staff/:staffId/available-times", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const staffId = parseInt(req.params.staffId);
      const { date, serviceId } = req.query;
      if (!date) {
        return res.status(400).json({ error: "Data \xE9 obrigat\xF3ria" });
      }
      let serviceDuration = 30;
      if (serviceId) {
        const service = await storage.getService(parseInt(String(serviceId)), establishmentId);
        if (service) {
          serviceDuration = service.duration;
        }
      }
      const staffWorkingHours3 = await storage.getStaffWorkingHours(staffId, establishmentId);
      const appointments3 = await storage.getAppointments(establishmentId);
      const dateStr = String(date);
      const dayOfWeek = new Date(dateStr).getDay();
      const staffDayHours = staffWorkingHours3.find(
        (h) => h.dayOfWeek === dayOfWeek && h.isAvailable
      );
      if (!staffDayHours) {
        return res.json({
          staffId,
          date: dateStr,
          available: false,
          message: "Profissional n\xE3o trabalha neste dia",
          timeSlots: []
        });
      }
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { staffVacations: staffVacations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq3, and: and3 } = await import("drizzle-orm");
      const staffVacationsData = await db2.select().from(staffVacations2).where(and3(
        eq3(staffVacations2.establishmentId, establishmentId),
        eq3(staffVacations2.staffId, staffId),
        eq3(staffVacations2.isActive, true)
      ));
      const isOnVacation = staffVacationsData.some((vacation) => {
        const vacationStart = new Date(vacation.startDate);
        const vacationEnd = new Date(vacation.endDate);
        const checkDate = new Date(dateStr);
        vacationStart.setHours(0, 0, 0, 0);
        vacationEnd.setHours(23, 59, 59, 999);
        checkDate.setHours(12, 0, 0, 0);
        return checkDate >= vacationStart && checkDate <= vacationEnd;
      });
      if (isOnVacation) {
        const vacationInfo = staffVacationsData.find((vacation) => {
          const vacationStart = new Date(vacation.startDate);
          const vacationEnd = new Date(vacation.endDate);
          const checkDate = new Date(dateStr);
          vacationStart.setHours(0, 0, 0, 0);
          vacationEnd.setHours(23, 59, 59, 999);
          checkDate.setHours(12, 0, 0, 0);
          return checkDate >= vacationStart && checkDate <= vacationEnd;
        });
        return res.json({
          staffId,
          date: dateStr,
          available: false,
          message: `Profissional de ${vacationInfo?.type || "f\xE9rias"}: ${vacationInfo?.reason || "N\xE3o dispon\xEDvel nesta data"}`,
          timeSlots: []
        });
      }
      const appointmentsForDate = appointments3.filter((apt) => {
        const aptDate = new Date(apt.appointmentDate).toISOString().split("T")[0];
        return aptDate === dateStr && apt.staffId === staffId;
      });
      const [openHour, openMinute] = (staffDayHours.openTime || "09:00").split(":").map(Number);
      const [closeHour, closeMinute] = (staffDayHours.closeTime || "18:00").split(":").map(Number);
      const timeSlots = [];
      const now = /* @__PURE__ */ new Date();
      const brazilTime = new Date(now.getTime() - 3 * 60 * 60 * 1e3);
      const today = brazilTime.toISOString().split("T")[0];
      const currentHour = brazilTime.getHours();
      const currentMinute = brazilTime.getMinutes();
      for (let hour = openHour; hour < closeHour || hour === closeHour && 0 < closeMinute; hour++) {
        for (let minute = 0; minute < 60; minute += 10) {
          if (hour === closeHour && minute >= closeMinute) break;
          const timeSlot = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
          const isPast = dateStr === today && (hour < currentHour || hour === currentHour && minute <= currentMinute);
          const endTime = new Date(2e3, 0, 1, hour, minute + serviceDuration);
          const endTimeStr = `${endTime.getHours().toString().padStart(2, "0")}:${endTime.getMinutes().toString().padStart(2, "0")}`;
          const serviceEndsAfterClose = endTime.getHours() > closeHour || endTime.getHours() === closeHour && endTime.getMinutes() > closeMinute;
          const isBooked = appointmentsForDate.some((apt) => {
            const aptTime = new Date(apt.appointmentDate);
            const aptHour = aptTime.getHours();
            const aptMinute = aptTime.getMinutes();
            const slotStart = hour * 60 + minute;
            const slotEnd = slotStart + serviceDuration;
            const aptStart = aptHour * 60 + aptMinute;
            const aptEnd = aptStart + (apt.duration || 30);
            return slotStart < aptEnd && slotEnd > aptStart;
          });
          const available = !isPast && !isBooked && !serviceEndsAfterClose;
          timeSlots.push({
            time: timeSlot,
            available,
            isPast,
            isBooked,
            serviceEndsAfterClose,
            serviceDuration,
            endTime: endTimeStr
          });
        }
      }
      res.json({
        staffId,
        date: dateStr,
        serviceDuration,
        available: true,
        workingHours: {
          openTime: staffDayHours.openTime,
          closeTime: staffDayHours.closeTime
        },
        timeSlots
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar hor\xE1rios dispon\xEDveis" });
    }
  });
  app2.get("/api/n8n/establishment/:id/info", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    const establishmentId = parseInt(req.params.id);
    if (!establishmentId) {
      return res.status(400).json({
        error: "ID do estabelecimento \xE9 obrigat\xF3rio"
      });
    }
    (async () => {
      try {
        const establishment = await storage.getEstablishment(establishmentId);
        if (!establishment) {
          return res.status(404).json({
            error: "Estabelecimento n\xE3o encontrado"
          });
        }
        const [services2, staff2, businessHours2] = await Promise.all([
          storage.getServices(establishmentId),
          storage.getStaff(establishmentId),
          storage.getBusinessHours(establishmentId)
        ]);
        res.json({
          establishment: {
            id: establishment.id,
            name: establishment.name,
            email: establishment.email,
            phone: establishment.phone,
            address: establishment.address
          },
          services: services2.map((service) => ({
            id: service.id,
            name: service.name,
            description: service.description,
            price: service.price,
            duration: service.duration,
            category: service.category
          })),
          staff: staff2.map((member) => ({
            id: member.id,
            name: member.name,
            email: member.email,
            phone: member.phone,
            specialties: member.specialties
          })),
          businessHours: businessHours2.map((hour) => ({
            dayOfWeek: hour.dayOfWeek,
            openTime: hour.openTime,
            closeTime: hour.closeTime,
            isOpen: hour.isOpen
          }))
        });
      } catch (error) {
        res.status(500).json({
          error: "Erro interno do servidor",
          message: error instanceof Error ? error.message : "Unknown error"
        });
      }
    })();
  });
  app2.put("/api/n8n/appointment/:id/confirm", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    const appointmentId = parseInt(req.params.id);
    if (!appointmentId) {
      return res.status(400).json({
        error: "ID do agendamento \xE9 obrigat\xF3rio"
      });
    }
    (async () => {
      try {
        const appointment = await storage.getAppointment(appointmentId, req.body.establishmentId);
        if (!appointment) {
          return res.status(404).json({
            error: "Agendamento n\xE3o encontrado"
          });
        }
        const updatedAppointment = await storage.updateAppointmentStatus(appointmentId, "confirmado", req.body.establishmentId);
        res.json({
          success: true,
          message: "Agendamento confirmado com sucesso",
          data: {
            appointmentId: updatedAppointment.id,
            status: updatedAppointment.status,
            confirmedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        });
      } catch (error) {
        res.status(500).json({
          error: "Erro interno do servidor",
          message: error instanceof Error ? error.message : "Unknown error"
        });
      }
    })();
  });
  app2.post("/api/register/establishment", async (req, res) => {
    try {
      const { establishment, user } = req.body;
      const establishmentData = insertEstablishmentSchema.parse(establishment);
      const userData = insertUserSchema.omit({ establishmentId: true }).parse(user);
      const existingEstablishment = await storage.getEstablishmentByEmail(establishmentData.email);
      if (existingEstablishment) {
        return res.status(400).json({ message: "Email j\xE1 est\xE1 em uso por outro estabelecimento" });
      }
      const now = /* @__PURE__ */ new Date();
      const newEstablishment = await storage.createEstablishment({
        ...establishmentData,
        termsAcceptedAt: now,
        privacyPolicyAcceptedAt: now,
        termsVersion: "1.0",
        privacyPolicyVersion: "1.0"
      });
      const hashedPassword = await bcrypt2.hash(userData.password, 10);
      const newUser = await storage.createUser({
        ...userData,
        establishmentId: newEstablishment.id,
        password: hashedPassword,
        role: "admin"
      });
      const { password, ...userWithoutPassword } = newUser;
      res.json({
        establishment: newEstablishment,
        user: userWithoutPassword,
        message: "Estabelecimento criado com sucesso!"
      });
    } catch (error) {
      console.error("Establishment registration error:", error);
      res.status(400).json({
        message: error.message || "Erro ao criar estabelecimento"
      });
    }
  });
  app2.post("/api/register", async (req, res) => {
    try {
      const { name, email, password, establishmentName, phone, segment, selectedPlan } = req.body;
      const planId = parseInt(selectedPlan);
      if (!planId || planId < 1 || planId > 3) {
        return res.status(400).json({ message: "Plano inv\xE1lido selecionado" });
      }
      if (!establishmentName || !phone || !segment) {
        return res.status(400).json({ message: "Nome do estabelecimento, telefone e segmento s\xE3o obrigat\xF3rios" });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email j\xE1 est\xE1 em uso" });
      }
      const now = /* @__PURE__ */ new Date();
      const establishment = await storage.createEstablishment({
        name: establishmentName,
        ownerName: name,
        email,
        phone,
        whatsappNumber: phone,
        segment,
        address: "",
        planId,
        termsAcceptedAt: now,
        privacyPolicyAcceptedAt: now,
        termsVersion: "1.0",
        privacyPolicyVersion: "1.0"
      });
      const cleanPassword = password.trim();
      const hashedPassword = await bcrypt2.hash(cleanPassword, 10);
      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        role: "admin",
        establishmentId: establishment.id
      });
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        message: "Conta criada com sucesso!"
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Falha ao criar conta" });
    }
  });
  app2.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const normalizedEmail = email.toLowerCase();
      const user = await storage.getUserByEmail(normalizedEmail);
      if (!user) {
        return res.status(401).json({ message: "Credenciais inv\xE1lidas" });
      }
      const passwordMatch = await bcrypt2.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Credenciais inv\xE1lidas" });
      }
      req.session.userId = user.id;
      req.session.establishmentId = user.establishmentId;
      req.session.role = user.role || "admin";
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        establishmentId: user.establishmentId
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Falha no login" });
    }
  });
  app2.post("/api/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ message: "Erro ao fazer logout" });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logout realizado com sucesso" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Erro ao fazer logout" });
    }
  });
  app2.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email \xE9 obrigat\xF3rio" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: "Se este email existir em nossos registros, voc\xEA receber\xE1 um link para redefinir sua senha." });
      }
      const [establishment] = await db.select().from(establishments).where(eq2(establishments.id, user.establishmentId));
      const resetToken = nanoid(32);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
      await db.insert(passwordResetTokens).values({
        email: email.toLowerCase(),
        token: resetToken,
        expiresAt,
        used: false
      });
      await sendPasswordResetEmail(
        email,
        resetToken,
        establishment?.name
      );
      res.json({ message: "Se este email existir em nossos registros, voc\xEA receber\xE1 um link para redefinir sua senha." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/reset-password/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const [resetToken] = await db.select().from(passwordResetTokens).where(and2(
        eq2(passwordResetTokens.token, token),
        eq2(passwordResetTokens.used, false),
        gte2(passwordResetTokens.expiresAt, /* @__PURE__ */ new Date())
      ));
      if (!resetToken) {
        return res.status(400).json({ message: "Token inv\xE1lido ou expirado" });
      }
      res.json({ valid: true, email: resetToken.email });
    } catch (error) {
      console.error("Verify reset token error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token e nova senha s\xE3o obrigat\xF3rios" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres" });
      }
      const [resetToken] = await db.select().from(passwordResetTokens).where(and2(
        eq2(passwordResetTokens.token, token),
        eq2(passwordResetTokens.used, false),
        gte2(passwordResetTokens.expiresAt, /* @__PURE__ */ new Date())
      ));
      if (!resetToken) {
        return res.status(400).json({ message: "Token inv\xE1lido ou expirado" });
      }
      const hashedPassword = await bcrypt2.hash(newPassword, 10);
      await db.update(users).set({ password: hashedPassword }).where(eq2(users.email, resetToken.email));
      await db.update(passwordResetTokens).set({ used: true }).where(eq2(passwordResetTokens.id, resetToken.id));
      res.json({ message: "Senha redefinida com sucesso" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/accept-terms", requireAuth, async (req, res) => {
    try {
      const { establishmentId } = req.body;
      const { termsVersion = "1.0", privacyPolicyVersion = "1.0" } = req.body;
      if (!establishmentId) {
        return res.status(400).json({ message: "ID do estabelecimento \xE9 obrigat\xF3rio" });
      }
      const now = /* @__PURE__ */ new Date();
      await db.update(establishments).set({
        termsAcceptedAt: now,
        privacyPolicyAcceptedAt: now,
        termsVersion,
        privacyPolicyVersion,
        updatedAt: now
      }).where(eq2(establishments.id, establishmentId));
      res.json({
        message: "Termos aceitos com sucesso",
        acceptedAt: now,
        termsVersion,
        privacyPolicyVersion
      });
    } catch (error) {
      console.error("Accept terms error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/terms-status/:establishmentId", requireAuth, async (req, res) => {
    try {
      const { establishmentId } = req.params;
      const [establishment] = await db.select({
        termsAcceptedAt: establishments.termsAcceptedAt,
        privacyPolicyAcceptedAt: establishments.privacyPolicyAcceptedAt,
        termsVersion: establishments.termsVersion,
        privacyPolicyVersion: establishments.privacyPolicyVersion
      }).from(establishments).where(eq2(establishments.id, parseInt(establishmentId)));
      if (!establishment) {
        return res.status(404).json({ message: "Estabelecimento n\xE3o encontrado" });
      }
      const hasAcceptedTerms = establishment.termsAcceptedAt && establishment.privacyPolicyAcceptedAt;
      res.json({
        hasAcceptedTerms,
        termsAcceptedAt: establishment.termsAcceptedAt,
        privacyPolicyAcceptedAt: establishment.privacyPolicyAcceptedAt,
        termsVersion: establishment.termsVersion || "1.0",
        privacyPolicyVersion: establishment.privacyPolicyVersion || "1.0",
        currentVersion: "1.0"
      });
    } catch (error) {
      console.error("Terms status error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/dashboard/stats", async (req, res) => {
    try {
      const { establishmentId, userId, role } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      if (role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const stats = await storage.getDashboardStats(establishmentId);
      res.json(stats);
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  app2.get("/api/staff/dashboard-data", async (req, res) => {
    try {
      const { establishmentId, userId, role } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      if (role !== "staff") {
        return res.status(403).json({ message: "Staff access required" });
      }
      const staffMember = await storage.getStaffByUserId(userId, establishmentId);
      if (!staffMember) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      const staffData = await storage.getCompleteStaffData(establishmentId, staffMember.id);
      res.json(staffData);
    } catch (error) {
      console.error("Staff dashboard API error:", error);
      res.status(500).json({ message: "Failed to fetch staff dashboard data" });
    }
  });
  app2.get("/api/dashboard/recent-appointments", async (req, res) => {
    try {
      const { establishmentId, userId, userRole } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      let appointments3;
      if (userRole === "staff") {
        const staffMember = await storage.getStaffByUserId(userId, establishmentId);
        if (staffMember) {
          appointments3 = await storage.getTodaysAppointmentsForStaff(establishmentId, staffMember.id);
        } else {
          appointments3 = [];
        }
      } else {
        appointments3 = await storage.getTodaysAppointments(establishmentId);
      }
      res.json(appointments3);
    } catch (error) {
      console.error("Get recent appointments error:", error);
      res.status(500).json({ message: "Failed to fetch recent appointments" });
    }
  });
  app2.get("/api/clients", requireAdmin, async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const clients2 = await storage.getClients(establishmentId);
      res.json(clients2);
    } catch (error) {
      console.error("Get clients error:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });
  app2.get("/api/clients/list", requireAuth, async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const clients2 = await storage.getClients(establishmentId);
      res.json(clients2);
    } catch (error) {
      console.error("Get clients list error:", error);
      res.status(500).json({ message: "Failed to fetch clients list" });
    }
  });
  app2.get("/api/clients/search", requireAdmin, async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.json([]);
      }
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const clients2 = await storage.searchClients(q, establishmentId);
      res.json(clients2);
    } catch (error) {
      console.error("Search clients error:", error);
      res.status(500).json({ message: "Failed to search clients" });
    }
  });
  app2.get("/api/clients/:id", requireAdmin, async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id, establishmentId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Get client error:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });
  app2.post("/api/clients", requireAdmin, async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const clientData = insertClientSchema.parse({
        ...req.body,
        establishmentId
      });
      const client = await storage.createClient(clientData);
      try {
        const { wsManager: wsManager2 } = await Promise.resolve().then(() => (init_websocket(), websocket_exports));
        if (wsManager2) {
          wsManager2.notifyClientChange(establishmentId, {
            type: "client_created",
            clientId: client.id,
            clientName: client.name
          });
        }
      } catch (wsError) {
      }
      res.json(client);
    } catch (error) {
      console.error("Create client error:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });
  app2.put("/api/clients/:id", requireAdmin, async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const id = parseInt(req.params.id);
      const clientData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, clientData, establishmentId);
      try {
        const { wsManager: wsManager2 } = await Promise.resolve().then(() => (init_websocket(), websocket_exports));
        if (wsManager2) {
          wsManager2.notifyClientChange(establishmentId, {
            type: "client_updated",
            clientId: id,
            clientName: client.name
          });
        }
      } catch (wsError) {
      }
      res.json(client);
    } catch (error) {
      console.error("Update client error:", error);
      res.status(500).json({ message: "Failed to update client" });
    }
  });
  app2.delete("/api/clients/:id", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const id = parseInt(req.params.id);
      await storage.deleteClient(id, establishmentId);
      try {
        const { wsManager: wsManager2 } = await Promise.resolve().then(() => (init_websocket(), websocket_exports));
        if (wsManager2) {
          wsManager2.notifyClientChange(establishmentId, {
            type: "client_deleted",
            clientId: id
          });
        }
      } catch (wsError) {
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete client error:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });
  app2.get("/api/staff", requireAdmin, async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const staffList = await storage.getStaff(establishmentId);
      res.json(staffList);
    } catch (error) {
      console.error("Get staff error:", error);
      if (error?.message === "Authentication required") {
        return res.status(401).json({ message: "Authentication required" });
      }
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });
  app2.get("/api/staff/list", requireAuth, async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const staffList = await storage.getStaff(establishmentId);
      res.json(staffList);
    } catch (error) {
      console.error("Get staff list error:", error);
      if (error?.message === "Authentication required") {
        return res.status(401).json({ message: "Authentication required" });
      }
      res.status(500).json({ message: "Failed to fetch staff list" });
    }
  });
  app2.post("/api/staff", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const staffLimit = await storage.checkStaffLimit(establishmentId);
      if (!staffLimit.isWithinLimit) {
        const plan = await storage.getEstablishmentPlan(establishmentId);
        return res.status(403).json({
          message: `Limite de colaboradores atingido (${staffLimit.currentCount}/${staffLimit.maxAllowed}). Atualize seu plano para adicionar mais colaboradores.`,
          currentPlan: plan?.name,
          maxAllowed: staffLimit.maxAllowed,
          currentCount: staffLimit.currentCount
        });
      }
      const requestBody = req.body;
      const staffData = insertStaffSchema.parse({
        ...requestBody,
        email: requestBody.email ? requestBody.email.toLowerCase() : requestBody.email,
        establishmentId
      });
      const staff2 = await storage.createStaff(staffData);
      if (requestBody.hasSystemAccess && requestBody.email && requestBody.password) {
        try {
          const normalizedEmail = requestBody.email.toLowerCase();
          const existingUser = await storage.getUserByEmail(normalizedEmail);
          if (!existingUser) {
            const userData = {
              name: requestBody.name,
              email: normalizedEmail,
              password: requestBody.password,
              // Will be hashed in storage.createUser
              role: "staff",
              establishmentId,
              staffId: staff2.id
            };
            await storage.createUser(userData);
          } else {
          }
        } catch (userError) {
          console.error("Error creating user account for staff:", userError);
        }
      }
      res.json(staff2);
    } catch (error) {
      console.error("Create staff error:", error);
      res.status(500).json({ message: "Failed to create staff member" });
    }
  });
  app2.put("/api/staff/:id", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const id = parseInt(req.params.id);
      const staffData = insertStaffSchema.partial().parse(req.body);
      const staff2 = await storage.updateStaff(id, staffData);
      if (staffData.hasSystemAccess && staffData.email) {
        try {
          const existingUser = await storage.getUserByEmail(staffData.email);
          if (!existingUser) {
            const fullStaffData = await storage.getStaffMember(id, establishmentId);
            if (fullStaffData && fullStaffData.password) {
              const userData = {
                name: staffData.name || fullStaffData.name,
                email: staffData.email,
                password: fullStaffData.password,
                // Use existing staff password
                role: "staff",
                establishmentId,
                staffId: id
              };
              await storage.createUser(userData);
            }
          } else if (existingUser.staffId !== id) {
          }
        } catch (userError) {
          console.error("Error creating/updating user account for staff:", userError);
        }
      }
      res.json(staff2);
    } catch (error) {
      console.error("Update staff error:", error);
      res.status(500).json({ message: "Failed to update staff member" });
    }
  });
  app2.delete("/api/staff/:id", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const id = parseInt(req.params.id);
      const existingStaff = await storage.getStaffMember(id, establishmentId);
      if (!existingStaff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      await storage.deleteStaff(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete staff error:", error);
      res.status(500).json({ message: "Failed to delete staff member" });
    }
  });
  app2.get("/api/staff/:id/working-hours", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const staffId = parseInt(req.params.id);
      if (!staffId || !establishmentId) {
        return res.status(400).json({ message: "Staff ID and establishment ID required" });
      }
      const workingHours = await storage.getStaffWorkingHours(staffId, establishmentId);
      res.json(workingHours);
    } catch (error) {
      console.error("Get staff working hours error:", error);
      res.status(500).json({ message: "Failed to fetch staff working hours" });
    }
  });
  app2.post("/api/staff/:id/working-hours", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const staffId = parseInt(req.params.id);
      const { workingHours } = req.body;
      if (!staffId || !establishmentId || !Array.isArray(workingHours)) {
        return res.status(400).json({ message: "Staff ID, establishment ID and working hours array required" });
      }
      await storage.setStaffWorkingHours(staffId, establishmentId, workingHours);
      res.json({ message: "Working hours updated successfully" });
    } catch (error) {
      console.error("Set staff working hours error:", error);
      res.status(500).json({ message: "Failed to update staff working hours" });
    }
  });
  app2.get("/api/staff/:id/vacations", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const staffId = parseInt(req.params.id);
      if (!staffId || !establishmentId) {
        return res.status(400).json({ message: "Staff ID and establishment ID required" });
      }
      const vacations = await db.select().from(staffVacations).where(and2(eq2(staffVacations.staffId, staffId), eq2(staffVacations.establishmentId, establishmentId), eq2(staffVacations.isActive, true))).orderBy(staffVacations.startDate);
      res.json(vacations);
    } catch (error) {
      console.error("Get staff vacations error:", error);
      res.status(500).json({ message: "Failed to fetch staff vacations" });
    }
  });
  app2.post("/api/staff/:id/vacations", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const staffId = parseInt(req.params.id);
      if (!staffId || !establishmentId) {
        return res.status(400).json({ message: "Staff ID and establishment ID required" });
      }
      const vacationData = insertStaffVacationSchema.parse({
        ...req.body,
        staffId,
        establishmentId
      });
      const [vacation] = await db.insert(staffVacations).values(vacationData).returning();
      res.json(vacation);
    } catch (error) {
      console.error("Create staff vacation error:", error);
      res.status(500).json({ message: "Failed to create staff vacation" });
    }
  });
  app2.put("/api/staff/:id/vacations/:vacationId", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const staffId = parseInt(req.params.id);
      const vacationId = parseInt(req.params.vacationId);
      if (!staffId || !establishmentId || !vacationId) {
        return res.status(400).json({ message: "Staff ID, establishment ID and vacation ID required" });
      }
      const vacationData = insertStaffVacationSchema.partial().parse(req.body);
      const [vacation] = await db.update(staffVacations).set({
        ...vacationData,
        updatedAt: sql3`now()`
      }).where(and2(
        eq2(staffVacations.id, vacationId),
        eq2(staffVacations.staffId, staffId),
        eq2(staffVacations.establishmentId, establishmentId)
      )).returning();
      if (!vacation) {
        return res.status(404).json({ message: "Vacation not found" });
      }
      res.json(vacation);
    } catch (error) {
      console.error("Update staff vacation error:", error);
      res.status(500).json({ message: "Failed to update staff vacation" });
    }
  });
  app2.delete("/api/staff/:id/vacations/:vacationId", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const staffId = parseInt(req.params.id);
      const vacationId = parseInt(req.params.vacationId);
      if (!staffId || !establishmentId || !vacationId) {
        return res.status(400).json({ message: "Staff ID, establishment ID and vacation ID required" });
      }
      await db.update(staffVacations).set({ isActive: false, updatedAt: sql3`now()` }).where(and2(
        eq2(staffVacations.id, vacationId),
        eq2(staffVacations.staffId, staffId),
        eq2(staffVacations.establishmentId, establishmentId)
      ));
      res.json({ message: "Vacation deleted successfully" });
    } catch (error) {
      console.error("Delete staff vacation error:", error);
      res.status(500).json({ message: "Failed to delete staff vacation" });
    }
  });
  app2.get("/api/services", requireAdmin, async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const services2 = await storage.getServices(establishmentId);
      res.json(services2);
    } catch (error) {
      console.error("Get services error:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });
  app2.get("/api/services/list", requireAuth, async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const services2 = await storage.getServices(establishmentId);
      res.json(services2);
    } catch (error) {
      console.error("Get services list error:", error);
      res.status(500).json({ message: "Failed to fetch services list" });
    }
  });
  app2.post("/api/services", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const requestBody = { ...req.body };
      if (Array.isArray(requestBody.staffIds)) {
        requestBody.staffIds = JSON.stringify(requestBody.staffIds);
      }
      const serviceData = insertServiceSchema.parse({
        ...requestBody,
        establishmentId
      });
      const service = await storage.createService(serviceData);
      res.json(service);
    } catch (error) {
      console.error("Create service error:", error);
      res.status(500).json({ message: "Failed to create service" });
    }
  });
  app2.put("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const requestBody = { ...req.body };
      if (Array.isArray(requestBody.staffIds)) {
        requestBody.staffIds = JSON.stringify(requestBody.staffIds);
      }
      const serviceData = insertServiceSchema.parse(requestBody);
      const service = await storage.updateService(id, serviceData);
      res.json(service);
    } catch (error) {
      console.error("Update service error:", error);
      res.status(500).json({ message: "Failed to update service" });
    }
  });
  app2.delete("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteService(id);
      res.json({ message: "Service deleted successfully" });
    } catch (error) {
      console.error("Delete service error:", error);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });
  app2.get("/api/service-categories", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const categories = await storage.getServiceCategories(establishmentId);
      res.json(categories);
    } catch (error) {
      console.error("Get service categories error:", error);
      res.status(500).json({ message: "Failed to fetch service categories" });
    }
  });
  app2.post("/api/service-categories", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const categoryData = insertServiceCategorySchema.parse({
        ...req.body,
        establishmentId
      });
      const category = await storage.createServiceCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Create service category error:", error);
      res.status(500).json({ message: "Failed to create service category" });
    }
  });
  app2.delete("/api/service-categories/:id", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const id = parseInt(req.params.id);
      await storage.deleteServiceCategory(id, establishmentId);
      res.json({ message: "Service category deleted successfully" });
    } catch (error) {
      console.error("Delete service category error:", error);
      res.status(500).json({ message: "Failed to delete service category" });
    }
  });
  app2.get("/api/appointments", async (req, res) => {
    try {
      const { establishmentId, userId, userRole } = getUserContext(req);
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 50, 100);
      const month = req.query.month;
      const statusFilter = req.query.status;
      const offset = (page - 1) * limit;
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      let appointments3;
      let total = 0;
      if (userRole === "staff") {
        const staffMember = await storage.getStaffByUserId(userId, establishmentId);
        if (staffMember) {
          const result = await storage.getPaginatedStaffAppointments(establishmentId, staffMember.id, offset, limit, month, statusFilter);
          appointments3 = result.appointments;
          total = result.total;
        } else {
          appointments3 = [];
          total = 0;
        }
      } else {
        const result = await storage.getPaginatedAppointments(establishmentId, offset, limit, month, statusFilter);
        appointments3 = result.appointments;
        total = result.total;
      }
      res.json({
        appointments: appointments3,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error("\u274C Get appointments error:", error);
      console.error("\u274C Error message:", error?.message);
      console.error("\u274C Error stack:", error?.stack);
      console.error("\u274C Request details:", {
        page: req.query.page,
        limit: req.query.limit,
        month: req.query.month,
        statusFilter: req.query.status,
        userRole: req.headers["x-user-role"],
        userId: req.headers["x-user-id"],
        establishmentId: req.headers["x-establishment-id"],
        host: req.headers.host,
        env: process.env.NODE_ENV
      });
      res.status(500).json({
        message: "Failed to fetch appointments",
        error: error instanceof Error ? error.message : String(error),
        details: process.env.NODE_ENV === "development" ? error?.stack : void 0
      });
    }
  });
  app2.post("/api/appointments", async (req, res) => {
    try {
      const { clientId, serviceId, staffId, appointmentDate, appointmentTime, notes } = req.body;
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const service = await storage.getService(parseInt(serviceId), establishmentId);
      if (!service) {
        return res.status(400).json({ message: "Servi\xE7o n\xE3o encontrado" });
      }
      if (!appointmentDate || !appointmentTime) {
        return res.status(400).json({ message: "Data e hor\xE1rio s\xE3o obrigat\xF3rios" });
      }
      let dateOnly = appointmentDate;
      if (typeof appointmentDate === "string" && appointmentDate.includes("T")) {
        dateOnly = appointmentDate.split("T")[0];
      }
      const localString = `${dateOnly}T${appointmentTime}:00`;
      const dataInicio = new Date(localString);
      if (isNaN(dataInicio.getTime())) {
        return res.status(400).json({ message: "Data ou hor\xE1rio inv\xE1lido" });
      }
      const now = /* @__PURE__ */ new Date();
      const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
      if (dataInicio < brazilTime) {
        return res.status(400).json({
          message: "N\xE3o \xE9 poss\xEDvel agendar para datas/hor\xE1rios passados"
        });
      }
      const dataFim = new Date(dataInicio.getTime() + service.duration * 6e4 - 6e4);
      const businessHours2 = await storage.getBusinessHours(establishmentId);
      const appointmentDay = dataInicio.getDay();
      const dayHours = businessHours2.find((h) => h.dayOfWeek === appointmentDay);
      if (!dayHours || !dayHours.isOpen) {
        const dayNames = ["Domingo", "Segunda-feira", "Ter\xE7a-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "S\xE1bado"];
        return res.status(400).json({
          message: `Estabelecimento fechado em ${dayNames[appointmentDay]}`
        });
      }
      const [hour, minute] = appointmentTime.split(":").map(Number);
      const appointmentMinutes = hour * 60 + minute;
      const openTime = dayHours.openTime || "09:00";
      const closeTime = dayHours.closeTime || "18:00";
      const [openHour, openMinute] = openTime.split(":").map(Number);
      const [closeHour, closeMinute] = closeTime.split(":").map(Number);
      const openMinutes = openHour * 60 + openMinute;
      const closeMinutes = closeHour * 60 + closeMinute;
      if (appointmentMinutes < openMinutes || appointmentMinutes >= closeMinutes) {
        return res.status(400).json({
          message: `Hor\xE1rio deve ser entre ${openTime} e ${closeTime}`
        });
      }
      const appointmentEndMinutes = appointmentMinutes + service.duration;
      if (appointmentEndMinutes > closeMinutes) {
        return res.status(400).json({
          message: `Agendamento ultrapassaria o hor\xE1rio de funcionamento (${closeTime})`
        });
      }
      const conflictCheck = await storage.checkAppointmentConflict(
        parseInt(staffId),
        dataInicio,
        dataFim
      );
      if (conflictCheck) {
        return res.status(400).json({
          message: "Conflito de hor\xE1rio! O profissional j\xE1 tem um agendamento neste per\xEDodo."
        });
      }
      const limitCheck = await storage.checkMonthlyAppointmentLimit(establishmentId);
      if (!limitCheck.canCreate) {
        const message = limitCheck.maxCount === null ? "Erro interno ao verificar limite de agendamentos" : `Limite mensal de agendamentos atingido (${limitCheck.currentCount}/${limitCheck.maxCount}). Considere fazer upgrade do seu plano para continuar agendando.`;
        return res.status(400).json({
          message,
          currentCount: limitCheck.currentCount,
          maxCount: limitCheck.maxCount
        });
      }
      const transformedData = {
        clientId: parseInt(clientId),
        serviceId: parseInt(serviceId),
        staffId: parseInt(staffId),
        appointmentDate: dataInicio,
        dataFim,
        duration: service.duration,
        status: "scheduled",
        notes: notes || "",
        establishmentId: typeof establishmentId === "number" ? establishmentId : parseInt(establishmentId)
      };
      const appointmentData = insertAppointmentSchema.parse(transformedData);
      const appointment = await storage.createAppointment(appointmentData);
      try {
        const { wsManager: wsManager2 } = await Promise.resolve().then(() => (init_websocket(), websocket_exports));
        if (wsManager2) {
          wsManager2.notifyAppointmentChange(establishmentId, {
            type: "created",
            appointmentId: appointment.id,
            clientId: appointment.clientId,
            staffId: appointment.staffId,
            serviceId: appointment.serviceId,
            date: appointment.appointmentDate
          });
          wsManager2.notifyNewNotification(establishmentId, {
            type: "appointment",
            appointmentId: appointment.id
          });
          wsManager2.notifyStaffDashboardChange(establishmentId, appointment.staffId, {
            type: "appointment_created",
            appointmentId: appointment.id
          });
          try {
            const [client, service2] = await Promise.all([
              storage.getClient(appointment.clientId, establishmentId),
              storage.getService(appointment.serviceId, establishmentId)
            ]);
            wsManager2.notifyStaffAppointment(establishmentId, appointment.staffId, {
              type: "new_appointment",
              appointmentId: appointment.id,
              clientName: client?.name || "Cliente",
              serviceName: service2?.name || "Servi\xE7o",
              appointmentDate: appointment.appointmentDate
            });
          } catch (notifyError) {
          }
        }
      } catch (wsError) {
      }
      try {
        const [client, service2, staff2, establishment] = await Promise.all([
          storage.getClient(appointment.clientId, establishmentId),
          storage.getService(appointment.serviceId, establishmentId),
          storage.getStaffMember(appointment.staffId, establishmentId),
          storage.getEstablishment(establishmentId)
        ]);
        if (client && service2 && staff2 && establishment && establishment.email) {
          const appointmentDate2 = new Date(appointment.appointmentDate);
          const formattedDate = appointmentDate2.toLocaleDateString("pt-BR");
          const formattedTime = appointmentDate2.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
          });
          const emailSent = await sendAppointmentNotification(establishment.email, {
            establishmentName: establishment.name,
            clientName: client.name,
            serviceName: service2.name,
            staffName: staff2.name,
            appointmentDate: formattedDate,
            appointmentTime: formattedTime,
            clientPhone: client.phone || ""
          });
        } else {
        }
      } catch (emailError) {
        console.error("\u274C Erro no envio de email de notifica\xE7\xE3o:", emailError);
      }
      res.json(appointment);
    } catch (error) {
      console.error("Create appointment error:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });
  app2.put("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { clientId, serviceId, staffId, appointmentDate, appointmentTime, notes } = req.body;
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const service = await storage.getService(parseInt(serviceId), establishmentId);
      if (!service) {
        return res.status(400).json({ message: "Servi\xE7o n\xE3o encontrado" });
      }
      const appointmentDateTime = /* @__PURE__ */ new Date(`${appointmentDate}T${appointmentTime}`);
      const now = /* @__PURE__ */ new Date();
      const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
      if (appointmentDateTime < brazilTime) {
        return res.status(400).json({
          message: "N\xE3o \xE9 poss\xEDvel agendar para datas/hor\xE1rios passados"
        });
      }
      const businessHours2 = await storage.getBusinessHours(establishmentId);
      const appointmentDay = appointmentDateTime.getDay();
      const dayHours = businessHours2.find((h) => h.dayOfWeek === appointmentDay);
      if (!dayHours || !dayHours.isOpen) {
        const dayNames = ["Domingo", "Segunda-feira", "Ter\xE7a-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "S\xE1bado"];
        return res.status(400).json({
          message: `Estabelecimento fechado em ${dayNames[appointmentDay]}`
        });
      }
      const [hour, minute] = appointmentTime.split(":").map(Number);
      const appointmentMinutes = hour * 60 + minute;
      const openTime = dayHours.openTime || "09:00";
      const closeTime = dayHours.closeTime || "18:00";
      const [openHour, openMinute] = openTime.split(":").map(Number);
      const [closeHour, closeMinute] = closeTime.split(":").map(Number);
      const openMinutes = openHour * 60 + openMinute;
      const closeMinutes = closeHour * 60 + closeMinute;
      if (appointmentMinutes < openMinutes || appointmentMinutes >= closeMinutes) {
        return res.status(400).json({
          message: `Hor\xE1rio deve ser entre ${openTime} e ${closeTime}`
        });
      }
      const appointmentEndMinutes = appointmentMinutes + service.duration;
      if (appointmentEndMinutes > closeMinutes) {
        return res.status(400).json({
          message: `Agendamento ultrapassaria o hor\xE1rio de funcionamento (${closeTime})`
        });
      }
      const existingAppointments = await storage.getAppointmentsRaw();
      const conflictingAppointments = existingAppointments.filter((apt) => {
        if (apt.id === id) return false;
        if (apt.staffId !== parseInt(staffId)) return false;
        const aptStart = new Date(apt.appointmentDate);
        const aptEnd = new Date(aptStart.getTime() + (apt.duration || 30) * 6e4 - 6e4);
        const newEnd = new Date(appointmentDateTime.getTime() + service.duration * 6e4 - 6e4);
        return appointmentDateTime <= aptEnd && newEnd >= aptStart;
      });
      if (conflictingAppointments.length > 0) {
        return res.status(400).json({
          message: "Conflito de hor\xE1rio! J\xE1 existe um agendamento neste per\xEDodo.",
          conflictingAppointments: conflictingAppointments.map((apt) => ({
            id: apt.id,
            time: new Date(apt.appointmentDate).toLocaleTimeString(),
            duration: apt.duration
          }))
        });
      }
      const appointmentEndTime = new Date(appointmentDateTime.getTime() + service.duration * 6e4);
      const appointmentData = {
        clientId: parseInt(clientId),
        serviceId: parseInt(serviceId),
        staffId: parseInt(staffId),
        appointmentDate: appointmentDateTime,
        dataFim: appointmentEndTime,
        duration: service.duration,
        status: "agendado",
        notes: notes || ""
      };
      const appointment = await storage.updateAppointment(id, appointmentData);
      try {
        const { wsManager: wsManager2 } = await Promise.resolve().then(() => (init_websocket(), websocket_exports));
        if (wsManager2) {
          wsManager2.notifyAppointmentChange(establishmentId, {
            type: "updated",
            appointmentId: id,
            clientId: appointment.clientId,
            staffId: appointment.staffId,
            serviceId: appointment.serviceId,
            date: appointment.appointmentDate
          });
          wsManager2.notifyStaffDashboardChange(establishmentId, appointment.staffId, {
            type: "appointment_updated",
            appointmentId: id
          });
          wsManager2.notifyStaffDashboardChange(establishmentId, appointment.staffId, {
            type: "appointment_updated",
            appointmentId: id
          });
        }
      } catch (wsError) {
      }
      res.json(appointment);
    } catch (error) {
      console.error("Update appointment error:", error);
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });
  app2.patch("/api/appointments/:id/status", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const currentAppointment = await storage.getAppointment(id, establishmentId);
      if (!currentAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      const appointment = await storage.updateAppointmentStatus(id, status, establishmentId);
      if ((currentAppointment.status === "scheduled" || currentAppointment.status === "agendado") && (status === "completed" || status === "realizado")) {
        try {
          const { establishmentId: establishmentId2 } = getUserContext(req);
          if (!establishmentId2) {
            console.error("Establishment ID required for transaction creation");
            throw new Error("Establishment ID required");
          }
          const service = await storage.getService(currentAppointment.serviceId, establishmentId2);
          if (service && service.price) {
            const now = /* @__PURE__ */ new Date();
            const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
            const transactionData = {
              amount: service.price,
              type: "income",
              description: `Servi\xE7o realizado: ${service.name}`,
              category: "Servi\xE7os Realizados",
              paymentMethod: "dinheiro",
              appointmentId: id,
              transactionDate: brazilTime,
              establishmentId: establishmentId2
            };
            await storage.createTransaction(transactionData);
          }
          try {
            await storage.addLoyaltyPointsForCompletedService(
              currentAppointment.clientId,
              currentAppointment.serviceId,
              id,
              establishmentId2
            );
          } catch (loyaltyError) {
            console.error("Error processing loyalty points:", loyaltyError);
          }
        } catch (transactionError) {
          console.error("Error creating financial transaction:", transactionError);
        }
      }
      try {
        const { wsManager: wsManager2 } = await Promise.resolve().then(() => (init_websocket(), websocket_exports));
        if (wsManager2) {
          wsManager2.notifyAppointmentChange(establishmentId, {
            type: "status_changed",
            appointmentId: id,
            newStatus: status,
            clientId: appointment.clientId,
            staffId: appointment.staffId
          });
          if ((currentAppointment.status === "scheduled" || currentAppointment.status === "agendado") && (status === "completed" || status === "realizado")) {
            const service = await storage.getService(currentAppointment.serviceId, establishmentId);
            const servicePrice = service?.price || 0;
            wsManager2.notifyFinancialChange(establishmentId, {
              type: "income_from_appointment",
              appointmentId: id,
              amount: servicePrice,
              serviceName: service?.name || "Servi\xE7o"
            });
            wsManager2.notifyDashboardStatsChange(establishmentId, {
              type: "appointment_revenue_update",
              reason: "appointment_completed",
              appointmentId: id,
              amount: servicePrice
            });
          }
        }
      } catch (wsError) {
      }
      res.json(appointment);
    } catch (error) {
      console.error("Update appointment status error:", error);
      res.status(500).json({ message: "Failed to update appointment status" });
    }
  });
  app2.delete("/api/appointments/:id", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const id = parseInt(req.params.id);
      const appointment = await storage.getAppointment(id, establishmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      await storage.deleteAppointment(id);
      try {
        const { wsManager: wsManager2 } = await Promise.resolve().then(() => (init_websocket(), websocket_exports));
        if (wsManager2) {
          wsManager2.notifyAppointmentChange(establishmentId, {
            type: "deleted",
            appointmentId: id,
            staffId: appointment.staffId
          });
          wsManager2.notifyStaffDashboardChange(establishmentId, appointment.staffId, {
            type: "appointment_deleted",
            appointmentId: id
          });
        }
      } catch (wsError) {
      }
      res.json({ success: true, message: "Appointment deleted successfully" });
    } catch (error) {
      console.error("Delete appointment error:", error);
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });
  app2.get("/api/appointments/pending", async (req, res) => {
    try {
      const { establishmentId, userId, userRole } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      let pendingAppointments;
      if (userRole === "staff") {
        const staffMember = await storage.getStaffByUserId(userId, establishmentId);
        if (staffMember) {
          pendingAppointments = await storage.getPendingAppointmentsForStaff(establishmentId, staffMember.id);
        } else {
          pendingAppointments = [];
        }
      } else {
        pendingAppointments = await storage.getPendingAppointments(establishmentId);
      }
      res.json(pendingAppointments);
    } catch (error) {
      console.error("Fetch pending appointments error:", error);
      res.status(500).json({ message: "Failed to fetch pending appointments" });
    }
  });
  app2.get("/api/appointments/recent", async (req, res) => {
    try {
      const { establishmentId, userId, userRole } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      let recentAppointments;
      if (userRole === "staff") {
        const staffMember = await storage.getStaffByUserId(userId, establishmentId);
        if (staffMember) {
          recentAppointments = await storage.getRecentAppointmentsForStaff(establishmentId, staffMember.id);
        } else {
          recentAppointments = [];
        }
      } else {
        recentAppointments = await storage.getRecentAppointments(establishmentId);
      }
      res.json(recentAppointments);
    } catch (error) {
      console.error("Fetch recent appointments error:", error);
      res.status(500).json({ message: "Failed to fetch recent appointments" });
    }
  });
  app2.get("/api/staff/next-appointment", async (req, res) => {
    try {
      const { establishmentId, userId, userRole } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      if (userRole !== "staff") {
        return res.status(403).json({ message: "Staff access required" });
      }
      const staffRecord = await storage.getStaffByUserId(userId, establishmentId);
      if (!staffRecord) {
        return res.status(400).json({ message: "Registro de colaborador n\xE3o encontrado" });
      }
      const nextAppointment = await storage.getNextAppointmentForStaff(establishmentId, staffRecord.id);
      res.json(nextAppointment || null);
    } catch (error) {
      console.error("Get next appointment error:", error);
      res.status(500).json({ message: "Failed to fetch next appointment" });
    }
  });
  app2.get("/api/notifications", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const notifications2 = await storage.getNotifications(establishmentId);
      res.json(notifications2);
    } catch (error) {
      console.error("Fetch notifications error:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app2.get("/api/notifications/unread", async (req, res) => {
    try {
      const { establishmentId, userId, userRole } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      let notifications2;
      if (userRole === "staff") {
        const staffMember = await storage.getStaffByUserId(userId, establishmentId);
        if (staffMember) {
          notifications2 = await storage.getUnreadNotificationsForStaff(establishmentId, staffMember.id);
        } else {
          notifications2 = [];
        }
      } else {
        notifications2 = await storage.getUnreadNotifications(establishmentId);
      }
      res.json(notifications2);
    } catch (error) {
      console.error("Fetch unread notifications error:", error);
      res.status(500).json({ message: "Failed to fetch unread notifications" });
    }
  });
  app2.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const id = parseInt(req.params.id);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      await storage.markNotificationAsRead(id, establishmentId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Mark notification as read error:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  app2.patch("/api/notifications/read-all", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      await storage.markAllNotificationsAsRead(establishmentId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Mark all notifications as read error:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });
  app2.get("/api/appointments/monthly-limit", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const limitInfo = await storage.checkMonthlyAppointmentLimit(establishmentId);
      res.json(limitInfo);
    } catch (error) {
      console.error("Get monthly limit error:", error);
      res.status(500).json({ message: "Failed to get monthly limit information" });
    }
  });
  app2.get("/api/appointments/available-times", async (req, res) => {
    try {
      const { staffId, date, serviceId } = req.query;
      if (!staffId || !date || !serviceId) {
        return res.status(400).json({ message: "StaffId, date, and serviceId are required" });
      }
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const service = await storage.getService(parseInt(serviceId), establishmentId);
      if (!service) {
        return res.status(400).json({ message: "Service not found" });
      }
      const businessHours2 = await storage.getBusinessHours(establishmentId);
      const queryDate = new Date(date);
      const dayOfWeek = queryDate.getDay();
      const dayHours = businessHours2.find((h) => h.dayOfWeek === dayOfWeek);
      if (!dayHours || !dayHours.isOpen) {
        return res.json({
          closed: true,
          message: "Estabelecimento fechado neste dia"
        });
      }
      const staffWorkingHours3 = await storage.getStaffWorkingHours(parseInt(staffId), establishmentId);
      const staffDayHours = staffWorkingHours3.find((h) => h.dayOfWeek === dayOfWeek);
      if (!staffDayHours || !staffDayHours.isAvailable) {
        return res.json({
          closed: true,
          message: "Profissional n\xE3o dispon\xEDvel neste dia"
        });
      }
      const dateStr = date;
      const staffVacationsData = await db.select().from(staffVacations).where(and2(
        eq2(staffVacations.staffId, parseInt(staffId)),
        eq2(staffVacations.establishmentId, establishmentId),
        eq2(staffVacations.isActive, true)
      ));
      const isOnVacation = staffVacationsData.some((vacation) => {
        const vacationStart = new Date(vacation.startDate);
        const vacationEnd = new Date(vacation.endDate);
        const checkDate = new Date(dateStr);
        vacationStart.setHours(0, 0, 0, 0);
        vacationEnd.setHours(23, 59, 59, 999);
        checkDate.setHours(12, 0, 0, 0);
        return checkDate >= vacationStart && checkDate <= vacationEnd;
      });
      if (isOnVacation) {
        const vacationInfo = staffVacationsData.find((vacation) => {
          const vacationStart = new Date(vacation.startDate);
          const vacationEnd = new Date(vacation.endDate);
          const checkDate = new Date(dateStr);
          vacationStart.setHours(0, 0, 0, 0);
          vacationEnd.setHours(23, 59, 59, 999);
          checkDate.setHours(12, 0, 0, 0);
          return checkDate >= vacationStart && checkDate <= vacationEnd;
        });
        const typeLabels = {
          vacation: "f\xE9rias",
          sick_leave: "atestado m\xE9dico",
          time_off: "folga"
        };
        const typeLabel = typeLabels[vacationInfo?.type] || "aus\xEAncia";
        return res.json({
          closed: true,
          message: `Profissional est\xE1 de ${typeLabel} neste per\xEDodo`,
          timeSlots: []
        });
      }
      const existingAppointments = await storage.getAppointments(establishmentId);
      const staffAppointments = existingAppointments.filter((apt) => {
        if (apt.staffId !== parseInt(staffId)) return false;
        const aptDate = new Date(apt.appointmentDate);
        return aptDate.getFullYear() === queryDate.getFullYear() && aptDate.getMonth() === queryDate.getMonth() && aptDate.getDate() === queryDate.getDate();
      });
      const openTime = staffDayHours.openTime || dayHours.openTime || "09:00";
      const closeTime = staffDayHours.closeTime || dayHours.closeTime || "18:00";
      const [openHour, openMinute] = openTime.split(":").map(Number);
      const [closeHour, closeMinute] = closeTime.split(":").map(Number);
      const serviceDurationMinutes = service.duration;
      const availableTimes = [];
      const currentTime = /* @__PURE__ */ new Date();
      const currentBrazilTime = new Date(currentTime.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
      let currentSlotHour = openHour;
      let currentSlotMinute = openMinute;
      while (currentSlotHour < closeHour || currentSlotHour === closeHour && currentSlotMinute < closeMinute) {
        const timeString = `${currentSlotHour.toString().padStart(2, "0")}:${currentSlotMinute.toString().padStart(2, "0")}`;
        const slotStart = /* @__PURE__ */ new Date(`${date}T${timeString}:00`);
        const slotEnd = new Date(slotStart.getTime() + serviceDurationMinutes * 6e4);
        const slotEndHour = slotEnd.getHours();
        const slotEndMinute = slotEnd.getMinutes();
        if (slotEndHour < closeHour || slotEndHour === closeHour && slotEndMinute <= closeMinute) {
          const isPastTime = slotStart <= currentBrazilTime;
          const hasConflict = staffAppointments.some((apt) => {
            const aptStart = new Date(apt.appointmentDate);
            const aptDuration = apt.duration || 30;
            const aptEnd = new Date(aptStart.getTime() + aptDuration * 6e4);
            return slotStart < aptEnd && slotEnd > aptStart;
          });
          availableTimes.push({
            time: timeString,
            available: !isPastTime && !hasConflict,
            isPast: isPastTime,
            isBooked: !isPastTime && hasConflict
          });
        }
        currentSlotMinute += 10;
        if (currentSlotMinute >= 60) {
          currentSlotMinute = 0;
          currentSlotHour++;
        }
      }
      res.json({
        closed: false,
        timeSlots: availableTimes,
        businessHours: {
          open: openTime,
          close: closeTime
        },
        staffWorkingHours: {
          open: staffDayHours.openTime,
          close: staffDayHours.closeTime,
          isAvailable: staffDayHours.isAvailable
        }
      });
    } catch (error) {
      console.error("Get available times error:", error);
      const { establishmentId } = getUserContext(req);
      res.status(500).json({
        message: "Failed to get available times",
        error: error instanceof Error ? error.message : String(error),
        details: {
          staffId: req.query.staffId,
          date: req.query.date,
          serviceId: req.query.serviceId,
          establishmentId
        }
      });
    }
  });
  app2.get("/api/products", requireAdmin, async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const hasInventoryAccess = await storage.hasInventoryAccess(establishmentId);
      if (!hasInventoryAccess) {
        return res.status(403).json({
          message: "Este recurso faz parte do plano Avan\xE7ado. Atualize seu plano para desbloquear.",
          requiredPlan: "Expert"
        });
      }
      const products2 = await storage.getProducts(establishmentId);
      const mappedProducts = products2.map((product) => ({
        ...product,
        currentStock: product.stock,
        stock: void 0
      }));
      res.json(mappedProducts);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  app2.post("/api/products", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const hasInventoryAccess = await storage.hasInventoryAccess(establishmentId);
      if (!hasInventoryAccess) {
        return res.status(403).json({
          message: "Este recurso faz parte do plano Avan\xE7ado. Atualize seu plano para desbloquear.",
          requiredPlan: "Expert"
        });
      }
      const body = { ...req.body, establishmentId };
      if (body.price && typeof body.price === "number") {
        body.price = body.price.toString();
      }
      if (body.cost && typeof body.cost === "number") {
        body.cost = body.cost.toString();
      }
      if (body.currentStock !== void 0) {
        body.stock = body.currentStock;
        delete body.currentStock;
      }
      const productData = insertProductSchema.parse(body);
      const product = await storage.createProduct(productData);
      try {
        const { wsManager: wsManager2 } = await Promise.resolve().then(() => (init_websocket(), websocket_exports));
        if (wsManager2) {
          wsManager2.notifyInventoryChange(establishmentId, {
            type: "product_created",
            productId: product.id,
            productName: product.name,
            currentStock: product.stock
          });
        }
      } catch (wsError) {
      }
      const mappedProduct = {
        ...product,
        currentStock: product.stock,
        stock: void 0
      };
      res.json(mappedProduct);
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });
  app2.put("/api/products/:id", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const hasInventoryAccess = await storage.hasInventoryAccess(establishmentId);
      if (!hasInventoryAccess) {
        return res.status(403).json({
          message: "Este recurso faz parte do plano Avan\xE7ado. Atualize seu plano para desbloquear.",
          requiredPlan: "Expert"
        });
      }
      const id = parseInt(req.params.id);
      const body = { ...req.body };
      if (body.price && typeof body.price === "number") {
        body.price = body.price.toString();
      }
      if (body.cost && typeof body.cost === "number") {
        body.cost = body.cost.toString();
      }
      if (body.currentStock !== void 0) {
        body.stock = body.currentStock;
        delete body.currentStock;
      }
      const productData = insertProductSchema.partial().parse(body);
      const product = await storage.updateProduct(id, productData, establishmentId);
      try {
        const { wsManager: wsManager2 } = await Promise.resolve().then(() => (init_websocket(), websocket_exports));
        if (wsManager2) {
          wsManager2.notifyInventoryChange(establishmentId, {
            type: "product_updated",
            productId: product.id,
            productName: product.name,
            currentStock: product.stock
          });
        }
      } catch (wsError) {
      }
      const mappedProduct = {
        ...product,
        currentStock: product.stock,
        stock: void 0
      };
      res.json(mappedProduct);
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });
  app2.delete("/api/products/:id", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const hasInventoryAccess = await storage.hasInventoryAccess(establishmentId);
      if (!hasInventoryAccess) {
        return res.status(403).json({
          message: "Este recurso faz parte do plano Avan\xE7ado. Atualize seu plano para desbloquear.",
          requiredPlan: "Expert"
        });
      }
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id, establishmentId);
      await storage.deleteProduct(id, establishmentId);
      try {
        const { wsManager: wsManager2 } = await Promise.resolve().then(() => (init_websocket(), websocket_exports));
        if (wsManager2) {
          wsManager2.notifyInventoryChange(establishmentId, {
            type: "product_deleted",
            productId: id,
            productName: product?.name || "Produto removido"
          });
        }
      } catch (wsError) {
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
  app2.post("/api/products/sell", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const hasInventoryAccess = await storage.hasInventoryAccess(establishmentId);
      if (!hasInventoryAccess) {
        return res.status(403).json({
          message: "Este recurso faz parte do plano Avan\xE7ado. Atualize seu plano para desbloquear.",
          requiredPlan: "Expert"
        });
      }
      const { productId, quantity, unitPrice, productName } = req.body;
      if (!productId || !quantity || !unitPrice || !productName) {
        return res.status(400).json({ message: "Dados de venda incompletos" });
      }
      const product = await storage.getProduct(productId, establishmentId);
      if (!product) {
        return res.status(404).json({ message: "Produto n\xE3o encontrado" });
      }
      const currentStock = product.stock || 0;
      if (currentStock < quantity) {
        return res.status(400).json({
          message: `Estoque insuficiente. Dispon\xEDvel: ${currentStock}, Solicitado: ${quantity}`
        });
      }
      const totalAmount = quantity * unitPrice;
      const newStock = currentStock - quantity;
      await storage.updateProduct(productId, { stock: newStock }, establishmentId);
      const now = /* @__PURE__ */ new Date();
      const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
      await storage.createTransaction({
        establishmentId,
        amount: totalAmount.toString(),
        type: "income",
        category: "Produto Vendido",
        paymentMethod: "Venda Direta",
        description: `Venda: ${productName} (${quantity}x)`,
        transactionDate: brazilTime
      });
      try {
        const { wsManager: wsManager2 } = await Promise.resolve().then(() => (init_websocket(), websocket_exports));
        if (wsManager2) {
          wsManager2.notifyInventoryChange(establishmentId, {
            type: "product_sold",
            productId,
            productName,
            quantity,
            newStock
          });
          wsManager2.notifyFinancialChange(establishmentId, {
            type: "product_sale",
            productId,
            productName,
            quantity,
            amount: totalAmount
          });
          wsManager2.notifyDashboardStatsChange(establishmentId, {
            type: "product_sale_update",
            reason: "product_sold"
          });
        }
      } catch (wsError) {
      }
      res.json({
        success: true,
        message: "Venda realizada com sucesso!",
        productId,
        quantity,
        totalAmount,
        newStock
      });
    } catch (error) {
      console.error("Sell product error:", error);
      res.status(500).json({ message: "Erro ao processar venda" });
    }
  });
  app2.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 25, 50);
      const offset = (page - 1) * limit;
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const hasFinancialAccess = await storage.hasFinancialAccess(establishmentId);
      if (!hasFinancialAccess) {
        return res.status(403).json({
          message: "Este recurso faz parte do plano Core ou superior. Atualize seu plano para desbloquear.",
          requiredPlan: "Intermedi\xE1rio"
        });
      }
      let result;
      const { role, userId } = getUserContext(req);
      if (role === "staff") {
        const establishmentPlan = await storage.getEstablishmentPlan(establishmentId);
        if (establishmentPlan?.name !== "Core" && establishmentPlan?.name !== "Expert") {
          return res.status(403).json({
            message: "Staff s\xF3 tem acesso ao financeiro em planos Core ou Expert.",
            requiredPlan: "Core"
          });
        }
        const staffMember = await storage.getStaffByUserId(userId, establishmentId);
        if (staffMember) {
          result = await storage.getPaginatedTransactionsForStaff(establishmentId, staffMember.id, offset, limit);
        } else {
          result = { transactions: [], total: 0 };
        }
      } else {
        result = await storage.getPaginatedTransactions(establishmentId, offset, limit);
      }
      const transactions2 = result.transactions;
      const total = result.total;
      res.json({
        transactions: transactions2,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });
  app2.post("/api/transactions", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const hasFinancialAccess = await storage.hasFinancialAccess(establishmentId);
      if (!hasFinancialAccess) {
        return res.status(403).json({
          message: "Este recurso faz parte do plano Core ou superior. Atualize seu plano para desbloquear.",
          requiredPlan: "Intermedi\xE1rio"
        });
      }
      let transactionDate;
      if (req.body.transactionDate) {
        const inputDate = new Date(req.body.transactionDate);
        const today = /* @__PURE__ */ new Date();
        if (inputDate.toISOString().split("T")[0] === today.toISOString().split("T")[0]) {
          transactionDate = new Date(today.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
        } else {
          transactionDate = inputDate;
        }
      } else {
        const now = /* @__PURE__ */ new Date();
        transactionDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
      }
      const transformedData = {
        ...req.body,
        establishmentId,
        amount: req.body.amount.toString(),
        // Convert number to string for decimal field
        transactionDate
      };
      const transactionData = insertTransactionSchema.parse(transformedData);
      const transaction = await storage.createTransaction(transactionData);
      try {
        const { wsManager: wsManager2 } = await Promise.resolve().then(() => (init_websocket(), websocket_exports));
        if (wsManager2) {
          wsManager2.notifyFinancialChange(establishmentId, {
            type: "transaction_created",
            transactionId: transaction.id,
            amount: transaction.amount,
            transactionType: transaction.type,
            category: transaction.category
          });
          wsManager2.notifyDashboardStatsChange(establishmentId, {
            type: "financial_stats_update",
            reason: "new_transaction"
          });
        }
      } catch (wsError) {
      }
      res.json(transaction);
    } catch (error) {
      console.error("Create transaction error:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });
  app2.delete("/api/transactions/:id", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const id = parseInt(req.params.id);
      await storage.deleteTransaction(id);
      try {
        const { wsManager: wsManager2 } = await Promise.resolve().then(() => (init_websocket(), websocket_exports));
        if (wsManager2) {
          wsManager2.notifyFinancialChange(establishmentId, {
            type: "transaction_deleted",
            transactionId: id
          });
          wsManager2.notifyDashboardStatsChange(establishmentId, {
            type: "financial_stats_update",
            reason: "transaction_deleted"
          });
        }
      } catch (wsError) {
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete transaction error:", error);
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });
  app2.get("/api/transactions/date/:date", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const hasFinancialAccess = await storage.hasFinancialAccess(establishmentId);
      if (!hasFinancialAccess) {
        return res.status(403).json({
          message: "Este recurso faz parte do plano Core ou superior. Atualize seu plano para desbloquear.",
          requiredPlan: "Intermedi\xE1rio"
        });
      }
      const dateParam = req.params.date;
      const transactions2 = await storage.getTransactionsByDate(establishmentId, dateParam);
      res.json(transactions2);
    } catch (error) {
      console.error("Get transactions by date error:", error);
      res.status(500).json({ message: "Failed to fetch transactions for date" });
    }
  });
  app2.get("/api/finances/stats", async (req, res) => {
    try {
      const { establishmentId, userId, role } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const hasFinancialAccess = await storage.hasFinancialAccess(establishmentId);
      if (!hasFinancialAccess) {
        return res.status(403).json({
          message: "Este recurso faz parte do plano Core ou superior. Atualize seu plano para desbloquear.",
          requiredPlan: "Intermedi\xE1rio"
        });
      }
      let stats;
      if (role === "staff") {
        const establishmentPlan = await storage.getEstablishmentPlan(establishmentId);
        if (establishmentPlan?.name !== "Core" && establishmentPlan?.name !== "Expert") {
          return res.status(403).json({
            message: "Staff s\xF3 tem acesso ao financeiro em planos Core ou Expert.",
            requiredPlan: "Core"
          });
        }
        const staffMember = await storage.getStaffByUserId(userId, establishmentId);
        if (staffMember) {
          stats = await storage.getFinancialStatsForStaff(establishmentId, staffMember.id);
        } else {
          stats = {
            todayIncome: 0,
            todayExpenses: 0,
            monthIncome: 0,
            monthExpenses: 0
          };
        }
      } else {
        stats = await storage.getFinancialStats(establishmentId);
      }
      res.json(stats);
    } catch (error) {
      console.error("Get financial stats error:", error);
      if (error?.message === "Authentication required") {
        return res.status(401).json({ message: "Authentication required" });
      }
      res.status(500).json({ message: "Failed to fetch financial stats" });
    }
  });
  app2.get("/api/settings", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (isNaN(establishmentId)) {
        console.error("Invalid establishmentId:", establishmentId);
        return res.status(400).json({ message: "Invalid establishment ID" });
      }
      const settings = await storage.getBusinessSettings(establishmentId);
      res.json(settings || {});
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });
  app2.put("/api/settings", async (req, res) => {
    try {
      const { establishmentId, role } = getUserContext(req);
      const settingsData = req.body;
      const restrictedFields = ["twoFactorAuth", "sessionTimeout", "businessName", "businessAddress", "businessSegment", "businessPhone", "businessEmail", "businessLogo", "workingHours", "whatsappApiUrl", "whatsappPhoneNumber", "whatsappWelcomeMessage", "whatsappAutoReply"];
      if (role === "staff") {
        const hasRestrictedFields = restrictedFields.some((field) => settingsData.hasOwnProperty(field));
        if (hasRestrictedFields) {
          return res.status(403).json({ message: "Acesso negado. Colaboradores n\xE3o podem alterar configura\xE7\xF5es administrativas." });
        }
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem alterar configura\xE7\xF5es do neg\xF3cio." });
      }
      if (isNaN(establishmentId)) {
        return res.status(400).json({ message: "Invalid establishment ID" });
      }
      const updatedSettings = await storage.updateBusinessSettings(settingsData, establishmentId);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });
  app2.get("/api/business-hours", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (isNaN(establishmentId)) {
        return res.status(400).json({ message: "Invalid establishment ID" });
      }
      const hours = await storage.getBusinessHours(establishmentId);
      res.json(hours);
    } catch (error) {
      console.error("Error fetching business hours:", error);
      res.status(500).json({ message: "Failed to fetch business hours" });
    }
  });
  app2.put("/api/business-hours", async (req, res) => {
    try {
      const { establishmentId, role } = getUserContext(req);
      if (role === "staff") {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem alterar hor\xE1rios de funcionamento." });
      }
      if (isNaN(establishmentId)) {
        return res.status(400).json({ message: "Invalid establishment ID" });
      }
      const hours = await storage.updateBusinessHours(req.body.hours, establishmentId);
      res.json(hours);
    } catch (error) {
      console.error("Error updating business hours:", error);
      res.status(500).json({ message: "Failed to update business hours" });
    }
  });
  app2.get("/api/establishment", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (isNaN(establishmentId)) {
        return res.status(400).json({ message: "Invalid establishment ID" });
      }
      const establishment = await storage.getEstablishment(establishmentId);
      res.json(establishment);
    } catch (error) {
      console.error("Error fetching establishment:", error);
      res.status(500).json({ message: "Failed to fetch establishment" });
    }
  });
  app2.put("/api/establishment", async (req, res) => {
    try {
      const { establishmentId, role } = getUserContext(req);
      if (role === "staff") {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem alterar informa\xE7\xF5es do estabelecimento." });
      }
      if (isNaN(establishmentId)) {
        return res.status(400).json({ message: "Invalid establishment ID" });
      }
      const establishment = await storage.updateEstablishment(establishmentId, req.body);
      res.json(establishment);
    } catch (error) {
      console.error("Error updating establishment:", error);
      res.status(500).json({ message: "Failed to update establishment" });
    }
  });
  app2.patch("/api/establishment/timezone", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const { timezone } = req.body;
      const validTimezones = [
        "America/Sao_Paulo",
        "America/Manaus",
        "America/Campo_Grande",
        "America/Cuiaba",
        "America/Porto_Velho",
        "America/Boa_Vista",
        "America/Rio_Branco",
        "America/Eirunepe",
        "America/Fortaleza",
        "America/Recife",
        "America/Salvador",
        "America/Maceio",
        "America/Belem",
        "America/Santarem",
        "America/Araguaina",
        "America/Noronha"
      ];
      if (!validTimezones.includes(timezone)) {
        return res.status(400).json({ message: "Fuso hor\xE1rio inv\xE1lido" });
      }
      await storage.updateEstablishmentTimezone(establishmentId, timezone);
      res.json({ message: "Fuso hor\xE1rio atualizado com sucesso" });
    } catch (error) {
      console.error("Update establishment timezone error:", error);
      res.status(500).json({ message: "Falha ao atualizar fuso hor\xE1rio" });
    }
  });
  app2.put("/api/user/email", async (req, res) => {
    try {
      const { userId } = getUserContext(req);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const user = await storage.updateUserEmail(userId, email);
      res.json(user);
    } catch (error) {
      console.error("Error updating user email:", error);
      res.status(500).json({ message: "Failed to update email" });
    }
  });
  app2.put("/api/user/password", async (req, res) => {
    try {
      const { userId } = getUserContext(req);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }
      const hashedPassword = await bcrypt2.hash(password, 10);
      const user = await storage.updateUserPassword(userId, hashedPassword);
      res.json(user);
    } catch (error) {
      console.error("Error updating user password:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });
  app2.post("/api/staff/salary-commission", async (req, res) => {
    try {
      const { staffId, startDate, endDate } = req.body;
      const { userId, establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate e endDate s\xE3o obrigat\xF3rios" });
      }
      const allStaff = await storage.getStaff(establishmentId);
      if (allStaff.length === 0) {
        return res.status(400).json({ message: "Nenhum colaborador encontrado" });
      }
      let targetStaffId;
      const { role } = getUserContext(req);
      if (role === "staff") {
        const staffRecord = await storage.getStaffByUserId(userId, establishmentId);
        if (staffRecord) {
          targetStaffId = staffRecord.id;
        } else {
          return res.status(400).json({ message: "Registro de colaborador n\xE3o encontrado para este usu\xE1rio" });
        }
      } else {
        targetStaffId = staffId && staffId !== null ? parseInt(staffId) : allStaff[0].id;
      }
      const commission = await storage.calculateStaffCommission(targetStaffId, startDate, endDate, establishmentId);
      res.json({
        ...commission,
        isStaffUser: role === "staff",
        selectedStaffId: targetStaffId
      });
    } catch (error) {
      console.error("Calculate salary/commission error:", error);
      res.status(500).json({ message: error.message || "Falha ao calcular sal\xE1rio/comiss\xE3o" });
    }
  });
  app2.get("/api/plans", async (req, res) => {
    try {
      const plans2 = await storage.getPlans();
      res.json(plans2);
    } catch (error) {
      console.error("Error fetching plans:", error);
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });
  app2.get("/api/establishment/plan", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const plan = await storage.getEstablishmentPlan(establishmentId);
      res.json(plan);
    } catch (error) {
      console.error("Error fetching establishment plan:", error);
      res.status(500).json({ message: "Failed to fetch establishment plan" });
    }
  });
  app2.put("/api/establishment/plan", async (req, res) => {
    try {
      const { establishmentId, role } = getUserContext(req);
      if (role === "staff") {
        return res.status(403).json({ message: "Apenas administradores podem alterar planos." });
      }
      const { planId } = req.body;
      const establishment = await storage.updateEstablishmentPlan(establishmentId, planId);
      res.json(establishment);
    } catch (error) {
      console.error("Error updating establishment plan:", error);
      res.status(500).json({ message: "Failed to update establishment plan" });
    }
  });
  app2.get("/api/establishment/permissions", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const establishment = await storage.getEstablishment(establishmentId);
      if (!establishment) {
        return res.status(404).json({ message: "Establishment not found" });
      }
      const plan = await storage.getPlan(establishment.planId || 1);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      const staffCount = await storage.getStaff(establishmentId);
      const staffLimit = {
        isWithinLimit: staffCount.length <= (plan.maxStaffMembers || 99),
        currentCount: staffCount.length,
        maxAllowed: plan.maxStaffMembers || 99
      };
      const hasLoyaltyAccess = plan.id >= 2;
      res.json({
        plan,
        staffLimit,
        hasFinancialAccess: plan?.hasFinancialModule || false,
        hasInventoryAccess: plan?.hasInventoryModule || false,
        hasWhatsappAccess: plan?.hasWhatsappIntegration || true,
        hasLoyaltyAccess,
        canViewLoyalty: hasLoyaltyAccess
      });
    } catch (error) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({ message: "Failed to fetch permissions" });
    }
  });
  app2.get("/api/n8n-integrations", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const integrations = await storage.getN8nIntegrations(establishmentId);
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching N8N integrations:", error);
      res.status(500).json({ message: "Failed to fetch integrations" });
    }
  });
  app2.post("/api/n8n-integrations/setup-whatsapp", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const integrationData = {
        name: "WhatsApp Session Creator",
        webhookUrl: "https://n8n-n8n-start.ayp7v6.easypanel.host/webhook-test/gerar_qrcode",
        triggerEvents: [
          "appointment_created",
          "client_created",
          "staff_created"
        ],
        isActive: true,
        establishmentId
      };
      const integration = await storage.createN8nIntegration(integrationData);
      const testData = {
        establishments_id: establishmentId,
        event: "setup_test",
        data: {
          message: "WhatsApp integration configurada com sucesso!",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }
      };
      try {
        const response = await fetch(integrationData.webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(testData)
        });
        const responseText = await response.text();
      } catch (testError) {
        console.error("Error testing N8N webhook:", testError);
      }
      res.status(201).json({
        integration,
        message: "Integra\xE7\xE3o WhatsApp N8N configurada com sucesso!",
        webhookUrl: integrationData.webhookUrl
      });
    } catch (error) {
      console.error("Error setting up N8N WhatsApp integration:", error);
      res.status(500).json({ message: "Failed to setup WhatsApp integration" });
    }
  });
  app2.post("/api/n8n-integrations", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const integrationData = { ...req.body, establishmentId };
      const integration = await storage.createN8nIntegration(integrationData);
      res.status(201).json(integration);
    } catch (error) {
      console.error("Error creating N8N integration:", error);
      res.status(500).json({ message: "Failed to create integration" });
    }
  });
  app2.put("/api/n8n-integrations/:id", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const integrationId = parseInt(req.params.id);
      const integration = await storage.updateN8nIntegration(integrationId, req.body, establishmentId);
      res.json(integration);
    } catch (error) {
      console.error("Error updating N8N integration:", error);
      res.status(500).json({ message: "Failed to update integration" });
    }
  });
  app2.delete("/api/n8n-integrations/:id", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const integrationId = parseInt(req.params.id);
      await storage.deleteN8nIntegration(integrationId, establishmentId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting N8N integration:", error);
      res.status(500).json({ message: "Failed to delete integration" });
    }
  });
  app2.get("/api/n8n-integrations/:id/logs", async (req, res) => {
    try {
      const integrationId = parseInt(req.params.id);
      const logs = await storage.getWebhookLogs(integrationId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching webhook logs:", error);
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });
  app2.post("/api/n8n-integrations/test", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const { webhookUrl, apiKey, event = "test" } = req.body;
      const testData = {
        message: "Test webhook from Sal\xE3o Online",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      const headers = {
        "Content-Type": "application/json"
      };
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          establishments_id: establishmentId,
          event,
          data: testData
        })
      });
      const responseText = await response.text();
      res.json({
        success: response.ok,
        status: response.status,
        response: responseText
      });
    } catch (error) {
      console.error("Error testing webhook:", error);
      res.status(500).json({ message: "Failed to test webhook" });
    }
  });
  app2.post("/api/evolution/client-appointment", async (req, res) => {
    try {
      const {
        establishmentId,
        clientData,
        appointmentData,
        apiKey
        // Para autenticação
      } = req.body;
      if (!establishmentId || !clientData || !appointmentData) {
        return res.status(400).json({
          message: "Dados obrigat\xF3rios: establishmentId, clientData, appointmentData"
        });
      }
      const establishment = await storage.getEstablishment(parseInt(establishmentId));
      if (!establishment) {
        return res.status(404).json({ message: "Estabelecimento n\xE3o encontrado" });
      }
      let client;
      let clientId;
      if (clientData.phone) {
        const existingClients = await storage.searchClients(clientData.phone, parseInt(establishmentId));
        client = existingClients.find((c) => c.phone === clientData.phone);
      }
      if (!client && clientData.email) {
        const existingClients = await storage.searchClients(clientData.email, parseInt(establishmentId));
        client = existingClients.find((c) => c.email === clientData.email);
      }
      if (!client) {
        const newClientData = {
          establishmentId: parseInt(establishmentId),
          name: clientData.name || "Cliente WhatsApp",
          phone: clientData.phone || null,
          email: clientData.email || null,
          notes: clientData.notes || "Cliente cadastrado via WhatsApp/Evolution API"
        };
        client = await storage.createClient(newClientData);
        clientId = client.id;
      } else {
        clientId = client.id;
      }
      const appointmentDateTime = new Date(appointmentData.appointmentDate);
      const serviceId = parseInt(appointmentData.serviceId);
      const staffId = parseInt(appointmentData.staffId);
      const service = await storage.getService(serviceId, parseInt(establishmentId));
      if (!service) {
        return res.status(404).json({ message: "Servi\xE7o n\xE3o encontrado" });
      }
      const appointmentEndTime = new Date(appointmentDateTime.getTime() + service.duration * 6e4);
      const hasConflict = await storage.checkAppointmentConflict(staffId, appointmentDateTime, appointmentEndTime);
      if (hasConflict) {
        return res.status(409).json({
          message: "Conflito de hor\xE1rio detectado",
          conflict: true
        });
      }
      const newAppointmentData = {
        establishmentId: parseInt(establishmentId),
        clientId,
        serviceId,
        staffId,
        appointmentDate: appointmentDateTime,
        dataFim: appointmentEndTime,
        duration: service.duration,
        status: appointmentData.status || "agendado",
        notes: appointmentData.notes || "Agendamento criado via WhatsApp/Evolution API"
      };
      const appointment = await storage.createAppointment(newAppointmentData);
      try {
        const { wsManager: wsManager2 } = await Promise.resolve().then(() => (init_websocket(), websocket_exports));
        if (wsManager2) {
          wsManager2.notifyAppointmentChange(parseInt(establishmentId), {
            type: "created_evolution",
            appointmentId: appointment.id,
            clientId,
            staffId,
            serviceId,
            date: appointment.appointmentDate
          });
          wsManager2.notifyNewNotification(parseInt(establishmentId), {
            type: "appointment",
            appointmentId: appointment.id
          });
        }
      } catch (wsError) {
      }
      try {
        await storage.triggerN8nWebhook("appointment_created", {
          appointment,
          client,
          service,
          source: "evolution_api"
        }, parseInt(establishmentId));
      } catch (webhookError) {
        console.error("Erro ao disparar webhook N8N:", webhookError);
      }
      res.json({
        success: true,
        client,
        appointment,
        message: client.id === clientId ? "Cliente e agendamento criados com sucesso" : "Agendamento criado para cliente existente"
      });
    } catch (error) {
      console.error("Evolution API integration error:", error);
      res.status(500).json({
        message: "Erro ao processar dados do Evolution API",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });
  app2.post("/api/evolution/client", async (req, res) => {
    try {
      const { establishmentId, clientData, apiKey } = req.body;
      if (!establishmentId || !clientData) {
        return res.status(400).json({
          message: "Dados obrigat\xF3rios: establishmentId, clientData"
        });
      }
      const establishment = await storage.getEstablishment(parseInt(establishmentId));
      if (!establishment) {
        return res.status(404).json({ message: "Estabelecimento n\xE3o encontrado" });
      }
      let client;
      if (clientData.phone) {
        const existingClients = await storage.searchClients(clientData.phone, parseInt(establishmentId));
        client = existingClients.find((c) => c.phone === clientData.phone);
      }
      if (!client && clientData.email) {
        const existingClients = await storage.searchClients(clientData.email, parseInt(establishmentId));
        client = existingClients.find((c) => c.email === clientData.email);
      }
      if (client) {
        const updateData = {};
        if (clientData.name && clientData.name !== client.name) updateData.name = clientData.name;
        if (clientData.email && clientData.email !== client.email) updateData.email = clientData.email;
        if (clientData.notes) updateData.notes = clientData.notes;
        if (Object.keys(updateData).length > 0) {
          client = await storage.updateClient(client.id, updateData, parseInt(establishmentId));
        }
      } else {
        const newClientData = {
          establishmentId: parseInt(establishmentId),
          name: clientData.name || "Cliente WhatsApp",
          phone: clientData.phone || null,
          email: clientData.email || null,
          notes: clientData.notes || "Cliente cadastrado via WhatsApp/Evolution API"
        };
        client = await storage.createClient(newClientData);
        try {
          await storage.triggerN8nWebhook("client_created", {
            client,
            source: "evolution_api"
          }, parseInt(establishmentId));
        } catch (webhookError) {
          console.error("Erro ao disparar webhook N8N:", webhookError);
        }
      }
      res.json({
        success: true,
        client,
        message: client ? "Cliente processado com sucesso" : "Erro ao processar cliente"
      });
    } catch (error) {
      console.error("Evolution API client integration error:", error);
      res.status(500).json({
        message: "Erro ao processar cliente via Evolution API",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });
  app2.get("/api/evolution/establishment/:id/info", async (req, res) => {
    try {
      const establishmentId = parseInt(req.params.id);
      const establishment = await storage.getEstablishment(establishmentId);
      if (!establishment) {
        return res.status(404).json({ message: "Estabelecimento n\xE3o encontrado" });
      }
      const services2 = await storage.getServices(establishmentId);
      const activeServices = services2.filter((s) => s.isActive);
      const staff2 = await storage.getStaff(establishmentId);
      const activeStaff = staff2.filter((s) => s.isActive && s.isAvailable);
      const businessHours2 = await storage.getBusinessHours(establishmentId);
      res.json({
        establishment: {
          id: establishment.id,
          name: establishment.name,
          phone: establishment.phone,
          whatsappNumber: establishment.whatsappNumber
        },
        services: activeServices.map((s) => ({
          id: s.id,
          name: s.name,
          price: s.price,
          duration: s.duration,
          category: s.category
        })),
        staff: activeStaff.map((s) => ({
          id: s.id,
          name: s.name,
          specialties: s.specialties
        })),
        businessHours: businessHours2
      });
    } catch (error) {
      console.error("Error fetching establishment info:", error);
      res.status(500).json({
        message: "Erro ao buscar informa\xE7\xF5es do estabelecimento"
      });
    }
  });
  app2.get("/api/evolution-connections", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const connections = await storage.getEvolutionApiConnections(establishmentId);
      res.json(connections);
    } catch (error) {
      console.error("Error fetching Evolution API connections:", error);
      res.status(500).json({ message: "Failed to fetch connections" });
    }
  });
  app2.post("/api/evolution-connections", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const connectionData = {
        ...req.body,
        establishmentId,
        status: "disconnected"
      };
      const connection = await storage.createEvolutionApiConnection(connectionData);
      res.json(connection);
    } catch (error) {
      console.error("Error creating Evolution API connection:", error);
      res.status(500).json({ message: "Failed to create connection" });
    }
  });
  app2.put("/api/evolution-connections/:id", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const connectionId = parseInt(req.params.id);
      const connection = await storage.updateEvolutionApiConnection(connectionId, req.body, establishmentId);
      res.json(connection);
    } catch (error) {
      console.error("Error updating Evolution API connection:", error);
      res.status(500).json({ message: "Failed to update connection" });
    }
  });
  app2.delete("/api/evolution-connections/:id", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const connectionId = parseInt(req.params.id);
      await storage.deleteEvolutionApiConnection(connectionId, establishmentId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting Evolution API connection:", error);
      res.status(500).json({ message: "Failed to delete connection" });
    }
  });
  app2.post("/api/evolution-connections/:id/qr-code", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const connectionId = parseInt(req.params.id);
      const connection = await storage.getEvolutionApiConnection(connectionId, establishmentId);
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      await storage.updateConnectionStatus(connectionId, "connecting");
      await storage.triggerN8nWebhook("evolution_qr_request", {
        connectionId,
        instanceName: connection.instanceName,
        apiUrl: connection.apiUrl,
        apiKey: connection.apiKey
      }, establishmentId);
      res.json({ message: "QR Code request sent", status: "connecting" });
    } catch (error) {
      console.error("Error requesting QR Code:", error);
      res.status(500).json({ message: "Failed to request QR Code" });
    }
  });
  app2.get("/api/evolution-connections/:id/status", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const connectionId = parseInt(req.params.id);
      const connection = await storage.getEvolutionApiConnection(connectionId, establishmentId);
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      let status = connection.status;
      let qrCode = connection.qrCode;
      if (connection.qrCodeExpiration && /* @__PURE__ */ new Date() > connection.qrCodeExpiration) {
        qrCode = null;
        if (status === "connecting") {
          status = "disconnected";
          await storage.updateConnectionStatus(connectionId, "disconnected", void 0);
        }
      }
      res.json({
        id: connection.id,
        instanceName: connection.instanceName,
        status,
        qrCode,
        qrCodeExpiration: connection.qrCodeExpiration,
        lastStatusCheck: connection.lastStatusCheck,
        errorMessage: connection.errorMessage
      });
    } catch (error) {
      console.error("Error checking connection status:", error);
      res.status(500).json({ message: "Failed to check status" });
    }
  });
  app2.get("/api/evolution/connection-status", async (req, res) => {
    try {
      const userContext = getUserContext(req);
      if (!userContext?.establishmentId) {
        return res.json({
          status: "disconnected",
          message: "Contexto de usu\xE1rio n\xE3o encontrado",
          connected: false,
          lastCheck: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      const webhookData2 = await storage.getN8nWebhookData(userContext.establishmentId);
      if (!webhookData2 || !webhookData2.apiKey || !webhookData2.instanceId) {
        return res.json({
          status: "disconnected",
          message: "Nenhuma conex\xE3o configurada",
          connected: false,
          lastCheck: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      const evolutionApiUrl = "https://evolution-evolution-api.ayp7v6.easypanel.host";
      const instanceName = webhookData2.establishmentName || "default";
      const statusEndpoint = `${evolutionApiUrl}/instance/connectionState/${instanceName}`;
      try {
        const response = await fetch(statusEndpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "apikey": webhookData2.apiKey
          }
        });
        if (response.ok) {
          const statusData = await response.json();
          const connectionStatus = statusData.instance?.state === "open" ? "connected" : statusData.instance?.state === "connecting" ? "connecting" : statusData.instance?.state === "close" ? "disconnected" : "unknown";
          res.json({
            status: connectionStatus,
            message: `Status verificado via Evolution API: ${statusData.instance?.state || "unknown"}`,
            connected: connectionStatus === "connected",
            instanceData: statusData,
            localData: {
              apiKey: webhookData2.apiKey.substring(0, 8) + "...",
              instanceId: webhookData2.instanceId,
              instanceName,
              lastUpdated: webhookData2.updatedAt || webhookData2.createdAt
            },
            lastCheck: (/* @__PURE__ */ new Date()).toISOString()
          });
        } else {
          const errorText = await response.text();
          res.json({
            status: "unknown",
            message: `Erro ao verificar via Evolution API: ${response.status} - ${errorText}`,
            connected: false,
            localData: {
              apiKey: webhookData2.apiKey.substring(0, 8) + "...",
              instanceId: webhookData2.instanceId,
              instanceName,
              lastUpdated: webhookData2.updatedAt || webhookData2.createdAt
            },
            lastCheck: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
      } catch (fetchError) {
        console.error("\u274C Erro ao consultar Evolution API:", fetchError);
        res.json({
          status: "unknown",
          message: "N\xE3o foi poss\xEDvel verificar status via Evolution API - erro de conectividade",
          connected: false,
          localData: {
            apiKey: webhookData2.apiKey.substring(0, 8) + "...",
            instanceId: webhookData2.instanceId,
            instanceName,
            lastUpdated: webhookData2.updatedAt || webhookData2.createdAt
          },
          error: fetchError?.message || "Unknown error",
          lastCheck: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    } catch (error) {
      console.error("Error checking Evolution API connection status:", error);
      res.status(500).json({
        status: "error",
        message: "Erro interno ao verificar status",
        connected: false,
        error: error?.message || "Unknown error",
        lastCheck: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
  app2.post("/api/evolution/webhook/status", async (req, res) => {
    try {
      const { connectionId, status, qrCode, errorMessage } = req.body;
      if (!connectionId || !status) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const connection = await storage.updateConnectionStatus(
        parseInt(connectionId),
        status,
        qrCode || null,
        errorMessage || null
      );
      console.log(`Evolution API status updated: ${status} for connection ${connectionId}`);
      res.json({ success: true, connection });
    } catch (error) {
      console.error("Error updating Evolution API status:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });
  app2.post("/api/evolution/webhook/n8n-instance", async (req, res) => {
    try {
      console.log("Body:", JSON.stringify(req.body, null, 2));
      const body = req.body || {};
      const apiKey = body.apikey || body.apiKey || body.ChaveAPI;
      const instanceId = body.instanceID || body.instanceId;
      if (!apiKey || !instanceId) {
        return res.status(400).json({
          error: "Campos obrigat\xF3rios ausentes",
          required: ["apikey", "instanceID"],
          received: Object.keys(body)
        });
      }
      res.json({
        success: true,
        message: "Dados recebidos com sucesso via API Evolution",
        data: {
          apiKey: apiKey.substring(0, 8) + "...",
          instanceId,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
    } catch (error) {
      console.error("Error in N8N instance webhook:", error);
      res.status(500).json({ message: "Failed to process N8N webhook" });
    }
  });
  app2.get("/api/agenda-release/policy", async (req, res) => {
    try {
      const userContext = getUserContext(req);
      if (!userContext?.establishmentId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const policy = await storage.getAgendaReleasePolicy(userContext.establishmentId);
      const currentReleasedMonths = await storage.calculateReleasedMonths(userContext.establishmentId);
      res.json({
        ...policy,
        currentReleasedMonths
      });
    } catch (error) {
      console.error("Error fetching agenda release policy:", error);
      res.status(500).json({ error: "Failed to fetch agenda release policy" });
    }
  });
  app2.post("/api/agenda-release/policy", async (req, res) => {
    try {
      const userContext = getUserContext(req);
      if (!userContext?.establishmentId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const policyData = {
        ...req.body,
        establishmentId: userContext.establishmentId
      };
      const policy = await storage.createOrUpdateAgendaReleasePolicy(policyData);
      res.json(policy);
    } catch (error) {
      console.error("Error creating/updating agenda release policy:", error);
      res.status(500).json({ error: "Failed to save agenda release policy" });
    }
  });
  app2.post("/api/agenda-release/recalculate", async (req, res) => {
    try {
      const userContext = getUserContext(req);
      if (!userContext?.establishmentId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const policy = await storage.getAgendaReleasePolicy(userContext.establishmentId);
      if (!policy) {
        return res.status(404).json({ error: "No agenda release policy found" });
      }
      const autoReleasedMonths = await storage.calculateReleasedMonths(userContext.establishmentId);
      const updatedPolicy = await storage.createOrUpdateAgendaReleasePolicy({
        establishmentId: userContext.establishmentId,
        releaseInterval: policy.releaseInterval,
        releaseDay: policy.releaseDay,
        releasedMonths: [],
        // Limpar meses manuais
        isActive: policy.isActive
      });
      res.json({
        success: true,
        message: "Agenda release recalculated successfully",
        autoReleasedMonths,
        policy: updatedPolicy
      });
    } catch (error) {
      console.error("Error recalculating release:", error);
      res.status(500).json({ error: "Failed to recalculate release" });
    }
  });
  app2.get("/api/evolution/webhook-data", async (req, res) => {
    try {
      const userContext = getUserContext(req);
      if (!userContext?.establishmentId) {
        return res.json({
          apiKey: "",
          instanceId: "",
          qrCodeBase64: "",
          lastUpdated: null
        });
      }
      const webhookData2 = await storage.getN8nWebhookData(userContext.establishmentId);
      if (webhookData2) {
        res.json({
          apiKey: webhookData2.apiKey || "",
          instanceId: webhookData2.instanceId || "",
          qrCodeBase64: webhookData2.qrCodeBase64 || "",
          lastUpdated: webhookData2.updatedAt || webhookData2.createdAt
        });
      } else {
        res.json({
          apiKey: "",
          instanceId: "",
          qrCodeBase64: "",
          lastUpdated: null
        });
      }
    } catch (error) {
      console.error("Error getting webhook data:", error);
      res.json({
        apiKey: "",
        instanceId: "",
        qrCodeBase64: "",
        lastUpdated: null
      });
    }
  });
  app2.get("/api/n8n/establishment/:id/info", async (req, res) => {
    res.header("Content-Type", "application/json");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    try {
      const establishmentId = parseInt(req.params.id);
      if (!establishmentId) {
        return res.status(400).json({
          error: "ID do estabelecimento \xE9 obrigat\xF3rio"
        });
      }
      const establishment = await storage.getEstablishment(establishmentId);
      if (!establishment) {
        return res.status(404).json({
          error: "Estabelecimento n\xE3o encontrado"
        });
      }
      const services2 = await storage.getServices(establishmentId);
      const staff2 = await storage.getStaff(establishmentId);
      const businessHours2 = await storage.getBusinessHours(establishmentId);
      res.json({
        establishment: {
          id: establishment.id,
          name: establishment.name,
          email: establishment.email,
          phone: establishment.phone,
          address: establishment.address
        },
        services: services2.map((service) => ({
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration,
          category: service.category
        })),
        staff: staff2.map((member) => ({
          id: member.id,
          name: member.name,
          email: member.email,
          phone: member.phone,
          specialties: member.specialties
        })),
        businessHours: businessHours2.map((hour) => ({
          dayOfWeek: hour.dayOfWeek,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          isOpen: hour.isOpen
        }))
      });
    } catch (error) {
      console.error("Error getting establishment info for N8N:", error);
      res.status(500).json({
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/n8n/establishment/:id/availability", async (req, res) => {
    res.header("Content-Type", "application/json");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    try {
      const establishmentId = parseInt(req.params.id);
      const { date, staffId, serviceId } = req.query;
      if (!establishmentId || !date) {
        return res.status(400).json({
          error: "ID do estabelecimento e data s\xE3o obrigat\xF3rios"
        });
      }
      let serviceDuration = 30;
      if (serviceId) {
        const service = await storage.getService(parseInt(String(serviceId)), establishmentId);
        if (service) {
          serviceDuration = service.duration;
        }
      }
      const businessHours2 = await storage.getBusinessHours(establishmentId);
      let staffWorkingHours3 = null;
      if (staffId) {
        staffWorkingHours3 = await storage.getStaffWorkingHours(parseInt(String(staffId)), establishmentId);
      }
      const appointments3 = await storage.getAppointments(establishmentId);
      const dateStr = String(date);
      const appointmentsForDate = appointments3.filter((apt) => {
        const aptDate = new Date(apt.appointmentDate).toISOString().split("T")[0];
        return aptDate === dateStr && (!staffId || apt.staffId === parseInt(String(staffId)));
      });
      const dayOfWeek = new Date(dateStr).getDay();
      let availableHours = null;
      if (staffWorkingHours3 && staffWorkingHours3.length > 0) {
        const staffDayHours = staffWorkingHours3.find((h) => h.dayOfWeek === dayOfWeek);
        if (staffDayHours && staffDayHours.isAvailable) {
          availableHours = {
            openTime: staffDayHours.openTime,
            closeTime: staffDayHours.closeTime,
            isOpen: true
          };
        } else {
          availableHours = { isOpen: false };
        }
      } else {
        const businessHour = businessHours2.find((bh) => bh.dayOfWeek === dayOfWeek);
        availableHours = businessHour || { isOpen: false };
      }
      if (!availableHours || !availableHours.isOpen) {
        return res.json({
          date: dateStr,
          available: false,
          message: staffId ? "Colaborador n\xE3o dispon\xEDvel neste dia" : "Estabelecimento fechado neste dia",
          timeSlots: []
        });
      }
      if (staffId) {
        const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { staffVacations: staffVacations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const { eq: eq3, and: and3 } = await import("drizzle-orm");
        const staffVacationsData = await db2.select().from(staffVacations2).where(and3(
          eq3(staffVacations2.establishmentId, establishmentId),
          eq3(staffVacations2.staffId, parseInt(String(staffId))),
          eq3(staffVacations2.isActive, true)
        ));
        const isOnVacation = staffVacationsData.some((vacation) => {
          const vacationStart = new Date(vacation.startDate);
          const vacationEnd = new Date(vacation.endDate);
          const checkDate = new Date(dateStr);
          vacationStart.setHours(0, 0, 0, 0);
          vacationEnd.setHours(23, 59, 59, 999);
          checkDate.setHours(12, 0, 0, 0);
          return checkDate >= vacationStart && checkDate <= vacationEnd;
        });
        if (isOnVacation) {
          const vacationInfo = staffVacationsData.find((vacation) => {
            const vacationStart = new Date(vacation.startDate);
            const vacationEnd = new Date(vacation.endDate);
            const checkDate = new Date(dateStr);
            vacationStart.setHours(0, 0, 0, 0);
            vacationEnd.setHours(23, 59, 59, 999);
            checkDate.setHours(12, 0, 0, 0);
            return checkDate >= vacationStart && checkDate <= vacationEnd;
          });
          const typeLabels = {
            vacation: "f\xE9rias",
            sick_leave: "atestado m\xE9dico",
            time_off: "folga"
          };
          const typeLabel = typeLabels[vacationInfo?.type] || "aus\xEAncia";
          return res.json({
            date: dateStr,
            available: false,
            message: `Profissional est\xE1 de ${typeLabel} neste per\xEDodo`,
            timeSlots: []
          });
        }
      }
      const timeSlots = [];
      const [openHour, openMinute] = (availableHours.openTime || "08:00").split(":").map(Number);
      const [closeHour, closeMinute] = (availableHours.closeTime || "18:00").split(":").map(Number);
      for (let hour = openHour; hour < closeHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          if (hour === closeHour - 1 && minute >= closeMinute) break;
          const timeSlot = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
          const slotTime = /* @__PURE__ */ new Date(`${dateStr}T${timeSlot}:00`);
          const slotEndTime = new Date(slotTime.getTime() + serviceDuration * 6e4);
          const dayEndTime = /* @__PURE__ */ new Date(`${dateStr}T${availableHours.closeTime}:00`);
          if (slotEndTime > dayEndTime) {
            continue;
          }
          const hasConflict = appointmentsForDate.some((apt) => {
            const aptStart = new Date(apt.appointmentDate);
            const aptEnd = new Date(apt.dataFim || new Date(aptStart.getTime() + 30 * 6e4));
            return slotTime < aptEnd && slotEndTime > aptStart;
          });
          timeSlots.push({
            time: timeSlot,
            available: !hasConflict
          });
        }
      }
      res.json({
        date: dateStr,
        available: true,
        establishmentId,
        staffId: staffId ? parseInt(String(staffId)) : null,
        serviceId: serviceId ? parseInt(String(serviceId)) : null,
        serviceDuration,
        timeSlots
      });
    } catch (error) {
      console.error("Error checking availability for N8N:", error);
      res.status(500).json({
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/n8n/establishment/:establishmentId/staff/:staffId/available-days-month", async (req, res) => {
    res.header("Content-Type", "application/json");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    try {
      const establishmentId = parseInt(req.params.establishmentId);
      const staffId = parseInt(req.params.staffId);
      const { month, year } = req.query;
      if (!month || !year) {
        return res.status(400).json({
          error: "Par\xE2metros month e year s\xE3o obrigat\xF3rios",
          example: "/api/n8n/establishment/9/staff/11/available-days-month?month=8&year=2025"
        });
      }
      const targetMonth = parseInt(month);
      const targetYear = parseInt(year);
      if (targetMonth < 1 || targetMonth > 12) {
        return res.status(400).json({
          error: "M\xEAs deve estar entre 1 e 12"
        });
      }
      const staffWorkingHours3 = await storage.getStaffWorkingHours(staffId, establishmentId);
      if (!staffWorkingHours3 || staffWorkingHours3.length === 0) {
        return res.json({
          staffId,
          establishmentId,
          month: targetMonth,
          year: targetYear,
          availableDays: [],
          message: "Profissional n\xE3o possui hor\xE1rios configurados"
        });
      }
      const workingDays = /* @__PURE__ */ new Set();
      staffWorkingHours3.forEach((hour) => {
        if (hour.isAvailable) {
          workingDays.add(hour.dayOfWeek);
        }
      });
      const staffVacationsData2 = await db.select().from(staffVacations).where(and2(
        eq2(staffVacations.establishmentId, establishmentId),
        eq2(staffVacations.staffId, staffId),
        eq2(staffVacations.isActive, true)
      ));
      const availableDays = [];
      const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
      const now = /* @__PURE__ */ new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(targetYear, targetMonth - 1, day);
        const dayOfWeek = currentDate.getDay();
        if (currentDate < today) {
          continue;
        }
        if (workingDays.has(dayOfWeek)) {
          const dateStr = currentDate.toISOString().split("T")[0];
          const isOnVacation = staffVacationsData2.some((vacation) => {
            const vacationStart = new Date(vacation.startDate);
            const vacationEnd = new Date(vacation.endDate);
            const checkDate = new Date(dateStr);
            vacationStart.setHours(0, 0, 0, 0);
            vacationEnd.setHours(23, 59, 59, 999);
            checkDate.setHours(12, 0, 0, 0);
            return checkDate >= vacationStart && checkDate <= vacationEnd;
          });
          if (!isOnVacation) {
            const workingHour = staffWorkingHours3.find((h) => h.dayOfWeek === dayOfWeek);
            availableDays.push({
              date: currentDate.toISOString().split("T")[0],
              // YYYY-MM-DD
              dayOfWeek,
              dayName: ["Domingo", "Segunda", "Ter\xE7a", "Quarta", "Quinta", "Sexta", "S\xE1bado"][dayOfWeek],
              openTime: workingHour?.openTime || "",
              closeTime: workingHour?.closeTime || "",
              available: true
            });
          }
        }
      }
      res.json({
        staffId,
        establishmentId,
        month: targetMonth,
        year: targetYear,
        availableDays,
        totalDays: availableDays.length
      });
    } catch (error) {
      console.error("Error fetching staff available days for month:", error);
      res.status(500).json({
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/n8n/establishment/:id/appointment", async (req, res) => {
    res.header("Content-Type", "application/json");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    try {
      const establishmentId = parseInt(req.params.id);
      const { clientData, appointmentData } = req.body;
      if (!establishmentId || !clientData || !appointmentData) {
        return res.status(400).json({
          error: "Dados do estabelecimento, cliente e agendamento s\xE3o obrigat\xF3rios"
        });
      }
      const establishment = await storage.getEstablishment(establishmentId);
      if (!establishment) {
        return res.status(404).json({
          error: "Estabelecimento n\xE3o encontrado"
        });
      }
      let client = await storage.getClients(establishmentId);
      const existingClient = client.find(
        (c) => c.email === clientData.email || c.phone === clientData.phone
      );
      let clientId;
      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const newClient = await storage.createClient({
          establishmentId,
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          notes: clientData.notes || ""
        });
        clientId = newClient.id;
      }
      const startTime = new Date(appointmentData.dataInicio);
      const endTime = new Date(appointmentData.dataFim);
      const hasConflict = await storage.checkAppointmentConflict(
        appointmentData.staffId,
        startTime,
        endTime
      );
      if (hasConflict) {
        return res.status(409).json({
          error: "Hor\xE1rio j\xE1 est\xE1 ocupado",
          message: "J\xE1 existe um agendamento para este hor\xE1rio"
        });
      }
      const appointment = await storage.createAppointment({
        establishmentId,
        clientId,
        staffId: appointmentData.staffId,
        serviceId: appointmentData.serviceId,
        appointmentDate: startTime,
        dataFim: endTime,
        duration: appointmentData.duration || 60,
        status: "agendado",
        notes: appointmentData.notes || ""
      });
      try {
        const { wsManager: wsManager2 } = await Promise.resolve().then(() => (init_websocket(), websocket_exports));
        if (wsManager2) {
          wsManager2.notifyAppointmentChange(establishmentId, {
            type: "created",
            appointmentId: appointment.id,
            clientId,
            staffId: appointmentData.staffId,
            serviceId: appointmentData.serviceId,
            date: appointment.appointmentDate
          });
          wsManager2.notifyNewNotification(establishmentId, {
            type: "appointment",
            appointmentId: appointment.id
          });
        }
      } catch (wsError) {
      }
      try {
        const [client2, service, staff2, establishment2] = await Promise.all([
          storage.getClient(clientId, establishmentId),
          storage.getService(appointmentData.serviceId, establishmentId),
          storage.getStaffMember(appointmentData.staffId, establishmentId),
          storage.getEstablishment(establishmentId)
        ]);
        if (client2 && service && staff2 && establishment2 && establishment2.email) {
          const appointmentDate = new Date(appointment.appointmentDate);
          const formattedDate = appointmentDate.toLocaleDateString("pt-BR");
          const formattedTime = appointmentDate.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
          });
          const emailSent = await sendAppointmentNotification(establishment2.email, {
            establishmentName: establishment2.name,
            clientName: client2.name,
            serviceName: service.name,
            staffName: staff2.name,
            appointmentDate: formattedDate,
            appointmentTime: formattedTime,
            clientPhone: client2.phone || ""
          });
          if (emailSent) {
          }
        }
      } catch (emailError) {
      }
      res.json({
        success: true,
        message: "Agendamento criado com sucesso",
        data: {
          appointmentId: appointment.id,
          clientId,
          establishmentId,
          scheduledTime: appointment.appointmentDate,
          status: appointment.status
        }
      });
    } catch (error) {
      console.error("Error creating appointment for N8N:", error);
      res.status(500).json({
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.put("/api/n8n/appointment/:id/confirm", async (req, res) => {
    res.header("Content-Type", "application/json");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    try {
      const appointmentId = parseInt(req.params.id);
      if (!appointmentId) {
        return res.status(400).json({
          error: "ID do agendamento \xE9 obrigat\xF3rio"
        });
      }
      const appointment = await storage.getAppointmentById(appointmentId);
      if (!appointment) {
        return res.status(404).json({
          error: "Agendamento n\xE3o encontrado"
        });
      }
      const updatedAppointment = await storage.updateAppointmentStatus(appointmentId, "confirmado", appointment.establishmentId);
      res.json({
        success: true,
        message: "Agendamento confirmado com sucesso",
        data: {
          appointmentId: updatedAppointment.id,
          status: updatedAppointment.status,
          confirmedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
    } catch (error) {
      console.error("Error confirming appointment for N8N:", error);
      res.status(500).json({
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/calendar/months", async (req, res) => {
    try {
      const months = [];
      const now = /* @__PURE__ */ new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const monthNames = [
        "Janeiro",
        "Fevereiro",
        "Mar\xE7o",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
      ];
      for (let i = 0; i < 12; i++) {
        const targetMonth = (currentMonth + i) % 12;
        const targetYear = currentYear + Math.floor((currentMonth + i) / 12);
        months.push({
          month: targetMonth + 1,
          // 1-12
          year: targetYear,
          name: monthNames[targetMonth],
          shortName: monthNames[targetMonth].substring(0, 3),
          fullName: `${monthNames[targetMonth]} ${targetYear}`
        });
      }
      res.json({
        success: true,
        data: months,
        currentMonth: currentMonth + 1,
        currentYear
      });
    } catch (error) {
      console.error("Error fetching months:", error);
      res.status(500).json({ message: "Failed to fetch months" });
    }
  });
  app2.get("/api/calendar/days", async (req, res) => {
    try {
      const { month, year } = req.query;
      const userContext = getUserContext(req);
      if (!month || !year) {
        return res.status(400).json({
          error: "Par\xE2metros month e year s\xE3o obrigat\xF3rios",
          example: "/api/calendar/days?month=7&year=2025"
        });
      }
      const targetMonth = parseInt(month);
      const targetYear = parseInt(year);
      if (targetMonth < 1 || targetMonth > 12) {
        return res.status(400).json({
          error: "M\xEAs deve estar entre 1 e 12"
        });
      }
      const businessHours2 = await storage.getBusinessHours(userContext.establishmentId);
      const openDays = /* @__PURE__ */ new Set();
      businessHours2.forEach((hour) => {
        if (hour.isOpen) {
          openDays.add(hour.dayOfWeek);
        }
      });
      const days = [];
      const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
      const now = /* @__PURE__ */ new Date();
      const currentDay = now.getDate();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const dayNames = [
        "Domingo",
        "Segunda-feira",
        "Ter\xE7a-feira",
        "Quarta-feira",
        "Quinta-feira",
        "Sexta-feira",
        "S\xE1bado"
      ];
      const shortDayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "S\xE1b"];
      let startDay = 1;
      if (targetMonth === currentMonth && targetYear === currentYear) {
        startDay = currentDay;
      }
      const allStaffVacations = await db.select().from(staffVacations).where(and2(
        eq2(staffVacations.establishmentId, userContext.establishmentId),
        eq2(staffVacations.isActive, true)
      ));
      for (let day = startDay; day <= daysInMonth; day++) {
        const date = new Date(targetYear, targetMonth - 1, day);
        const dayOfWeek = date.getDay();
        const dateStr = `${targetYear}-${targetMonth.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
        if (openDays.has(dayOfWeek)) {
          const hasStaffOnVacation = allStaffVacations.some((vacation) => {
            const vacationStart = new Date(vacation.startDate);
            const vacationEnd = new Date(vacation.endDate);
            const checkDate = new Date(dateStr);
            vacationStart.setHours(0, 0, 0, 0);
            vacationEnd.setHours(23, 59, 59, 999);
            checkDate.setHours(12, 0, 0, 0);
            return checkDate >= vacationStart && checkDate <= vacationEnd;
          });
          if (!hasStaffOnVacation) {
            days.push({
              day,
              dayOfWeek,
              dayName: dayNames[dayOfWeek],
              shortDayName: shortDayNames[dayOfWeek],
              fullDate: `${day.toString().padStart(2, "0")}/${targetMonth.toString().padStart(2, "0")}/${targetYear}`,
              formattedDate: `${day.toString().padStart(2, "0")}/${targetMonth.toString().padStart(2, "0")}/${targetYear} (${dayNames[dayOfWeek]})`,
              isoDate: date.toISOString().split("T")[0],
              isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
              isToday: day === currentDay && targetMonth === currentMonth && targetYear === currentYear,
              isAvailable: true
              // Todos os dias retornados têm horários disponíveis
            });
          }
        }
      }
      const monthNames = [
        "Janeiro",
        "Fevereiro",
        "Mar\xE7o",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
      ];
      res.json({
        success: true,
        data: days,
        monthInfo: {
          month: targetMonth,
          year: targetYear,
          monthName: monthNames[targetMonth - 1],
          daysInMonth,
          availableDays: days.length,
          totalDays: daysInMonth - startDay + 1,
          firstDayOfWeek: days.length > 0 ? days[0].dayOfWeek : null,
          lastDayOfWeek: days.length > 0 ? days[days.length - 1].dayOfWeek : null
        },
        businessInfo: {
          openDays: Array.from(openDays).sort(),
          businessHours: businessHours2.filter((h) => h.isOpen).map((h) => ({
            dayOfWeek: h.dayOfWeek,
            dayName: dayNames[h.dayOfWeek],
            openTime: h.openTime,
            closeTime: h.closeTime
          }))
        }
      });
    } catch (error) {
      console.error("Error fetching available days:", error);
      res.status(500).json({ message: "Failed to fetch available days" });
    }
  });
  app2.get("/api/loyalty/programs", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const hasLoyaltyAccess = await storage.hasLoyaltyAccess(establishmentId);
      if (!hasLoyaltyAccess) {
        return res.status(403).json({
          message: "Este recurso faz parte do plano Core ou superior. Atualize seu plano para desbloquear.",
          requiredPlan: "Intermedi\xE1rio"
        });
      }
      const programs = await storage.getLoyaltyPrograms(establishmentId);
      const programsWithServices = await Promise.all(
        programs.map(async (program) => {
          const services2 = await storage.getLoyaltyProgramServices(program.id, establishmentId);
          return { ...program, services: services2 };
        })
      );
      res.json(programsWithServices);
    } catch (error) {
      console.error("Get loyalty programs error:", error);
      res.status(500).json({ message: "Failed to fetch loyalty programs" });
    }
  });
  app2.post("/api/loyalty/programs", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const hasLoyaltyAccess = await storage.hasLoyaltyAccess(establishmentId);
      if (!hasLoyaltyAccess) {
        return res.status(403).json({
          message: "Este recurso faz parte do plano Core ou superior. Atualize seu plano para desbloquear.",
          requiredPlan: "Intermedi\xE1rio"
        });
      }
      const { services: services2, ...programData } = req.body;
      const program = await storage.createLoyaltyProgram({
        ...programData,
        establishmentId,
        isActive: true
      });
      if (services2 && Array.isArray(services2)) {
        for (const serviceId of services2) {
          await storage.addServiceToLoyaltyProgram({
            loyaltyProgramId: program.id,
            serviceId,
            establishmentId
          });
        }
      }
      res.json(program);
    } catch (error) {
      console.error("Create loyalty program error:", error);
      res.status(500).json({ message: "Failed to create loyalty program" });
    }
  });
  app2.put("/api/loyalty/programs/:id", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const hasLoyaltyAccess = await storage.hasLoyaltyAccess(establishmentId);
      if (!hasLoyaltyAccess) {
        return res.status(403).json({
          message: "Este recurso faz parte do plano Core ou superior. Atualize seu plano para desbloquear.",
          requiredPlan: "Intermedi\xE1rio"
        });
      }
      const programId = parseInt(req.params.id);
      const { services: services2, ...programData } = req.body;
      const program = await storage.updateLoyaltyProgram(programId, programData, establishmentId);
      if (services2 && Array.isArray(services2)) {
        const currentServices = await storage.getLoyaltyProgramServices(programId, establishmentId);
        const currentServiceIds = currentServices.map((s) => s.serviceId);
        for (const currentServiceId of currentServiceIds) {
          if (!services2.includes(currentServiceId)) {
            await storage.removeServiceFromLoyaltyProgram(programId, currentServiceId, establishmentId);
          }
        }
        for (const serviceId of services2) {
          if (!currentServiceIds.includes(serviceId)) {
            await storage.addServiceToLoyaltyProgram({
              loyaltyProgramId: programId,
              serviceId,
              establishmentId
            });
          }
        }
      }
      res.json(program);
    } catch (error) {
      console.error("Update loyalty program error:", error);
      res.status(500).json({ message: "Failed to update loyalty program" });
    }
  });
  app2.delete("/api/loyalty/programs/:id", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const hasLoyaltyAccess = await storage.hasLoyaltyAccess(establishmentId);
      if (!hasLoyaltyAccess) {
        return res.status(403).json({
          message: "Este recurso faz parte do plano Core ou superior. Atualize seu plano para desbloquear.",
          requiredPlan: "Intermedi\xE1rio"
        });
      }
      const programId = parseInt(req.params.id);
      await storage.deleteLoyaltyProgram(programId, establishmentId);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete loyalty program error:", error);
      res.status(500).json({ message: "Failed to delete loyalty program" });
    }
  });
  app2.get("/api/loyalty/clients-with-rewards", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const hasLoyaltyAccess = await storage.hasLoyaltyAccess(establishmentId);
      if (!hasLoyaltyAccess) {
        return res.status(403).json({
          message: "Este recurso faz parte do plano Core ou superior. Atualize seu plano para desbloquear.",
          requiredPlan: "Intermedi\xE1rio"
        });
      }
      console.log(`Buscando clientes com pontos para estabelecimento ${establishmentId}`);
      const results = await db.select({
        clientId: clientLoyaltyPoints.clientId,
        clientName: clients.name,
        totalPoints: clientLoyaltyPoints.availablePoints,
        pointsToReward: loyaltyPrograms.pointsToReward,
        rewardDescription: loyaltyPrograms.rewardDescription,
        canRedeem: sql3`${clientLoyaltyPoints.availablePoints} >= ${loyaltyPrograms.pointsToReward}`
      }).from(clientLoyaltyPoints).innerJoin(clients, eq2(clients.id, clientLoyaltyPoints.clientId)).innerJoin(loyaltyPrograms, eq2(loyaltyPrograms.id, clientLoyaltyPoints.loyaltyProgramId)).where(eq2(clientLoyaltyPoints.establishmentId, establishmentId));
      console.log(`Encontrados ${results.length} clientes com pontos`);
      res.json(results);
    } catch (error) {
      console.error("Get clients with rewards error:", error);
      res.status(500).json({ message: "Failed to fetch clients with rewards" });
    }
  });
  app2.get("/api/loyalty/clients/:clientId/points", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const hasLoyaltyAccess = await storage.hasLoyaltyAccess(establishmentId);
      if (!hasLoyaltyAccess) {
        return res.status(403).json({
          message: "Este recurso faz parte do plano Core ou superior. Atualize seu plano para desbloquear.",
          requiredPlan: "Intermedi\xE1rio"
        });
      }
      const clientId = parseInt(req.params.clientId);
      const points = await storage.getClientLoyaltyPoints(clientId, establishmentId);
      const transactions2 = await storage.getLoyaltyPointTransactions(clientId, establishmentId);
      res.json({ points, transactions: transactions2 });
    } catch (error) {
      console.error("Get client loyalty points error:", error);
      res.status(500).json({ message: "Failed to fetch client loyalty points" });
    }
  });
  app2.post("/api/loyalty/clients/:clientId/use-points", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const hasLoyaltyAccess = await storage.hasLoyaltyAccess(establishmentId);
      if (!hasLoyaltyAccess) {
        return res.status(403).json({
          message: "Este recurso faz parte do plano Core ou superior. Atualize seu plano para desbloquear.",
          requiredPlan: "Intermedi\xE1rio"
        });
      }
      const clientId = parseInt(req.params.clientId);
      const { programId, points } = req.body;
      await storage.useLoyaltyPoints(clientId, programId, points, establishmentId);
      res.json({ success: true, message: "Pontos utilizados com sucesso" });
    } catch (error) {
      console.error("Use loyalty points error:", error);
      res.status(500).json({ message: error?.message || "Failed to use loyalty points" });
    }
  });
  app2.post("/api/loyalty/clients/:clientId/add-points", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const hasLoyaltyAccess = await storage.hasLoyaltyAccess(establishmentId);
      if (!hasLoyaltyAccess) {
        return res.status(403).json({
          message: "Este recurso faz parte do plano Core ou superior. Atualize seu plano para desbloquear.",
          requiredPlan: "Intermedi\xE1rio"
        });
      }
      const clientId = parseInt(req.params.clientId);
      const { programId, points, appointmentId } = req.body;
      await storage.addLoyaltyPoints(clientId, programId, points, appointmentId, establishmentId);
      res.json({ success: true, message: "Pontos adicionados com sucesso" });
    } catch (error) {
      console.error("Add loyalty points error:", error);
      res.status(500).json({ message: "Failed to add loyalty points" });
    }
  });
  app2.post("/api/push-subscription", async (req, res) => {
    try {
      const { userId, establishmentId } = getUserContext(req);
      const { subscription } = req.body;
      if (!subscription) {
        return res.status(400).json({ message: "Subscription data is required" });
      }
      await db.update(pushSubscriptions).set({ isActive: false }).where(eq2(pushSubscriptions.userId, userId));
      const [newSubscription] = await db.insert(pushSubscriptions).values({
        userId,
        establishmentId,
        subscription: JSON.stringify(subscription),
        isActive: true
      }).returning();
      res.json({ message: "Push subscription saved successfully", subscription: newSubscription });
    } catch (error) {
      console.error("Error saving push subscription:", error);
      res.status(500).json({ message: "Failed to save push subscription" });
    }
  });
  app2.delete("/api/push-subscription", async (req, res) => {
    try {
      const { userId } = getUserContext(req);
      await db.update(pushSubscriptions).set({ isActive: false }).where(eq2(pushSubscriptions.userId, userId));
      res.json({ message: "Push subscription removed successfully" });
    } catch (error) {
      console.error("Error removing push subscription:", error);
      res.status(500).json({ message: "Failed to remove push subscription" });
    }
  });
  app2.get("/api/push-subscription/status", async (req, res) => {
    try {
      const { userId } = getUserContext(req);
      const [subscription] = await db.select().from(pushSubscriptions).where(and2(
        eq2(pushSubscriptions.userId, userId),
        eq2(pushSubscriptions.isActive, true)
      ));
      res.json({
        hasActiveSubscription: !!subscription,
        subscription: subscription || null
      });
    } catch (error) {
      console.error("Error checking push subscription status:", error);
      res.status(500).json({ message: "Failed to check subscription status" });
    }
  });
  const httpServer = createServer(app2);
  const { initializeWebSocket: initializeWebSocket2 } = await Promise.resolve().then(() => (init_websocket(), websocket_exports));
  initializeWebSocket2(httpServer);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
var vite_config_default = defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid as nanoid2 } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: {
      ...serverOptions,
      allowedHosts: true
    },
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid2()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import Stripe2 from "stripe";
var app = express2();
async function startServer() {
  try {
    await initializeDatabase();
    await setupApplication();
  } catch (error) {
    console.error("\u274C Server startup failed:", error);
    process.exit(1);
  }
}
var webhookData = {
  apiKey: "",
  instanceId: "",
  lastUpdated: null
};
function updateWebhookData(apiKey, instanceId) {
  webhookData = {
    apiKey,
    instanceId,
    lastUpdated: /* @__PURE__ */ new Date()
  };
}
var stripeKey2 = process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY;
if (!stripeKey2) {
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY_LIVE or STRIPE_SECRET_KEY");
}
var stripe2 = new Stripe2(stripeKey2, {
  apiVersion: "2025-07-30.basil"
});
var isLiveMode = stripeKey2.startsWith("sk_live_");
app.post("/api/stripe-webhook", express2.raw({ type: "application/json" }), async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    let event;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_LIVE || process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      try {
        const bodyStr = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : req.body;
        event = JSON.parse(bodyStr);
      } catch (err) {
        return res.status(400).send("Invalid JSON");
      }
    } else {
      try {
        event = stripe2.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    }
    if (process.env.NODE_ENV === "development") {
    }
    if (["checkout.session.completed", "checkout.session.async_payment_succeeded", "invoice.payment_succeeded", "payment_intent.succeeded"].includes(event.type)) {
      const customerId = event.data.object.customer;
      if (customerId) {
        try {
          const response = await fetch(`http://localhost:5000/api/confirm-payment-manual`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stripeCustomerId: customerId })
          });
          if (!response.ok && process.env.NODE_ENV === "development") {
          }
        } catch (error) {
          console.error(`\u274C Erro ao processar pagamento:`, error);
        }
      }
    }
    res.json({ received: true });
  } catch (error) {
    console.error("\u274C Erro no webhook:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});
app.use(express2.json());
app.use("/attached_assets", express2.static("attached_assets"));
app.post("/n8n", (req, res) => {
  try {
    const data = req.body || {};
    const apiKey = data.apikey || data.apiKey || data.ChaveAPI;
    const instanceId = data.instanceID || data.instanceId;
    if (!apiKey || !instanceId) {
      return res.status(400).json({
        error: "Campos obrigat\xF3rios ausentes",
        required: ["apikey", "instanceID"],
        received: Object.keys(data)
      });
    }
    webhookData.apiKey = apiKey;
    webhookData.instanceId = instanceId;
    webhookData.lastUpdated = /* @__PURE__ */ new Date();
    res.json({
      success: true,
      message: "Dados recebidos com sucesso",
      data: {
        apiKey: apiKey.substring(0, 8) + "...",
        instanceId,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  } catch (error) {
    console.error("Erro no webhook:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});
app.use((req, res, next) => {
  if (req.url === "/webhook-n8n" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const apiKey = data.apikey || data.apiKey || data.ChaveAPI;
        const instanceId = data.instanceID || data.instanceId;
        if (!apiKey || !instanceId) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({
            error: "Campos obrigat\xF3rios ausentes",
            required: ["apikey", "instanceID"],
            received: Object.keys(data)
          }));
        }
        webhookData = {
          apiKey,
          instanceId,
          lastUpdated: /* @__PURE__ */ new Date()
        };
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          success: true,
          message: "Dados recebidos com sucesso via intercepta\xE7\xE3o",
          data: {
            apiKey: apiKey.substring(0, 8) + "...",
            instanceId,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          }
        }));
      } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "JSON inv\xE1lido" }));
      }
    });
    return;
  }
  next();
});
app.post("/webhook/n8n-data", express2.json(), async (req, res) => {
  try {
    const body = req.body || {};
    const qrCodeBase64 = body.qrcode_base64;
    const apiKey = body.api_key;
    const instanceId = body.instance_id;
    const establishmentName = body.establishment_name;
    const updateType = body.update_type;
    if (qrCodeBase64) {
    }
    const establishmentId = body.establishment_id || 1;
    const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    if (updateType === "countdown_update" && qrCodeBase64) {
      const updatedRecord = await storage2.updateN8nWebhookQRCode(establishmentId, qrCodeBase64);
      if (updatedRecord) {
        try {
          const webhookPayload = {
            qrcode_base64: qrCodeBase64,
            api_key: updatedRecord.apiKey,
            instance_id: updatedRecord.instanceId,
            establishment_id: establishmentId,
            establishment_name: updatedRecord.establishmentName,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            source: "qr_code_update"
          };
          const updateWebhookUrl = "https://n8n-n8n-start.ayp7v6.easypanel.host/webhook/523e863a-f529-4d45-98fb-5f9ff3e826f0";
          const response = await fetch(updateWebhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(webhookPayload)
          });
          if (response.ok) {
            const responseData = await response.text();
          } else {
            const errorData = await response.text();
          }
        } catch (error) {
        }
        return res.json({
          success: true,
          message: "QR Code atualizado com sucesso",
          action: "update_qr_code",
          data: {
            id: updatedRecord.id,
            apiKey: updatedRecord.apiKey?.substring(0, 8) + "...",
            instanceId: updatedRecord.instanceId,
            qrCodeUpdated: true,
            timestamp: updatedRecord.updatedAt
          }
        });
      } else {
        return res.status(404).json({
          error: "Nenhum registro encontrado para atualizar",
          message: "Precisa criar um registro inicial primeiro"
        });
      }
    }
    if (!apiKey || !instanceId) {
      return res.status(400).json({
        error: "Campos obrigat\xF3rios ausentes",
        required: ["api_key", "instance_id"],
        received: Object.keys(body)
      });
    }
    try {
      const existingData = await storage2.getN8nWebhookData(establishmentId);
      if (existingData) {
        await storage2.deleteN8nWebhookData(establishmentId);
      }
    } catch (deleteError) {
    }
    const webhookDataRecord = await storage2.saveN8nWebhookData({
      establishmentId,
      establishmentName,
      qrCodeBase64,
      apiKey,
      instanceId
    });
    res.json({
      success: true,
      message: "Dados recebidos e salvos com sucesso",
      data: {
        id: webhookDataRecord.id,
        apiKey: apiKey.substring(0, 8) + "...",
        instanceId,
        qrCodePresent: !!qrCodeBase64,
        timestamp: webhookDataRecord.createdAt
      }
    });
  } catch (error) {
    console.error("Erro no webhook N8N:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
app.use("*", async (req, res, next) => {
  if (req.originalUrl.startsWith("/n8n-api/") || req.originalUrl.startsWith("/api/n8n/")) {
    let normalizedUrl = req.originalUrl;
    if (normalizedUrl.startsWith("/n8n-api/")) {
      normalizedUrl = normalizedUrl.replace("/n8n-api/", "/api/n8n/");
    }
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      return res.status(200).end();
    }
    try {
      const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      if (normalizedUrl.includes("/info") && req.method === "GET") {
        const pathParts = normalizedUrl.split("/");
        const establishmentId = parseInt(pathParts[4]);
        if (!establishmentId) {
          return res.status(400).json({ error: "ID do estabelecimento \xE9 obrigat\xF3rio" });
        }
        const establishment = await storage2.getEstablishment(establishmentId);
        if (!establishment) {
          return res.status(404).json({ error: "Estabelecimento n\xE3o encontrado" });
        }
        const [services2, staff2, businessHours2] = await Promise.all([
          storage2.getServices(establishmentId),
          storage2.getStaff(establishmentId),
          storage2.getBusinessHours(establishmentId)
        ]);
        return res.json({
          establishment: {
            id: establishment.id,
            name: establishment.name,
            email: establishment.email,
            phone: establishment.phone,
            address: establishment.address
          },
          services: services2.map((service) => ({
            id: service.id,
            name: service.name,
            description: service.description,
            price: service.price,
            duration: service.duration,
            category: service.category
          })),
          staff: staff2.map((member) => ({
            id: member.id,
            name: member.name,
            email: member.email,
            phone: member.phone,
            specialties: member.specialties
          })),
          businessHours: businessHours2.map((hour) => ({
            dayOfWeek: hour.dayOfWeek,
            openTime: hour.openTime,
            closeTime: hour.closeTime,
            isOpen: hour.isOpen
          }))
        });
      }
      if (normalizedUrl.includes("/months") && req.method === "GET") {
        const pathParts = normalizedUrl.split("/");
        const establishmentId = parseInt(pathParts[4]);
        if (!establishmentId) {
          return res.status(400).json({ error: "ID do estabelecimento \xE9 obrigat\xF3rio" });
        }
        try {
          const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
          const { agendaReleasePolicies: agendaReleasePolicies2, agendaReleases: agendaReleases2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
          const { eq: eq3, desc: desc2, and: and3 } = await import("drizzle-orm");
          const [policy] = await db2.select().from(agendaReleasePolicies2).where(and3(
            eq3(agendaReleasePolicies2.establishmentId, establishmentId),
            eq3(agendaReleasePolicies2.isActive, true)
          ));
          if (!policy) {
            const now2 = /* @__PURE__ */ new Date();
            const availableMonths2 = [];
            for (let i = 0; i < 12; i++) {
              const targetDate = new Date(now2.getFullYear(), now2.getMonth() + i);
              const monthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}`;
              availableMonths2.push(monthStr);
            }
            return res.json({
              establishmentId,
              availableMonths: availableMonths2,
              policy: null,
              message: "Controle de libera\xE7\xE3o desativado - agenda dispon\xEDvel para os pr\xF3ximos 12 meses",
              mode: "rolling_calendar"
            });
          }
          const { storage: storage3 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
          const calculatedMonths = await storage3.calculateReleasedMonths(establishmentId);
          const now = /* @__PURE__ */ new Date();
          const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
          const availableMonths = new Set(calculatedMonths);
          availableMonths.add(currentMonth);
          const filteredMonths = Array.from(availableMonths).filter((month) => month >= currentMonth).sort();
          return res.json({
            establishmentId,
            availableMonths: filteredMonths,
            policy: {
              releaseInterval: policy.releaseInterval,
              releaseDay: policy.releaseDay
            },
            nextReleaseDate: policy.releaseDay <= now.getDate() ? `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, "0")}-${String(policy.releaseDay).padStart(2, "0")}` : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(policy.releaseDay).padStart(2, "0")}`,
            totalReleasedMonths: filteredMonths.length
          });
        } catch (error) {
          console.error("Erro ao buscar meses liberados:", error);
          return res.status(500).json({
            error: "Erro interno do servidor",
            message: error instanceof Error ? error.message : "Unknown error"
          });
        }
      }
      if (normalizedUrl.includes("/availability") && req.method === "GET") {
        const pathParts = normalizedUrl.split("/");
        const establishmentId = parseInt(pathParts[4]);
        const url = new URL(req.originalUrl, "http://localhost:5000");
        const date = url.searchParams.get("date");
        const staffId = url.searchParams.get("staffId");
        const serviceId = url.searchParams.get("serviceId");
        if (!establishmentId || !date) {
          return res.status(400).json({ error: "ID do estabelecimento e data s\xE3o obrigat\xF3rios" });
        }
        const dateStr = String(date);
        const requestedMonth = dateStr.substring(0, 7);
        try {
          const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
          const { agendaReleasePolicies: agendaReleasePolicies2, agendaReleases: agendaReleases2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
          const { eq: eq3, desc: desc2, and: and3 } = await import("drizzle-orm");
          const [policy] = await db2.select().from(agendaReleasePolicies2).where(and3(
            eq3(agendaReleasePolicies2.establishmentId, establishmentId),
            eq3(agendaReleasePolicies2.isActive, true)
          ));
          if (policy && policy.isActive) {
            const releases = await db2.select().from(agendaReleases2).where(eq3(agendaReleases2.establishmentId, establishmentId)).orderBy(desc2(agendaReleases2.releaseDate));
            const availableMonths = /* @__PURE__ */ new Set();
            for (const release of releases) {
              for (const month of release.releasedMonths) {
                availableMonths.add(month);
              }
            }
            if (!availableMonths.has(requestedMonth)) {
              const nextReleaseDay = policy.releaseDay;
              return res.json({
                date: dateStr,
                available: false,
                establishmentId,
                staffId: staffId ? parseInt(String(staffId)) : null,
                serviceId: serviceId ? parseInt(String(serviceId)) : null,
                message: `Agenda ainda n\xE3o liberada para ${requestedMonth}. Pr\xF3xima libera\xE7\xE3o no dia ${nextReleaseDay}`,
                timeSlots: []
              });
            }
          } else {
          }
        } catch (error) {
          console.error("Erro ao verificar agenda liberada:", error);
        }
        const [businessHours2, appointments3, services2, staffWorkingHours3] = await Promise.all([
          storage2.getBusinessHours(establishmentId),
          storage2.getAppointments(establishmentId),
          storage2.getServices(establishmentId),
          staffId ? storage2.getStaffWorkingHours(parseInt(String(staffId)), establishmentId) : Promise.resolve([])
        ]);
        let serviceDuration = 30;
        if (serviceId) {
          const service = services2.find((s) => s.id === parseInt(String(serviceId)));
          if (service) {
            serviceDuration = service.duration;
          }
        }
        const appointmentsForDate = appointments3.filter((apt) => {
          const aptDate = new Date(apt.appointmentDate).toISOString().split("T")[0];
          return aptDate === dateStr && (!staffId || apt.staffId === parseInt(String(staffId)));
        });
        const dayOfWeek = new Date(dateStr).getDay();
        const businessHour = businessHours2.find((bh) => bh.dayOfWeek === dayOfWeek);
        if (!businessHour || !businessHour.isOpen) {
          return res.json({
            date: dateStr,
            available: false,
            establishmentId,
            staffId: staffId ? parseInt(String(staffId)) : null,
            serviceId: serviceId ? parseInt(String(serviceId)) : null,
            serviceDuration,
            message: "Estabelecimento fechado neste dia",
            timeSlots: []
          });
        }
        let finalOpenTime = businessHour.openTime;
        let finalCloseTime = businessHour.closeTime;
        if (staffId && staffWorkingHours3.length > 0) {
          const staffHour = staffWorkingHours3.find((swh) => swh.dayOfWeek === dayOfWeek && swh.isAvailable);
          if (!staffHour) {
            return res.json({
              date: dateStr,
              available: false,
              establishmentId,
              staffId: parseInt(String(staffId)),
              serviceId: serviceId ? parseInt(String(serviceId)) : null,
              serviceDuration,
              message: "Profissional n\xE3o trabalha neste dia",
              timeSlots: []
            });
          }
          finalOpenTime = businessHour.openTime && staffHour.openTime ? businessHour.openTime > staffHour.openTime ? businessHour.openTime : staffHour.openTime : businessHour.openTime || staffHour.openTime;
          finalCloseTime = businessHour.closeTime && staffHour.closeTime ? businessHour.closeTime < staffHour.closeTime ? businessHour.closeTime : staffHour.closeTime : businessHour.closeTime || staffHour.closeTime;
          if (!finalOpenTime || !finalCloseTime || finalOpenTime >= finalCloseTime) {
            return res.json({
              date: dateStr,
              available: false,
              establishmentId,
              staffId: parseInt(String(staffId)),
              serviceId: serviceId ? parseInt(String(serviceId)) : null,
              serviceDuration,
              message: "N\xE3o h\xE1 hor\xE1rios compat\xEDveis entre estabelecimento e profissional neste dia",
              timeSlots: []
            });
          }
          const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
          const { staffVacations: staffVacations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
          const { eq: eq3, and: and3 } = await import("drizzle-orm");
          const staffVacationsData = await db2.select().from(staffVacations2).where(and3(
            eq3(staffVacations2.establishmentId, establishmentId),
            eq3(staffVacations2.staffId, parseInt(String(staffId))),
            eq3(staffVacations2.isActive, true)
          ));
          const isOnVacation = staffVacationsData.some((vacation) => {
            const vacationStartStr = vacation.startDate.split(" ")[0];
            const vacationEndStr = vacation.endDate.split(" ")[0];
            return dateStr >= vacationStartStr && dateStr <= vacationEndStr;
          });
          if (isOnVacation) {
            const vacationInfo = staffVacationsData.find((vacation) => {
              const vacationStart = new Date(vacation.startDate);
              const vacationEnd = new Date(vacation.endDate);
              const checkDate = new Date(dateStr);
              vacationStart.setHours(0, 0, 0, 0);
              vacationEnd.setHours(23, 59, 59, 999);
              checkDate.setHours(12, 0, 0, 0);
              return checkDate >= vacationStart && checkDate <= vacationEnd;
            });
            const typeLabels = {
              vacation: "f\xE9rias",
              sick_leave: "atestado m\xE9dico",
              time_off: "folga"
            };
            const typeLabel = typeLabels[vacationInfo?.type] || "aus\xEAncia";
            return res.json({
              date: dateStr,
              available: false,
              establishmentId,
              staffId: parseInt(String(staffId)),
              serviceId: serviceId ? parseInt(String(serviceId)) : null,
              serviceDuration,
              message: `Profissional est\xE1 de ${typeLabel} neste per\xEDodo`,
              timeSlots: []
            });
          }
        }
        if (!finalOpenTime || !finalCloseTime) {
          return res.json({
            date: dateStr,
            available: false,
            establishmentId,
            staffId: staffId ? parseInt(String(staffId)) : null,
            serviceId: serviceId ? parseInt(String(serviceId)) : null,
            serviceDuration,
            message: "Hor\xE1rios n\xE3o definidos para este dia",
            timeSlots: []
          });
        }
        const [openHour, openMinute] = finalOpenTime.split(":").map(Number);
        const [closeHour, closeMinute] = finalCloseTime.split(":").map(Number);
        const timeSlots = [];
        const currentBrazilTime = /* @__PURE__ */ new Date();
        const brazilOffset = -3;
        const utcTime = currentBrazilTime.getTime() + currentBrazilTime.getTimezoneOffset() * 6e4;
        const currentSaoPauloTime = new Date(utcTime + brazilOffset * 36e5);
        let currentSlotHour = openHour;
        let currentSlotMinute = openMinute;
        while (currentSlotHour < closeHour || currentSlotHour === closeHour && currentSlotMinute < closeMinute) {
          const timeSlot = `${currentSlotHour.toString().padStart(2, "0")}:${currentSlotMinute.toString().padStart(2, "0")}`;
          const slotStart = /* @__PURE__ */ new Date(`${dateStr}T${timeSlot}:00`);
          const slotEnd = new Date(slotStart.getTime() + serviceDuration * 6e4);
          const isPastTime = slotStart <= currentSaoPauloTime;
          const hasConflict = appointmentsForDate.some((apt) => {
            const aptStart = new Date(apt.appointmentDate);
            const aptDuration = apt.duration || 30;
            const aptEnd = new Date(aptStart.getTime() + aptDuration * 6e4);
            return slotStart < aptEnd && slotEnd > aptStart;
          });
          const slotEndHour = slotEnd.getHours();
          const slotEndMinute = slotEnd.getMinutes();
          const finishesBeforeClose = slotEndHour < closeHour || slotEndHour === closeHour && slotEndMinute <= closeMinute;
          if (finishesBeforeClose) {
            timeSlots.push({
              time: timeSlot,
              available: !isPastTime && !hasConflict,
              isPast: isPastTime,
              isBooked: !isPastTime && hasConflict,
              serviceDuration,
              endTime: `${slotEndHour.toString().padStart(2, "0")}:${slotEndMinute.toString().padStart(2, "0")}`
            });
          }
          currentSlotMinute += 10;
          if (currentSlotMinute >= 60) {
            currentSlotMinute = 0;
            currentSlotHour++;
          }
        }
        return res.json({
          date: dateStr,
          available: true,
          establishmentId,
          staffId: staffId ? parseInt(String(staffId)) : null,
          serviceId: serviceId ? parseInt(String(serviceId)) : null,
          serviceDuration,
          businessHours: {
            openTime: businessHour.openTime,
            closeTime: businessHour.closeTime
          },
          staffHours: staffId && staffWorkingHours3.length > 0 ? {
            openTime: staffWorkingHours3.find((swh) => swh.dayOfWeek === dayOfWeek)?.openTime,
            closeTime: staffWorkingHours3.find((swh) => swh.dayOfWeek === dayOfWeek)?.closeTime
          } : null,
          finalHours: {
            openTime: finalOpenTime,
            closeTime: finalCloseTime
          },
          timeSlots
        });
      }
      if (normalizedUrl.includes("/appointment") && req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", async () => {
          try {
            const requestBody = body ? JSON.parse(body) : {};
            const pathParts = normalizedUrl.split("/");
            const establishmentId = parseInt(pathParts[4]);
            const { clientData, appointmentData } = requestBody;
            if (!establishmentId || !clientData || !appointmentData) {
              return res.status(400).json({ error: "Dados obrigat\xF3rios ausentes" });
            }
            const establishment = await storage2.getEstablishment(establishmentId);
            if (!establishment) {
              return res.status(404).json({ error: "Estabelecimento n\xE3o encontrado" });
            }
            const clients2 = await storage2.getClients(establishmentId);
            const existingClient = clients2.find(
              (c) => c.email === clientData.email || c.phone === clientData.phone
            );
            let clientId;
            if (existingClient) {
              clientId = existingClient.id;
            } else {
              const newClient = await storage2.createClient({
                establishmentId,
                name: clientData.name,
                email: clientData.email,
                phone: clientData.phone,
                notes: clientData.notes || ""
              });
              clientId = newClient.id;
            }
            const startTime = new Date(appointmentData.dataInicio);
            const endTime = new Date(appointmentData.dataFim);
            const hasConflict = await storage2.checkAppointmentConflict(
              appointmentData.staffId,
              startTime,
              endTime
            );
            if (hasConflict) {
              return res.status(409).json({
                error: "Hor\xE1rio j\xE1 est\xE1 ocupado",
                message: "J\xE1 existe um agendamento para este hor\xE1rio"
              });
            }
            const appointment = await storage2.createAppointment({
              establishmentId,
              clientId,
              staffId: appointmentData.staffId,
              serviceId: appointmentData.serviceId,
              appointmentDate: startTime,
              dataFim: endTime,
              duration: appointmentData.duration || 60,
              status: "agendado",
              notes: appointmentData.notes || ""
            });
            return res.json({
              success: true,
              message: "Agendamento criado com sucesso",
              data: {
                appointmentId: appointment.id,
                clientId,
                establishmentId,
                scheduledTime: appointment.appointmentDate,
                status: appointment.status
              }
            });
          } catch (error) {
            return res.status(500).json({ error: "Erro no processamento" });
          }
        });
        return;
      }
      if (normalizedUrl.includes("/confirm") && req.method === "PUT") {
        const pathParts = normalizedUrl.split("/");
        const appointmentId = parseInt(pathParts[4]);
        if (!appointmentId) {
          return res.status(400).json({ error: "ID do agendamento \xE9 obrigat\xF3rio" });
        }
        const appointment = await storage2.getAppointmentById(appointmentId);
        if (!appointment) {
          return res.status(404).json({ error: "Agendamento n\xE3o encontrado" });
        }
        const updatedAppointment = await storage2.updateAppointmentStatus(appointmentId, "confirmado", appointment.establishmentId);
        return res.json({
          success: true,
          message: "Agendamento confirmado com sucesso",
          data: {
            appointmentId: updatedAppointment.id,
            status: updatedAppointment.status,
            confirmedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        });
      }
      if (normalizedUrl.includes("/staff-available-days-month") && req.method === "GET") {
        const pathParts = normalizedUrl.split("?")[0].split("/");
        const establishmentId = parseInt(pathParts[3]);
        const { staffId, month, year } = req.query;
        if (!establishmentId || isNaN(establishmentId)) {
          return res.status(400).json({
            error: "ID do estabelecimento inv\xE1lido",
            pathParts
          });
        }
        if (!staffId || !month || !year) {
          return res.status(400).json({
            error: "Par\xE2metros staffId, month e year s\xE3o obrigat\xF3rios",
            example: "/api/n8n/establishment/9/staff-available-days-month?staffId=11&month=8&year=2025"
          });
        }
        const targetStaffId = parseInt(staffId);
        const targetMonth = parseInt(month);
        const targetYear = parseInt(year);
        if (isNaN(targetStaffId) || isNaN(targetMonth) || isNaN(targetYear)) {
          return res.status(400).json({
            error: "Par\xE2metros devem ser n\xFAmeros v\xE1lidos",
            received: { staffId, month, year }
          });
        }
        if (targetMonth < 1 || targetMonth > 12) {
          return res.status(400).json({
            error: "M\xEAs deve estar entre 1 e 12"
          });
        }
        const staffWorkingHours3 = await storage2.getStaffWorkingHours(targetStaffId, establishmentId);
        if (!staffWorkingHours3 || staffWorkingHours3.length === 0) {
          return res.json({
            staffId: targetStaffId,
            establishmentId,
            month: targetMonth,
            year: targetYear,
            availableDays: [],
            message: "Profissional n\xE3o possui hor\xE1rios configurados"
          });
        }
        const workingDays = /* @__PURE__ */ new Set();
        staffWorkingHours3.forEach((hour) => {
          if (hour.isAvailable) {
            workingDays.add(hour.dayOfWeek);
          }
        });
        const availableDays = [];
        const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
        const now = /* @__PURE__ */ new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        for (let day = 1; day <= daysInMonth; day++) {
          const currentDate = new Date(targetYear, targetMonth - 1, day);
          const dayOfWeek = currentDate.getDay();
          if (currentDate < today) {
            continue;
          }
          if (workingDays.has(dayOfWeek)) {
            const workingHour = staffWorkingHours3.find((h) => h.dayOfWeek === dayOfWeek);
            availableDays.push({
              date: currentDate.toISOString().split("T")[0],
              // YYYY-MM-DD
              dayOfWeek,
              dayName: ["Domingo", "Segunda", "Ter\xE7a", "Quarta", "Quinta", "Sexta", "S\xE1bado"][dayOfWeek],
              openTime: workingHour?.openTime || "",
              closeTime: workingHour?.closeTime || "",
              available: true
            });
          }
        }
        return res.json({
          staffId: targetStaffId,
          establishmentId,
          month: targetMonth,
          year: targetYear,
          availableDays,
          totalDays: availableDays.length
        });
      }
      if (normalizedUrl.includes("/api/n8n/staff-days") && req.method === "GET") {
        const { establishmentId, staffId } = req.query;
        if (!establishmentId || isNaN(parseInt(establishmentId))) {
          return res.status(400).json({
            error: "Par\xE2metro establishmentId \xE9 obrigat\xF3rio",
            example: "/api/n8n/staff-days?establishmentId=9&staffId=11"
          });
        }
        if (!staffId || isNaN(parseInt(staffId))) {
          return res.status(400).json({
            error: "Par\xE2metro staffId \xE9 obrigat\xF3rio",
            example: "/api/n8n/staff-days?establishmentId=9&staffId=11"
          });
        }
        const targetEstablishmentId = parseInt(establishmentId);
        const targetStaffId = parseInt(staffId);
        const staffWorkingHours3 = await storage2.getStaffWorkingHours(targetStaffId, targetEstablishmentId);
        if (!staffWorkingHours3 || staffWorkingHours3.length === 0) {
          return res.json({
            staffId: targetStaffId,
            establishmentId: targetEstablishmentId,
            workingDays: [],
            message: "Profissional n\xE3o possui hor\xE1rios configurados"
          });
        }
        const workingDays = staffWorkingHours3.filter((hour) => hour.isAvailable).map((hour) => ({
          dayOfWeek: hour.dayOfWeek,
          dayName: ["Domingo", "Segunda", "Ter\xE7a", "Quarta", "Quinta", "Sexta", "S\xE1bado"][hour.dayOfWeek],
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          available: true
        })).sort((a, b) => a.dayOfWeek - b.dayOfWeek);
        return res.json({
          staffId: targetStaffId,
          establishmentId: targetEstablishmentId,
          workingDays,
          totalWorkingDays: workingDays.length
        });
      }
      if (normalizedUrl.includes("/api/n8n/staff-available-days") && req.method === "GET") {
        const { establishmentId, staffId, month, year } = req.query;
        if (!establishmentId || isNaN(parseInt(establishmentId))) {
          return res.status(400).json({
            error: "Par\xE2metro establishmentId \xE9 obrigat\xF3rio",
            example: "/api/n8n/staff-available-days?establishmentId=9&staffId=11&month=8&year=2025"
          });
        }
        if (!staffId || isNaN(parseInt(staffId))) {
          return res.status(400).json({
            error: "Par\xE2metro staffId \xE9 obrigat\xF3rio",
            example: "/api/n8n/staff-available-days?establishmentId=9&staffId=11&month=8&year=2025"
          });
        }
        if (!month || isNaN(parseInt(month)) || parseInt(month) < 1 || parseInt(month) > 12) {
          return res.status(400).json({
            error: "Par\xE2metro month \xE9 obrigat\xF3rio (1-12)",
            example: "/api/n8n/staff-available-days?establishmentId=9&staffId=11&month=8&year=2025"
          });
        }
        if (!year || isNaN(parseInt(year))) {
          return res.status(400).json({
            error: "Par\xE2metro year \xE9 obrigat\xF3rio",
            example: "/api/n8n/staff-available-days?establishmentId=9&staffId=11&month=8&year=2025"
          });
        }
        const targetEstablishmentId = parseInt(establishmentId);
        const targetStaffId = parseInt(staffId);
        const targetMonth = parseInt(month);
        const targetYear = parseInt(year);
        const staffWorkingHours3 = await storage2.getStaffWorkingHours(targetStaffId, targetEstablishmentId);
        if (!staffWorkingHours3 || staffWorkingHours3.length === 0) {
          return res.json({
            staffId: targetStaffId,
            establishmentId: targetEstablishmentId,
            availableDays: [],
            message: "Profissional n\xE3o possui hor\xE1rios configurados"
          });
        }
        const establishment = await storage2.getEstablishment(targetEstablishmentId);
        const establishmentTimezone = establishment?.timezone || "America/Sao_Paulo";
        const now = /* @__PURE__ */ new Date();
        const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: establishmentTimezone }));
        const today = new Date(brazilTime);
        today.setHours(0, 0, 0, 0);
        const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { sql: sql4 } = await import("drizzle-orm");
        const staffVacationsQuery = await db2.execute(sql4`
          SELECT start_date, end_date 
          FROM staff_vacations 
          WHERE establishment_id = ${targetEstablishmentId} 
            AND staff_id = ${targetStaffId} 
            AND is_active = true
        `);
        const staffVacationsData = staffVacationsQuery.rows;
        const requestedMonth = `${targetYear}-${String(targetMonth).padStart(2, "0")}`;
        let monthIsReleased = true;
        if (targetEstablishmentId !== 2) {
          const { agendaReleasePolicies: agendaReleasePolicies2, agendaReleases: agendaReleases2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
          const { eq: eq3, desc: desc2, and: and3 } = await import("drizzle-orm");
          const [policy] = await db2.select().from(agendaReleasePolicies2).where(and3(
            eq3(agendaReleasePolicies2.establishmentId, targetEstablishmentId),
            eq3(agendaReleasePolicies2.isActive, true)
          ));
          if (policy && policy.isActive) {
            const releases = await db2.select().from(agendaReleases2).where(eq3(agendaReleases2.establishmentId, targetEstablishmentId)).orderBy(desc2(agendaReleases2.releaseDate));
            const availableMonths = /* @__PURE__ */ new Set();
            for (const release of releases) {
              for (const month2 of release.releasedMonths) {
                availableMonths.add(month2);
              }
            }
            monthIsReleased = availableMonths.has(requestedMonth);
          }
          if (!monthIsReleased) {
            return res.json({
              staffId: targetStaffId,
              establishmentId: targetEstablishmentId,
              month: targetMonth,
              year: targetYear,
              availableDays: [],
              totalAvailableDays: 0,
              message: `M\xEAs ${requestedMonth} n\xE3o foi liberado para agendamentos ainda`
            });
          }
        }
        const availableDays = [];
        const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          const currentDate = new Date(targetYear, targetMonth - 1, day);
          const dayOfWeek = currentDate.getDay();
          const nowBrazil = new Date((/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
          const todayBrazil = new Date(nowBrazil.getFullYear(), nowBrazil.getMonth(), nowBrazil.getDate());
          const currentDateOnly = new Date(currentDate);
          currentDateOnly.setHours(0, 0, 0, 0);
          if (currentDateOnly >= todayBrazil) {
            const staffHour = staffWorkingHours3.find(
              (hour) => hour.dayOfWeek === dayOfWeek && hour.isAvailable
            );
            if (staffHour) {
              const dateStr = currentDate.toISOString().split("T")[0];
              const isOnVacation = staffVacationsData.some((vacation) => {
                const vacationStart = new Date(vacation.start_date);
                const vacationEnd = new Date(vacation.end_date);
                const checkDate = new Date(dateStr);
                vacationStart.setHours(0, 0, 0, 0);
                vacationEnd.setHours(23, 59, 59, 999);
                checkDate.setHours(12, 0, 0, 0);
                return checkDate >= vacationStart && checkDate <= vacationEnd;
              });
              let available = false;
              if (!isOnVacation) {
                const nowBrazil2 = new Date((/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
                const todayBrazil2 = nowBrazil2.toISOString().split("T")[0];
                const isToday = dateStr === todayBrazil2;
                if (isToday) {
                  const currentMinutes = nowBrazil2.getHours() * 60 + nowBrazil2.getMinutes();
                  const [closeHour] = staffHour.closeTime?.split(":").map(Number) || [0];
                  const closeMinutes = closeHour * 60;
                  const timeLeft = closeMinutes - currentMinutes;
                  available = timeLeft >= 30;
                } else if (dateStr > todayBrazil2) {
                  available = true;
                }
              }
              availableDays.push({
                date: dateStr,
                dayOfWeek,
                dayName: ["Domingo", "Segunda", "Ter\xE7a", "Quarta", "Quinta", "Sexta", "S\xE1bado"][dayOfWeek],
                openTime: staffHour.openTime,
                closeTime: staffHour.closeTime,
                businessOpenTime: staffHour.openTime,
                businessCloseTime: staffHour.closeTime,
                staffOpenTime: staffHour.openTime,
                staffCloseTime: staffHour.closeTime,
                available
              });
            }
          }
        }
        return res.json({
          staffId: targetStaffId,
          establishmentId: targetEstablishmentId,
          month: targetMonth,
          year: targetYear,
          availableDays,
          totalAvailableDays: availableDays.length,
          message: availableDays.length === 0 ? "N\xE3o h\xE1 dias com hor\xE1rios compat\xEDveis no m\xEAs selecionado" : "Endpoint limpo - Campo available com l\xF3gica nova"
        });
      }
      if (normalizedUrl.includes("/available-days-month") && req.method === "GET") {
        const urlParts = normalizedUrl.split("/");
        const establishmentIdIndex = urlParts.indexOf("establishment") + 1;
        const staffIdIndex = urlParts.indexOf("staff") + 1;
        if (establishmentIdIndex <= 0 || staffIdIndex <= 0) {
          return res.status(400).json({
            error: "URL malformada",
            expected: "/api/n8n/establishment/:establishmentId/staff/:staffId/available-days-month?month=X&year=Y"
          });
        }
        const establishmentId = parseInt(urlParts[establishmentIdIndex]);
        const staffId = parseInt(urlParts[staffIdIndex]);
        const { month, year } = req.query;
        if (!month || !year) {
          return res.status(400).json({
            error: "Par\xE2metros month e year s\xE3o obrigat\xF3rios",
            example: "/api/n8n/establishment/9/staff/11/available-days-month?month=8&year=2025"
          });
        }
        const targetMonth = parseInt(month);
        const targetYear = parseInt(year);
        if (targetMonth < 1 || targetMonth > 12) {
          return res.status(400).json({
            error: "M\xEAs deve estar entre 1 e 12"
          });
        }
        const staffWorkingHours3 = await storage2.getStaffWorkingHours(staffId, establishmentId);
        if (!staffWorkingHours3 || staffWorkingHours3.length === 0) {
          return res.json({
            staffId,
            establishmentId,
            month: targetMonth,
            year: targetYear,
            availableDays: [],
            message: "Profissional n\xE3o possui hor\xE1rios configurados"
          });
        }
        const workingDays = /* @__PURE__ */ new Set();
        staffWorkingHours3.forEach((hour) => {
          if (hour.isAvailable) {
            workingDays.add(hour.dayOfWeek);
          }
        });
        const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { staffVacations: staffVacations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const { eq: eq3, and: and3 } = await import("drizzle-orm");
        const staffVacationsData = await db2.select().from(staffVacations2).where(and3(
          eq3(staffVacations2.establishmentId, establishmentId),
          eq3(staffVacations2.staffId, staffId),
          eq3(staffVacations2.isActive, true)
        ));
        const availableDays = [];
        const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
        const now = /* @__PURE__ */ new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        for (let day = 1; day <= daysInMonth; day++) {
          const currentDate = new Date(targetYear, targetMonth - 1, day);
          const dayOfWeek = currentDate.getDay();
          if (currentDate < today) {
            continue;
          }
          if (workingDays.has(dayOfWeek)) {
            const dateStr = currentDate.toISOString().split("T")[0];
            const isOnVacation = staffVacationsData.some((vacation) => {
              const vacationStart = new Date(vacation.startDate);
              const vacationEnd = new Date(vacation.endDate);
              const checkDate = new Date(dateStr);
              vacationStart.setHours(0, 0, 0, 0);
              vacationEnd.setHours(23, 59, 59, 999);
              checkDate.setHours(12, 0, 0, 0);
              return checkDate >= vacationStart && checkDate <= vacationEnd;
            });
            if (!isOnVacation) {
              const workingHour = staffWorkingHours3.find((h) => h.dayOfWeek === dayOfWeek);
              availableDays.push({
                date: currentDate.toISOString().split("T")[0],
                // YYYY-MM-DD
                dayOfWeek,
                dayName: ["Domingo", "Segunda", "Ter\xE7a", "Quarta", "Quinta", "Sexta", "S\xE1bado"][dayOfWeek],
                openTime: workingHour?.openTime || "",
                closeTime: workingHour?.closeTime || "",
                available: true
              });
            }
          }
        }
        return res.json({
          staffId,
          establishmentId,
          month: targetMonth,
          year: targetYear,
          availableDays,
          totalDays: availableDays.length
        });
      }
      return res.status(404).json({ error: "Endpoint N8N n\xE3o encontrado" });
    } catch (error) {
      console.error("Error in N8N route:", error);
      return res.status(500).json({
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
  next();
});
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.get("/api/n8n/establishment/:id/info", async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    const establishmentId = parseInt(req.params.id);
    if (!establishmentId) {
      return res.status(400).json({ error: "ID do estabelecimento \xE9 obrigat\xF3rio" });
    }
    const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const establishment = await storage2.getEstablishment(establishmentId);
    if (!establishment) {
      return res.status(404).json({ error: "Estabelecimento n\xE3o encontrado" });
    }
    const [services2, staff2, businessHours2] = await Promise.all([
      storage2.getServices(establishmentId),
      storage2.getStaff(establishmentId),
      storage2.getBusinessHours(establishmentId)
    ]);
    res.json({
      establishment: {
        id: establishment.id,
        name: establishment.name,
        email: establishment.email,
        phone: establishment.phone,
        address: establishment.address
      },
      services: services2.map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        category: service.category
      })),
      staff: staff2.map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        specialties: member.specialties
      })),
      businessHours: businessHours2.map((hour) => ({
        dayOfWeek: hour.dayOfWeek,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
        isOpen: hour.isOpen
      }))
    });
  } catch (error) {
    console.error("Error in N8N direct route:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
app.get("/api/n8n/establishment/:id/availability", async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    const establishmentId = parseInt(req.params.id);
    const { date, staffId } = req.query;
    if (!establishmentId || !date) {
      return res.status(400).json({ error: "ID do estabelecimento e data s\xE3o obrigat\xF3rios" });
    }
    const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const [businessHours2, appointments3, staffWorkingHours3] = await Promise.all([
      storage2.getBusinessHours(establishmentId),
      storage2.getAppointments(establishmentId),
      staffId ? storage2.getStaffWorkingHours(parseInt(String(staffId)), establishmentId) : Promise.resolve([])
    ]);
    const dateStr = String(date);
    const appointmentsForDate = appointments3.filter((apt) => {
      const aptDate = new Date(apt.appointmentDate).toISOString().split("T")[0];
      return aptDate === dateStr && (!staffId || apt.staffId === parseInt(String(staffId)));
    });
    const dayOfWeek = new Date(dateStr).getDay();
    const businessHour = businessHours2.find((bh) => bh.dayOfWeek === dayOfWeek);
    if (!businessHour || !businessHour.isOpen) {
      return res.json({
        date: dateStr,
        available: false,
        establishmentId,
        staffId: staffId ? parseInt(String(staffId)) : null,
        message: "Estabelecimento fechado neste dia",
        timeSlots: []
      });
    }
    let finalOpenTime = businessHour.openTime;
    let finalCloseTime = businessHour.closeTime;
    if (staffId && staffWorkingHours3.length > 0) {
      const staffHour = staffWorkingHours3.find((swh) => swh.dayOfWeek === dayOfWeek && swh.isAvailable);
      if (!staffHour) {
        return res.json({
          date: dateStr,
          available: false,
          establishmentId,
          staffId: parseInt(String(staffId)),
          message: "Profissional n\xE3o trabalha neste dia",
          timeSlots: []
        });
      }
      finalOpenTime = businessHour.openTime && staffHour.openTime ? businessHour.openTime > staffHour.openTime ? businessHour.openTime : staffHour.openTime : businessHour.openTime || staffHour.openTime;
      finalCloseTime = businessHour.closeTime && staffHour.closeTime ? businessHour.closeTime < staffHour.closeTime ? businessHour.closeTime : staffHour.closeTime : businessHour.closeTime || staffHour.closeTime;
      if (!finalOpenTime || !finalCloseTime || finalOpenTime >= finalCloseTime) {
        return res.json({
          date: dateStr,
          available: false,
          establishmentId,
          staffId: parseInt(String(staffId)),
          message: "N\xE3o h\xE1 hor\xE1rios compat\xEDveis entre estabelecimento e profissional neste dia",
          timeSlots: []
        });
      }
    }
    const [openHour, openMinute] = finalOpenTime?.split(":").map(Number) || [0, 0];
    const [closeHour, closeMinute] = finalCloseTime?.split(":").map(Number) || [0, 0];
    const timeSlots = [];
    for (let hour = openHour; hour < closeHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === closeHour - 1 && minute >= closeMinute) break;
        const timeSlot = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const isBooked = appointmentsForDate.some((apt) => {
          const aptTime = new Date(apt.appointmentDate).toTimeString().substring(0, 5);
          return aptTime === timeSlot;
        });
        timeSlots.push({
          time: timeSlot,
          available: !isBooked
        });
      }
    }
    res.json({
      date: dateStr,
      available: true,
      establishmentId,
      staffId: staffId ? parseInt(String(staffId)) : null,
      businessHours: {
        openTime: businessHour.openTime,
        closeTime: businessHour.closeTime
      },
      staffHours: staffId && staffWorkingHours3.length > 0 ? {
        openTime: staffWorkingHours3.find((swh) => swh.dayOfWeek === dayOfWeek)?.openTime,
        closeTime: staffWorkingHours3.find((swh) => swh.dayOfWeek === dayOfWeek)?.closeTime
      } : null,
      finalHours: {
        openTime: finalOpenTime,
        closeTime: finalCloseTime
      },
      timeSlots
    });
  } catch (error) {
    console.error("Error in N8N availability route:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
app.post("/api/n8n/establishment/:id/appointment", async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    const establishmentId = parseInt(req.params.id);
    const { clientData, appointmentData } = req.body;
    if (!establishmentId || !clientData || !appointmentData) {
      return res.status(400).json({ error: "Dados obrigat\xF3rios ausentes" });
    }
    const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const establishment = await storage2.getEstablishment(establishmentId);
    if (!establishment) {
      return res.status(404).json({ error: "Estabelecimento n\xE3o encontrado" });
    }
    const clients2 = await storage2.getClients(establishmentId);
    const existingClient = clients2.find(
      (c) => c.email === clientData.email || c.phone === clientData.phone
    );
    let clientId;
    if (existingClient) {
      clientId = existingClient.id;
    } else {
      const newClient = await storage2.createClient({
        establishmentId,
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        notes: clientData.notes || ""
      });
      clientId = newClient.id;
    }
    const startTime = new Date(appointmentData.dataInicio);
    const endTime = new Date(appointmentData.dataFim);
    const hasConflict = await storage2.checkAppointmentConflict(
      appointmentData.staffId,
      startTime,
      endTime
    );
    if (hasConflict) {
      return res.status(409).json({
        error: "Hor\xE1rio j\xE1 est\xE1 ocupado",
        message: "J\xE1 existe um agendamento para este hor\xE1rio"
      });
    }
    const appointment = await storage2.createAppointment({
      establishmentId,
      clientId,
      staffId: appointmentData.staffId,
      serviceId: appointmentData.serviceId,
      appointmentDate: startTime,
      dataFim: endTime,
      duration: appointmentData.duration || 60,
      status: "agendado",
      notes: appointmentData.notes || ""
    });
    res.json({
      success: true,
      message: "Agendamento criado com sucesso",
      data: {
        appointmentId: appointment.id,
        clientId,
        establishmentId,
        scheduledTime: appointment.appointmentDate,
        status: appointment.status
      }
    });
  } catch (error) {
    console.error("Error in N8N appointment route:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
app.put("/api/n8n/appointment/:id/confirm", async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    const appointmentId = parseInt(req.params.id);
    if (!appointmentId) {
      return res.status(400).json({ error: "ID do agendamento \xE9 obrigat\xF3rio" });
    }
    const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const appointment = await storage2.getAppointmentById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: "Agendamento n\xE3o encontrado" });
    }
    const updatedAppointment = await storage2.updateAppointmentStatus(appointmentId, "confirmado", appointment.establishmentId);
    res.json({
      success: true,
      message: "Agendamento confirmado com sucesso",
      data: {
        appointmentId: updatedAppointment.id,
        status: updatedAppointment.status,
        confirmedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  } catch (error) {
    console.error("Error in N8N confirm route:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
app.get("/webhook/client-appointments/:establishmentId/:clientId", async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    const establishmentId = parseInt(req.params.establishmentId);
    const clientId = parseInt(req.params.clientId);
    if (isNaN(establishmentId) || isNaN(clientId)) {
      return res.status(400).json({
        success: false,
        error: "Establishment ID e Client ID devem ser n\xFAmeros v\xE1lidos"
      });
    }
    const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const establishment = await storage2.getEstablishment(establishmentId);
    if (!establishment) {
      return res.status(404).json({
        success: false,
        error: "Estabelecimento n\xE3o encontrado"
      });
    }
    const client = await storage2.getClient(clientId, establishmentId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: "Cliente n\xE3o encontrado neste estabelecimento"
      });
    }
    const appointments3 = await storage2.getAppointmentsByClientId(clientId, establishmentId);
    res.json({
      success: true,
      establishment_id: establishmentId,
      client_id: clientId,
      client_name: client.name,
      client_phone: client.phone,
      client_email: client.email,
      total: appointments3.length,
      appointments: appointments3.map((apt) => ({
        id: apt.id,
        appointmentDate: apt.appointmentDate,
        duration: apt.duration,
        status: apt.status,
        notes: apt.notes,
        staffId: apt.staffId,
        serviceId: apt.serviceId,
        staffName: apt.staffName,
        serviceName: apt.serviceName,
        servicePrice: apt.servicePrice,
        createdAt: apt.createdAt,
        formattedDate: new Date(apt.appointmentDate).toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        })
      }))
    });
  } catch (error) {
    console.error("Erro ao buscar agendamentos por cliente:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
var PgSession = connectPgSimple(session);
app.use(session({
  store: new PgSession({
    pool,
    tableName: "session",
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || "fallback-secret-key-only-for-dev",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    // true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1e3
    // 24 hours
  }
}));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
app.get("/sw.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.setHeader("Service-Worker-Allowed", "/");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile("client/public/sw.js", { root: process.cwd() });
});
app.get("/manifest.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile("client/public/manifest.json", { root: process.cwd() });
});
app.get("/webhook/test", (req, res) => {
  res.json({
    status: "ok",
    message: "Webhook endpoint est\xE1 funcionando",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
var webhookHandler = (req, res) => {
  res.set("Content-Type", "application/json");
  try {
    const body = req.body || {};
    const apiKey = body.apiKey || body.apikey || body.ChaveAPI;
    const instanceId = body.instanceId || body.instanceID || body["instance.instanceId"];
    const establishmentId = body.establishmentId;
    const establishmentName = body.establishmentName;
    if (!apiKey || !instanceId) {
      return res.status(400).json({
        message: "Campos obrigat\xF3rios ausentes",
        required: ["apiKey", "instanceId"],
        received: { apiKey: !!apiKey, instanceId: !!instanceId }
      });
    }
    res.json({
      success: true,
      message: "Dados recebidos com sucesso no webhook",
      data: {
        apiKey: apiKey.substring(0, 10) + "...",
        instanceId,
        establishmentId,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
app.post("/webhook/evolution/instance-data", webhookHandler);
app.use((req, res, next) => {
  if (req.path === "/api/evolution/webhook/instance-data" && req.method === "POST") {
    return webhookHandler(req, res);
  }
  next();
});
app.use("/api/n8n/*", (req, res, next) => {
  next();
});
async function setupApplication() {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  app.get("/health", async (req, res) => {
    try {
      await pool.query("SELECT 1");
      res.status(200).json({
        status: "healthy",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        database: "connected",
        session_store: "postgresql",
        environment: process.env.NODE_ENV || "development",
        uptime: process.uptime()
      });
    } catch (error) {
      res.status(503).json({
        status: "unhealthy",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app.use("/webhook/n8n-*", (req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("X-N8N-Endpoint", "true");
    const originalSend = res.send;
    const originalJson = res.json;
    res.send = function(data) {
      if (typeof data === "string" && data.includes("<!DOCTYPE html>")) {
        return originalSend.call(this, JSON.stringify({
          error: "HTML blocked",
          message: "N8N endpoint must return JSON only"
        }));
      }
      return originalSend.call(this, data);
    };
    res.json = function(data) {
      try {
        const jsonString = JSON.stringify(data);
        return originalJson.call(this, data);
      } catch (error) {
        return originalJson.call(this, {
          error: "JSON serialization failed",
          message: error instanceof Error ? error.message : "Unknown error"
        });
      }
    };
    next();
  });
  app.get("/webhook/n8n-info/:id", (req, res, next) => {
    next();
  }, async (req, res) => {
    try {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      const establishmentId = parseInt(req.params.id);
      if (!establishmentId) {
        return res.status(400).json({ error: "ID do estabelecimento \xE9 obrigat\xF3rio" });
      }
      const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const establishment = await storage2.getEstablishment(establishmentId);
      if (!establishment) {
        return res.status(404).json({ error: "Estabelecimento n\xE3o encontrado" });
      }
      const [services2, staff2, businessHours2] = await Promise.all([
        storage2.getServices(establishmentId),
        storage2.getStaff(establishmentId),
        storage2.getBusinessHours(establishmentId)
      ]);
      res.json({
        establishment: {
          id: establishment.id,
          name: establishment.name,
          email: establishment.email,
          phone: establishment.phone,
          address: establishment.address
        },
        services: services2.map((service) => ({
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration,
          category: service.category
        })),
        staff: staff2.map((member) => ({
          id: member.id,
          name: member.name,
          email: member.email,
          phone: member.phone,
          specialties: member.specialties
        })),
        businessHours: businessHours2.map((hour) => ({
          dayOfWeek: hour.dayOfWeek,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          isOpen: hour.isOpen
        }))
      });
    } catch (error) {
      console.error("Error in N8N info webhook:", error);
      res.status(500).json({
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app.get("/webhook/staff/:establishmentId", async (req, res) => {
    try {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      const establishmentId = parseInt(req.params.establishmentId);
      if (!establishmentId || isNaN(establishmentId)) {
        return res.status(400).json({
          error: "establishmentId deve ser um n\xFAmero v\xE1lido"
        });
      }
      const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const [staffMembers, services2] = await Promise.all([
        storage2.getStaff(establishmentId),
        storage2.getServices(establishmentId)
      ]);
      const staffWithServices = staffMembers.map((staffMember) => {
        const staffServices = services2.filter((service) => {
          if (!service.staffIds) return false;
          try {
            const staffIdsArray = typeof service.staffIds === "string" ? JSON.parse(service.staffIds) : service.staffIds;
            return Array.isArray(staffIdsArray) && staffIdsArray.includes(staffMember.id.toString());
          } catch (error) {
            console.error(`Erro ao parsear staffIds do servi\xE7o ${service.id}:`, service.staffIds, error);
            return false;
          }
        }).map((service) => ({
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration,
          category: service.category
        }));
        return {
          id: staffMember.id,
          establishmentId: staffMember.establishmentId,
          name: staffMember.name,
          phone: staffMember.phone,
          email: staffMember.email,
          role: staffMember.role,
          specialties: staffMember.specialties,
          salaryType: staffMember.salaryType,
          salaryAmount: staffMember.salaryAmount,
          commissionRate: staffMember.commissionRate,
          isAvailable: staffMember.isAvailable,
          isActive: staffMember.isActive,
          hasSystemAccess: staffMember.hasSystemAccess,
          createdAt: staffMember.createdAt,
          services: staffServices,
          totalServices: staffServices.length
        };
      });
      res.json({
        success: true,
        data: staffWithServices,
        count: staffWithServices.length,
        establishmentId
      });
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app.get("/webhook/client/:establishmentId/:phone", async (req, res) => {
    try {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      const establishmentId = parseInt(req.params.establishmentId);
      const phone = req.params.phone;
      if (!establishmentId || isNaN(establishmentId)) {
        return res.status(400).json({
          error: "establishmentId deve ser um n\xFAmero v\xE1lido"
        });
      }
      if (!phone) {
        return res.status(400).json({
          error: "Telefone \xE9 obrigat\xF3rio"
        });
      }
      const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const establishment = await storage2.getEstablishment(establishmentId);
      if (!establishment) {
        return res.status(404).json({ error: "Estabelecimento n\xE3o encontrado" });
      }
      const clients2 = await storage2.getClients(establishmentId);
      const client = clients2.find((c) => c.phone === phone);
      if (!client) {
        return res.status(404).json({
          error: "Cliente n\xE3o encontrado",
          message: `Nenhum cliente encontrado com o telefone ${phone} no estabelecimento ${establishmentId}`
        });
      }
      let etapa = null;
      let ultimoAgendamentoTemp = null;
      try {
      } catch (error) {
      }
      res.json({
        success: true,
        data: {
          clientId: client.id,
          name: client.name,
          phone: client.phone,
          email: client.email,
          establishmentId: client.establishmentId,
          notes: client.notes,
          totalSpent: client.totalSpent,
          lastVisit: client.lastVisit,
          createdAt: client.createdAt,
          etapa,
          ultimoAgendamentoTempId: ultimoAgendamentoTemp ? ultimoAgendamentoTemp.id : null
        }
      });
    } catch (error) {
      console.error("Error fetching client by phone:", error);
      res.status(500).json({
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app.post("/webhook/appointment/:establishmentId", async (req, res) => {
    try {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      const establishmentId = parseInt(req.params.establishmentId);
      const { clientId, staffId, serviceId, appointmentDate, appointmentTime, notes } = req.body;
      if (!establishmentId || isNaN(establishmentId)) {
        return res.status(400).json({
          error: "establishmentId deve ser um n\xFAmero v\xE1lido"
        });
      }
      if (!clientId || !staffId || !serviceId || !appointmentDate || !appointmentTime) {
        return res.status(400).json({
          error: "Campos obrigat\xF3rios: clientId, staffId, serviceId, appointmentDate, appointmentTime"
        });
      }
      const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const establishment = await storage2.getEstablishment(establishmentId);
      if (!establishment) {
        return res.status(404).json({ error: "Estabelecimento n\xE3o encontrado" });
      }
      const client = await storage2.getClient(parseInt(clientId), establishmentId);
      if (!client) {
        return res.status(404).json({ error: "Cliente n\xE3o encontrado" });
      }
      const staffMember = await storage2.getStaffMember(parseInt(staffId), establishmentId);
      if (!staffMember) {
        return res.status(404).json({ error: "Profissional n\xE3o encontrado" });
      }
      const service = await storage2.getService(parseInt(serviceId), establishmentId);
      if (!service) {
        return res.status(404).json({ error: "Servi\xE7o n\xE3o encontrado" });
      }
      const appointmentDateTime = /* @__PURE__ */ new Date(`${appointmentDate}T${appointmentTime}:00.000Z`);
      const existingAppointments = await storage2.getAppointments(establishmentId);
      const conflictingAppointment = existingAppointments.find((apt) => {
        const aptStart = new Date(apt.appointmentDate);
        const aptEnd = new Date(aptStart.getTime() + apt.duration * 6e4);
        const newAptEnd = new Date(appointmentDateTime.getTime() + service.duration * 6e4);
        return apt.staffId === parseInt(staffId) && (appointmentDateTime >= aptStart && appointmentDateTime < aptEnd || newAptEnd > aptStart && newAptEnd <= aptEnd || appointmentDateTime <= aptStart && newAptEnd >= aptEnd);
      });
      if (conflictingAppointment) {
        return res.status(409).json({
          error: "Conflito de hor\xE1rio: j\xE1 existe um agendamento para este profissional neste hor\xE1rio",
          conflictingAppointment: {
            id: conflictingAppointment.id,
            date: conflictingAppointment.appointmentDate,
            clientId: conflictingAppointment.clientId
          }
        });
      }
      const newAppointment = await storage2.createAppointment({
        establishmentId,
        clientId: parseInt(clientId),
        staffId: parseInt(staffId),
        serviceId: parseInt(serviceId),
        appointmentDate: appointmentDateTime,
        duration: service.duration,
        status: "confirmed",
        notes: notes || null
      });
      res.status(201).json({
        success: true,
        message: "Agendamento criado com sucesso",
        data: {
          id: newAppointment.id,
          establishmentId,
          clientId: parseInt(clientId),
          clientName: client.name,
          staffId: parseInt(staffId),
          staffName: staffMember.name,
          serviceId: parseInt(serviceId),
          serviceName: service.name,
          servicePrice: service.price,
          serviceDuration: service.duration,
          appointmentDate: appointmentDateTime.toISOString(),
          appointmentDateFormatted: appointmentDateTime.toLocaleString("pt-BR", {
            timeZone: "America/Sao_Paulo",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }),
          status: "confirmed",
          notes: notes || null,
          createdAt: newAppointment.createdAt
        }
      });
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app.get("/webhook/n8n-availability/:id", async (req, res) => {
    try {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      const establishmentId = parseInt(req.params.id);
      const { date, staffId } = req.query;
      if (!establishmentId || !date) {
        return res.status(400).json({ error: "ID do estabelecimento e data s\xE3o obrigat\xF3rios" });
      }
      const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const [businessHours2, appointments3] = await Promise.all([
        storage2.getBusinessHours(establishmentId),
        storage2.getAppointments(establishmentId)
      ]);
      const dateStr = String(date);
      const appointmentsForDate = appointments3.filter((apt) => {
        const aptDate = new Date(apt.appointmentDate).toISOString().split("T")[0];
        return aptDate === dateStr && (!staffId || apt.staffId === parseInt(String(staffId)));
      });
      const dayOfWeek = new Date(dateStr).getDay();
      const businessHour = businessHours2.find((bh) => bh.dayOfWeek === dayOfWeek);
      if (!businessHour || !businessHour.isOpen) {
        return res.json({
          date: dateStr,
          available: false,
          establishmentId,
          staffId: staffId ? parseInt(String(staffId)) : null,
          message: "Estabelecimento fechado neste dia",
          timeSlots: []
        });
      }
      const [openHour, openMinute] = businessHour.openTime?.split(":").map(Number) || [0, 0];
      const [closeHour, closeMinute] = businessHour.closeTime?.split(":").map(Number) || [0, 0];
      const timeSlots = [];
      const currentBrazilTime = /* @__PURE__ */ new Date();
      const brazilOffset = -3;
      const utcTime = currentBrazilTime.getTime() + currentBrazilTime.getTimezoneOffset() * 6e4;
      const currentSaoPauloTime = new Date(utcTime + brazilOffset * 36e5);
      let currentSlotHour = openHour;
      let currentSlotMinute = openMinute;
      while (currentSlotHour < closeHour || currentSlotHour === closeHour && currentSlotMinute < closeMinute) {
        const timeSlot = `${currentSlotHour.toString().padStart(2, "0")}:${currentSlotMinute.toString().padStart(2, "0")}`;
        const slotStart = /* @__PURE__ */ new Date(`${dateStr}T${timeSlot}:00`);
        const slotEnd = new Date(slotStart.getTime() + 60 * 6e4);
        const isPastTime = slotStart <= currentSaoPauloTime;
        const hasConflict = appointmentsForDate.some((apt) => {
          const aptStart = new Date(apt.appointmentDate);
          const aptDuration = apt.duration || 30;
          const aptEnd = new Date(aptStart.getTime() + aptDuration * 6e4);
          return slotStart < aptEnd && slotEnd > aptStart;
        });
        const slotEndHour = slotEnd.getHours();
        const slotEndMinute = slotEnd.getMinutes();
        const finishesBeforeClose = slotEndHour < closeHour || slotEndHour === closeHour && slotEndMinute <= closeMinute;
        if (finishesBeforeClose) {
          timeSlots.push({
            time: timeSlot,
            available: !isPastTime && !hasConflict,
            isPast: isPastTime,
            isBooked: !isPastTime && hasConflict
          });
        }
        currentSlotMinute += 10;
        if (currentSlotMinute >= 60) {
          currentSlotMinute = 0;
          currentSlotHour++;
        }
      }
      res.json({
        date: dateStr,
        available: true,
        establishmentId,
        staffId: staffId ? parseInt(String(staffId)) : null,
        timeSlots
      });
    } catch (error) {
      console.error("Error in N8N availability webhook:", error);
      res.status(500).json({
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app.post("/webhook/n8n-appointment/:id", express2.json(), async (req, res) => {
    try {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      const establishmentId = parseInt(req.params.id);
      const { clientData, appointmentData } = req.body;
      if (!establishmentId || !clientData || !appointmentData) {
        return res.status(400).json({ error: "Dados obrigat\xF3rios ausentes" });
      }
      const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const establishment = await storage2.getEstablishment(establishmentId);
      if (!establishment) {
        return res.status(404).json({ error: "Estabelecimento n\xE3o encontrado" });
      }
      const clients2 = await storage2.getClients(establishmentId);
      const existingClient = clients2.find(
        (c) => c.email === clientData.email || c.phone === clientData.phone
      );
      let clientId;
      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const newClient = await storage2.createClient({
          establishmentId,
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          notes: clientData.notes || ""
        });
        clientId = newClient.id;
      }
      const startTime = new Date(appointmentData.dataInicio);
      const endTime = new Date(appointmentData.dataFim);
      const hasConflict = await storage2.checkAppointmentConflict(
        appointmentData.staffId,
        startTime,
        endTime
      );
      if (hasConflict) {
        return res.status(409).json({
          error: "Hor\xE1rio j\xE1 est\xE1 ocupado",
          message: "J\xE1 existe um agendamento para este hor\xE1rio"
        });
      }
      const appointment = await storage2.createAppointment({
        establishmentId,
        clientId,
        staffId: appointmentData.staffId,
        serviceId: appointmentData.serviceId,
        appointmentDate: startTime,
        dataFim: endTime,
        duration: appointmentData.duration || 60,
        status: "agendado",
        notes: appointmentData.notes || ""
      });
      res.json({
        success: true,
        message: "Agendamento criado com sucesso",
        data: {
          appointmentId: appointment.id,
          clientId,
          establishmentId,
          scheduledTime: appointment.appointmentDate,
          status: appointment.status
        }
      });
    } catch (error) {
      console.error("Error in N8N appointment webhook:", error);
      res.status(500).json({
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app.put("/webhook/n8n-confirm/:id", express2.json(), async (req, res) => {
    try {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      const appointmentId = parseInt(req.params.id);
      if (!appointmentId) {
        return res.status(400).json({ error: "ID do agendamento \xE9 obrigat\xF3rio" });
      }
      const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const appointment = await storage2.getAppointmentById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ error: "Agendamento n\xE3o encontrado" });
      }
      const updatedAppointment = await storage2.updateAppointmentStatus(appointmentId, "confirmado", appointment.establishmentId);
      res.json({
        success: true,
        message: "Agendamento confirmado com sucesso",
        data: {
          appointmentId: updatedAppointment.id,
          status: updatedAppointment.status,
          confirmedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
    } catch (error) {
      console.error("Error in N8N confirm webhook:", error);
      res.status(500).json({
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app.get("/webhook/n8n-establishment-lookup/:instanceId", async (req, res) => {
    let responseSent = false;
    const sendResponse = (statusCode, data) => {
      if (responseSent) {
        return;
      }
      responseSent = true;
      res.status(statusCode);
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.end(JSON.stringify(data));
    };
    try {
      const instanceId = req.params.instanceId;
      if (!instanceId || instanceId === "instanceId") {
        return sendResponse(400, {
          error: "instance_id \xE9 obrigat\xF3rio",
          message: "Use um instance_id v\xE1lido, n\xE3o 'instanceId'"
        });
      }
      const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const webhookData2 = await storage2.getN8nWebhookDataByInstanceId(instanceId);
      if (!webhookData2) {
        return sendResponse(404, {
          error: "Instance ID n\xE3o encontrado",
          message: "Nenhum estabelecimento encontrado para este instance_id"
        });
      }
      const establishmentData = {
        instance_id: instanceId,
        establishment_id: webhookData2.establishmentId,
        establishment_name: webhookData2.establishmentName,
        api_key: webhookData2.apiKey,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        source: "establishment_lookup"
      };
      const responseData = {
        success: true,
        message: "Establishment ID encontrado e enviado para N8N",
        data: {
          instance_id: instanceId,
          establishment_id: webhookData2.establishmentId,
          establishment_name: webhookData2.establishmentName || "",
          api_key: webhookData2.apiKey ? webhookData2.apiKey.substring(0, 8) + "..." : "",
          found_at: webhookData2.createdAt
        }
      };
      sendResponse(200, responseData);
    } catch (error) {
      console.error("Error in establishment lookup:", error);
      sendResponse(500, {
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app.get("/webhook/n8n-check-phone/:establishmentId/:phone", (req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    next();
  }, async (req, res) => {
    try {
      const establishmentId = parseInt(req.params.establishmentId);
      const phone = req.params.phone;
      if (!establishmentId || !phone) {
        return res.status(400).json({ error: "establishment_id e phone s\xE3o obrigat\xF3rios" });
      }
      const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const exists = await storage2.checkClientPhoneExists(phone, establishmentId);
      return res.json({
        exists
      });
    } catch (error) {
      console.error("Error in N8N check phone:", error);
      return res.status(500).json({
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app.post("/webhook/n8n-create-client", (req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    next();
  }, async (req, res) => {
    try {
      const { establishment_id, name, phone } = req.body;
      if (!establishment_id || !name || !phone) {
        return res.status(400).json({
          error: "Campos obrigat\xF3rios ausentes",
          required: ["establishment_id", "name", "phone"],
          received: { establishment_id: !!establishment_id, name: !!name, phone: !!phone }
        });
      }
      const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const establishment = await storage2.getEstablishment(establishment_id);
      if (!establishment) {
        return res.status(404).json({
          error: "Estabelecimento n\xE3o encontrado",
          message: `Estabelecimento com ID ${establishment_id} n\xE3o existe`
        });
      }
      const existingClient = await storage2.checkClientPhoneExists(phone, establishment_id);
      if (existingClient) {
        return res.status(409).json({
          error: "Cliente j\xE1 existe",
          message: `J\xE1 existe um cliente com o telefone ${phone} neste estabelecimento`
        });
      }
      const newClient = await storage2.createClient({
        establishmentId: establishment_id,
        name,
        phone,
        email: null
        // Campo opcional
      });
      return res.status(201).json({
        success: true,
        message: "Cliente criado com sucesso",
        data: {
          id: newClient.id,
          name: newClient.name,
          phone: newClient.phone,
          email: newClient.email,
          establishmentId: newClient.establishmentId,
          createdAt: newClient.createdAt
        }
      });
    } catch (error) {
      console.error("Error in N8N create client:", error);
      return res.status(500).json({
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app.get("/webhook/n8n-test", (req, res) => {
    const testData = {
      success: true,
      message: "N8N endpoints funcionando corretamente",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      endpoints: [
        "GET /webhook/n8n-info/:id",
        "GET /webhook/n8n-availability/:id",
        "POST /webhook/n8n-appointment/:id",
        "PUT /webhook/n8n-confirm/:id",
        "GET /webhook/n8n-establishment-lookup/:instanceId",
        "GET /webhook/n8n-check-phone/:establishmentId/:phone",
        "POST /webhook/n8n-create-client"
      ]
    };
    res.status(200);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(testData));
  });
  app.get("/webhook/n8n-simple-test/:instanceId", async (req, res) => {
    const simpleResponse = {
      test: true,
      instance_id: req.params.instanceId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      message: "Simple test successful"
    };
    res.status(200);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.end(JSON.stringify(simpleResponse));
  });
  app.get("/webhook/n8n-debug-lookup/:instanceId", async (req, res) => {
    try {
      const instanceId = req.params.instanceId;
      const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const webhookData2 = await storage2.getN8nWebhookDataByInstanceId(instanceId);
      if (!webhookData2) {
        const errorResponse = {
          error: "Instance ID n\xE3o encontrado",
          instanceId,
          debug: true
        };
        res.status(404);
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(errorResponse));
        return;
      }
      const debugResponse = {
        debug: true,
        instance_id: instanceId,
        establishment_id: webhookData2.establishmentId,
        establishment_name: webhookData2.establishmentName || "N/A",
        api_key_preview: webhookData2.apiKey ? webhookData2.apiKey.substring(0, 8) + "..." : "N/A",
        created_at: webhookData2.createdAt,
        raw_data: {
          id: webhookData2.id,
          qrCodeBase64: webhookData2.qrCodeBase64 ? "exists" : "null"
        }
      };
      res.status(200);
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(debugResponse));
    } catch (error) {
      console.error("\u274C DEBUG: Erro capturado:", error);
      const errorResponse = {
        debug: true,
        error: "Erro interno",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : void 0
      };
      res.status(500);
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(errorResponse));
    }
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    console.log(`\u2705 Server listening on port ${port}`);
    console.log(`\u{1F4CA} Health check available at http://localhost:${port}/health`);
    log(`serving on port ${port}`);
  });
  process.on("SIGTERM", async () => {
    console.log("\u{1F6D1} SIGTERM received, shutting down gracefully...");
    await closeDatabase();
    process.exit(0);
  });
  process.on("SIGINT", async () => {
    console.log("\u{1F6D1} SIGINT received, shutting down gracefully...");
    await closeDatabase();
    process.exit(0);
  });
}
startServer().catch((error) => {
  console.error("\u{1F4A5} Fatal server error:", error);
  process.exit(1);
});
export {
  updateWebhookData,
  webhookData
};
