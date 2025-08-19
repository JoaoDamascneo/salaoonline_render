import {
  establishments,
  users,
  clients,
  staff,
  services,
  serviceCategories,
  appointments,
  products,
  transactions,
  businessSettings,
  businessHours,
  plans,
  n8nIntegrations,
  webhookLogs,
  evolutionApiConnections,
  n8nWebhookData,
  notifications,
  staffWorkingHours,
  staffVacations,
  loyaltyPrograms,
  loyaltyProgramServices,
  clientLoyaltyPoints,
  loyaltyPointTransactions,
  type Establishment,
  type InsertEstablishment,
  type User,
  type InsertUser,
  type Client,
  type InsertClient,
  type Staff,
  type InsertStaff,
  type Service,
  type InsertService,
  type ServiceCategory,
  type InsertServiceCategory,
  type Appointment,
  type InsertAppointment,
  type Product,
  type InsertProduct,
  type Transaction,
  type InsertTransaction,
  type BusinessSettings,
  type InsertBusinessSettings,
  type BusinessHours,
  type InsertBusinessHours,
  type Plan,
  type InsertPlan,
  type N8nIntegration,
  type InsertN8nIntegration,
  type WebhookLog,
  type InsertWebhookLog,
  type EvolutionApiConnection,
  type InsertEvolutionApiConnection,
  type N8nWebhookData,
  type InsertN8nWebhookData,
  type Notification,
  type InsertNotification,
  type StaffWorkingHours,
  type InsertStaffWorkingHours,
  type LoyaltyProgram,
  type InsertLoyaltyProgram,
  type LoyaltyProgramService,
  type InsertLoyaltyProgramService,
  type ClientLoyaltyPoints,
  type InsertClientLoyaltyPoints,
  type LoyaltyPointTransaction,
  type InsertLoyaltyPointTransaction,
  agendaReleasePolicies,
  agendaReleases,
  type AgendaReleasePolicy,
  type InsertAgendaReleasePolicy,
  type AgendaRelease,
  type InsertAgendaRelease,

} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, gt, sql, like, desc, or, count } from "drizzle-orm";
import bcrypt from "bcrypt";


// Interface for storage operations
export interface IStorage {
  // Establishment operations
  getEstablishment(id: number): Promise<Establishment | undefined>;
  getEstablishmentByEmail(email: string): Promise<Establishment | undefined>;
  createEstablishment(establishment: InsertEstablishment): Promise<Establishment>;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Client operations
  getClients(establishmentId: number): Promise<Client[]>;
  getClient(id: number, establishmentId: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>, establishmentId: number): Promise<Client>;
  deleteClient(id: number, establishmentId: number): Promise<void>;
  searchClients(query: string, establishmentId: number): Promise<Client[]>;
  checkClientPhoneExists(phone: string, establishmentId: number): Promise<boolean>;

  // Staff operations
  getStaff(establishmentId: number): Promise<Staff[]>;
  getStaffMember(id: number, establishmentId: number): Promise<Staff | undefined>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: number, staff: Partial<InsertStaff>, establishmentId: number): Promise<Staff>;
  deleteStaff(id: number): Promise<void>;

  // Service operations
  getServices(establishmentId: number): Promise<Service[]>;
  getService(id: number, establishmentId: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>, establishmentId: number): Promise<Service>;
  deleteService(id: number, establishmentId: number): Promise<void>;

  // Service Category operations
  getServiceCategories(establishmentId: number): Promise<ServiceCategory[]>;
  getServiceCategory(id: number, establishmentId: number): Promise<ServiceCategory | undefined>;
  createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory>;
  deleteServiceCategory(id: number, establishmentId: number): Promise<void>;

  // Appointment operations
  getAppointments(establishmentId: number): Promise<any[]>;
  getAppointment(id: number, establishmentId: number): Promise<Appointment | undefined>;
  getAppointmentById(id: number): Promise<Appointment | undefined>; // For N8N endpoints
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment>;
  deleteAppointment(id: number): Promise<void>;
  getTodaysAppointments(establishmentId: number): Promise<any[]>;
  getPendingAppointments(establishmentId: number): Promise<any[]>;
  updateAppointmentStatus(id: number, status: string, establishmentId: number): Promise<Appointment>;
  getRecentAppointments(establishmentId: number): Promise<any[]>;

  // Product operations
  getProducts(establishmentId: number): Promise<Product[]>;
  getProduct(id: number, establishmentId: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>, establishmentId: number): Promise<Product>;
  deleteProduct(id: number, establishmentId: number): Promise<void>;

  // Transaction operations
  getTransactions(establishmentId: number): Promise<any[]>;
  getTransactionsByDate(establishmentId: number, date: string): Promise<any[]>;
  getPaginatedTransactions(establishmentId: number, offset: number, limit: number): Promise<{transactions: any[], total: number}>;
  getPaginatedTransactionsForStaff(establishmentId: number, staffId: number, offset: number, limit: number): Promise<{transactions: any[], total: number}>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  deleteTransaction(id: number): Promise<void>;
  getRevenueStats(): Promise<any>;
  getFinancialStats(establishmentId: number): Promise<any>;
  getFinancialStatsForStaff(establishmentId: number, staffId: number): Promise<any>;

  // Dashboard operations
  getDashboardStats(establishmentId: number): Promise<any>;

  // Appointment conflict checking
  checkAppointmentConflict(staffId: number, dataInicio: Date, dataFim: Date): Promise<boolean>;
  
  // Monthly appointment limit checking
  getMonthlyAppointmentCount(establishmentId: number, year: number, month: number): Promise<number>;
  checkMonthlyAppointmentLimit(establishmentId: number): Promise<{ canCreate: boolean; currentCount: number; maxCount: number | null }>;

  // Plan operations
  getPlan(planId: number): Promise<any>;
  
  // Get appointments for availability checking
  getAppointmentsRaw(): Promise<Appointment[]>;
  
  // Get upcoming appointments for today
  getUpcomingTodaysAppointments(): Promise<any[]>;

  // Get all scheduled appointments
  getScheduledAppointments(): Promise<any[]>;

  // Staff working hours operations
  getStaffWorkingHours(staffId: number, establishmentId: number): Promise<StaffWorkingHours[]>;
  createStaffWorkingHours(workingHours: InsertStaffWorkingHours): Promise<StaffWorkingHours>;
  updateStaffWorkingHours(id: number, workingHours: Partial<InsertStaffWorkingHours>): Promise<StaffWorkingHours>;
  deleteStaffWorkingHours(staffId: number, establishmentId: number): Promise<void>;
  setStaffWorkingHours(staffId: number, establishmentId: number, workingHoursData: any[]): Promise<void>;

  // Business settings operations
  getBusinessSettings(establishmentId: number): Promise<BusinessSettings | undefined>;
  updateBusinessSettings(settings: Partial<InsertBusinessSettings>, establishmentId: number): Promise<BusinessSettings>;

  // Business hours operations
  getBusinessHours(establishmentId: number): Promise<BusinessHours[]>;
  updateBusinessHours(hours: InsertBusinessHours[], establishmentId: number): Promise<BusinessHours[]>;

  // Establishment operations for settings
  updateEstablishment(id: number, data: Partial<InsertEstablishment>): Promise<Establishment>;
  updateEstablishmentTimezone(establishmentId: number, timezone: string): Promise<void>;

  // User operations for security settings
  updateUserEmail(id: number, email: string): Promise<User>;
  updateUserPassword(id: number, password: string): Promise<User>;

  // Staff commission calculation
  calculateStaffCommission(staffId: number, startDate: string, endDate: string, establishmentId: number): Promise<any>;

  // Plan operations
  getPlans(): Promise<any[]>;
  getPlan(id: number): Promise<any>;
  getEstablishmentPlan(establishmentId: number): Promise<any>;
  updateEstablishmentPlan(establishmentId: number, planId: number): Promise<Establishment>;
  checkStaffLimit(establishmentId: number): Promise<{ isWithinLimit: boolean; currentCount: number; maxAllowed: number }>;
  hasFinancialAccess(establishmentId: number): Promise<boolean>;
  hasInventoryAccess(establishmentId: number): Promise<boolean>;
  hasLoyaltyAccess(establishmentId: number): Promise<boolean>;

  // N8N Integration operations
  getN8nIntegrations(establishmentId: number): Promise<N8nIntegration[]>;
  getN8nIntegration(id: number, establishmentId: number): Promise<N8nIntegration | undefined>;
  createN8nIntegration(integration: InsertN8nIntegration): Promise<N8nIntegration>;
  updateN8nIntegration(id: number, integration: Partial<InsertN8nIntegration>, establishmentId: number): Promise<N8nIntegration>;
  deleteN8nIntegration(id: number, establishmentId: number): Promise<void>;
  
  // Webhook operations
  createWebhookLog(log: InsertWebhookLog): Promise<WebhookLog>;
  getWebhookLogs(integrationId: number): Promise<WebhookLog[]>;
  
  // Webhook trigger
  triggerN8nWebhook(event: string, data: any, establishmentId: number): Promise<void>;

  // Evolution API Connection operations
  getEvolutionApiConnections(establishmentId: number): Promise<EvolutionApiConnection[]>;
  getEvolutionApiConnection(id: number, establishmentId: number): Promise<EvolutionApiConnection | undefined>;
  createEvolutionApiConnection(connection: InsertEvolutionApiConnection): Promise<EvolutionApiConnection>;
  updateEvolutionApiConnection(id: number, connection: Partial<InsertEvolutionApiConnection>, establishmentId: number): Promise<EvolutionApiConnection>;
  deleteEvolutionApiConnection(id: number, establishmentId: number): Promise<void>;
  updateConnectionStatus(id: number, status: string, qrCode?: string, errorMessage?: string): Promise<EvolutionApiConnection>;

  // N8N Webhook Data operations
  getN8nWebhookData(establishmentId: number): Promise<N8nWebhookData | undefined>;
  getN8nWebhookDataByInstanceId(instanceId: string): Promise<N8nWebhookData | undefined>;
  saveN8nWebhookData(data: InsertN8nWebhookData): Promise<N8nWebhookData>;
  updateN8nWebhookQRCode(establishmentId: number, qrCodeBase64: string): Promise<N8nWebhookData | null>;
  clearN8nWebhookData(establishmentId: number): Promise<void>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(establishmentId: number): Promise<Notification[]>;
  getUnreadNotifications(establishmentId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number, establishmentId: number): Promise<void>;
  markAllNotificationsAsRead(establishmentId: number): Promise<void>;

  // Loyalty Program operations
  getLoyaltyPrograms(establishmentId: number): Promise<LoyaltyProgram[]>;
  getLoyaltyProgram(id: number, establishmentId: number): Promise<LoyaltyProgram | undefined>;
  createLoyaltyProgram(program: InsertLoyaltyProgram): Promise<LoyaltyProgram>;
  updateLoyaltyProgram(id: number, program: Partial<InsertLoyaltyProgram>, establishmentId: number): Promise<LoyaltyProgram>;
  deleteLoyaltyProgram(id: number, establishmentId: number): Promise<void>;

  // Loyalty Program Services operations
  getLoyaltyProgramServices(programId: number, establishmentId: number): Promise<LoyaltyProgramService[]>;
  addServiceToLoyaltyProgram(programService: InsertLoyaltyProgramService): Promise<LoyaltyProgramService>;
  removeServiceFromLoyaltyProgram(programId: number, serviceId: number, establishmentId: number): Promise<void>;

  // Client Loyalty Points operations
  getClientLoyaltyPoints(clientId: number, establishmentId: number): Promise<ClientLoyaltyPoints | undefined>;
  createClientLoyaltyPoints(points: InsertClientLoyaltyPoints): Promise<ClientLoyaltyPoints>;
  updateClientLoyaltyPoints(clientId: number, programId: number, points: number, establishmentId: number): Promise<ClientLoyaltyPoints>;
  addLoyaltyPoints(clientId: number, programId: number, points: number, appointmentId: number, establishmentId: number): Promise<void>;
  useLoyaltyPoints(clientId: number, programId: number, points: number, establishmentId: number): Promise<void>;

  // Loyalty Point Transactions operations
  getLoyaltyPointTransactions(clientId: number, establishmentId: number): Promise<LoyaltyPointTransaction[]>;
  createLoyaltyPointTransaction(transaction: InsertLoyaltyPointTransaction): Promise<LoyaltyPointTransaction>;

  // Loyalty system helpers
  checkClientEligibleForReward(clientId: number, programId: number, establishmentId: number): Promise<boolean>;
  getClientsWithAvailableRewards(establishmentId: number): Promise<any[]>;
  getClientsWithRewards(establishmentId: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // Establishment operations
  async getEstablishment(id: number): Promise<Establishment | undefined> {
    const [establishment] = await db.select().from(establishments).where(eq(establishments.id, id));
    return establishment || undefined;
  }

  async getEstablishmentByEmail(email: string): Promise<Establishment | undefined> {
    const [establishment] = await db.select().from(establishments).where(eq(establishments.email, email));
    return establishment || undefined;
  }

  async createEstablishment(insertEstablishment: InsertEstablishment): Promise<Establishment> {
    const [establishment] = await db
      .insert(establishments)
      .values(insertEstablishment)
      .returning();
    return establishment;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const normalizedEmail = email.toLowerCase();
    const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        email: insertUser.email.toLowerCase(),
        password: hashedPassword
      })
      .returning();
    return user;
  }

  // Client operations
  async getClients(establishmentId: number): Promise<Client[]> {
    return await db.select().from(clients).where(eq(clients.establishmentId, establishmentId));
  }

  async getClient(id: number, establishmentId: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(and(eq(clients.id, id), eq(clients.establishmentId, establishmentId)));
    return client;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values(insertClient)
      .returning();
    return client;
  }

  async updateClient(id: number, updateData: Partial<InsertClient>, establishmentId: number): Promise<Client> {
    const [client] = await db
      .update(clients)
      .set(updateData)
      .where(and(eq(clients.id, id), eq(clients.establishmentId, establishmentId)))
      .returning();
    return client;
  }

  async deleteClient(id: number, establishmentId: number): Promise<void> {
    // First get all appointments for this client
    const clientAppointments = await db.select({ id: appointments.id }).from(appointments).where(eq(appointments.clientId, id));
    
    // Delete all transactions related to these appointments
    for (const appointment of clientAppointments) {
      await db.delete(transactions).where(eq(transactions.appointmentId, appointment.id));
    }
    
    // Delete all notifications related to these appointments
    for (const appointment of clientAppointments) {
      await db.delete(notifications).where(eq(notifications.appointmentId, appointment.id));
    }
    
    // Delete loyalty points and transactions for this client
    await db.delete(loyaltyPointTransactions).where(eq(loyaltyPointTransactions.clientId, id));
    await db.delete(clientLoyaltyPoints).where(eq(clientLoyaltyPoints.clientId, id));
    
    // Then delete all appointments for this client
    await db.delete(appointments).where(eq(appointments.clientId, id));
    
    // Finally delete the client
    await db.delete(clients).where(and(eq(clients.id, id), eq(clients.establishmentId, establishmentId)));
  }

  async searchClients(query: string, establishmentId: number): Promise<Client[]> {
    return await db
      .select()
      .from(clients)
      .where(and(like(clients.name, `%${query}%`), eq(clients.establishmentId, establishmentId)));
  }

  async checkClientPhoneExists(phone: string, establishmentId: number): Promise<boolean> {
    const result = await db
      .select({ id: clients.id })
      .from(clients)
      .where(and(
        eq(clients.establishmentId, establishmentId),
        eq(clients.phone, phone)
      ))
      .limit(1);
    
    return result.length > 0;
  }

  // Staff operations
  async getStaff(establishmentId: number): Promise<Staff[]> {
    return await db.select().from(staff).where(and(eq(staff.isActive, true), eq(staff.establishmentId, establishmentId)));
  }

  async getStaffMember(id: number, establishmentId: number): Promise<Staff | undefined> {
    const [staffMember] = await db.select().from(staff).where(and(eq(staff.id, id), eq(staff.establishmentId, establishmentId)));
    return staffMember;
  }

  async getStaffByUserId(userId: number, establishmentId: number): Promise<Staff | undefined> {
    try {
      // First get the user's email
      const user = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
      if (!user || user.length === 0) {
        // User not found logging removed for compute optimization
        return undefined;
      }

      // Then find the staff member with matching email and establishment
      const [staffMember] = await db
        .select()
        .from(staff)
        .where(and(
          eq(staff.email, user[0].email),
          eq(staff.establishmentId, establishmentId)
        ));
      
      // Staff lookup logging removed for compute optimization
      return staffMember;
    } catch (error) {
      console.error("Error in getStaffByUserId:", error);
      return undefined;
    }
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const [staffMember] = await db
      .insert(staff)
      .values(insertStaff)
      .returning();
    return staffMember;
  }

  async updateStaff(id: number, updateData: Partial<InsertStaff>): Promise<Staff> {
    const [staffMember] = await db
      .update(staff)
      .set(updateData)
      .where(eq(staff.id, id))
      .returning();
    return staffMember;
  }

  async deleteStaff(id: number): Promise<void> {
    // First get all appointments for this staff member
    const staffAppointments = await db.select({ id: appointments.id }).from(appointments).where(eq(appointments.staffId, id));
    
    // Delete all loyalty point transactions related to these appointments
    for (const appointment of staffAppointments) {
      await db.delete(loyaltyPointTransactions).where(eq(loyaltyPointTransactions.appointmentId, appointment.id));
    }
    
    // Delete all transactions related to these appointments
    for (const appointment of staffAppointments) {
      await db.delete(transactions).where(eq(transactions.appointmentId, appointment.id));
    }
    
    // Delete all notifications related to these appointments
    for (const appointment of staffAppointments) {
      await db.delete(notifications).where(eq(notifications.appointmentId, appointment.id));
    }
    
    // Update any users that reference this staff member to remove the reference
    await db.update(users).set({ staffId: null }).where(eq(users.staffId, id));
    
    // Then delete all appointments for this staff member
    await db.delete(appointments).where(eq(appointments.staffId, id));
    
    // Delete staff working hours
    await db.delete(staffWorkingHours).where(eq(staffWorkingHours.staffId, id));
    
    // Delete staff vacations
    await db.delete(staffVacations).where(eq(staffVacations.staffId, id));
    
    // Finally delete the staff member
    await db.delete(staff).where(eq(staff.id, id));
  }

  // Service operations
  async getServices(establishmentId: number): Promise<Service[]> {
    return await db.select().from(services).where(and(eq(services.isActive, true), eq(services.establishmentId, establishmentId)));
  }

  async getService(id: number, establishmentId: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(and(eq(services.id, id), eq(services.establishmentId, establishmentId)));
    return service;
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db
      .insert(services)
      .values(insertService)
      .returning();
    return service;
  }

  async updateService(id: number, updateData: Partial<InsertService>): Promise<Service> {
    const [service] = await db
      .update(services)
      .set(updateData)
      .where(eq(services.id, id))
      .returning();
    return service;
  }

  async deleteService(id: number): Promise<void> {
    // First get all appointments for this service
    const serviceAppointments = await db.select({ id: appointments.id }).from(appointments).where(eq(appointments.serviceId, id));
    
    // Delete all transactions related to these appointments
    for (const appointment of serviceAppointments) {
      await db.delete(transactions).where(eq(transactions.appointmentId, appointment.id));
    }
    
    // Delete all notifications related to these appointments
    for (const appointment of serviceAppointments) {
      await db.delete(notifications).where(eq(notifications.appointmentId, appointment.id));
    }
    
    // Delete loyalty program services references
    await db.delete(loyaltyProgramServices).where(eq(loyaltyProgramServices.serviceId, id));
    
    // Then delete all appointments for this service
    await db.delete(appointments).where(eq(appointments.serviceId, id));
    
    // Finally delete the service
    await db.delete(services).where(eq(services.id, id));
  }

  // Service Category operations
  async getServiceCategories(establishmentId: number): Promise<ServiceCategory[]> {
    return await db.select().from(serviceCategories).where(eq(serviceCategories.establishmentId, establishmentId));
  }

  async getServiceCategory(id: number, establishmentId: number): Promise<ServiceCategory | undefined> {
    const [category] = await db.select().from(serviceCategories).where(and(eq(serviceCategories.id, id), eq(serviceCategories.establishmentId, establishmentId)));
    return category || undefined;
  }

  async createServiceCategory(insertCategory: InsertServiceCategory): Promise<ServiceCategory> {
    const [category] = await db
      .insert(serviceCategories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async deleteServiceCategory(id: number, establishmentId: number): Promise<void> {
    // First update services that use this category to null
    await db.update(services).set({ category: null }).where(eq(services.category, String(id)));
    // Then delete the category
    await db.delete(serviceCategories).where(and(eq(serviceCategories.id, id), eq(serviceCategories.establishmentId, establishmentId)));
  }

  // Appointment operations
  async getAppointments(establishmentId: number): Promise<any[]> {
    return await db
      .select({
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
        servicePrice: services.price,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(staff, eq(appointments.staffId, staff.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(and(
        eq(clients.establishmentId, establishmentId),
        eq(staff.establishmentId, establishmentId),
        eq(services.establishmentId, establishmentId)
      ))
      .orderBy(appointments.appointmentDate);
  }

  async getAppointmentsByClientId(clientId: number, establishmentId: number): Promise<any[]> {
    return await db
      .select({
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
        createdAt: appointments.createdAt,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(staff, eq(appointments.staffId, staff.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(and(
        eq(appointments.clientId, clientId),
        eq(clients.establishmentId, establishmentId),
        eq(staff.establishmentId, establishmentId),
        eq(services.establishmentId, establishmentId)
      ))
      .orderBy(desc(appointments.appointmentDate));
  }

  async getAppointmentsByStaff(establishmentId: number, staffId: number): Promise<any[]> {
    return await db
      .select({
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
        createdAt: appointments.createdAt,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(staff, eq(appointments.staffId, staff.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(and(
        eq(appointments.staffId, staffId),
        eq(appointments.establishmentId, establishmentId)
      ))
      .orderBy(desc(appointments.appointmentDate));
  }

  async getAppointmentsRaw(): Promise<Appointment[]> {
    return await db.select().from(appointments).orderBy(appointments.appointmentDate);
  }

  async getAppointment(id: number, establishmentId: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(
      and(
        eq(appointments.id, id),
        eq(appointments.establishmentId, establishmentId)
      )
    );
    return appointment;
  }

  // For N8N endpoints - gets appointment by ID without establishmentId restriction
  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db
      .insert(appointments)
      .values(insertAppointment)
      .returning();
    
    // Buscar informações completas do cliente, serviço e profissional para criar a notificação
    const [client, service, staffMember] = await Promise.all([
      this.getClient(appointment.clientId, appointment.establishmentId),
      this.getService(appointment.serviceId, appointment.establishmentId),
      this.getStaffMember(appointment.staffId, appointment.establishmentId)
    ]);
    
    // Formatar data e hora
    const appointmentDate = new Date(appointment.appointmentDate);
    const formattedDate = appointmentDate.toLocaleDateString('pt-BR');
    const formattedTime = appointmentDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    // Formatar valor
    const formattedPrice = service?.price ? 
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(service.price)) : 
      'Valor não informado';
    
    // Criar notificação automaticamente com todas as informações
    const notification = {
      establishmentId: appointment.establishmentId,
      appointmentId: appointment.id,
      title: "Novo Agendamento",
      message: `Cliente: ${client?.name || 'Cliente'}\nServiço: ${service?.name || 'Serviço'}\nProfissional: ${staffMember?.name || 'Profissional'}\nData: ${formattedDate}\nHora: ${formattedTime}\nDuração: ${appointment.duration || service?.duration || 30} minutos\nValor: ${formattedPrice}`,
      type: "appointment" as const,
      isRead: false
    };
    
    await this.createNotification(notification);
    
    return appointment;
  }

  async updateAppointment(id: number, updateData: Partial<InsertAppointment>): Promise<Appointment> {
    const [appointment] = await db
      .update(appointments)
      .set(updateData)
      .where(eq(appointments.id, id))
      .returning();
    return appointment;
  }

  async deleteAppointment(id: number): Promise<void> {
    // First, delete any notifications related to this appointment
    await db.delete(notifications).where(eq(notifications.appointmentId, id));
    // Then delete the appointment
    await db.delete(appointments).where(eq(appointments.id, id));
  }

  async getTodaysAppointments(establishmentId: number): Promise<any[]> {
    return await db
      .select({
        id: appointments.id,
        appointmentDate: appointments.appointmentDate,
        duration: appointments.duration,
        status: appointments.status,
        clientName: clients.name,
        staffId: appointments.staffId,
        staffName: staff.name,
        serviceName: services.name,
        servicePrice: services.price,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(staff, eq(appointments.staffId, staff.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(
        and(
          eq(appointments.establishmentId, establishmentId),
          sql`DATE(${appointments.appointmentDate}) = CURRENT_DATE`,
          or(
            eq(appointments.status, 'confirmed'),
            eq(appointments.status, 'scheduled')
          )
        )
      )
      .orderBy(appointments.appointmentDate);
  }

  async getPendingAppointments(establishmentId: number): Promise<any[]> {
    const result = await db
      .select({
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
        createdAt: appointments.createdAt,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(staff, eq(appointments.staffId, staff.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(and(
        eq(appointments.status, "pending"),
        eq(clients.establishmentId, establishmentId),
        eq(staff.establishmentId, establishmentId),
        eq(services.establishmentId, establishmentId)
      ))
      .orderBy(desc(appointments.createdAt));

    return result;
  }

  // Get pending appointments for a specific staff member
  async getPendingAppointmentsForStaff(establishmentId: number, staffId: number): Promise<any[]> {
    const result = await db
      .select({
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
        createdAt: appointments.createdAt,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(staff, eq(appointments.staffId, staff.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(and(
        eq(appointments.status, "pending"),
        eq(appointments.staffId, staffId),
        eq(clients.establishmentId, establishmentId),
        eq(staff.establishmentId, establishmentId),
        eq(services.establishmentId, establishmentId)
      ))
      .orderBy(desc(appointments.createdAt));

    return result;
  }

  async getRecentAppointments(establishmentId: number): Promise<any[]> {
    const today = new Date();
    const threeDaysAgo = new Date(today.getTime() - (3 * 24 * 60 * 60 * 1000));

    return await db
      .select({
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
        createdAt: appointments.createdAt,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(staff, eq(appointments.staffId, staff.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(and(
        eq(clients.establishmentId, establishmentId),
        eq(staff.establishmentId, establishmentId),
        eq(services.establishmentId, establishmentId),
        gte(appointments.appointmentDate, threeDaysAgo)
      ))
      .orderBy(desc(appointments.appointmentDate));
  }

  // Paginated appointment operations (COST OPTIMIZATION)
  async getPaginatedAppointments(establishmentId: number, offset: number, limit: number, month?: string, statusFilter?: string): Promise<{appointments: any[], total: number}> {
    const conditions = [eq(appointments.establishmentId, establishmentId)];
    
    // Add month filter if provided
    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1); // Month is 0-indexed
      const endDate = new Date(year, monthNum, 0, 23, 59, 59); // Last day of month
      
      conditions.push(gte(appointments.appointmentDate, startDate));
      conditions.push(lte(appointments.appointmentDate, endDate));
    }
    
    // Add status filter if provided
    if (statusFilter && statusFilter !== 'all') {
      if (statusFilter === 'scheduled') {
        // Include both 'scheduled' and 'agendado' for confirmed appointments
        const scheduledCondition = or(
          eq(appointments.status, 'scheduled'), 
          eq(appointments.status, 'agendado'), 
          eq(appointments.status, 'confirmed')
        );
        if (scheduledCondition) conditions.push(scheduledCondition);
      } else if (statusFilter === 'completed') {
        // Include both 'completed' and 'realizado' for finished appointments
        const completedCondition = or(
          eq(appointments.status, 'completed'), 
          eq(appointments.status, 'realizado')
        );
        if (completedCondition) conditions.push(completedCondition);
      }
    }

    const whereConditions = and(...conditions);
    
    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(appointments)
      .where(whereConditions);
    
    const total = totalResult.count;
    
    // Get paginated results
    const paginatedAppointments = await db
      .select({
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
        servicePrice: services.price,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(staff, eq(appointments.staffId, staff.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(whereConditions)
      .orderBy(desc(appointments.appointmentDate))
      .limit(limit)
      .offset(offset);
    
    return {
      appointments: paginatedAppointments,
      total
    };
  }

  // Paginated staff appointment operations (COST OPTIMIZATION)
  async getPaginatedStaffAppointments(establishmentId: number, staffId: number, offset: number, limit: number, month?: string, statusFilter?: string): Promise<{appointments: any[], total: number}> {
    let whereConditions = and(
      eq(appointments.establishmentId, establishmentId),
      eq(appointments.staffId, staffId)
    );
    
    // Add month filter if provided
    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1); // Month is 0-indexed
      const endDate = new Date(year, monthNum, 0, 23, 59, 59); // Last day of month
      
      whereConditions = and(
        whereConditions,
        gte(appointments.appointmentDate, startDate),
        lte(appointments.appointmentDate, endDate)
      );
    }
    
    // Add status filter if provided
    if (statusFilter && statusFilter !== 'all') {
      if (statusFilter === 'scheduled') {
        // Include both 'scheduled' and 'agendado' for confirmed appointments
        whereConditions = and(
          whereConditions,
          or(eq(appointments.status, 'scheduled'), eq(appointments.status, 'agendado'), eq(appointments.status, 'confirmed'))
        );
      } else if (statusFilter === 'completed') {
        // Include both 'completed' and 'realizado' for finished appointments
        whereConditions = and(
          whereConditions,
          or(eq(appointments.status, 'completed'), eq(appointments.status, 'realizado'))
        );
      }
    }
    
    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(appointments)
      .where(whereConditions);
    
    const total = totalResult.count;
    
    // Get paginated results
    const paginatedAppointments = await db
      .select({
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
        servicePrice: services.price,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(staff, eq(appointments.staffId, staff.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(whereConditions)
      .orderBy(desc(appointments.appointmentDate))
      .limit(limit)
      .offset(offset);
    
    return {
      appointments: paginatedAppointments,
      total
    };
  }

  async updateAppointmentStatus(id: number, status: string, establishmentId: number): Promise<Appointment> {
    const [appointment] = await db
      .update(appointments)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(appointments.id, id), eq(appointments.establishmentId, establishmentId)))
      .returning();
    return appointment;
  }

  // Product operations
  async getProducts(establishmentId: number): Promise<Product[]> {
    return await db.select().from(products).where(and(eq(products.isActive, true), eq(products.establishmentId, establishmentId)));
  }

  async getProduct(id: number, establishmentId: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(and(eq(products.id, id), eq(products.establishmentId, establishmentId)));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct as any)
      .returning();
    return product;
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>, establishmentId: number): Promise<Product> {
    const [product] = await db
      .update(products)
      .set(updateData)
      .where(and(eq(products.id, id), eq(products.establishmentId, establishmentId)))
      .returning();
    return product;
  }

  async deleteProduct(id: number, establishmentId: number): Promise<void> {
    await db.delete(products).where(and(eq(products.id, id), eq(products.establishmentId, establishmentId)));
  }

  // Transaction operations
  async getTransactions(establishmentId: number): Promise<any[]> {
    return await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        type: transactions.type,
        category: transactions.category,
        paymentMethod: transactions.paymentMethod,
        description: transactions.description,
        transactionDate: transactions.transactionDate,
        clientName: clients.name,
      })
      .from(transactions)
      .leftJoin(clients, eq(transactions.clientId, clients.id))
      .where(eq(transactions.establishmentId, establishmentId))
      .orderBy(desc(transactions.transactionDate));
  }

  // Paginated transaction operations (COST OPTIMIZATION)
  async getPaginatedTransactions(establishmentId: number, offset: number, limit: number): Promise<{transactions: any[], total: number}> {
    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(transactions)
      .where(eq(transactions.establishmentId, establishmentId));
    
    const total = totalResult.count;
    
    // Get paginated results
    const paginatedTransactions = await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        type: transactions.type,
        category: transactions.category,
        paymentMethod: transactions.paymentMethod,
        description: transactions.description,
        transactionDate: transactions.transactionDate,
        clientName: clients.name,
      })
      .from(transactions)
      .leftJoin(clients, eq(transactions.clientId, clients.id))
      .where(eq(transactions.establishmentId, establishmentId))
      .orderBy(desc(transactions.transactionDate))
      .limit(limit)
      .offset(offset);
    
    return {
      transactions: paginatedTransactions,
      total
    };
  }

  // Paginated transactions for staff (only commission/salary related)
  async getPaginatedTransactionsForStaff(establishmentId: number, staffId: number, offset: number, limit: number): Promise<{transactions: any[], total: number}> {
    // Get total count of transactions related to this staff member
    const [totalResult] = await db
      .select({ count: count() })
      .from(transactions)
      .innerJoin(appointments, eq(transactions.appointmentId, appointments.id))
      .where(
        and(
          eq(transactions.establishmentId, establishmentId),
          eq(appointments.staffId, staffId),
          eq(transactions.category, "Salários e Comissões")
        )
      );
    
    const total = totalResult.count;
    
    // Get paginated results for staff transactions
    const paginatedTransactions = await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        type: transactions.type,
        category: transactions.category,
        paymentMethod: transactions.paymentMethod,
        description: transactions.description,
        transactionDate: transactions.transactionDate,
        clientName: clients.name,
      })
      .from(transactions)
      .innerJoin(appointments, eq(transactions.appointmentId, appointments.id))
      .leftJoin(clients, eq(transactions.clientId, clients.id))
      .where(
        and(
          eq(transactions.establishmentId, establishmentId),
          eq(appointments.staffId, staffId),
          eq(transactions.category, "Salários e Comissões")
        )
      )
      .orderBy(desc(transactions.transactionDate))
      .limit(limit)
      .offset(offset);
    
    return {
      transactions: paginatedTransactions,
      total
    };
  }

  async getTransactionsByDate(establishmentId: number, date: string): Promise<any[]> {
    // Use raw SQL with timezone conversion to get transactions for the specific Brazil date
    const result = await db.execute(sql`
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

    return result.rows as any[];
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async deleteTransaction(id: number): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id));
  }

  async getFinancialStats(establishmentId: number): Promise<any> {
    try {
      // Calculate Brazil's current date to correctly aggregate today's transactions
      const now = new Date();
      const brazilTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
      const brazilToday = brazilTime.toISOString().split('T')[0]; // YYYY-MM-DD format
      const brazilYear = brazilTime.getFullYear();
      const brazilMonth = brazilTime.getMonth() + 1; // JS months are 0-indexed
      
      // Get today's transactions using Brazil timezone for correct date calculation
      const todayStats = await db.execute(sql`
        SELECT 
          SUM(CASE WHEN type = 'income' AND DATE(transaction_date AT TIME ZONE 'America/Sao_Paulo') = ${brazilToday}::date THEN amount::decimal ELSE 0 END) as today_income,
          SUM(CASE WHEN type = 'expense' AND DATE(transaction_date AT TIME ZONE 'America/Sao_Paulo') = ${brazilToday}::date THEN amount::decimal ELSE 0 END) as today_expenses,
          SUM(CASE WHEN type = 'income' AND EXTRACT(YEAR FROM transaction_date AT TIME ZONE 'America/Sao_Paulo') = ${brazilYear} AND EXTRACT(MONTH FROM transaction_date AT TIME ZONE 'America/Sao_Paulo') = ${brazilMonth} THEN amount::decimal ELSE 0 END) as month_income,
          SUM(CASE WHEN type = 'expense' AND EXTRACT(YEAR FROM transaction_date AT TIME ZONE 'America/Sao_Paulo') = ${brazilYear} AND EXTRACT(MONTH FROM transaction_date AT TIME ZONE 'America/Sao_Paulo') = ${brazilMonth} THEN amount::decimal ELSE 0 END) as month_expenses
        FROM transactions 
        WHERE establishment_id = ${establishmentId}
      `);

      const stats = todayStats.rows[0] as any;

      return {
        todayIncome: parseFloat(String(stats.today_income || '0')),
        todayExpenses: parseFloat(String(stats.today_expenses || '0')), 
        monthIncome: parseFloat(String(stats.month_income || '0')),
        monthExpenses: parseFloat(String(stats.month_expenses || '0')),
      };
    } catch (error) {
      console.error('Error in getFinancialStats:', error);
      return {
        todayIncome: 0,
        todayExpenses: 0,
        monthIncome: 0,
        monthExpenses: 0,
      };
    }
  }

  async getRevenueStats(): Promise<any> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Today's revenue
    const [todaysRevenue] = await db
      .select({ total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(gte(transactions.transactionDate, startOfDay));

    // Monthly revenue
    const [monthlyRevenue] = await db
      .select({ total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(gte(transactions.transactionDate, startOfMonth));

    return {
      todaysRevenue: todaysRevenue.total,
      monthlyRevenue: monthlyRevenue.total,
    };
  }

  async getDashboardStats(establishmentId: number): Promise<any> {
    try {
      // Use current date for dashboard stats (not date ranges that can cause timezone issues)
      const dashboardStats = await db.execute(
        sql`SELECT 
          COALESCE(SUM(CASE WHEN type = 'income' AND DATE(created_at) = CURRENT_DATE THEN amount::decimal ELSE 0 END), 0) as todays_revenue,
          COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as todays_appointments_count
        FROM transactions 
        WHERE establishment_id = ${establishmentId}`
      );

      const stats = dashboardStats.rows[0];

      // Get additional stats in parallel
      const [todaysAppointments, totalClients, activeServices, lowStockProducts] = await Promise.all([
        // Today's appointments count
        db.execute(sql`SELECT COUNT(*) as count FROM appointments 
          WHERE establishment_id = ${establishmentId} 
          AND DATE(appointment_date) = CURRENT_DATE`),
        // Total clients
        db.execute(sql`SELECT COUNT(*) as count FROM clients 
          WHERE establishment_id = ${establishmentId}`),
        // Active services
        db.execute(sql`SELECT COUNT(*) as count FROM services 
          WHERE establishment_id = ${establishmentId} AND is_active = true`),
        // Low stock products
        db.execute(sql`SELECT COUNT(*) as count FROM products 
          WHERE establishment_id = ${establishmentId} 
          AND is_active = true AND stock <= min_stock`)
      ]);

      return {
        todaysRevenue: stats.todays_revenue || "0",
        todaysAppointments: todaysAppointments.rows[0].count || "0",
        totalClients: totalClients.rows[0].count || "0",
        activeServices: activeServices.rows[0].count || "0",
        lowStockProducts: lowStockProducts.rows[0].count || "0",
      };
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      return {
        todaysRevenue: 0,
        todaysAppointments: 0,
        totalClients: 0,
        activeServices: 0,
        lowStockProducts: 0,
      };
    }
  }

  // Get complete staff data including next appointment
  async getCompleteStaffData(establishmentId: number, staffId: number): Promise<any> {
    try {
      // Complete staff data logging removed for compute optimization
      
      // Get today's appointments count for this staff member (simplified query)
      const appointmentsQuery = await db.execute(
        sql`SELECT 
          COUNT(CASE WHEN DATE(a.appointment_date) = CURRENT_DATE AND (a.status = 'confirmed' OR a.status = 'scheduled') THEN 1 END) as today_upcoming_appointments,
          COUNT(CASE WHEN DATE(a.appointment_date) = CURRENT_DATE AND a.status = 'completed' THEN 1 END) as today_completed_appointments
        FROM appointments a
        WHERE a.establishment_id = ${establishmentId} 
        AND a.staff_id = ${staffId}`
      );
      
      const appointmentResult = appointmentsQuery.rows[0] as any;
      
      // Staff appointments query logging removed for compute optimization
      
      return {
        todayUpcomingAppointments: parseInt(appointmentResult?.today_upcoming_appointments || 0),
        todayCompletedAppointments: parseInt(appointmentResult?.today_completed_appointments || 0)
      };
    } catch (error) {
      console.error('Error getting complete staff data:', error);
      return {
        todayUpcomingAppointments: 0,
        todayCompletedAppointments: 0
      };
    }
  }

  // Staff-specific dashboard stats
  async getDashboardStatsForStaff(establishmentId: number, staffId: number): Promise<any> {
    try {
      // Staff dashboard stats logging removed for compute optimization
      
      // Get today's appointments stats
      const staffStats = await db.execute(
        sql`SELECT 
          COUNT(CASE WHEN DATE(a.appointment_date) = CURRENT_DATE AND (a.status = 'confirmed' OR a.status = 'scheduled') THEN 1 END) as todays_appointments_count,
          COUNT(CASE WHEN DATE(a.appointment_date) = CURRENT_DATE AND a.status = 'completed' THEN 1 END) as completed_appointments_count
        FROM appointments a
        WHERE a.establishment_id = ${establishmentId} 
        AND a.staff_id = ${staffId}`
      );
      
      // Staff stats query result logging removed for compute optimization

      // Get establishment timezone
      const establishment = await this.getEstablishment(establishmentId);
      const timezone = establishment?.timezone || 'America/Sao_Paulo';

      // Get current time in establishment timezone
      const currentTimeInTimezone = await db.execute(
        sql`SELECT NOW() AT TIME ZONE ${timezone} as current_time`
      );
      const currentTime = currentTimeInTimezone.rows[0]?.current_time;
      
      // Get next upcoming appointment (timezone-aware)
      const nextAppointment = await db.execute(
        sql`SELECT 
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
      
      // Next appointment query logging removed for compute optimization
      
      // Debug: Check all appointments for this staff with timezone-aware time analysis
      const debugAppointments = await db.execute(
        sql`SELECT 
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
      // Debug appointments logging removed for compute optimization

      const stats = staffStats.rows[0] as any;
      const nextAppt = nextAppointment.rows[0] as any;
      
      // Next appointment result logging removed for compute optimization

      const result = {
        todaysAppointmentsCount: parseInt(String(stats.todays_appointments_count)) || 0,
        completedAppointmentsCount: parseInt(String(stats.completed_appointments_count)) || 0,
        nextAppointmentTime: nextAppt ? new Date(String(nextAppt.appointment_date)).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit'
        }) : null,
        nextAppointmentClient: nextAppt ? String(nextAppt.client_name) : null,
        nextAppointmentDate: nextAppt ? new Date(String(nextAppt.appointment_date)).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit'
        }) : null,
        // Staff members don't see global stats
        totalClients: 0,
        activeServices: 0,
        lowStockProducts: 0,
      };
      
      // Final staff dashboard stats logging removed for compute optimization
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
        lowStockProducts: 0,
      };
    }
  }

  // Staff-specific financial stats
  async getFinancialStatsForStaff(establishmentId: number, staffId: number): Promise<any> {
    try {
      const staffFinancialStats = await db.execute(sql`
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

      const stats = staffFinancialStats.rows[0] as any;

      return {
        todayIncome: parseFloat(String(stats.today_income || '0')),
        todayExpenses: parseFloat(String(stats.today_expenses || '0')), 
        monthIncome: parseFloat(String(stats.month_income || '0')),
        monthExpenses: parseFloat(String(stats.month_expenses || '0')),
      };
    } catch (error) {
      console.error('Error in getFinancialStatsForStaff:', error);
      return {
        todayIncome: 0,
        todayExpenses: 0,
        monthIncome: 0,
        monthExpenses: 0,
      };
    }
  }

  // Staff-specific today's appointments - for dashboard shows all confirmed/scheduled for today
  async getTodaysAppointmentsForStaff(establishmentId: number, staffId: number): Promise<any[]> {
    return await db
      .select({
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
        createdAt: appointments.createdAt,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(staff, eq(appointments.staffId, staff.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(and(
        eq(appointments.establishmentId, establishmentId),
        eq(appointments.staffId, staffId),
        sql`DATE(${appointments.appointmentDate}) = CURRENT_DATE`,
        or(
          eq(appointments.status, 'confirmed'),
          eq(appointments.status, 'scheduled')
        )
      ))
      .orderBy(appointments.appointmentDate);
  }

  // Staff-specific recent appointments
  async getNextAppointmentForStaff(establishmentId: number, staffId: number): Promise<any | null> {
    // Get current Brazil time (UTC-3) and convert to UTC for comparison with stored appointments
    const now = new Date();
    const brazilNow = new Date(now.getTime() - (3 * 60 * 60 * 1000));
    
    const [nextAppointment] = await db
      .select({
        id: appointments.id,
        appointmentDate: appointments.appointmentDate,
        duration: appointments.duration,
        status: appointments.status,
        clientName: clients.name,
        serviceName: services.name,
        servicePrice: services.price,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(and(
        eq(appointments.establishmentId, establishmentId),
        eq(appointments.staffId, staffId),
        sql`${appointments.appointmentDate} > ${brazilNow.toISOString()}`,
        or(
          eq(appointments.status, 'scheduled'),
          eq(appointments.status, 'confirmed')
        )
      ))
      .orderBy(appointments.appointmentDate)
      .limit(1);
    
    return nextAppointment || null;
  }

  async getRecentAppointmentsForStaff(establishmentId: number, staffId: number): Promise<any[]> {
    return await db
      .select({
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
        createdAt: appointments.createdAt,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(staff, eq(appointments.staffId, staff.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(and(
        eq(appointments.establishmentId, establishmentId),
        eq(appointments.staffId, staffId)
      ))
      .orderBy(desc(appointments.appointmentDate))
      .limit(10);
  }

  async checkAppointmentConflict(staffId: number, dataInicio: Date, dataFim: Date): Promise<boolean> {
    try {
      // Get all appointments for this staff member
      const existingAppointments = await db
        .select()
        .from(appointments)
        .leftJoin(services, eq(appointments.serviceId, services.id))
        .where(eq(appointments.staffId, staffId));
      
      // Check for overlaps using the same logic as frontend: end time = start + duration - 1 minute
      for (const aptData of existingAppointments) {
        const apt = aptData.appointments;
        const service = aptData.services;
        
        if (!apt || !service) continue;
        
        const existingStart = new Date(apt.appointmentDate);
        // Calculate existing appointment end time with -1 minute rule
        const existingEnd = new Date(existingStart.getTime() + (service.duration * 60000) - 60000);
        
        // Check for overlap: appointments overlap if one starts before the other ends
        // But with -1 minute rule, if one ends at 11:59 and next starts at 12:00, no conflict
        if (dataInicio <= existingEnd && dataFim >= existingStart) {
          return true; // Conflict found
        }
      }
      
      return false; // No conflicts
    } catch (error) {
      console.error("Check appointment conflict error:", error);
      return false;
    }
  }

  async getUpcomingTodaysAppointments(): Promise<any[]> {
    // Get appointments with "scheduled" status only, ordered by date
    const scheduledAppointments = await db
      .select({
        id: appointments.id,
        appointmentDate: appointments.appointmentDate,
        duration: appointments.duration,
        status: appointments.status,
        notes: appointments.notes,
        clientName: clients.name,
        staffName: staff.name,
        serviceName: services.name,
        servicePrice: services.price,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(staff, eq(appointments.staffId, staff.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(eq(appointments.status, "scheduled"))
      .orderBy(appointments.appointmentDate)
      .limit(5);

    return scheduledAppointments;
  }

  async getScheduledAppointments(): Promise<any[]> {
    // Get all appointments with "scheduled" status only
    const scheduledAppointments = await db
      .select({
        id: appointments.id,
        appointmentDate: appointments.appointmentDate,
        duration: appointments.duration,
        status: appointments.status,
        notes: appointments.notes,
        clientName: clients.name,
        staffName: staff.name,
        serviceName: services.name,
        servicePrice: services.price,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(staff, eq(appointments.staffId, staff.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(eq(appointments.status, "scheduled"))
      .orderBy(appointments.appointmentDate);

    return scheduledAppointments;
  }

  // Business settings operations
  async getBusinessSettings(establishmentId: number): Promise<BusinessSettings | undefined> {
    const [settings] = await db
      .select()
      .from(businessSettings)
      .where(eq(businessSettings.establishmentId, establishmentId))
      .limit(1);
    return settings || undefined;
  }

  async updateBusinessSettings(settingsData: Partial<InsertBusinessSettings>, establishmentId: number): Promise<BusinessSettings> {
    // Check if settings exist
    const existingSettings = await this.getBusinessSettings(establishmentId);
    
    if (existingSettings) {
      // Update existing settings
      const [updated] = await db
        .update(businessSettings)
        .set({
          ...settingsData,
          updatedAt: new Date(),
        })
        .where(eq(businessSettings.id, existingSettings.id))
        .returning();
      return updated;
    } else {
      // Create new settings
      const [created] = await db
        .insert(businessSettings)
        .values({
          ...settingsData,
          establishmentId,
        })
        .returning();
      return created;
    }
  }

  // Business hours operations
  async getBusinessHours(establishmentId: number): Promise<BusinessHours[]> {
    return await db
      .select()
      .from(businessHours)
      .where(eq(businessHours.establishmentId, establishmentId))
      .orderBy(businessHours.dayOfWeek);
  }

  async updateBusinessHours(hours: InsertBusinessHours[], establishmentId: number): Promise<BusinessHours[]> {
    // Delete existing hours for this establishment
    await db
      .delete(businessHours)
      .where(eq(businessHours.establishmentId, establishmentId));

    // Insert new hours - check if hours array exists and has items
    if (hours && Array.isArray(hours) && hours.length > 0) {
      const hoursWithEstablishment = hours.map(hour => ({
        ...hour,
        establishmentId,
      }));
      
      await db.insert(businessHours).values(hoursWithEstablishment);
    }

    // Return updated hours
    return await this.getBusinessHours(establishmentId);
  }

  // Establishment operations for settings
  async updateEstablishment(id: number, data: Partial<InsertEstablishment>): Promise<Establishment> {
    const [updated] = await db
      .update(establishments)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(establishments.id, id))
      .returning();
    return updated;
  }

  // User operations for security settings
  async updateUserEmail(id: number, email: string): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({
        email,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  // Plan operations
  async getPlans(): Promise<any[]> {
    return await db.select().from(plans).where(eq(plans.isActive, true));
  }

  async getPlan(id: number): Promise<any> {
    const [plan] = await db.select().from(plans).where(eq(plans.id, id));
    return plan;
  }

  async getEstablishmentPlan(establishmentId: number): Promise<any> {
    const establishment = await this.getEstablishment(establishmentId);
    if (!establishment?.planId) return undefined;
    return await this.getPlan(establishment.planId);
  }

  async updateEstablishmentPlan(establishmentId: number, planId: number): Promise<Establishment> {
    const [updated] = await db
      .update(establishments)
      .set({
        planId,
        updatedAt: new Date(),
      })
      .where(eq(establishments.id, establishmentId))
      .returning();
    return updated;
  }

  // Plan validation helpers
  async checkStaffLimit(establishmentId: number): Promise<{ isWithinLimit: boolean; currentCount: number; maxAllowed: number }> {
    const plan = await this.getEstablishmentPlan(establishmentId);
    const currentStaff = await this.getStaff(establishmentId);
    
    return {
      isWithinLimit: currentStaff.length < (plan?.maxStaffMembers || 2),
      currentCount: currentStaff.length,
      maxAllowed: plan?.maxStaffMembers || 2
    };
  }

  async hasFinancialAccess(establishmentId: number): Promise<boolean> {
    const plan = await this.getEstablishmentPlan(establishmentId);
    return plan?.hasFinancialModule || false;
  }

  async hasInventoryAccess(establishmentId: number): Promise<boolean> {
    const plan = await this.getEstablishmentPlan(establishmentId);
    return plan?.hasInventoryModule || false;
  }

  async hasLoyaltyAccess(establishmentId: number): Promise<boolean> {
    const plan = await this.getEstablishmentPlan(establishmentId);
    // Fidelidade disponível apenas para Core e Expert
    return plan?.name === "Core" || plan?.name === "Expert";
  }

  async updateUserPassword(id: number, password: string): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({
        password,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async calculateStaffCommission(staffId: number, startDate: string, endDate: string, establishmentId: number): Promise<any> {
    // Get staff member info
    const staffMember = await this.getStaffMember(staffId, establishmentId);
    if (!staffMember) {
      throw new Error("Colaborador não encontrado");
    }

    // Get appointments for the staff member in the date range
    const appointmentsList = await db
      .select({
        id: appointments.id,
        appointmentDate: appointments.appointmentDate,
        serviceName: services.name,
        servicePrice: services.price,
        clientName: clients.name,
      })
      .from(appointments)
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .innerJoin(clients, eq(appointments.clientId, clients.id))
      .where(
        and(
          eq(appointments.staffId, staffId),
          eq(appointments.status, "completed"),
          eq(services.establishmentId, establishmentId),
          eq(clients.establishmentId, establishmentId),
          gte(appointments.appointmentDate, new Date(startDate)),
          lte(appointments.appointmentDate, new Date(endDate))
        )
      );

    // Calculate totals
    const totalServices = appointmentsList.length;
    const totalServiceValue = appointmentsList.reduce((sum, apt) => sum + parseFloat(apt.servicePrice), 0);
    const commissionRate = parseFloat(staffMember.commissionRate || "0");
    const commissionValue = (totalServiceValue * commissionRate) / 100;
    const fixedSalary = parseFloat(staffMember.salaryAmount || "0");

    // Format services for display
    const servicesData = appointmentsList.map(apt => ({
      date: apt.appointmentDate,
      clientName: apt.clientName,
      serviceName: apt.serviceName,
      price: parseFloat(apt.servicePrice),
      commissionAmount: (parseFloat(apt.servicePrice) * commissionRate) / 100,
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
      message: totalServices === 0 && commissionRate > 0 ? "Nenhum agendamento encontrado no período selecionado" : null
    };
  }

  // N8N Integration operations
  async getN8nIntegrations(establishmentId: number): Promise<N8nIntegration[]> {
    const result = await db
      .select()
      .from(n8nIntegrations)
      .where(eq(n8nIntegrations.establishmentId, establishmentId))
      .orderBy(desc(n8nIntegrations.createdAt));
    
    return result;
  }

  async getN8nIntegration(id: number, establishmentId: number): Promise<N8nIntegration | undefined> {
    const result = await db
      .select()
      .from(n8nIntegrations)
      .where(and(
        eq(n8nIntegrations.id, id),
        eq(n8nIntegrations.establishmentId, establishmentId)
      ))
      .limit(1);
    
    return result[0];
  }

  async createN8nIntegration(insertN8nIntegration: InsertN8nIntegration): Promise<N8nIntegration> {
    const result = await db
      .insert(n8nIntegrations)
      .values(insertN8nIntegration)
      .returning();
    
    return result[0];
  }

  async updateN8nIntegration(id: number, updateData: Partial<InsertN8nIntegration>, establishmentId: number): Promise<N8nIntegration> {
    const result = await db
      .update(n8nIntegrations)
      .set({ ...updateData, updatedAt: new Date() })
      .where(and(
        eq(n8nIntegrations.id, id),
        eq(n8nIntegrations.establishmentId, establishmentId)
      ))
      .returning();
    
    return result[0];
  }

  async deleteN8nIntegration(id: number, establishmentId: number): Promise<void> {
    await db
      .delete(n8nIntegrations)
      .where(and(
        eq(n8nIntegrations.id, id),
        eq(n8nIntegrations.establishmentId, establishmentId)
      ));
  }

  async createWebhookLog(insertWebhookLog: InsertWebhookLog): Promise<WebhookLog> {
    const result = await db
      .insert(webhookLogs)
      .values(insertWebhookLog)
      .returning();
    
    return result[0];
  }

  async getWebhookLogs(integrationId: number): Promise<WebhookLog[]> {
    const result = await db
      .select()
      .from(webhookLogs)
      .where(eq(webhookLogs.integrationId, integrationId))
      .orderBy(desc(webhookLogs.createdAt))
      .limit(50);
    
    return result;
  }

  async triggerN8nWebhook(event: string, data: any, establishmentId: number): Promise<void> {
    const integrations = await db
      .select()
      .from(n8nIntegrations)
      .where(and(
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
            timestamp: new Date().toISOString()
          };

          const headers: Record<string, string> = {
            'Content-Type': 'application/json'
          };

          if (integration.apiKey) {
            headers['Authorization'] = `Bearer ${integration.apiKey}`;
          }

          const response = await fetch(integration.webhookUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
          });

          const responseText = await response.text();

          await this.createWebhookLog({
            integrationId: integration.id,
            event,
            payload: JSON.stringify(payload),
            response: responseText,
            status: response.ok ? 'success' : 'error',
            errorMessage: response.ok ? null : `HTTP ${response.status}: ${response.statusText}`
          });

          await db
            .update(n8nIntegrations)
            .set({ lastTriggered: new Date() })
            .where(eq(n8nIntegrations.id, integration.id));

        } catch (error) {
          console.error('N8N webhook error:', error);
          
          await this.createWebhookLog({
            integrationId: integration.id,
            event,
            payload: JSON.stringify({ event, data, establishmentId }),
            response: null,
            status: 'error',
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }
  }

  // Evolution API Connection operations
  async getEvolutionApiConnections(establishmentId: number): Promise<EvolutionApiConnection[]> {
    const result = await db
      .select()
      .from(evolutionApiConnections)
      .where(eq(evolutionApiConnections.establishmentId, establishmentId))
      .orderBy(desc(evolutionApiConnections.createdAt));
    
    return result;
  }

  async getEvolutionApiConnection(id: number, establishmentId: number): Promise<EvolutionApiConnection | undefined> {
    const result = await db
      .select()
      .from(evolutionApiConnections)
      .where(and(
        eq(evolutionApiConnections.id, id),
        eq(evolutionApiConnections.establishmentId, establishmentId)
      ))
      .limit(1);
    
    return result[0];
  }

  async createEvolutionApiConnection(insertConnection: InsertEvolutionApiConnection): Promise<EvolutionApiConnection> {
    const result = await db
      .insert(evolutionApiConnections)
      .values(insertConnection)
      .returning();
    
    return result[0];
  }

  async updateEvolutionApiConnection(id: number, updateData: Partial<InsertEvolutionApiConnection>, establishmentId: number): Promise<EvolutionApiConnection> {
    const result = await db
      .update(evolutionApiConnections)
      .set({ ...updateData, updatedAt: new Date() })
      .where(and(
        eq(evolutionApiConnections.id, id),
        eq(evolutionApiConnections.establishmentId, establishmentId)
      ))
      .returning();
    
    return result[0];
  }

  async deleteEvolutionApiConnection(id: number, establishmentId: number): Promise<void> {
    await db
      .delete(evolutionApiConnections)
      .where(and(
        eq(evolutionApiConnections.id, id),
        eq(evolutionApiConnections.establishmentId, establishmentId)
      ));
  }

  async updateConnectionStatus(id: number, status: string, qrCode?: string, errorMessage?: string): Promise<EvolutionApiConnection> {
    const updateData: any = {
      status,
      lastStatusCheck: new Date(),
      updatedAt: new Date()
    };

    if (qrCode !== undefined) {
      updateData.qrCode = qrCode;
      if (qrCode) {
        // QR Code expires in 2 minutes
        updateData.qrCodeExpiration = new Date(Date.now() + 2 * 60 * 1000);
      } else {
        updateData.qrCodeExpiration = null;
      }
    }

    if (errorMessage !== undefined) {
      updateData.errorMessage = errorMessage;
    }

    const result = await db
      .update(evolutionApiConnections)
      .set(updateData)
      .where(eq(evolutionApiConnections.id, id))
      .returning();
    
    return result[0];
  }

  // N8N Webhook Data operations
  async getN8nWebhookData(establishmentId: number): Promise<N8nWebhookData | undefined> {
    const result = await db
      .select()
      .from(n8nWebhookData)
      .where(and(
        eq(n8nWebhookData.establishmentId, establishmentId),
        eq(n8nWebhookData.isActive, true)
      ))
      .orderBy(desc(n8nWebhookData.createdAt))
      .limit(1);
    
    return result[0];
  }

  async saveN8nWebhookData(data: InsertN8nWebhookData): Promise<N8nWebhookData> {
    // GARANTIR APENAS 1 REGISTRO ATIVO POR ESTABELECIMENTO
    // Primeiro, desativar todos os registros existentes para este estabelecimento
    await db
      .update(n8nWebhookData)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(n8nWebhookData.establishmentId, data.establishmentId));
    
    // Deactivated records logging removed for compute optimization
    
    // Agora inserir o novo registro como ativo
    const result = await db
      .insert(n8nWebhookData)
      .values({ ...data, isActive: true })
      .returning();
    
    // New record created logging removed for compute optimization
    return result[0];
  }

  async updateN8nWebhookQRCode(establishmentId: number, qrCodeBase64: string): Promise<N8nWebhookData | null> {
    // Buscar o registro mais recente ativo para este estabelecimento
    const existingRecord = await db
      .select()
      .from(n8nWebhookData)
      .where(and(
        eq(n8nWebhookData.establishmentId, establishmentId),
        eq(n8nWebhookData.isActive, true)
      ))
      .orderBy(desc(n8nWebhookData.createdAt))
      .limit(1);

    if (existingRecord.length === 0) {
      // No existing record logging removed for compute optimization
      return null;
    }

    // Atualizar apenas o qrCodeBase64 do registro existente
    const updated = await db
      .update(n8nWebhookData)
      .set({ 
        qrCodeBase64: qrCodeBase64,
        updatedAt: new Date()
      })
      .where(eq(n8nWebhookData.id, existingRecord[0].id))
      .returning();

    // QR code updated logging removed for compute optimization

    return updated[0];
  }

  async getN8nWebhookDataByInstanceId(instanceId: string): Promise<N8nWebhookData | undefined> {
    const result = await db
      .select()
      .from(n8nWebhookData)
      .where(and(
        eq(n8nWebhookData.instanceId, instanceId),
        eq(n8nWebhookData.isActive, true)
      ))
      .orderBy(desc(n8nWebhookData.createdAt))
      .limit(1);
    
    return result[0];
  }

  async clearN8nWebhookData(establishmentId: number): Promise<void> {
    await db
      .update(n8nWebhookData)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(
        eq(n8nWebhookData.establishmentId, establishmentId),
        eq(n8nWebhookData.isActive, true)
      ));
  }

  async deleteN8nWebhookData(establishmentId: number): Promise<void> {
    // Deletar fisicamente todos os registros para este estabelecimento
    await db
      .delete(n8nWebhookData)
      .where(eq(n8nWebhookData.establishmentId, establishmentId));
    
    // N8N webhook deletion logging removed for compute optimization
  }

  // Notification methods
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [result] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    
    return result;
  }

  async getNotifications(establishmentId: number): Promise<Notification[]> {
    const results = await db
      .select()
      .from(notifications)
      .where(eq(notifications.establishmentId, establishmentId))
      .orderBy(desc(notifications.createdAt));
    
    return results;
  }

  async getUnreadNotifications(establishmentId: number): Promise<Notification[]> {
    const results = await db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.establishmentId, establishmentId),
        eq(notifications.isRead, false)
      ))
      .orderBy(desc(notifications.createdAt));
    
    return results;
  }

  // Get unread notifications for a specific staff member (filtered by appointment staffId)
  async getUnreadNotificationsForStaff(establishmentId: number, staffId: number): Promise<any[]> {
    const results = await db
      .select({
        id: notifications.id,
        establishmentId: notifications.establishmentId,
        appointmentId: notifications.appointmentId,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt,
        staffId: appointments.staffId,
      })
      .from(notifications)
      .leftJoin(appointments, eq(notifications.appointmentId, appointments.id))
      .where(and(
        eq(notifications.establishmentId, establishmentId),
        eq(notifications.isRead, false),
        // Only show notifications for appointments assigned to this staff member
        eq(appointments.staffId, staffId)
      ))
      .orderBy(desc(notifications.createdAt));
    
    return results;
  }

  async markNotificationAsRead(id: number, establishmentId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(
        eq(notifications.id, id),
        eq(notifications.establishmentId, establishmentId)
      ));
  }

  async markAllNotificationsAsRead(establishmentId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.establishmentId, establishmentId));
  }

  // Monthly appointment limit methods
  async getMonthlyAppointmentCount(establishmentId: number, year: number, month: number): Promise<number> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const [result] = await db
      .select({ count: sql<string>`COUNT(*)` })
      .from(appointments)
      .where(
        and(
          eq(appointments.establishmentId, establishmentId),
          gte(appointments.appointmentDate, startOfMonth),
          lte(appointments.appointmentDate, endOfMonth)
        )
      );

    return parseInt(result.count);
  }

  async checkMonthlyAppointmentLimit(establishmentId: number): Promise<{ canCreate: boolean; currentCount: number; maxCount: number | null }> {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    // Get current month's appointment count
    const currentCount = await this.getMonthlyAppointmentCount(establishmentId, currentYear, currentMonth);

    // Get establishment and plan info
    const establishment = await this.getEstablishment(establishmentId);
    if (!establishment) {
      return { canCreate: false, currentCount, maxCount: null };
    }

    const plan = await this.getPlan(establishment.planId || 1);
    if (!plan) {
      return { canCreate: false, currentCount, maxCount: null };
    }

    const maxCount = plan.maxMonthlyAppointments;
    
    // If maxMonthlyAppointments is null, it means unlimited
    if (maxCount === null) {
      return { canCreate: true, currentCount, maxCount: null };
    }

    // Check if current count is below the limit
    return {
      canCreate: currentCount < maxCount,
      currentCount,
      maxCount
    };
  }

  // Staff working hours operations
  async getStaffWorkingHours(staffId: number, establishmentId: number): Promise<StaffWorkingHours[]> {
    return await db
      .select()
      .from(staffWorkingHours)
      .where(
        and(
          eq(staffWorkingHours.staffId, staffId),
          eq(staffWorkingHours.establishmentId, establishmentId)
        )
      );
  }

  async createStaffWorkingHours(workingHours: InsertStaffWorkingHours): Promise<StaffWorkingHours> {
    const [result] = await db
      .insert(staffWorkingHours)
      .values(workingHours)
      .returning();
    return result;
  }

  async updateStaffWorkingHours(id: number, workingHoursData: Partial<InsertStaffWorkingHours>): Promise<StaffWorkingHours> {
    const [result] = await db
      .update(staffWorkingHours)
      .set({ ...workingHoursData, updatedAt: sql`(now() AT TIME ZONE 'America/Sao_Paulo')` })
      .where(eq(staffWorkingHours.id, id))
      .returning();
    return result;
  }

  async deleteStaffWorkingHours(staffId: number, establishmentId: number): Promise<void> {
    await db
      .delete(staffWorkingHours)
      .where(
        and(
          eq(staffWorkingHours.staffId, staffId),
          eq(staffWorkingHours.establishmentId, establishmentId)
        )
      );
  }

  async setStaffWorkingHours(staffId: number, establishmentId: number, workingHoursData: any[]): Promise<void> {
    // Delete existing working hours for this staff member
    await this.deleteStaffWorkingHours(staffId, establishmentId);
    
    // Insert new working hours
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
  async getLoyaltyPrograms(establishmentId: number): Promise<LoyaltyProgram[]> {
    return await db.select().from(loyaltyPrograms).where(eq(loyaltyPrograms.establishmentId, establishmentId));
  }

  async getLoyaltyProgram(id: number, establishmentId: number): Promise<LoyaltyProgram | undefined> {
    const [program] = await db.select().from(loyaltyPrograms).where(
      and(eq(loyaltyPrograms.id, id), eq(loyaltyPrograms.establishmentId, establishmentId))
    );
    return program;
  }

  async createLoyaltyProgram(program: InsertLoyaltyProgram): Promise<LoyaltyProgram> {
    const [result] = await db.insert(loyaltyPrograms).values(program).returning();
    return result;
  }

  async updateLoyaltyProgram(id: number, program: Partial<InsertLoyaltyProgram>, establishmentId: number): Promise<LoyaltyProgram> {
    const [result] = await db
      .update(loyaltyPrograms)
      .set({ ...program, updatedAt: sql`(now() AT TIME ZONE 'America/Sao_Paulo')` })
      .where(and(eq(loyaltyPrograms.id, id), eq(loyaltyPrograms.establishmentId, establishmentId)))
      .returning();
    return result;
  }

  async deleteLoyaltyProgram(id: number, establishmentId: number): Promise<void> {
    await db.delete(loyaltyPrograms).where(
      and(eq(loyaltyPrograms.id, id), eq(loyaltyPrograms.establishmentId, establishmentId))
    );
  }

  // Loyalty Program Services operations
  async getLoyaltyProgramServices(programId: number, establishmentId: number): Promise<LoyaltyProgramService[]> {
    return await db.select().from(loyaltyProgramServices).where(
      and(
        eq(loyaltyProgramServices.loyaltyProgramId, programId),
        eq(loyaltyProgramServices.establishmentId, establishmentId)
      )
    );
  }

  async addServiceToLoyaltyProgram(programService: InsertLoyaltyProgramService): Promise<LoyaltyProgramService> {
    const [result] = await db.insert(loyaltyProgramServices).values(programService).returning();
    return result;
  }

  async removeServiceFromLoyaltyProgram(programId: number, serviceId: number, establishmentId: number): Promise<void> {
    await db.delete(loyaltyProgramServices).where(
      and(
        eq(loyaltyProgramServices.loyaltyProgramId, programId),
        eq(loyaltyProgramServices.serviceId, serviceId),
        eq(loyaltyProgramServices.establishmentId, establishmentId)
      )
    );
  }

  // Client Loyalty Points operations
  async getClientLoyaltyPoints(clientId: number, establishmentId: number): Promise<ClientLoyaltyPoints | undefined> {
    const [points] = await db.select().from(clientLoyaltyPoints).where(
      and(
        eq(clientLoyaltyPoints.clientId, clientId),
        eq(clientLoyaltyPoints.establishmentId, establishmentId)
      )
    );
    return points;
  }

  async createClientLoyaltyPoints(points: InsertClientLoyaltyPoints): Promise<ClientLoyaltyPoints> {
    const [result] = await db.insert(clientLoyaltyPoints).values(points).returning();
    return result;
  }

  async updateClientLoyaltyPoints(clientId: number, programId: number, points: number, establishmentId: number): Promise<ClientLoyaltyPoints> {
    const [result] = await db
      .update(clientLoyaltyPoints)
      .set({ 
        availablePoints: points,
        updatedAt: sql`(now() AT TIME ZONE 'America/Sao_Paulo')`
      })
      .where(
        and(
          eq(clientLoyaltyPoints.clientId, clientId),
          eq(clientLoyaltyPoints.loyaltyProgramId, programId),
          eq(clientLoyaltyPoints.establishmentId, establishmentId)
        )
      )
      .returning();
    return result;
  }

  async addLoyaltyPoints(clientId: number, programId: number, points: number, appointmentId: number, establishmentId: number): Promise<void> {
    // Get or create client loyalty points record
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
      await db
        .update(clientLoyaltyPoints)
        .set({
          totalPoints: sql`${clientLoyaltyPoints.totalPoints} + ${points}`,
          availablePoints: sql`${clientLoyaltyPoints.availablePoints} + ${points}`,
          lastEarnedAt: sql`(now() AT TIME ZONE 'America/Sao_Paulo')`,
          updatedAt: sql`(now() AT TIME ZONE 'America/Sao_Paulo')`
        })
        .where(eq(clientLoyaltyPoints.id, clientPoints.id));
    }

    // Create transaction record
    await this.createLoyaltyPointTransaction({
      clientId,
      loyaltyProgramId: programId,
      establishmentId,
      appointmentId,
      points,
      type: 'earned',
      description: `Pontos ganhos por serviço realizado`
    });
  }

  async addLoyaltyPointsForCompletedService(clientId: number, serviceId: number, appointmentId: number, establishmentId: number): Promise<void> {
    // Get active loyalty programs for this establishment
    const programs = await db
      .select()
      .from(loyaltyPrograms)
      .where(eq(loyaltyPrograms.establishmentId, establishmentId));

    if (programs.length === 0) {
      // Loyalty program logging removed for compute optimization
      return;
    }

    // For each program, check if this service is eligible
    for (const program of programs) {
      const eligibleServices = await db
        .select()
        .from(loyaltyProgramServices)
        .where(
          and(
            eq(loyaltyProgramServices.loyaltyProgramId, program.id),
            eq(loyaltyProgramServices.serviceId, serviceId)
          )
        );

      if (eligibleServices.length > 0) {
        // Service is eligible for this program - add points
        await this.addLoyaltyPoints(
          clientId,
          program.id,
          program.pointsPerService,
          appointmentId,
          establishmentId
        );
        // Loyalty points logging removed for compute optimization
      }
    }
  }

  async useLoyaltyPoints(clientId: number, programId: number, points: number, establishmentId: number): Promise<void> {
    const clientPoints = await this.getClientLoyaltyPoints(clientId, establishmentId);
    
    if (!clientPoints || clientPoints.availablePoints < points) {
      throw new Error('Pontos insuficientes');
    }

    await db
      .update(clientLoyaltyPoints)
      .set({
        usedPoints: sql`${clientLoyaltyPoints.usedPoints} + ${points}`,
        availablePoints: sql`${clientLoyaltyPoints.availablePoints} - ${points}`,
        lastUsedAt: sql`(now() AT TIME ZONE 'America/Sao_Paulo')`,
        updatedAt: sql`(now() AT TIME ZONE 'America/Sao_Paulo')`
      })
      .where(eq(clientLoyaltyPoints.id, clientPoints.id));

    // Create transaction record
    await this.createLoyaltyPointTransaction({
      clientId,
      loyaltyProgramId: programId,
      establishmentId,
      points: -points,
      type: 'used',
      description: `Pontos utilizados para recompensa`
    });
  }

  // Loyalty Point Transactions operations
  async getLoyaltyPointTransactions(clientId: number, establishmentId: number): Promise<LoyaltyPointTransaction[]> {
    return await db.select().from(loyaltyPointTransactions).where(
      and(
        eq(loyaltyPointTransactions.clientId, clientId),
        eq(loyaltyPointTransactions.establishmentId, establishmentId)
      )
    ).orderBy(desc(loyaltyPointTransactions.createdAt));
  }

  async createLoyaltyPointTransaction(transaction: InsertLoyaltyPointTransaction): Promise<LoyaltyPointTransaction> {
    const [result] = await db.insert(loyaltyPointTransactions).values(transaction).returning();
    return result;
  }

  // Loyalty system helpers
  async checkClientEligibleForReward(clientId: number, programId: number, establishmentId: number): Promise<boolean> {
    const clientPoints = await this.getClientLoyaltyPoints(clientId, establishmentId);
    const program = await this.getLoyaltyProgram(programId, establishmentId);
    
    if (!clientPoints || !program) return false;
    
    return clientPoints.availablePoints >= program.pointsToReward;
  }

  async getClientsWithAvailableRewards(establishmentId: number): Promise<any[]> {
    const results = await db
      .select({
        clientId: clientLoyaltyPoints.clientId,
        clientName: clients.name,
        availablePoints: clientLoyaltyPoints.availablePoints,
        pointsToReward: loyaltyPrograms.pointsToReward,
        rewardDescription: loyaltyPrograms.rewardDescription
      })
      .from(clientLoyaltyPoints)
      .innerJoin(clients, eq(clients.id, clientLoyaltyPoints.clientId))
      .innerJoin(loyaltyPrograms, eq(loyaltyPrograms.id, clientLoyaltyPoints.loyaltyProgramId))
      .where(
        and(
          eq(clientLoyaltyPoints.establishmentId, establishmentId),
          sql`${clientLoyaltyPoints.availablePoints} >= ${loyaltyPrograms.pointsToReward}`
        )
      );
    
    return results;
  }

  async getClientsWithRewards(establishmentId: number): Promise<any[]> {
    try {
      // Client loyalty points search logging removed for compute optimization
      
      const results = await db
        .select({
          clientId: clientLoyaltyPoints.clientId,
          clientName: clients.name,
          totalPoints: clientLoyaltyPoints.availablePoints,
          pointsToReward: loyaltyPrograms.pointsToReward,
          rewardDescription: loyaltyPrograms.rewardDescription,
          canRedeem: sql<boolean>`${clientLoyaltyPoints.availablePoints} >= ${loyaltyPrograms.pointsToReward}`,
          programName: loyaltyPrograms.name
        })
        .from(clientLoyaltyPoints)
        .innerJoin(clients, eq(clients.id, clientLoyaltyPoints.clientId))
        .innerJoin(loyaltyPrograms, eq(loyaltyPrograms.id, clientLoyaltyPoints.loyaltyProgramId))
        .where(
          and(
            eq(clientLoyaltyPoints.establishmentId, establishmentId),
            gt(clientLoyaltyPoints.availablePoints, 0)
          )
        );
      
      // Client loyalty points results logging removed for compute optimization
      return results;
    } catch (error) {
      console.error("Erro ao buscar clientes com pontos:", error);
      throw error;
    }
  }

  // Agenda Release Policies
  async getAgendaReleasePolicy(establishmentId: number): Promise<AgendaReleasePolicy | undefined> {
    const [policy] = await db.select()
      .from(agendaReleasePolicies)
      .where(and(
        eq(agendaReleasePolicies.establishmentId, establishmentId),
        eq(agendaReleasePolicies.isActive, true)
      ));
    return policy || undefined;
  }

  // Calcular automaticamente os meses que devem estar liberados baseado na política
  async calculateReleasedMonths(establishmentId: number): Promise<string[]> {
    const policy = await this.getAgendaReleasePolicy(establishmentId);
    if (!policy) {
      return [];
    }

    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const releaseDay = policy.releaseDay;
    const releaseInterval = policy.releaseInterval;
    
    const releasedMonths: string[] = [];
    
    // Se ainda não chegou o dia de liberação do mês atual, não libera meses futuros ainda
    let startMonth: Date;
    if (currentDay >= releaseDay) {
      // Já passou do dia de liberação, então libera a partir do próximo mês
      startMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    } else {
      // Ainda não chegou o dia de liberação, então libera a partir do mês atual
      startMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    }
    
    // Gerar os meses liberados baseado no intervalo
    for (let i = 0; i < releaseInterval; i++) {
      const monthToRelease = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
      const monthString = `${monthToRelease.getFullYear()}-${(monthToRelease.getMonth() + 1).toString().padStart(2, '0')}`;
      releasedMonths.push(monthString);
    }
    
    return releasedMonths;
  }

  async createOrUpdateAgendaReleasePolicy(policyData: any): Promise<AgendaReleasePolicy> {
    const existingPolicy = await this.getAgendaReleasePolicy(policyData.establishmentId);
    
    if (existingPolicy) {
      const [updated] = await db
        .update(agendaReleasePolicies)
        .set({
          ...policyData,
          updatedAt: sql`(now() AT TIME ZONE 'America/Sao_Paulo')`
        })
        .where(eq(agendaReleasePolicies.id, existingPolicy.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(agendaReleasePolicies)
        .values(policyData)
        .returning();
      return created;
    }
  }

  async createOrUpdateAgendaReleasePolicyOld(policy: InsertAgendaReleasePolicy): Promise<AgendaReleasePolicy> {
    // Desativar política existente
    await db.update(agendaReleasePolicies)
      .set({ isActive: false })
      .where(eq(agendaReleasePolicies.establishmentId, policy.establishmentId));

    // Criar nova política
    const [newPolicy] = await db.insert(agendaReleasePolicies)
      .values(policy)
      .returning();
    return newPolicy;
  }

  async getAgendaReleases(establishmentId: number): Promise<AgendaRelease[]> {
    const releases = await db.select()
      .from(agendaReleases)
      .where(eq(agendaReleases.establishmentId, establishmentId))
      .orderBy(desc(agendaReleases.releaseDate));
    return releases;
  }

  async createAgendaRelease(release: InsertAgendaRelease): Promise<AgendaRelease> {
    const [newRelease] = await db.insert(agendaReleases)
      .values(release)
      .returning();
    return newRelease;
  }



  async updateEstablishmentTimezone(establishmentId: number, timezone: string): Promise<void> {
    await db
      .update(establishments)
      .set({ timezone })
      .where(eq(establishments.id, establishmentId));
  }
}

export const storage = new DatabaseStorage();