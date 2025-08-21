import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { appointments, clientLoyaltyPoints, clients, loyaltyPrograms, pushSubscriptions, plans, establishments, pendingRegistrations, passwordResetTokens, users, staffVacations } from "@shared/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { insertEstablishmentSchema, insertUserSchema, insertClientSchema, insertStaffSchema, insertServiceSchema, insertServiceCategorySchema, insertAppointmentSchema, insertProductSchema, insertTransactionSchema, insertBusinessSettingsSchema, staffWorkingHours, insertPushSubscriptionSchema, insertStaffVacationSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import Stripe from "stripe";
import { sendNewAppointmentEmail, sendAppointmentNotification, sendPasswordResetEmail } from "./emailService";
import { nanoid } from "nanoid";
import { n8nWebhookData } from "@shared/schema";

// Extend express session type
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    establishmentId?: number;
    role?: string;
  }
}

// Cache para contexto de usuário (5 minutos)
const userContextCache = new Map<string, { context: any, timestamp: number }>();
const CONTEXT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Middleware to extract user context from authentication
function getUserContext(req: any) {
  const userId = req.session?.userId || req.headers['x-user-id'];
  const establishmentId = req.session?.establishmentId || req.headers['x-establishment-id'];
  const role = req.session?.role || req.headers['x-user-role'];
  
  if (!userId || !establishmentId) {
    throw new Error('Authentication required');
  }
  
  // Cache key based on user session
  const cacheKey = `${userId}-${establishmentId}-${role}`;
  const now = Date.now();
  const cached = userContextCache.get(cacheKey);
  
  if (cached && (now - cached.timestamp) < CONTEXT_CACHE_DURATION) {
    return cached.context;
  }
  
  const context = { 
    userId: parseInt(String(userId)), 
    establishmentId: parseInt(String(establishmentId)),
    role: String(role || 'admin'),
    userRole: String(role || 'admin') // Alias para compatibilidade
  };
  
  // Cache the context
  userContextCache.set(cacheKey, { context, timestamp: now });
  
  // Clean old cache entries (basic cleanup)
  if (userContextCache.size > 1000) {
    const entries = Array.from(userContextCache.entries());
    entries.forEach(([key, value]) => {
      if ((now - value.timestamp) > CONTEXT_CACHE_DURATION) {
        userContextCache.delete(key);
      }
    });
  }
  
  return context;
}

// Authentication middleware
function requireAuth(req: any, res: any, next: any) {
  try {
    getUserContext(req);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication required' });
  }
}

// Admin only middleware
function requireAdmin(req: any, res: any, next: any) {
  try {
    const { userRole } = getUserContext(req);
    if (userRole !== 'admin' && userRole !== 'manager' && userRole !== 'owner') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication required' });
  }
}

// Configurar Stripe - usar chave de teste quando disponível
const stripeKey = process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY or STRIPE_TEST_SECRET_KEY');
}
const stripe = new Stripe(stripeKey, {
  apiVersion: "2023-08-16" as any,
});

// Stripe configuration log removed for compute optimization
// Stripe mode logging removed for compute optimization

export async function registerRoutes(app: Express): Promise<Server> {

  // Authentication routes
  app.get("/api/auth/me", async (req, res) => {
    try {
      // Check if user is authenticated via session or localStorage simulation
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

  app.get("/api/auth/user", requireAuth, async (req, res) => {
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

  // Endpoint para buscar planos disponíveis
  app.get("/api/plans", async (req, res) => {
    try {
      const availablePlans = await db.select().from(plans).where(eq(plans.isActive, true));
      res.json(availablePlans);
    } catch (error) {
      // Error log removed for compute optimization
      res.status(500).json({ error: "Erro ao buscar planos" });
    }
  });

  // Endpoint para criar assinatura com Stripe
  app.post("/api/create-subscription", async (req, res) => {
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

      // Buscar informações do plano
      const [selectedPlan] = await db.select().from(plans).where(eq(plans.id, planId));
      if (!selectedPlan) {
        return res.status(400).json({ error: "Plano não encontrado" });
      }

      // Criar cliente no Stripe
      const customer = await stripe.customers.create({
        email: email,
        name: ownerName,
        metadata: {
          establishment_name: establishmentName,
          plan_id: planId.toString()
        }
      });

      // Links de pagamento do Stripe por plano com email bloqueado (somente leitura)
      const baseUrl = process.env.BASE_URL || 'https://salaoonline-render.onrender.com';
      const encodedEmail = encodeURIComponent(email);
      
      const stripeLinks = {
        1: `https://buy.stripe.com/00w8wQ6Y83eq2un3EBfIs00?locked_prefilled_email=${encodedEmail}&success_url=${baseUrl}/pagamento-callback?success=true&session_id={CHECKOUT_SESSION_ID}&cancel_url=${baseUrl}/pagamento-callback?canceled=true`, // Base (produção)
        2: `https://buy.stripe.com/8x2cN60zK9CO2unejffIs01?locked_prefilled_email=${encodedEmail}&success_url=${baseUrl}/pagamento-callback?success=true&session_id={CHECKOUT_SESSION_ID}&cancel_url=${baseUrl}/pagamento-callback?canceled=true`, // Core
        3: `https://buy.stripe.com/5kQcN6fuEeX85Gz4IFfIs02?locked_prefilled_email=${encodedEmail}&success_url=${baseUrl}/pagamento-callback?success=true&session_id={CHECKOUT_SESSION_ID}&cancel_url=${baseUrl}/pagamento-callback?canceled=true`  // Expert
      };

      const paymentLink = stripeLinks[planId as keyof typeof stripeLinks];
      if (!paymentLink) {
        return res.status(400).json({ error: "Link de pagamento não encontrado para este plano" });
      }

      // Salvar dados temporariamente no banco de dados
      const hashedPassword = await bcrypt.hash(password, 10);
      const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

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
        paymentLink: paymentLink,
        customerId: customer.id
      });

    } catch (error: any) {
      // Subscription creation error log removed for compute optimization
      res.status(500).json({ error: "Erro ao criar assinatura: " + error.message });
    }
  });

  // Endpoint para completar registro após pagamento confirmado
  app.post("/api/complete-registration", async (req, res) => {
    try {
      const { stripeCustomerId } = req.body;

      // Buscar dados do registro pendente
      const [pendingReg] = await db.select()
        .from(pendingRegistrations)
        .where(and(
          eq(pendingRegistrations.stripeCustomerId, stripeCustomerId),
          eq(pendingRegistrations.status, 'pending')
        ));

      if (!pendingReg) {
        return res.status(404).json({ error: "Registro pendente não encontrado" });
      }

      // Verificar se não expirou
      if (new Date() > pendingReg.expiresAt) {
        return res.status(400).json({ error: "Registro expirado" });
      }

      // Criar estabelecimento
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
        subscriptionStatus: 'active'
      }).returning();

      // Criar usuário administrador
      await storage.createUser({
        establishmentId: establishment.id,
        email: pendingReg.email,
        name: pendingReg.userName,
        password: pendingReg.password, // já está hasheado
        role: 'admin'
      });

      // Marcar registro como completado
      await db.update(pendingRegistrations)
        .set({ status: 'completed' })
        .where(eq(pendingRegistrations.id, pendingReg.id));

      res.json({ success: true, establishmentId: establishment.id });

    } catch (error: any) {
      // Registration completion error log removed for compute optimization
      res.status(500).json({ error: "Erro ao completar registro: " + error.message });
    }
  });

  // Webhook do Stripe agora está registrado no server/index.ts antes dos middlewares

  // Função para processar pagamento confirmado
  async function processCompletedPayment(stripeCustomerId: string) {
    // Stripe customer lookup log removed for compute optimization
    
    // Primeiro tentar buscar por customer ID exato
    let pendingRegs = await db.select()
      .from(pendingRegistrations)
      .where(and(
        eq(pendingRegistrations.stripeCustomerId, stripeCustomerId),
        eq(pendingRegistrations.status, 'pending')
      ));
      
    // Registration records log removed for compute optimization
    
    // Se não encontrar, buscar customer no Stripe e procurar por email
    if (pendingRegs.length === 0) {
      // Stripe customer search log removed for compute optimization
      
      try {
        const stripeCustomer = await stripe.customers.retrieve(stripeCustomerId);
        if (stripeCustomer && !stripeCustomer.deleted && stripeCustomer.email) {
          // Stripe customer email logging removed for compute optimization
          
          // Buscar por email em registros pendentes
          pendingRegs = await db.select()
            .from(pendingRegistrations)
            .where(and(
              eq(pendingRegistrations.email, stripeCustomer.email),
              eq(pendingRegistrations.status, 'pending')
            ));
            
          // Pending registrations count logging removed for compute optimization
          
          // Atualizar o registro com o novo customer ID do Stripe
          if (pendingRegs.length > 0) {
            // Customer ID update logging removed for compute optimization
            await db.update(pendingRegistrations)
              .set({ stripeCustomerId: stripeCustomerId })
              .where(eq(pendingRegistrations.id, pendingRegs[0].id));
          }
        }
      } catch (error) {
        // Stripe customer error logging removed for compute optimization
      }
    }
    
    // Pending registrations list logging removed for compute optimization
    
    const [pendingReg] = pendingRegs;

    if (!pendingReg) {
      throw new Error("Registro pendente não encontrado");
    }

    // Pending registration found logging removed for compute optimization

    // Verificar se não expirou
    if (new Date() > pendingReg.expiresAt) {
      throw new Error("Registro expirado");
    }

    // Criar estabelecimento
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
      subscriptionStatus: 'active'
    }).returning();

    // Criar usuário administrador
    await storage.createUser({
      establishmentId: establishment.id,
      email: pendingReg.email,
      name: pendingReg.userName,
      password: pendingReg.password, // já está hasheado
      role: 'admin'
    });

    // Marcar registro como completado
    await db.update(pendingRegistrations)
      .set({ status: 'completed' })
      .where(eq(pendingRegistrations.id, pendingReg.id));

    return establishment;
  }

  // Endpoint para confirmar pagamento manualmente
  app.post("/api/confirm-payment-manual", async (req, res) => {
    try {
      const { stripeCustomerId } = req.body;
      
      if (!stripeCustomerId) {
        return res.status(400).json({ error: "Customer ID é obrigatório" });
      }

      // Processar o pagamento usando a função existente
      const establishment = await processCompletedPayment(stripeCustomerId);
      
      res.json({ 
        success: true, 
        message: "Conta criada com sucesso!",
        establishmentId: establishment.id 
      });

    } catch (error: any) {
      // Manual payment confirmation error log removed for compute optimization
      res.status(500).json({ error: "Erro ao confirmar pagamento: " + error.message });
    }
  });
  
  // Endpoint para buscar dias disponíveis de um profissional
  app.get("/api/staff/:staffId/available-days", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const staffId = parseInt(req.params.staffId);
      const { month, year } = req.query;
      
      const staffWorkingHours = await storage.getStaffWorkingHours(staffId, establishmentId);
      
      if (!staffWorkingHours || staffWorkingHours.length === 0) {
        return res.json({ availableDays: [] });
      }
      
      // Se month e year são fornecidos, retornar dias específicos do mês
      if (month && year) {
        const targetMonth = parseInt(month as string);
        const targetYear = parseInt(year as string);
        
        // Buscar férias/folgas do colaborador para o período  
        const staffVacationsData = await db.select()
          .from(staffVacations)
          .where(and(
            eq(staffVacations.staffId, staffId), 
            eq(staffVacations.establishmentId, establishmentId), 
            eq(staffVacations.isActive, true)
          ));
        
        const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
        const availableSpecificDays = [];
        
        // Data atual
        const now = new Date();
        const currentDay = now.getDate();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        
        // Determinar o dia inicial
        let startDay = 1;
        if (targetMonth === currentMonth && targetYear === currentYear) {
          startDay = currentDay; // Se for o mês atual, começar do dia atual
        }
        
        for (let day = startDay; day <= daysInMonth; day++) {
          const date = new Date(targetYear, targetMonth - 1, day);
          const dayOfWeek = date.getDay();
          const dateStr = `${targetYear}-${targetMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          
          // Verificar se o profissional trabalha neste dia da semana
          const workingDay = staffWorkingHours.find(h => h.dayOfWeek === dayOfWeek && h.isAvailable);
          
          if (workingDay) {
            // Verificar se o profissional está de férias neste dia
            const isOnVacation = staffVacationsData.some((vacation: any) => {
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
                formattedDate: `${day.toString().padStart(2, '0')}/${targetMonth.toString().padStart(2, '0')}/${targetYear}`,
                dayName: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][dayOfWeek],
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
      
      // Retorno padrão - dias da semana que o profissional trabalha
      const availableDays = staffWorkingHours
        .filter(hours => hours.isAvailable)
        .map(hours => ({
          dayOfWeek: hours.dayOfWeek,
          dayName: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][hours.dayOfWeek],
          openTime: hours.openTime,
          closeTime: hours.closeTime
        }));
      
      res.json({ 
        staffId,
        availableDays 
      });
    } catch (error) {
      // Staff available days error log removed for compute optimization
      res.status(500).json({ error: "Erro ao buscar dias disponíveis" });
    }
  });



  // Endpoint para buscar horários disponíveis de um profissional em uma data específica
  app.get("/api/staff/:staffId/available-times", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const staffId = parseInt(req.params.staffId);
      const { date, serviceId } = req.query;
      
      if (!date) {
        return res.status(400).json({ error: "Data é obrigatória" });
      }

      let serviceDuration = 30;
      if (serviceId) {
        const service = await storage.getService(parseInt(String(serviceId)), establishmentId);
        if (service) {
          serviceDuration = service.duration;
        }
      }
      
      const staffWorkingHours = await storage.getStaffWorkingHours(staffId, establishmentId);
      const appointments = await storage.getAppointments(establishmentId);
      
      // Check if staff is on vacation/time-off on this date
      const dateStr = String(date);
      
      const dayOfWeek = new Date(dateStr).getDay();
      
      const staffDayHours = staffWorkingHours.find(h => 
        h.dayOfWeek === dayOfWeek && h.isAvailable
      );
      
      if (!staffDayHours) {
        return res.json({
          staffId,
          date: dateStr,
          available: false,
          message: "Profissional não trabalha neste dia",
          timeSlots: []
        });
      }

      // Verificar se o profissional está de férias nesta data
      const { db } = await import("./db");
      const { staffVacations } = await import("@shared/schema");
      const { eq, and } = await import("drizzle-orm");
      
      const staffVacationsData = await db.select()
        .from(staffVacations)
        .where(and(
          eq(staffVacations.establishmentId, establishmentId), 
          eq(staffVacations.staffId, staffId),
          eq(staffVacations.isActive, true)
        ));

      // Verificar se há férias ativas na data solicitada
      const isOnVacation = staffVacationsData.some(vacation => {
        const vacationStart = new Date(vacation.startDate);
        const vacationEnd = new Date(vacation.endDate);
        const checkDate = new Date(dateStr);
        
        // Set times to start of day for accurate comparison
        vacationStart.setHours(0, 0, 0, 0);
        vacationEnd.setHours(23, 59, 59, 999);
        checkDate.setHours(12, 0, 0, 0);
        
        return checkDate >= vacationStart && checkDate <= vacationEnd;
      });

      if (isOnVacation) {
        const vacationInfo = staffVacationsData.find(vacation => {
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
          message: `Profissional de ${vacationInfo?.type || 'férias'}: ${vacationInfo?.reason || 'Não disponível nesta data'}`,
          timeSlots: []
        });
      }
      
      const appointmentsForDate = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
        return aptDate === dateStr && apt.staffId === staffId;
      });
      
      const [openHour, openMinute] = (staffDayHours.openTime || '09:00').split(':').map(Number);
      const [closeHour, closeMinute] = (staffDayHours.closeTime || '18:00').split(':').map(Number);
      
      const timeSlots = [];
      // Ajustar para fuso horário brasileiro (UTC-3)
      const now = new Date();
      const brazilTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
      const today = brazilTime.toISOString().split('T')[0];
      const currentHour = brazilTime.getHours();
      const currentMinute = brazilTime.getMinutes();
      
      for (let hour = openHour; hour < closeHour || (hour === closeHour && 0 < closeMinute); hour++) {
        for (let minute = 0; minute < 60; minute += 10) {
          if (hour === closeHour && minute >= closeMinute) break;
          
          const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          
          const isPast = dateStr === today && (
            hour < currentHour || 
            (hour === currentHour && minute <= currentMinute)
          );
          
          const endTime = new Date(2000, 0, 1, hour, minute + serviceDuration);
          const endTimeStr = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
          
          const serviceEndsAfterClose = endTime.getHours() > closeHour || 
            (endTime.getHours() === closeHour && endTime.getMinutes() > closeMinute);
          
          const isBooked = appointmentsForDate.some(apt => {
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
      // Staff available times error log removed for compute optimization
      res.status(500).json({ error: "Erro ao buscar horários disponíveis" });
    }
  });

  // ===== ROTAS N8N COM PRIORIDADE MÁXIMA - ANTES DE TODAS AS OUTRAS =====
  
  // Endpoint para buscar informações completas do estabelecimento (sem autenticação)
  app.get("/api/n8n/establishment/:id/info", (req, res) => {
    // Forçar resposta JSON imediatamente
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Processar imediatamente sem async para evitar interceptação
    const establishmentId = parseInt(req.params.id);
    
    if (!establishmentId) {
      return res.status(400).json({ 
        error: "ID do estabelecimento é obrigatório" 
      });
    }

    // Usar Promise para manter compatibilidade
    (async () => {
      try {
        // Buscar informações do estabelecimento
        const establishment = await storage.getEstablishment(establishmentId);
        if (!establishment) {
          return res.status(404).json({ 
            error: "Estabelecimento não encontrado" 
          });
        }

        // Buscar dados relacionados
        const [services, staff, businessHours] = await Promise.all([
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
          services: services.map(service => ({
            id: service.id,
            name: service.name,
            description: service.description,
            price: service.price,
            duration: service.duration,
            category: service.category
          })),
          staff: staff.map(member => ({
            id: member.id,
            name: member.name,
            email: member.email,
            phone: member.phone,
            specialties: member.specialties
          })),
          businessHours: businessHours.map(hour => ({
            dayOfWeek: hour.dayOfWeek,
            openTime: hour.openTime,
            closeTime: hour.closeTime,
            isOpen: hour.isOpen
          }))
        });
      } catch (error) {
        // N8N establishment info error log removed for compute optimization
        res.status(500).json({ 
          error: "Erro interno do servidor",
          message: error instanceof Error ? error.message : "Unknown error"
        });
      }
    })();
  });



  // Endpoint duplicado removido - mantendo apenas o endpoint mais completo nas linhas 4972+

  // Endpoint para confirmar agendamento (sem autenticação)
  app.put("/api/n8n/appointment/:id/confirm", (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const appointmentId = parseInt(req.params.id);
    
    if (!appointmentId) {
      return res.status(400).json({ 
        error: "ID do agendamento é obrigatório" 
      });
    }

    (async () => {
      try {
        const appointment = await storage.getAppointment(appointmentId, req.body.establishmentId);
        if (!appointment) {
          return res.status(404).json({ 
            error: "Agendamento não encontrado" 
          });
        }

        const updatedAppointment = await storage.updateAppointmentStatus(appointmentId, "confirmado", req.body.establishmentId);

        res.json({
          success: true,
          message: "Agendamento confirmado com sucesso",
          data: {
            appointmentId: updatedAppointment.id,
            status: updatedAppointment.status,
            confirmedAt: new Date().toISOString()
          }
        });
      } catch (error) {
        // N8N appointment confirmation error log removed for compute optimization
        res.status(500).json({ 
          error: "Erro interno do servidor",
          message: error instanceof Error ? error.message : "Unknown error"
        });
      }
    })();
  });

  // ===== ROTAS NORMAIS DO SISTEMA =====
  
  // Establishment registration route
  app.post("/api/register/establishment", async (req, res) => {
    try {
      const { establishment, user } = req.body;
      
      // Validate input data
      const establishmentData = insertEstablishmentSchema.parse(establishment);
      const userData = insertUserSchema.omit({ establishmentId: true }).parse(user);

      // Check if establishment email already exists
      const existingEstablishment = await storage.getEstablishmentByEmail(establishmentData.email);
      if (existingEstablishment) {
        return res.status(400).json({ message: "Email já está em uso por outro estabelecimento" });
      }

      // Create establishment with terms acceptance
      const now = new Date();
      const newEstablishment = await storage.createEstablishment({
        ...establishmentData,
        termsAcceptedAt: now,
        privacyPolicyAcceptedAt: now,
        termsVersion: "1.0",
        privacyPolicyVersion: "1.0"
      });

      // Hash password and create admin user
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const newUser = await storage.createUser({
        ...userData,
        establishmentId: newEstablishment.id,
        password: hashedPassword,
        role: "admin",
      });

      // Return success with user data (excluding password)
      const { password, ...userWithoutPassword } = newUser;
      res.json({
        establishment: newEstablishment,
        user: userWithoutPassword,
        message: "Estabelecimento criado com sucesso!"
      });
    } catch (error: any) {
      console.error("Establishment registration error:", error);
      res.status(400).json({ 
        message: error.message || "Erro ao criar estabelecimento" 
      });
    }
  });

  // Authentication routes
  app.post("/api/register", async (req, res) => {
    try {
      const { name, email, password, establishmentName, phone, segment, selectedPlan } = req.body;
      
      // Convert selectedPlan to number
      const planId = parseInt(selectedPlan);
      if (!planId || planId < 1 || planId > 3) {
        return res.status(400).json({ message: "Plano inválido selecionado" });
      }

      // Validate required fields
      if (!establishmentName || !phone || !segment) {
        return res.status(400).json({ message: "Nome do estabelecimento, telefone e segmento são obrigatórios" });
      }

      // Check if user email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email já está em uso" });
      }

      // Create establishment with provided data and terms acceptance
      const now = new Date();
      const establishment = await storage.createEstablishment({
        name: establishmentName,
        ownerName: name,
        email: email,
        phone: phone,
        whatsappNumber: phone,
        segment: segment,
        address: "",
        planId: planId,
        termsAcceptedAt: now,
        privacyPolicyAcceptedAt: now,
        termsVersion: "1.0",
        privacyPolicyVersion: "1.0"
      });

      // Hash password and create admin user
      const cleanPassword = password.trim();
      const hashedPassword = await bcrypt.hash(cleanPassword, 10);
      
      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        role: "admin",
        establishmentId: establishment.id
      });

      // Return user data for automatic login
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

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const normalizedEmail = email.toLowerCase();
      const user = await storage.getUserByEmail(normalizedEmail);
      if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      
      // Verificar senha usando bcrypt
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      
      // Set session data for subsequent requests
      req.session.userId = user.id;
      req.session.establishmentId = user.establishmentId;
      req.session.role = user.role || 'admin';
      
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

  app.post("/api/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ message: "Erro ao fazer logout" });
        }
        res.clearCookie('connect.sid');
        res.json({ message: "Logout realizado com sucesso" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Erro ao fazer logout" });
    }
  });

  // Endpoint para solicitar redefinição de senha
  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email é obrigatório" });
      }
      
      // Buscar usuário pelo email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Retornar sucesso mesmo se o usuário não existir (por segurança)
        return res.json({ message: "Se este email existir em nossos registros, você receberá um link para redefinir sua senha." });
      }

      // Buscar informações do estabelecimento
      const [establishment] = await db.select()
        .from(establishments)
        .where(eq(establishments.id, user.establishmentId));
      
      // Gerar token de redefinição
      const resetToken = nanoid(32);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
      
      // Salvar token no banco
      await db.insert(passwordResetTokens).values({
        email: email.toLowerCase(),
        token: resetToken,
        expiresAt,
        used: false
      });
      
      // Enviar email de redefinição
      await sendPasswordResetEmail(
        email,
        resetToken,
        establishment?.name
      );
      
      res.json({ message: "Se este email existir em nossos registros, você receberá um link para redefinir sua senha." });
      
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Endpoint para verificar validade do token de redefinição
  app.get("/api/reset-password/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      // Buscar token no banco
      const [resetToken] = await db.select()
        .from(passwordResetTokens)
        .where(and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, false),
          gte(passwordResetTokens.expiresAt, new Date())
        ));
      
      if (!resetToken) {
        return res.status(400).json({ message: "Token inválido ou expirado" });
      }
      
      res.json({ valid: true, email: resetToken.email });
      
    } catch (error) {
      console.error("Verify reset token error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Endpoint para redefinir senha
  app.post("/api/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token e nova senha são obrigatórios" });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres" });
      }
      
      // Buscar token no banco
      const [resetToken] = await db.select()
        .from(passwordResetTokens)
        .where(and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, false),
          gte(passwordResetTokens.expiresAt, new Date())
        ));
      
      if (!resetToken) {
        return res.status(400).json({ message: "Token inválido ou expirado" });
      }
      
      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Atualizar senha do usuário
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.email, resetToken.email));
      
      // Marcar token como usado
      await db.update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.id, resetToken.id));
      
      res.json({ message: "Senha redefinida com sucesso" });
      
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Endpoint para aceitar termos de uso
  app.post("/api/accept-terms", requireAuth, async (req, res) => {
    try {
      const { establishmentId } = req.body;
      const { termsVersion = "1.0", privacyPolicyVersion = "1.0" } = req.body;

      if (!establishmentId) {
        return res.status(400).json({ message: "ID do estabelecimento é obrigatório" });
      }

      const now = new Date();
      
      // Atualizar o estabelecimento com informações de aceitação dos termos
      await db.update(establishments)
        .set({
          termsAcceptedAt: now,
          privacyPolicyAcceptedAt: now,
          termsVersion,
          privacyPolicyVersion,
          updatedAt: now
        })
        .where(eq(establishments.id, establishmentId));

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

  // Endpoint para verificar status dos termos
  app.get("/api/terms-status/:establishmentId", requireAuth, async (req, res) => {
    try {
      const { establishmentId } = req.params;
      
      const [establishment] = await db.select({
        termsAcceptedAt: establishments.termsAcceptedAt,
        privacyPolicyAcceptedAt: establishments.privacyPolicyAcceptedAt,
        termsVersion: establishments.termsVersion,
        privacyPolicyVersion: establishments.privacyPolicyVersion
      })
      .from(establishments)
      .where(eq(establishments.id, parseInt(establishmentId)));

      if (!establishment) {
        return res.status(404).json({ message: "Estabelecimento não encontrado" });
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

  // Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const { establishmentId, userId, role } = getUserContext(req);
      // Dashboard stats logging removed for compute optimization
      
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      
      // Only return admin stats for admin users
      // Staff users will use a separate endpoint
      if (role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const stats = await storage.getDashboardStats(establishmentId);
      res.json(stats);
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // New endpoint specifically for staff dashboard data
  app.get("/api/staff/dashboard-data", async (req, res) => {
    try {
      // Staff dashboard API logging removed for compute optimization
      const { establishmentId, userId, role } = getUserContext(req);
      
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      
      if (role !== 'staff') {
        return res.status(403).json({ message: "Staff access required" });
      }
      
      const staffMember = await storage.getStaffByUserId(userId, establishmentId);
      if (!staffMember) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      // Get staff data including next appointment
      const staffData = await storage.getCompleteStaffData(establishmentId, staffMember.id);
      res.json(staffData);
    } catch (error) {
      console.error("Staff dashboard API error:", error);
      res.status(500).json({ message: "Failed to fetch staff dashboard data" });
    }
  });

  app.get("/api/dashboard/recent-appointments", async (req, res) => {
    try {
      const { establishmentId, userId, userRole } = getUserContext(req);
      // Dashboard recent appointments role logging removed for compute optimization
      
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      
      let appointments;
      
      // If user is staff, only show their appointments
      if (userRole === 'staff') {
        // Staff user detection and member lookup logging removed for compute optimization
        const staffMember = await storage.getStaffByUserId(userId, establishmentId);
        
        if (staffMember) {
          appointments = await storage.getTodaysAppointmentsForStaff(establishmentId, staffMember.id);
          // Found appointments count logging removed for compute optimization
        } else {
          appointments = [];
        }
      } else {
        // Admin/Manager user detection logging removed for compute optimization
        // For managers and owners, show all appointments
        appointments = await storage.getTodaysAppointments(establishmentId);
        // Found appointments count logging removed for compute optimization
      }
      
      res.json(appointments);
    } catch (error) {
      console.error("Get recent appointments error:", error);
      res.status(500).json({ message: "Failed to fetch recent appointments" });
    }
  });

  // Client routes - Admin only
  app.get("/api/clients", requireAdmin, async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const clients = await storage.getClients(establishmentId);
      res.json(clients);
    } catch (error) {
      console.error("Get clients error:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  // Staff-accessible endpoint for getting clients list (read-only for appointments)
  app.get("/api/clients/list", requireAuth, async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const clients = await storage.getClients(establishmentId);
      res.json(clients);
    } catch (error) {
      console.error("Get clients list error:", error);
      res.status(500).json({ message: "Failed to fetch clients list" });
    }
  });

  app.get("/api/clients/search", requireAdmin, async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.json([]);
      }
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const clients = await storage.searchClients(q, establishmentId);
      res.json(clients);
    } catch (error) {
      console.error("Search clients error:", error);
      res.status(500).json({ message: "Failed to search clients" });
    }
  });

  app.get("/api/clients/:id", requireAdmin, async (req, res) => {
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

  app.post("/api/clients", requireAdmin, async (req, res) => {
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
      
      // Send WebSocket notification for client change
      try {
        const { wsManager } = await import("./websocket");
        if (wsManager) {
          wsManager.notifyClientChange(establishmentId, {
            type: 'client_created',
            clientId: client.id,
            clientName: client.name
          });
        }
      } catch (wsError) {
                  // WebSocket notification error logging removed for compute optimization
      }
      
      res.json(client);
    } catch (error) {
      console.error("Create client error:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put("/api/clients/:id", requireAdmin, async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const id = parseInt(req.params.id);
      const clientData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, clientData, establishmentId);
      
      // Send WebSocket notification for client change
      try {
        const { wsManager } = await import("./websocket");
        if (wsManager) {
          wsManager.notifyClientChange(establishmentId, {
            type: 'client_updated',
            clientId: id,
            clientName: client.name
          });
        }
      } catch (wsError) {
                  // WebSocket notification error logging removed for compute optimization
      }
      
      res.json(client);
    } catch (error) {
      console.error("Update client error:", error);
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const id = parseInt(req.params.id);
      await storage.deleteClient(id, establishmentId);
      
      // Send WebSocket notification for client change
      try {
        const { wsManager } = await import("./websocket");
        if (wsManager) {
          wsManager.notifyClientChange(establishmentId, {
            type: 'client_deleted',
            clientId: id
          });
        }
      } catch (wsError) {
                  // WebSocket notification error logging removed for compute optimization
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Delete client error:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Staff routes
  app.get("/api/staff", requireAdmin, async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const staffList = await storage.getStaff(establishmentId);
      res.json(staffList);
    } catch (error: any) {
      console.error("Get staff error:", error);
      if (error?.message === 'Authentication required') {
        return res.status(401).json({ message: "Authentication required" });
      }
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  // Staff-accessible endpoint for getting staff list (read-only for appointments)
  app.get("/api/staff/list", requireAuth, async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const staffList = await storage.getStaff(establishmentId);
      res.json(staffList);
    } catch (error: any) {
      console.error("Get staff list error:", error);
      if (error?.message === 'Authentication required') {
        return res.status(401).json({ message: "Authentication required" });
      }
      res.status(500).json({ message: "Failed to fetch staff list" });
    }
  });

  app.post("/api/staff", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      
      // Check staff limit before creating new staff member
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
      
      const requestBody = req.body as any;
      const staffData = insertStaffSchema.parse({
        ...requestBody,
        email: requestBody.email ? requestBody.email.toLowerCase() : requestBody.email,
        establishmentId
      });
      
      // Create staff member
      const staff = await storage.createStaff(staffData);
      
      // If staff has system access, create corresponding user
      if (requestBody.hasSystemAccess && requestBody.email && requestBody.password) {
        try {
          const normalizedEmail = requestBody.email.toLowerCase();
          // Check if user already exists
          const existingUser = await storage.getUserByEmail(normalizedEmail);
          if (!existingUser) {
            // Create user for the staff member
            const userData = {
              name: requestBody.name,
              email: normalizedEmail,
              password: requestBody.password, // Will be hashed in storage.createUser
              role: "staff" as const,
              establishmentId: establishmentId,
              staffId: staff.id
            };
            await storage.createUser(userData);
                        // User account creation logging removed for compute optimization
          } else {
                        // User account exists logging removed for compute optimization
          }
        } catch (userError) {
          console.error("Error creating user account for staff:", userError);
          // Don't fail the staff creation if user creation fails
        }
      }
      
      res.json(staff);
    } catch (error) {
      console.error("Create staff error:", error);
      res.status(500).json({ message: "Failed to create staff member" });
    }
  });

  app.put("/api/staff/:id", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const id = parseInt(req.params.id);
      const staffData = insertStaffSchema.partial().parse(req.body);
      const staff = await storage.updateStaff(id, staffData);
      
      // If staff now has system access, create corresponding user account
      if (staffData.hasSystemAccess && staffData.email) {
        try {
          // Check if user already exists
          const existingUser = await storage.getUserByEmail(staffData.email);
          if (!existingUser) {
            // Get the staff password from the staff record
            const fullStaffData = await storage.getStaffMember(id, establishmentId);
            if (fullStaffData && fullStaffData.password) {
              // Create user for the staff member
              const userData = {
                name: staffData.name || fullStaffData.name,
                email: staffData.email,
                password: fullStaffData.password, // Use existing staff password
                role: "staff" as const,
                establishmentId: establishmentId,
                staffId: id
              };
              await storage.createUser(userData);
                            // Existing staff user creation logging removed for compute optimization
            }
          } else if (existingUser.staffId !== id) {
            // Update existing user to link with this staff member  
            // Note: updateUser method needs to be added to storage interface
                        // User account exists check logging removed for compute optimization
                        // Staff user account link logging removed for compute optimization
          }
        } catch (userError) {
          console.error("Error creating/updating user account for staff:", userError);
          // Don't fail the staff update if user creation fails
        }
      }
      
      res.json(staff);
    } catch (error) {
      console.error("Update staff error:", error);
      res.status(500).json({ message: "Failed to update staff member" });
    }
  });

  app.delete("/api/staff/:id", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const id = parseInt(req.params.id);
      
      // Verify staff member belongs to the establishment
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

  // Staff working hours routes
  app.get("/api/staff/:id/working-hours", async (req, res) => {
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

  app.post("/api/staff/:id/working-hours", async (req, res) => {
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

  // Staff vacation routes
  app.get("/api/staff/:id/vacations", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const staffId = parseInt(req.params.id);
      
      if (!staffId || !establishmentId) {
        return res.status(400).json({ message: "Staff ID and establishment ID required" });
      }
      
      const vacations = await db.select()
        .from(staffVacations)
        .where(and(eq(staffVacations.staffId, staffId), eq(staffVacations.establishmentId, establishmentId), eq(staffVacations.isActive, true)))
        .orderBy(staffVacations.startDate);
      
      res.json(vacations);
    } catch (error) {
      console.error("Get staff vacations error:", error);
      res.status(500).json({ message: "Failed to fetch staff vacations" });
    }
  });

  app.post("/api/staff/:id/vacations", async (req, res) => {
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

  app.put("/api/staff/:id/vacations/:vacationId", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const staffId = parseInt(req.params.id);
      const vacationId = parseInt(req.params.vacationId);
      
      if (!staffId || !establishmentId || !vacationId) {
        return res.status(400).json({ message: "Staff ID, establishment ID and vacation ID required" });
      }
      
      const vacationData = insertStaffVacationSchema.partial().parse(req.body);
      
      const [vacation] = await db.update(staffVacations)
        .set({
          ...vacationData,
          updatedAt: sql`now()`
        })
        .where(and(
          eq(staffVacations.id, vacationId),
          eq(staffVacations.staffId, staffId),
          eq(staffVacations.establishmentId, establishmentId)
        ))
        .returning();
      
      if (!vacation) {
        return res.status(404).json({ message: "Vacation not found" });
      }
      
      res.json(vacation);
    } catch (error) {
      console.error("Update staff vacation error:", error);
      res.status(500).json({ message: "Failed to update staff vacation" });
    }
  });

  app.delete("/api/staff/:id/vacations/:vacationId", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const staffId = parseInt(req.params.id);
      const vacationId = parseInt(req.params.vacationId);
      
      if (!staffId || !establishmentId || !vacationId) {
        return res.status(400).json({ message: "Staff ID, establishment ID and vacation ID required" });
      }
      
      await db.update(staffVacations)
        .set({ isActive: false, updatedAt: sql`now()` })
        .where(and(
          eq(staffVacations.id, vacationId),
          eq(staffVacations.staffId, staffId),
          eq(staffVacations.establishmentId, establishmentId)
        ));
      
      res.json({ message: "Vacation deleted successfully" });
    } catch (error) {
      console.error("Delete staff vacation error:", error);
      res.status(500).json({ message: "Failed to delete staff vacation" });
    }
  });

  // Service routes
  app.get("/api/services", requireAdmin, async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const services = await storage.getServices(establishmentId);
      res.json(services);
    } catch (error) {
      console.error("Get services error:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  // Staff-accessible endpoint for getting services list (read-only for appointments)
  app.get("/api/services/list", requireAuth, async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const services = await storage.getServices(establishmentId);
      res.json(services);
    } catch (error) {
      console.error("Get services list error:", error);
      res.status(500).json({ message: "Failed to fetch services list" });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      
            // Raw request body logging removed for compute optimization
      
      // Transform staffIds array to JSON string if it's an array
      const requestBody = { ...req.body };
      if (Array.isArray(requestBody.staffIds)) {
                // StaffIds conversion logging removed for compute optimization
        requestBody.staffIds = JSON.stringify(requestBody.staffIds);
      }
      
            // Processed request body logging removed for compute optimization
      
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

  app.put("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Transform staffIds array to JSON string if it's an array
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

  app.delete("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
              await storage.deleteService(id, establishmentId);
      res.json({ message: "Service deleted successfully" });
    } catch (error) {
      console.error("Delete service error:", error);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Service Categories routes
  app.get("/api/service-categories", async (req, res) => {
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

  app.post("/api/service-categories", async (req, res) => {
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

  app.delete("/api/service-categories/:id", async (req, res) => {
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

  // Appointment routes
  app.get("/api/appointments", async (req, res) => {
    try {
      // Appointments debug headers log removed for compute optimization
      // Appointments debug headers log removed for compute optimization
      const { establishmentId, userId, userRole } = getUserContext(req);
      
      // Appointments debug context log removed for compute optimization
      
      // Get pagination parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100); // Max 100 per page
      const month = req.query.month as string; // Format: YYYY-MM
      const statusFilter = req.query.status as string; // "scheduled", "completed", "all"
      const offset = (page - 1) * limit;
      
            // Get appointments role logging removed for compute optimization
      
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      
      let appointments;
      let total = 0;
      
      // If user is staff, only show their appointments
      if (userRole === 'staff') {
                // Staff appointment filtering logging removed for compute optimization
        // Get staff member info to filter by staffId
        const staffMember = await storage.getStaffByUserId(userId, establishmentId);
                // Staff member found logging removed for compute optimization
        
        if (staffMember) {
          const result = await storage.getPaginatedStaffAppointments(establishmentId, staffMember.id, offset, limit, month, statusFilter);
          appointments = result.appointments;
          total = result.total;
                    // Staff appointments count logging removed for compute optimization
        } else {
          appointments = [];
          total = 0;
                    // No staff member logging removed for compute optimization
        }
      } else {
                // Admin user detection logging removed for compute optimization
        // For managers and owners, show all appointments with pagination
        const result = await storage.getPaginatedAppointments(establishmentId, offset, limit, month, statusFilter);
        appointments = result.appointments;
        total = result.total;
                // Appointments pagination logging removed for compute optimization
      }
      
      res.json({
        appointments,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error: any) {
      console.error("❌ Get appointments error:", error);
      console.error("❌ Error message:", error?.message);
      console.error("❌ Error stack:", error?.stack);
      console.error("❌ Request details:", {
        page: req.query.page,
        limit: req.query.limit,
        month: req.query.month,
        statusFilter: req.query.status,
        userRole: req.headers['x-user-role'],
        userId: req.headers['x-user-id'],
        establishmentId: req.headers['x-establishment-id'],
        host: req.headers.host,
        env: process.env.NODE_ENV
      });
      res.status(500).json({ 
        message: "Failed to fetch appointments", 
        error: error instanceof Error ? error.message : String(error),
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
            // Appointment data reception logging removed for compute optimization
      const { clientId, serviceId, staffId, appointmentDate, appointmentTime, notes } = req.body;
      
      // Get establishment ID from user context
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      
      // Get service details to get duration
      const service = await storage.getService(parseInt(serviceId), establishmentId);
      if (!service) {
        return res.status(400).json({ message: "Serviço não encontrado" });
      }
      
      // Validate input data
      if (!appointmentDate || !appointmentTime) {
                // Missing fields logging removed for compute optimization
        return res.status(400).json({ message: "Data e horário são obrigatórios" });
      }

      // Simple date creation without timezone conversions - use local time
      let dateOnly = appointmentDate;
      if (typeof appointmentDate === 'string' && appointmentDate.includes('T')) {
        dateOnly = appointmentDate.split('T')[0];
      }
      
      // Create local datetime string without Z suffix to avoid UTC conversion
      const localString = `${dateOnly}T${appointmentTime}:00`;
      const dataInicio = new Date(localString);
      
      // Check if date is valid
      if (isNaN(dataInicio.getTime())) {
        return res.status(400).json({ message: "Data ou horário inválido" });
      }
      
      // Check if appointment is in the past using Brazil timezone
      const now = new Date();
      const brazilTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
      if (dataInicio < brazilTime) {
        return res.status(400).json({ 
          message: "Não é possível agendar para datas/horários passados" 
        });
      }
      
      // Calculate end time: start + duration - 1 minute (to allow next appointment to start exactly at end time)
      const dataFim = new Date(dataInicio.getTime() + (service.duration * 60000) - 60000);
      
      // Validate business hours based on configured settings
      const businessHours = await storage.getBusinessHours(establishmentId);
      const appointmentDay = dataInicio.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Find business hours for the appointment day
      const dayHours = businessHours.find(h => h.dayOfWeek === appointmentDay);
      
      if (!dayHours || !dayHours.isOpen) {
        const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        return res.status(400).json({ 
          message: `Estabelecimento fechado em ${dayNames[appointmentDay]}` 
        });
      }
      
      // Validate appointment time within business hours
      const [hour, minute] = appointmentTime.split(':').map(Number);
      const appointmentMinutes = hour * 60 + minute;
      
      const openTime = dayHours.openTime || "09:00";
      const closeTime = dayHours.closeTime || "18:00";
      const [openHour, openMinute] = openTime.split(':').map(Number);
      const [closeHour, closeMinute] = closeTime.split(':').map(Number);
      const openMinutes = openHour * 60 + openMinute;
      const closeMinutes = closeHour * 60 + closeMinute;
      
      if (appointmentMinutes < openMinutes || appointmentMinutes >= closeMinutes) {
        return res.status(400).json({ 
          message: `Horário deve ser entre ${openTime} e ${closeTime}` 
        });
      }
      
      // Check if appointment would go beyond closing time
      const appointmentEndMinutes = appointmentMinutes + service.duration;
      if (appointmentEndMinutes > closeMinutes) {
        return res.status(400).json({ 
          message: `Agendamento ultrapassaria o horário de funcionamento (${closeTime})` 
        });
      }
      
      // Check for scheduling conflicts for the same staff member
      const conflictCheck = await storage.checkAppointmentConflict(
        parseInt(staffId), 
        dataInicio, 
        dataFim
      );
      
      if (conflictCheck) {
        return res.status(400).json({ 
          message: "Conflito de horário! O profissional já tem um agendamento neste período." 
        });
      }

      // Check monthly appointment limit
      const limitCheck = await storage.checkMonthlyAppointmentLimit(establishmentId);
      if (!limitCheck.canCreate) {
        const message = limitCheck.maxCount === null 
          ? "Erro interno ao verificar limite de agendamentos"
          : `Limite mensal de agendamentos atingido (${limitCheck.currentCount}/${limitCheck.maxCount}). Considere fazer upgrade do seu plano para continuar agendando.`;
        
        return res.status(400).json({ 
          message,
          currentCount: limitCheck.currentCount,
          maxCount: limitCheck.maxCount
        });
      }
      
      // Transform data for insertion
      const transformedData = {
        clientId: parseInt(clientId),
        serviceId: parseInt(serviceId),
        staffId: parseInt(staffId),
        appointmentDate: dataInicio,
        dataFim: dataFim,
        duration: service.duration,
        status: "scheduled",
        notes: notes || "",
        establishmentId: typeof establishmentId === 'number' ? establishmentId : parseInt(establishmentId)
      };
      

      
      const appointmentData = insertAppointmentSchema.parse(transformedData);
      const appointment = await storage.createAppointment(appointmentData);

      // NOTIFICAÇÕES AGORA SÃO AUTOMÁTICAS NO STORAGE
      // Não é mais necessário enviar aqui, pois o storage já envia automaticamente

      // Enviar email de notificação para o estabelecimento
      try {
        // Email notification process log removed for compute optimization
        
        // Buscar informações necessárias para o email
        const [client, service, staff, establishment] = await Promise.all([
          storage.getClient(appointment.clientId, establishmentId),
          storage.getService(appointment.serviceId, establishmentId),
          storage.getStaffMember(appointment.staffId, establishmentId),
          storage.getEstablishment(establishmentId)
        ]);
        
        // Appointment data log removed for compute optimization

        if (client && service && staff && establishment && establishment.email) {
          const appointmentDate = new Date(appointment.appointmentDate);
          const formattedDate = appointmentDate.toLocaleDateString('pt-BR');
          const formattedTime = appointmentDate.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });

          // Email sending log removed for compute optimization
          const emailSent = await sendAppointmentNotification(establishment.email, {
            establishmentName: establishment.name,
            clientName: client.name,
            serviceName: service.name,
            staffName: staff.name,
            appointmentDate: formattedDate,
            appointmentTime: formattedTime,
            clientPhone: client.phone || ''
          });

          // Email notification status logs removed for compute optimization
        } else {
                    // Insufficient email info logging removed for compute optimization
        }
      } catch (emailError) {
        console.error('❌ Erro no envio de email de notificação:', emailError);
        // Não falhar a criação do agendamento por causa do erro de email
      }

      res.json(appointment);
    } catch (error) {
      console.error("Create appointment error:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
            // Appointment update data logging removed for compute optimization
      
      const { clientId, serviceId, staffId, appointmentDate, appointmentTime, notes } = req.body;
      
      // Get establishment ID from user context
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      
      // Get service details to get duration
      const service = await storage.getService(parseInt(serviceId), establishmentId);
      if (!service) {
        return res.status(400).json({ message: "Serviço não encontrado" });
      }
      
      // Parse the appointment date and time using local time
      const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
      
      // Check if appointment is in the past using Brazil timezone
      const now = new Date();
      const brazilTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
      if (appointmentDateTime < brazilTime) {
        return res.status(400).json({ 
          message: "Não é possível agendar para datas/horários passados" 
        });
      }
      
      // Validate business hours based on configured settings
      const businessHours = await storage.getBusinessHours(establishmentId);
      const appointmentDay = appointmentDateTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Find business hours for the appointment day
      const dayHours = businessHours.find(h => h.dayOfWeek === appointmentDay);
      
      if (!dayHours || !dayHours.isOpen) {
        const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        return res.status(400).json({ 
          message: `Estabelecimento fechado em ${dayNames[appointmentDay]}` 
        });
      }
      
      // Validate appointment time within business hours
      const [hour, minute] = appointmentTime.split(':').map(Number);
      const appointmentMinutes = hour * 60 + minute;
      
      const openTime = dayHours.openTime || "09:00";
      const closeTime = dayHours.closeTime || "18:00";
      const [openHour, openMinute] = openTime.split(':').map(Number);
      const [closeHour, closeMinute] = closeTime.split(':').map(Number);
      const openMinutes = openHour * 60 + openMinute;
      const closeMinutes = closeHour * 60 + closeMinute;
      
      if (appointmentMinutes < openMinutes || appointmentMinutes >= closeMinutes) {
        return res.status(400).json({ 
          message: `Horário deve ser entre ${openTime} e ${closeTime}` 
        });
      }
      
      // Check if appointment would go beyond closing time
      const appointmentEndMinutes = appointmentMinutes + service.duration;
      if (appointmentEndMinutes > closeMinutes) {
        return res.status(400).json({ 
          message: `Agendamento ultrapassaria o horário de funcionamento (${closeTime})` 
        });
      }
      
      // Check for appointment conflicts (excluding the current appointment being updated)
      const existingAppointments = await storage.getAppointmentsRaw();
      const conflictingAppointments = existingAppointments.filter(apt => {
        if (apt.id === id) return false; // Exclude current appointment
        if (apt.staffId !== parseInt(staffId)) return false;
        
        const aptStart = new Date(apt.appointmentDate);
        // Apply -1 minute rule for existing appointment end time
        const aptEnd = new Date(aptStart.getTime() + (apt.duration || 30) * 60000 - 60000);
        // Apply -1 minute rule for new appointment end time
        const newEnd = new Date(appointmentDateTime.getTime() + service.duration * 60000 - 60000);
        
        return appointmentDateTime <= aptEnd && newEnd >= aptStart;
      });
      
      if (conflictingAppointments.length > 0) {
        return res.status(400).json({ 
          message: "Conflito de horário! Já existe um agendamento neste período.",
          conflictingAppointments: conflictingAppointments.map(apt => ({
            id: apt.id,
            time: new Date(apt.appointmentDate).toLocaleTimeString(),
            duration: apt.duration
          }))
        });
      }
      
      // Create the appointment data with end time
      const appointmentEndTime = new Date(appointmentDateTime.getTime() + service.duration * 60000);
      
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
            // Updated appointment logging removed for compute optimization
      
      // NOTIFICAÇÕES AGORA SÃO AUTOMÁTICAS NO STORAGE
      // Não é mais necessário enviar aqui, pois o storage já envia automaticamente
      
      res.json(appointment);
    } catch (error) {
      console.error("Update appointment error:", error);
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  app.patch("/api/appointments/:id/status", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      // Get the current appointment to check previous status and get service price
      const currentAppointment = await storage.getAppointment(id, establishmentId);
      if (!currentAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Update the appointment status
      const appointment = await storage.updateAppointmentStatus(id, status, establishmentId);
      
      // If status changed from "scheduled"/"agendado" to "completed"/"realizado", create financial transaction
      if ((currentAppointment.status === "scheduled" || currentAppointment.status === "agendado") && 
          (status === "completed" || status === "realizado")) {
                // Status change detection logging removed for compute optimization
        try {
          // Get establishment ID from user context
          const { establishmentId } = getUserContext(req);
          if (!establishmentId) {
            console.error("Establishment ID required for transaction creation");
            throw new Error("Establishment ID required");
          }
          
          // Get service details to get the price
          const service = await storage.getService(currentAppointment.serviceId, establishmentId);
          if (service && service.price) {
            // Create transaction date in São Paulo timezone (UTC-3)
            // This ensures financial records show the correct local business time
            const now = new Date();
            const brazilTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
            
            const transactionData = {
              amount: service.price,
              type: "income",
              description: `Serviço realizado: ${service.name}`,
              category: "Serviços Realizados",
              paymentMethod: "dinheiro",
              appointmentId: id,
              transactionDate: brazilTime,
              establishmentId: establishmentId
            };
            
            await storage.createTransaction(transactionData);
                        // Financial transaction creation logging removed for compute optimization
          }
          
          // Add loyalty points if service is part of a loyalty program
          try {
            await storage.addLoyaltyPointsForCompletedService(
              currentAppointment.clientId, 
              currentAppointment.serviceId, 
              id, 
              establishmentId
            );
                        // Loyalty points processing logging removed for compute optimization
          } catch (loyaltyError) {
            console.error("Error processing loyalty points:", loyaltyError);
            // Don't fail the status update if loyalty points fail
          }
        } catch (transactionError) {
          console.error("Error creating financial transaction:", transactionError);
          // Don't fail the status update if transaction creation fails
        }
      }
      
      // NOTIFICAÇÕES AGORA SÃO AUTOMÁTICAS NO STORAGE
      // Não é mais necessário enviar aqui, pois o storage já envia automaticamente
      
      res.json(appointment);
    } catch (error) {
      console.error("Update appointment status error:", error);
      res.status(500).json({ message: "Failed to update appointment status" });
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const id = parseInt(req.params.id);
      
      // Check if appointment exists and belongs to the establishment
      const appointment = await storage.getAppointment(id, establishmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      await storage.deleteAppointment(id);
      
      // NOTIFICAÇÕES AGORA SÃO AUTOMÁTICAS NO STORAGE
      // Não é mais necessário enviar aqui, pois o storage já envia automaticamente
      
      res.json({ success: true, message: "Appointment deleted successfully" });
    } catch (error) {
      console.error("Delete appointment error:", error);
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });

  // Pending appointments endpoint with staff filtering
  app.get("/api/appointments/pending", async (req, res) => {
    try {
      const { establishmentId, userId, userRole } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      
      let pendingAppointments;
      
      // If user is staff, only show pending appointments assigned to them
      if (userRole === 'staff') {
        const staffMember = await storage.getStaffByUserId(userId, establishmentId);
        if (staffMember) {
          pendingAppointments = await storage.getPendingAppointmentsForStaff(establishmentId, staffMember.id);
        } else {
          pendingAppointments = [];
        }
      } else {
        // For admin/manager, show all pending appointments
        pendingAppointments = await storage.getPendingAppointments(establishmentId);
      }
      
      res.json(pendingAppointments);
    } catch (error) {
      console.error("Fetch pending appointments error:", error);
      res.status(500).json({ message: "Failed to fetch pending appointments" });
    }
  });

  // Recent appointments endpoint with proper staff filtering
  app.get("/api/appointments/recent", async (req, res) => {
    try {
      const { establishmentId, userId, userRole } = getUserContext(req);
      // Appointments recent role logging removed for compute optimization
      
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      
      let recentAppointments;
      
      // If user is staff, only show their recent appointments
      if (userRole === 'staff') {
        // Staff user detection and member lookup logging removed for compute optimization
        const staffMember = await storage.getStaffByUserId(userId, establishmentId);
        
        if (staffMember) {
          recentAppointments = await storage.getRecentAppointmentsForStaff(establishmentId, staffMember.id);
          // Found recent appointments count logging removed for compute optimization
        } else {
          recentAppointments = [];
        }
      } else {
        // Admin/Manager user detection logging removed for compute optimization
        // For managers and owners, show all recent appointments
        recentAppointments = await storage.getRecentAppointments(establishmentId);
        // Found recent appointments total count logging removed for compute optimization
      }
      
      res.json(recentAppointments);
    } catch (error) {
      console.error("Fetch recent appointments error:", error);
      res.status(500).json({ message: "Failed to fetch recent appointments" });
    }
  });

  // Get next appointment for staff user
  app.get("/api/staff/next-appointment", async (req, res) => {
    try {
      const { establishmentId, userId, userRole } = getUserContext(req);
      
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      
      if (userRole !== 'staff') {
        return res.status(403).json({ message: "Staff access required" });
      }
      
      // Get staff record for this user
      const staffRecord = await storage.getStaffByUserId(userId, establishmentId);
      if (!staffRecord) {
        return res.status(400).json({ message: "Registro de colaborador não encontrado" });
      }
      
      const nextAppointment = await storage.getNextAppointmentForStaff(establishmentId, staffRecord.id);
      res.json(nextAppointment || null);
    } catch (error) {
      console.error("Get next appointment error:", error);
      res.status(500).json({ message: "Failed to fetch next appointment" });
    }
  });

  // =====  NOTIFICATION ENDPOINTS  =====
  
  // Get all notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      const notifications = await storage.getNotifications(establishmentId);
      res.json(notifications);
    } catch (error) {
      console.error("Fetch notifications error:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Get unread notifications with staff filtering
  app.get("/api/notifications/unread", async (req, res) => {
    try {
      const { establishmentId, userId, userRole } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      
      let notifications;
      
      // If user is staff, only show notifications for appointments assigned to them
      if (userRole === 'staff') {
        const staffMember = await storage.getStaffByUserId(userId, establishmentId);
        if (staffMember) {
          notifications = await storage.getUnreadNotificationsForStaff(establishmentId, staffMember.id);
        } else {
          notifications = [];
        }
      } else {
        // For admin/manager, show all unread notifications
        notifications = await storage.getUnreadNotifications(establishmentId);
      }
      
      res.json(notifications);
    } catch (error) {
      console.error("Fetch unread notifications error:", error);
      res.status(500).json({ message: "Failed to fetch unread notifications" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id/read", async (req, res) => {
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

  // Mark all notifications as read
  app.patch("/api/notifications/read-all", async (req, res) => {
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

  // Get monthly appointment limit information
  app.get("/api/appointments/monthly-limit", async (req, res) => {
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

  // Get available times for a staff member on a specific date
  app.get("/api/appointments/available-times", async (req, res) => {
    try {
      const { staffId, date, serviceId } = req.query;
      
      if (!staffId || !date || !serviceId) {
        return res.status(400).json({ message: "StaffId, date, and serviceId are required" });
      }
      
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      
      const service = await storage.getService(parseInt(serviceId as string), establishmentId);
      if (!service) {
        return res.status(400).json({ message: "Service not found" });
      }
      
      // Get business hours for the establishment
      const businessHours = await storage.getBusinessHours(establishmentId);
      const queryDate = new Date(date as string);
      const dayOfWeek = queryDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Find business hours for the appointment day
      const dayHours = businessHours.find(h => h.dayOfWeek === dayOfWeek);
      
      // Check if establishment is closed on this day
      if (!dayHours || !dayHours.isOpen) {
        return res.json({ 
          closed: true, 
          message: "Estabelecimento fechado neste dia" 
        });
      }

      // Get staff working hours for the specific staff member
      const staffWorkingHours = await storage.getStaffWorkingHours(parseInt(staffId as string), establishmentId);
      const staffDayHours = staffWorkingHours.find(h => h.dayOfWeek === dayOfWeek);
      
      // Check if staff member is available on this day
      if (!staffDayHours || !staffDayHours.isAvailable) {
        return res.json({ 
          closed: true, 
          message: "Profissional não disponível neste dia" 
        });
      }
      
      // Check if staff is on vacation/time-off on this date
      const dateStr = (date as string);
      const staffVacationsData = await db.select()
        .from(staffVacations)
        .where(and(
          eq(staffVacations.staffId, parseInt(staffId as string)), 
          eq(staffVacations.establishmentId, establishmentId), 
          eq(staffVacations.isActive, true)
        ));
      
      // Check if the date falls within any vacation period
      const isOnVacation = staffVacationsData.some(vacation => {
        const vacationStart = new Date(vacation.startDate);
        const vacationEnd = new Date(vacation.endDate);
        const checkDate = new Date(dateStr);
        
        // Set times to start of day for accurate comparison
        vacationStart.setHours(0, 0, 0, 0);
        vacationEnd.setHours(23, 59, 59, 999);
        checkDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
        
        return checkDate >= vacationStart && checkDate <= vacationEnd;
      });
      
      if (isOnVacation) {
        const vacationInfo = staffVacationsData.find(vacation => {
          const vacationStart = new Date(vacation.startDate);
          const vacationEnd = new Date(vacation.endDate);
          const checkDate = new Date(dateStr);
          
          vacationStart.setHours(0, 0, 0, 0);
          vacationEnd.setHours(23, 59, 59, 999);
          checkDate.setHours(12, 0, 0, 0);
          
          return checkDate >= vacationStart && checkDate <= vacationEnd;
        });
        
        const typeLabels = {
          vacation: 'férias',
          sick_leave: 'atestado médico',
          time_off: 'folga'
        };
        
        const typeLabel = typeLabels[vacationInfo?.type as keyof typeof typeLabels] || 'ausência';
        
        return res.json({
          closed: true,
          message: `Profissional está de ${typeLabel} neste período`,
          timeSlots: []
        });
      }
      
      // Get existing appointments for the establishment on that date
      const existingAppointments = await storage.getAppointments(establishmentId);
      
      // Filter appointments for the specific staff member and date
      const staffAppointments = existingAppointments.filter(apt => {
        if (apt.staffId !== parseInt(staffId as string)) return false;
        
        const aptDate = new Date(apt.appointmentDate);
        
        // Compare year, month, and day
        return aptDate.getFullYear() === queryDate.getFullYear() &&
               aptDate.getMonth() === queryDate.getMonth() &&
               aptDate.getDate() === queryDate.getDate();
      });
      
      // Use staff working hours instead of establishment hours
      const openTime = staffDayHours.openTime || dayHours.openTime || "09:00";
      const closeTime = staffDayHours.closeTime || dayHours.closeTime || "18:00";
      const [openHour, openMinute] = openTime.split(':').map(Number);
      const [closeHour, closeMinute] = closeTime.split(':').map(Number);
      
      const serviceDurationMinutes = service.duration;
      
      // Generate time slots with 10-minute intervals
      const availableTimes = [];
      const currentTime = new Date();
      const currentBrazilTime = new Date(currentTime.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
      
      // Start from opening time
      let currentSlotHour = openHour;
      let currentSlotMinute = openMinute;
      
      while (currentSlotHour < closeHour || (currentSlotHour === closeHour && currentSlotMinute < closeMinute)) {
        const timeString = `${currentSlotHour.toString().padStart(2, '0')}:${currentSlotMinute.toString().padStart(2, '0')}`;
        
        // Create start and end times for this potential slot (in Brazil timezone)
        const slotStart = new Date(`${date}T${timeString}:00`);
        const slotEnd = new Date(slotStart.getTime() + (serviceDurationMinutes * 60000));
        
        // Check if service would finish before closing time
        const slotEndHour = slotEnd.getHours();
        const slotEndMinute = slotEnd.getMinutes();
        
        if (slotEndHour < closeHour || (slotEndHour === closeHour && slotEndMinute <= closeMinute)) {
          // Check if slot is not in the past (both times in Brazil timezone)
          const isPastTime = slotStart <= currentBrazilTime;
          
          // Check for conflicts with existing appointments
          const hasConflict = staffAppointments.some((apt: any) => {
            const aptStart = new Date(apt.appointmentDate);
            const aptDuration = apt.duration || 30;
            const aptEnd = new Date(aptStart.getTime() + (aptDuration * 60000));
            
            // Check for overlap
            return (slotStart < aptEnd && slotEnd > aptStart);
          });
          
          availableTimes.push({
            time: timeString,
            available: !isPastTime && !hasConflict,
            isPast: isPastTime,
            isBooked: !isPastTime && hasConflict
          });
        }
        
        // Increment by 10 minutes
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

  // NOTE: Removed duplicate /api/appointments/recent endpoint - proper version with staff filtering exists above



  // Product routes
  app.get("/api/products", requireAdmin, async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      
      // Check if establishment has access to inventory module
      const hasInventoryAccess = await storage.hasInventoryAccess(establishmentId);
      if (!hasInventoryAccess) {
        return res.status(403).json({ 
          message: "Este recurso faz parte do plano Avançado. Atualize seu plano para desbloquear.",
          requiredPlan: "Expert"
        });
      }
      
      const products = await storage.getProducts(establishmentId);
      // Map stock to currentStock for frontend
      const mappedProducts = products.map(product => ({
        ...product,
        currentStock: product.stock,
        stock: undefined
      }));
      res.json(mappedProducts);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      
      // Check if establishment has access to inventory module
      const hasInventoryAccess = await storage.hasInventoryAccess(establishmentId);
      if (!hasInventoryAccess) {
        return res.status(403).json({ 
          message: "Este recurso faz parte do plano Avançado. Atualize seu plano para desbloquear.",
          requiredPlan: "Expert"
        });
      }
      
      // Convert numeric values to strings for database storage and add establishmentId
      const body = { ...req.body, establishmentId };
      if (body.price && typeof body.price === 'number') {
        body.price = body.price.toString();
      }
      if (body.cost && typeof body.cost === 'number') {
        body.cost = body.cost.toString();
      }
      // Map currentStock to stock for database
      if (body.currentStock !== undefined) {
        body.stock = body.currentStock;
        delete body.currentStock;
      }
      const productData = insertProductSchema.parse(body);
      const product = await storage.createProduct(productData);
      
      // Send WebSocket notification for inventory change
      try {
        const { wsManager } = await import("./websocket");
        if (wsManager) {
          wsManager.notifyInventoryChange(establishmentId, {
            type: 'product_created',
            productId: product.id,
            productName: product.name,
            currentStock: product.stock
          });
        }
      } catch (wsError) {
                  // WebSocket notification error logging removed for compute optimization
      }
      
      // Map stock to currentStock for frontend
      const mappedProduct = {
        ...product,
        currentStock: product.stock,
        stock: undefined
      };
      res.json(mappedProduct);
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      
      // Check if establishment has access to inventory module
      const hasInventoryAccess = await storage.hasInventoryAccess(establishmentId);
      if (!hasInventoryAccess) {
        return res.status(403).json({ 
          message: "Este recurso faz parte do plano Avançado. Atualize seu plano para desbloquear.",
          requiredPlan: "Expert"
        });
      }
      
      const id = parseInt(req.params.id);
      // Convert numeric values to strings for database storage
      const body = { ...req.body };
      if (body.price && typeof body.price === 'number') {
        body.price = body.price.toString();
      }
      if (body.cost && typeof body.cost === 'number') {
        body.cost = body.cost.toString();
      }
      // Map currentStock to stock for database
      if (body.currentStock !== undefined) {
        body.stock = body.currentStock;
        delete body.currentStock;
      }
      const productData = insertProductSchema.partial().parse(body);
      const product = await storage.updateProduct(id, productData, establishmentId);
      
      // Send WebSocket notification for inventory change
      try {
        const { wsManager } = await import("./websocket");
        if (wsManager) {
          wsManager.notifyInventoryChange(establishmentId, {
            type: 'product_updated',
            productId: product.id,
            productName: product.name,
            currentStock: product.stock
          });
        }
      } catch (wsError) {
                  // WebSocket notification error logging removed for compute optimization
      }
      
      // Map stock to currentStock for frontend
      const mappedProduct = {
        ...product,
        currentStock: product.stock,
        stock: undefined
      };
      res.json(mappedProduct);
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      
      // Check if establishment has access to inventory module
      const hasInventoryAccess = await storage.hasInventoryAccess(establishmentId);
      if (!hasInventoryAccess) {
        return res.status(403).json({ 
          message: "Este recurso faz parte do plano Avançado. Atualize seu plano para desbloquear.",
          requiredPlan: "Expert"
        });
      }
      
      const id = parseInt(req.params.id);
      
      // Get product info before deletion for notification
      const product = await storage.getProduct(id, establishmentId);
      await storage.deleteProduct(id, establishmentId);
      
      // Send WebSocket notification for inventory change
      try {
        const { wsManager } = await import("./websocket");
        if (wsManager) {
          wsManager.notifyInventoryChange(establishmentId, {
            type: 'product_deleted',
            productId: id,
            productName: product?.name || 'Produto removido'
          });
        }
      } catch (wsError) {
                  // WebSocket notification error logging removed for compute optimization
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  app.post("/api/products/sell", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      
      // Check if establishment has access to inventory module
      const hasInventoryAccess = await storage.hasInventoryAccess(establishmentId);
      if (!hasInventoryAccess) {
        return res.status(403).json({ 
          message: "Este recurso faz parte do plano Avançado. Atualize seu plano para desbloquear.",
          requiredPlan: "Expert"
        });
      }
      
      const { productId, quantity, unitPrice, productName } = req.body;
      
      // Validate input
      if (!productId || !quantity || !unitPrice || !productName) {
        return res.status(400).json({ message: "Dados de venda incompletos" });
      }
      
      // Get product to check stock
      const product = await storage.getProduct(productId, establishmentId);
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      
      // Check if there's enough stock
      const currentStock = product.stock || 0;
      if (currentStock < quantity) {
        return res.status(400).json({ 
          message: `Estoque insuficiente. Disponível: ${currentStock}, Solicitado: ${quantity}` 
        });
      }
      
      // Calculate total amount
      const totalAmount = quantity * unitPrice;
      
      // Update product stock
      const newStock = currentStock - quantity;
      await storage.updateProduct(productId, { stock: newStock }, establishmentId);
      
      // Create financial transaction with São Paulo timezone (UTC-3)
      const now = new Date();
      const brazilTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
      
      await storage.createTransaction({
        establishmentId,
        amount: totalAmount.toString(),
        type: "income",
        category: "Produto Vendido",
        paymentMethod: "Venda Direta",
        description: `Venda: ${productName} (${quantity}x)`,
        transactionDate: brazilTime,
      });
      
      // WebSocket notifications are now handled automatically in storage.ts
      
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

  // Transaction routes
  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      
      // Get pagination parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 25, 50); // Max 50 per page
      const offset = (page - 1) * limit;
      
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      
      // Check if establishment has access to financial module
      const hasFinancialAccess = await storage.hasFinancialAccess(establishmentId);
      if (!hasFinancialAccess) {
        return res.status(403).json({ 
          message: "Este recurso faz parte do plano Core ou superior. Atualize seu plano para desbloquear.",
          requiredPlan: "Intermediário"
        });
      }
      
      let result;
      const { role, userId } = getUserContext(req);
      
      // If user is staff, check if establishment has Core or Expert plan and only show transactions related to their commissions
      if (role === 'staff') {
        const establishmentPlan = await storage.getEstablishmentPlan(establishmentId);
        if (establishmentPlan?.name !== 'Core' && establishmentPlan?.name !== 'Expert') {
          return res.status(403).json({ 
            message: "Staff só tem acesso ao financeiro em planos Core ou Expert.",
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
        // For admins, show all transactions
        result = await storage.getPaginatedTransactions(establishmentId, offset, limit);
      }
      
      const transactions = result.transactions;
      const total = result.total;
      
            // Transactions pagination logging removed for compute optimization
      
      res.json({
        transactions,
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

  app.post("/api/transactions", async (req, res) => {
    try {
      // Get establishment ID from user context
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      
      // Check if establishment has access to financial module
      const hasFinancialAccess = await storage.hasFinancialAccess(establishmentId);
      if (!hasFinancialAccess) {
        return res.status(403).json({ 
          message: "Este recurso faz parte do plano Core ou superior. Atualize seu plano para desbloquear.",
          requiredPlan: "Intermediário"
        });
      }
      
      // Transform the data to match schema expectations
      // Parse the transaction date and adjust to São Paulo timezone if it's "today"
      let transactionDate;
      if (req.body.transactionDate) {
        // If it's today's date from frontend, use current Brazil time
        const inputDate = new Date(req.body.transactionDate);
        const today = new Date();
        
        // If the date part matches today's date, use Brazil timezone for the current moment
        if (inputDate.toISOString().split('T')[0] === today.toISOString().split('T')[0]) {
          transactionDate = new Date(today.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
        } else {
          // For past/future dates, keep the original date
          transactionDate = inputDate;
        }
      } else {
        // If no date provided, use current Brazil time
        const now = new Date();
        transactionDate = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
      }
      
      const transformedData = {
        ...req.body,
        establishmentId,
        amount: req.body.amount.toString(), // Convert number to string for decimal field
        transactionDate: transactionDate,
      };
      const transactionData = insertTransactionSchema.parse(transformedData);
      const transaction = await storage.createTransaction(transactionData);
      
      // WebSocket notifications are now handled automatically in storage.ts
      
      res.json(transaction);
    } catch (error) {
      console.error("Create transaction error:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const id = parseInt(req.params.id);
      await storage.deleteTransaction(id);
      
      // WebSocket notifications are now handled automatically in storage.ts
      
      res.json({ success: true });
    } catch (error) {
      console.error("Delete transaction error:", error);
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Get transactions by specific date
  app.get("/api/transactions/date/:date", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      
      // Check if establishment has access to financial module
      const hasFinancialAccess = await storage.hasFinancialAccess(establishmentId);
      if (!hasFinancialAccess) {
        return res.status(403).json({ 
          message: "Este recurso faz parte do plano Core ou superior. Atualize seu plano para desbloquear.",
          requiredPlan: "Intermediário"
        });
      }
      
      const dateParam = req.params.date;
      const transactions = await storage.getTransactionsByDate(establishmentId, dateParam);
      res.json(transactions);
    } catch (error) {
      console.error("Get transactions by date error:", error);
      res.status(500).json({ message: "Failed to fetch transactions for date" });
    }
  });

  // Financial stats route
  app.get("/api/finances/stats", async (req, res) => {
    try {
      const { establishmentId, userId, role } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      
      // Check if establishment has access to financial module
      const hasFinancialAccess = await storage.hasFinancialAccess(establishmentId);
      if (!hasFinancialAccess) {
        return res.status(403).json({ 
          message: "Este recurso faz parte do plano Core ou superior. Atualize seu plano para desbloquear.",
          requiredPlan: "Intermediário"
        });
      }
      
      let stats;
      
      // If user is staff, check if establishment has Core or Expert plan and only show their financial stats
      if (role === 'staff') {
        const establishmentPlan = await storage.getEstablishmentPlan(establishmentId);
        if (establishmentPlan?.name !== 'Core' && establishmentPlan?.name !== 'Expert') {
          return res.status(403).json({ 
            message: "Staff só tem acesso ao financeiro em planos Core ou Expert.",
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
        // For managers and owners, show all financial stats
        stats = await storage.getFinancialStats(establishmentId);
      }
      
      res.json(stats);
    } catch (error: any) {
      console.error("Get financial stats error:", error);
      if (error?.message === 'Authentication required') {
        return res.status(401).json({ message: "Authentication required" });
      }
      res.status(500).json({ message: "Failed to fetch financial stats" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
            // Settings retrieval logging removed for compute optimization
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

  app.put("/api/settings", async (req, res) => {
    try {
      const { establishmentId, role } = getUserContext(req);
      
      // Check if user is trying to update restricted settings
      const settingsData = req.body;
      const restrictedFields = ['twoFactorAuth', 'sessionTimeout', 'businessName', 'businessAddress', 'businessSegment', 'businessPhone', 'businessEmail', 'businessLogo', 'workingHours', 'whatsappApiUrl', 'whatsappPhoneNumber', 'whatsappWelcomeMessage', 'whatsappAutoReply'];
      
      if (role === 'staff') {
        // Check if staff user is trying to update restricted fields
        const hasRestrictedFields = restrictedFields.some(field => settingsData.hasOwnProperty(field));
        if (hasRestrictedFields) {
          return res.status(403).json({ message: "Acesso negado. Colaboradores não podem alterar configurações administrativas." });
        }
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem alterar configurações do negócio." });
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

  // Business hours routes
  app.get('/api/business-hours', async (req, res) => {
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

  app.put('/api/business-hours', async (req, res) => {
    try {
      const { establishmentId, role } = getUserContext(req);
      
      // Only administrators can update business hours
      if (role === 'staff') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem alterar horários de funcionamento." });
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

  // Establishment settings routes
  app.get('/api/establishment', async (req, res) => {
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

  app.put('/api/establishment', async (req, res) => {
    try {
      const { establishmentId, role } = getUserContext(req);
      
      // Only administrators can update establishment settings
      if (role === 'staff') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem alterar informações do estabelecimento." });
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

  // Update establishment timezone
  app.patch("/api/establishment/timezone", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }
      
      const { timezone } = req.body;
      
      // Validate timezone
      const validTimezones = [
        "America/Sao_Paulo", "America/Manaus", "America/Campo_Grande", "America/Cuiaba",
        "America/Porto_Velho", "America/Boa_Vista", "America/Rio_Branco", "America/Eirunepe",
        "America/Fortaleza", "America/Recife", "America/Salvador", "America/Maceio",
        "America/Belem", "America/Santarem", "America/Araguaina", "America/Noronha"
      ];
      
      if (!validTimezones.includes(timezone)) {
        return res.status(400).json({ message: "Fuso horário inválido" });
      }
      
      await storage.updateEstablishmentTimezone(establishmentId, timezone);
      res.json({ message: "Fuso horário atualizado com sucesso" });
    } catch (error) {
      console.error("Update establishment timezone error:", error);
      res.status(500).json({ message: "Falha ao atualizar fuso horário" });
    }
  });

  // Security settings routes
  app.put('/api/user/email', async (req, res) => {
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

  app.put('/api/user/password', async (req, res) => {
    try {
      const { userId } = getUserContext(req);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.updateUserPassword(userId, hashedPassword);
      res.json(user);
    } catch (error) {
      console.error("Error updating user password:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  // Calculate staff salary/commission
  app.post("/api/staff/salary-commission", async (req, res) => {
    try {
      const { staffId, startDate, endDate } = req.body;
      
            // Payload reception logging removed for compute optimization
      
      // Get user context
      const { userId, establishmentId } = getUserContext(req);
      if (!establishmentId) {
        return res.status(400).json({ message: "Establishment ID required" });
      }

      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate e endDate são obrigatórios" });
      }

      // Get all staff to select from
      const allStaff = await storage.getStaff(establishmentId);
      if (allStaff.length === 0) {
        return res.status(400).json({ message: "Nenhum colaborador encontrado" });
      }

      // Determine target staff based on user role and permissions
      let targetStaffId;
      const { role } = getUserContext(req);
      
      if (role === 'staff') {
        // Staff users can only view their own commission
        // Use getStaffByUserId to find the staff record linked to this user
        // Staff record lookup logging removed for compute optimization
        const staffRecord = await storage.getStaffByUserId(userId, establishmentId);
        // Staff record verification logging removed for compute optimization
        if (staffRecord) {
          targetStaffId = staffRecord.id;
          // Staff linking success logging removed for compute optimization
        } else {
          // Staff record not found logging removed for compute optimization
          return res.status(400).json({ message: "Registro de colaborador não encontrado para este usuário" });
        }
      } else {
        // Admin users can specify any staff member or use first as default
        targetStaffId = staffId && staffId !== null ? parseInt(staffId) : allStaff[0].id;
      }
      
      // Target staff ID logging removed for compute optimization
      
      const commission = await storage.calculateStaffCommission(targetStaffId, startDate, endDate, establishmentId);
      res.json({
        ...commission,
        isStaffUser: role === 'staff',
        selectedStaffId: targetStaffId
      });
    } catch (error) {
      console.error("Calculate salary/commission error:", error);
      res.status(500).json({ message: (error as Error).message || "Falha ao calcular salário/comissão" });
    }
  });

  // Plans routes
  app.get('/api/plans', async (req, res) => {
    try {
      const plans = await storage.getPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });

  app.get('/api/establishment/plan', async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const plan = await storage.getEstablishmentPlan(establishmentId);
      res.json(plan);
    } catch (error) {
      console.error("Error fetching establishment plan:", error);
      res.status(500).json({ message: "Failed to fetch establishment plan" });
    }
  });

  app.put('/api/establishment/plan', async (req, res) => {
    try {
      const { establishmentId, role } = getUserContext(req);
      
      // Only administrators can change plans
      if (role === 'staff') {
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

  // Check plan limits and permissions
  app.get('/api/establishment/permissions', async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      
      // Get establishment and plan info
      const establishment = await storage.getEstablishment(establishmentId);
      if (!establishment) {
        return res.status(404).json({ message: "Establishment not found" });
      }
      
      const plan = await storage.getPlan(establishment.planId || 1);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      
      // Get staff count for limits
      const staffCount = await storage.getStaff(establishmentId);
      const staffLimit = {
        isWithinLimit: staffCount.length <= (plan.maxStaffMembers || 99),
        currentCount: staffCount.length,
        maxAllowed: plan.maxStaffMembers || 99
      };
      
      const hasLoyaltyAccess = plan.id >= 2; // Core and Expert plans have loyalty
      
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

  // N8N Integration endpoints
  app.get("/api/n8n-integrations", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const integrations = await storage.getN8nIntegrations(establishmentId);
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching N8N integrations:", error);
      res.status(500).json({ message: "Failed to fetch integrations" });
    }
  });

  // Setup N8N WhatsApp integration
  app.post("/api/n8n-integrations/setup-whatsapp", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      
      // Create WhatsApp integration with the provided webhook URL
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
      
      // Test the webhook immediately
      const testData = {
        establishments_id: establishmentId,
        event: "setup_test", 
        data: {
          message: "WhatsApp integration configurada com sucesso!",
          timestamp: new Date().toISOString()
        }
      };

      try {
        const response = await fetch(integrationData.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(testData)
        });

        const responseText = await response.text();
        // N8N webhook test response logging removed for compute optimization
      } catch (testError) {
        console.error("Error testing N8N webhook:", testError);
      }
      
      res.status(201).json({
        integration,
        message: "Integração WhatsApp N8N configurada com sucesso!",
        webhookUrl: integrationData.webhookUrl
      });
    } catch (error) {
      console.error("Error setting up N8N WhatsApp integration:", error);
      res.status(500).json({ message: "Failed to setup WhatsApp integration" });
    }
  });

  app.post("/api/n8n-integrations", async (req, res) => {
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

  app.put("/api/n8n-integrations/:id", async (req, res) => {
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

  app.delete("/api/n8n-integrations/:id", async (req, res) => {
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

  app.get("/api/n8n-integrations/:id/logs", async (req, res) => {
    try {
      const integrationId = parseInt(req.params.id);
      const logs = await storage.getWebhookLogs(integrationId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching webhook logs:", error);
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  app.post("/api/n8n-integrations/test", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const { webhookUrl, apiKey, event = "test" } = req.body;
      
      const testData = {
        message: "Test webhook from Salão Online",
        timestamp: new Date().toISOString()
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
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

  // Evolution API / N8N Integration Routes
  // Endpoint para receber dados do Evolution API via N8N
  app.post("/api/evolution/client-appointment", async (req, res) => {
    try {
      const { 
        establishmentId, 
        clientData, 
        appointmentData,
        apiKey // Para autenticação
      } = req.body;

      // Validação básica
      if (!establishmentId || !clientData || !appointmentData) {
        return res.status(400).json({ 
          message: "Dados obrigatórios: establishmentId, clientData, appointmentData" 
        });
      }

      // Verificar se o estabelecimento existe
      const establishment = await storage.getEstablishment(parseInt(establishmentId));
      if (!establishment) {
        return res.status(404).json({ message: "Estabelecimento não encontrado" });
      }

      let client;
      let clientId;

      // Verificar se cliente já existe (por telefone ou email)
      if (clientData.phone) {
        const existingClients = await storage.searchClients(clientData.phone, parseInt(establishmentId));
        client = existingClients.find(c => c.phone === clientData.phone);
      }

      if (!client && clientData.email) {
        const existingClients = await storage.searchClients(clientData.email, parseInt(establishmentId));
        client = existingClients.find(c => c.email === clientData.email);
      }

      // Se cliente não existe, criar novo
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
        // Evolution API client creation logging removed for compute optimization
      } else {
        clientId = client.id;
        // Evolution API existing client logging removed for compute optimization
      }

      // Criar agendamento
      const appointmentDateTime = new Date(appointmentData.appointmentDate);
      const serviceId = parseInt(appointmentData.serviceId);
      const staffId = parseInt(appointmentData.staffId);

      // Buscar dados do serviço para calcular duração
      const service = await storage.getService(serviceId, parseInt(establishmentId));
      if (!service) {
        return res.status(404).json({ message: "Serviço não encontrado" });
      }

      // Calcular data/hora de fim
      const appointmentEndTime = new Date(appointmentDateTime.getTime() + service.duration * 60000);

      // Verificar conflito de horário
      const hasConflict = await storage.checkAppointmentConflict(staffId, appointmentDateTime, appointmentEndTime);
      if (hasConflict) {
        return res.status(409).json({ 
          message: "Conflito de horário detectado",
          conflict: true
        });
      }

      const newAppointmentData = {
        establishmentId: parseInt(establishmentId),
        clientId: clientId,
        serviceId: serviceId,
        staffId: staffId,
        appointmentDate: appointmentDateTime,
        dataFim: appointmentEndTime,
        duration: service.duration,
        status: appointmentData.status || "agendado",
        notes: appointmentData.notes || "Agendamento criado via WhatsApp/Evolution API"
      };

      const appointment = await storage.createAppointment(newAppointmentData);
      // Evolution API appointment creation logging removed for compute optimization

      // NOTIFICAÇÕES AGORA SÃO AUTOMÁTICAS NO STORAGE
      // Não é mais necessário enviar aqui, pois o storage já envia automaticamente

      // Disparar webhook N8N se configurado
      try {
        await storage.triggerN8nWebhook("appointment_created", {
          appointment,
          client,
          service,
          source: "evolution_api"
        }, parseInt(establishmentId));
      } catch (webhookError) {
        console.error("Erro ao disparar webhook N8N:", webhookError);
        // Não falhar a requisição por erro de webhook
      }

      res.json({
        success: true,
        client: client,
        appointment: appointment,
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

  // Endpoint para apenas criar/atualizar cliente via Evolution API
  app.post("/api/evolution/client", async (req, res) => {
    try {
      const { establishmentId, clientData, apiKey } = req.body;

      if (!establishmentId || !clientData) {
        return res.status(400).json({ 
          message: "Dados obrigatórios: establishmentId, clientData" 
        });
      }

      // Verificar se o estabelecimento existe
      const establishment = await storage.getEstablishment(parseInt(establishmentId));
      if (!establishment) {
        return res.status(404).json({ message: "Estabelecimento não encontrado" });
      }

      let client;

      // Verificar se cliente já existe
      if (clientData.phone) {
        const existingClients = await storage.searchClients(clientData.phone, parseInt(establishmentId));
        client = existingClients.find(c => c.phone === clientData.phone);
      }

      if (!client && clientData.email) {
        const existingClients = await storage.searchClients(clientData.email, parseInt(establishmentId));
        client = existingClients.find(c => c.email === clientData.email);
      }

      if (client) {
        // Atualizar cliente existente se necessário
        const updateData: any = {};
        if (clientData.name && clientData.name !== client.name) updateData.name = clientData.name;
        if (clientData.email && clientData.email !== client.email) updateData.email = clientData.email;
        if (clientData.notes) updateData.notes = clientData.notes;

        if (Object.keys(updateData).length > 0) {
          client = await storage.updateClient(client.id, updateData, parseInt(establishmentId));
          // Evolution API client update logging removed for compute optimization
        }
      } else {
        // Criar novo cliente
        const newClientData = {
          establishmentId: parseInt(establishmentId),
          name: clientData.name || "Cliente WhatsApp",
          phone: clientData.phone || null,
          email: clientData.email || null,
          notes: clientData.notes || "Cliente cadastrado via WhatsApp/Evolution API"
        };

        client = await storage.createClient(newClientData);
        // New client creation log removed for compute optimization

        // Disparar webhook N8N se configurado
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
        client: client,
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

  // Endpoint para buscar informações necessárias para agendamento
  app.get("/api/evolution/establishment/:id/info", async (req, res) => {
    try {
      const establishmentId = parseInt(req.params.id);
      
      const establishment = await storage.getEstablishment(establishmentId);
      if (!establishment) {
        return res.status(404).json({ message: "Estabelecimento não encontrado" });
      }

      // Buscar serviços ativos
      const services = await storage.getServices(establishmentId);
      const activeServices = services.filter(s => s.isActive);

      // Buscar funcionários ativos
      const staff = await storage.getStaff(establishmentId);
      const activeStaff = staff.filter(s => s.isActive && s.isAvailable);

      // Buscar horários de funcionamento
      const businessHours = await storage.getBusinessHours(establishmentId);

      res.json({
        establishment: {
          id: establishment.id,
          name: establishment.name,
          phone: establishment.phone,
          whatsappNumber: establishment.whatsappNumber
        },
        services: activeServices.map(s => ({
          id: s.id,
          name: s.name,
          price: s.price,
          duration: s.duration,
          category: s.category
        })),
        staff: activeStaff.map(s => ({
          id: s.id,
          name: s.name,
          specialties: s.specialties
        })),
        businessHours: businessHours
      });

    } catch (error) {
      console.error("Error fetching establishment info:", error);
      res.status(500).json({ 
        message: "Erro ao buscar informações do estabelecimento" 
      });
    }
  });

  // Evolution API Connection Management Routes
  app.get("/api/evolution-connections", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const connections = await storage.getEvolutionApiConnections(establishmentId);
      res.json(connections);
    } catch (error) {
      console.error("Error fetching Evolution API connections:", error);
      res.status(500).json({ message: "Failed to fetch connections" });
    }
  });

  app.post("/api/evolution-connections", async (req, res) => {
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

  app.put("/api/evolution-connections/:id", async (req, res) => {
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

  app.delete("/api/evolution-connections/:id", async (req, res) => {
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

  // Endpoint para solicitar QR Code via N8N
  app.post("/api/evolution-connections/:id/qr-code", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const connectionId = parseInt(req.params.id);
      
      const connection = await storage.getEvolutionApiConnection(connectionId, establishmentId);
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }

      // Atualizar status para "connecting"
      await storage.updateConnectionStatus(connectionId, "connecting");

      // Disparar webhook N8N para solicitar QR Code
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

  // Endpoint para verificar status da conexão
  app.get("/api/evolution-connections/:id/status", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      const connectionId = parseInt(req.params.id);
      
      const connection = await storage.getEvolutionApiConnection(connectionId, establishmentId);
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }

      // Verificar se QR Code expirou
      let status = connection.status;
      let qrCode = connection.qrCode;

      if (connection.qrCodeExpiration && new Date() > connection.qrCodeExpiration) {
        qrCode = null;
        if (status === "connecting") {
          status = "disconnected";
          await storage.updateConnectionStatus(connectionId, "disconnected", undefined);
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

  // Endpoint GET para verificar status de conexão da Evolution API
  app.get("/api/evolution/connection-status", async (req, res) => {
    try {
      const userContext = getUserContext(req);
      if (!userContext?.establishmentId) {
        return res.json({
          status: "disconnected",
          message: "Contexto de usuário não encontrado",
          connected: false,
          lastCheck: new Date().toISOString()
        });
      }
      
      // Buscar dados da conexão atual armazenados usando função correta
      const webhookData = await storage.getN8nWebhookData(userContext.establishmentId);
      
      if (!webhookData || !webhookData.apiKey || !webhookData.instanceId) {
        return res.json({
          status: "disconnected",
          message: "Nenhuma conexão configurada",
          connected: false,
          lastCheck: new Date().toISOString()
        });
      }

      // Usar baseURL correto da Evolution API e nome da instância
      const evolutionApiUrl = "https://evolution-evolution-api.ayp7v6.easypanel.host";
      const instanceName = webhookData.establishmentName || 'default';
      const statusEndpoint = `${evolutionApiUrl}/instance/connectionState/${instanceName}`;
      
      // Evolution API status check logs removed for compute optimization
      
      try {
        // Fazer chamada GET para Evolution API
        const response = await fetch(statusEndpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': webhookData.apiKey
          }
        });

        // Response status log removed for compute optimization

        if (response.ok) {
          const statusData = await response.json();
          // Status data log removed for compute optimization
          
          // Mapear status da Evolution API
          const connectionStatus = statusData.instance?.state === 'open' ? 'connected' : 
                                  statusData.instance?.state === 'connecting' ? 'connecting' : 
                                  statusData.instance?.state === 'close' ? 'disconnected' : 'unknown';
          
          res.json({
            status: connectionStatus,
            message: `Status verificado via Evolution API: ${statusData.instance?.state || 'unknown'}`,
            connected: connectionStatus === 'connected',
            instanceData: statusData,
            localData: {
              apiKey: webhookData.apiKey.substring(0, 8) + "...",
              instanceId: webhookData.instanceId,
              instanceName: instanceName,
              lastUpdated: webhookData.updatedAt || webhookData.createdAt
            },
            lastCheck: new Date().toISOString()
          });
        } else {
          const errorText = await response.text();
          // Evolution API error log removed for compute optimization
          
          // Se API externa falhar, retornar dados locais
          res.json({
            status: "unknown",
            message: `Erro ao verificar via Evolution API: ${response.status} - ${errorText}`,
            connected: false,
            localData: {
              apiKey: webhookData.apiKey.substring(0, 8) + "...",
              instanceId: webhookData.instanceId,
              instanceName: instanceName,
              lastUpdated: webhookData.updatedAt || webhookData.createdAt
            },
            lastCheck: new Date().toISOString()
          });
        }
      } catch (fetchError: any) {
        console.error("❌ Erro ao consultar Evolution API:", fetchError);
        
        // Se falhar conexão externa, retornar dados locais
        res.json({
          status: "unknown",
          message: "Não foi possível verificar status via Evolution API - erro de conectividade",
          connected: false,
          localData: {
            apiKey: webhookData.apiKey.substring(0, 8) + "...",
            instanceId: webhookData.instanceId,
            instanceName: instanceName,
            lastUpdated: webhookData.updatedAt || webhookData.createdAt
          },
          error: fetchError?.message || 'Unknown error',
          lastCheck: new Date().toISOString()
        });
      }
    } catch (error: any) {
      console.error("Error checking Evolution API connection status:", error);
      res.status(500).json({ 
        status: "error",
        message: "Erro interno ao verificar status",
        connected: false,
        error: error?.message || 'Unknown error',
        lastCheck: new Date().toISOString()
      });
    }
  });

  // Endpoint público para N8N atualizar status/QR Code
  app.post("/api/evolution/webhook/status", async (req, res) => {
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

  // Endpoint para N8N - Webhook de dados da instância
  app.post("/api/evolution/webhook/n8n-instance", async (req, res) => {
    try {
      // N8N webhook data log removed for compute optimization
      console.log("Body:", JSON.stringify(req.body, null, 2));
      
      const body = req.body || {};
      const apiKey = body.apikey || body.apiKey || body.ChaveAPI;
      const instanceId = body.instanceID || body.instanceId;
      
      if (!apiKey || !instanceId) {
        return res.status(400).json({
          error: "Campos obrigatórios ausentes",
          required: ["apikey", "instanceID"],
          received: Object.keys(body)
        });
      }
      
      res.json({
        success: true,
        message: "Dados recebidos com sucesso via API Evolution",
        data: {
          apiKey: apiKey.substring(0, 8) + "...",
          instanceId: instanceId,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Error in N8N instance webhook:", error);
      res.status(500).json({ message: "Failed to process N8N webhook" });
    }
  });

  // Agenda Release Policies
  app.get("/api/agenda-release/policy", async (req, res) => {
    try {
      const userContext = getUserContext(req);
      if (!userContext?.establishmentId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const policy = await storage.getAgendaReleasePolicy(userContext.establishmentId);
      const currentReleasedMonths = await storage.calculateReleasedMonths(userContext.establishmentId);
      
      res.json({
        ...policy,
        currentReleasedMonths: currentReleasedMonths
      });
    } catch (error) {
      console.error("Error fetching agenda release policy:", error);
      res.status(500).json({ error: "Failed to fetch agenda release policy" });
    }
  });

  app.post("/api/agenda-release/policy", async (req, res) => {
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

  // Endpoint para recalcular e forçar atualização dos meses liberados
  app.post("/api/agenda-release/recalculate", async (req, res) => {
    try {
      const userContext = getUserContext(req);
      if (!userContext?.establishmentId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Buscar política atual
      const policy = await storage.getAgendaReleasePolicy(userContext.establishmentId);
      if (!policy) {
        return res.status(404).json({ error: "No agenda release policy found" });
      }

      // Calcular meses que devem estar liberados automaticamente
      const autoReleasedMonths = await storage.calculateReleasedMonths(userContext.establishmentId);

      // Atualizar política removendo o campo releasedMonths (não usado mais)
      const updatedPolicy = await storage.createOrUpdateAgendaReleasePolicy({
        establishmentId: userContext.establishmentId,
        releaseInterval: policy.releaseInterval,
        releaseDay: policy.releaseDay,
        releasedMonths: [], // Limpar meses manuais
        isActive: policy.isActive
      });

      res.json({
        success: true,
        message: "Agenda release recalculated successfully",
        autoReleasedMonths: autoReleasedMonths,
        policy: updatedPolicy
      });
    } catch (error) {
      console.error("Error recalculating release:", error);
      res.status(500).json({ error: "Failed to recalculate release" });
    }
  });

  // Webhook N8N handler moved to index.ts to avoid authentication middleware

  // Endpoint para fornecer dados do webhook para o frontend (agora vem do banco)
  app.get("/api/evolution/webhook-data", async (req, res) => {
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
      
      // Buscar os dados mais recentes do banco
      const webhookData = await storage.getN8nWebhookData(userContext.establishmentId);
      
      if (webhookData) {
        res.json({
          apiKey: webhookData.apiKey || "",
          instanceId: webhookData.instanceId || "",
          qrCodeBase64: webhookData.qrCodeBase64 || "",
          lastUpdated: webhookData.updatedAt || webhookData.createdAt
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

  // ===== NOVOS ENDPOINTS ESPECÍFICOS PARA N8N =====
  
  // Endpoint para buscar informações completas do estabelecimento (sem autenticação)
  app.get("/api/n8n/establishment/:id/info", async (req, res) => {
    // Garantir headers corretos para API
    res.header('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    try {
      const establishmentId = parseInt(req.params.id);
      
      if (!establishmentId) {
        return res.status(400).json({ 
          error: "ID do estabelecimento é obrigatório" 
        });
      }

      // Buscar informações do estabelecimento
      const establishment = await storage.getEstablishment(establishmentId);
      if (!establishment) {
        return res.status(404).json({ 
          error: "Estabelecimento não encontrado" 
        });
      }

      // Buscar serviços ativos
      const services = await storage.getServices(establishmentId);
      
      // Buscar profissionais (staff)
      const staff = await storage.getStaff(establishmentId);
      
      // Buscar horários de funcionamento
      const businessHours = await storage.getBusinessHours(establishmentId);

      res.json({
        establishment: {
          id: establishment.id,
          name: establishment.name,
          email: establishment.email,
          phone: establishment.phone,
          address: establishment.address
        },
        services: services.map(service => ({
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration,
          category: service.category
        })),
        staff: staff.map(member => ({
          id: member.id,
          name: member.name,
          email: member.email,
          phone: member.phone,
          specialties: member.specialties
        })),
        businessHours: businessHours.map(hour => ({
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

  // Endpoint para verificar disponibilidade de horários (sem autenticação)
  app.get("/api/n8n/establishment/:id/availability", async (req, res) => {
    // Garantir headers corretos para API
    res.header('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    try {
      const establishmentId = parseInt(req.params.id);
      const { date, staffId, serviceId } = req.query;
      // N8N availability endpoint log removed for compute optimization
      
      if (!establishmentId || !date) {
        return res.status(400).json({ 
          error: "ID do estabelecimento e data são obrigatórios" 
        });
      }

      // Buscar duração do serviço se fornecido
      let serviceDuration = 30; // padrão
      if (serviceId) {
        const service = await storage.getService(parseInt(String(serviceId)), establishmentId);
        if (service) {
          serviceDuration = service.duration;
        }
      }

      // Buscar horários de funcionamento do estabelecimento
      const businessHours = await storage.getBusinessHours(establishmentId);
      
      // Se staffId fornecido, buscar horários individuais do colaborador
      let staffWorkingHours = null;
      if (staffId) {
        staffWorkingHours = await storage.getStaffWorkingHours(parseInt(String(staffId)), establishmentId);
      }
      
      // Buscar agendamentos existentes para a data
      const appointments = await storage.getAppointments(establishmentId);
      
      // Filtrar agendamentos para a data específica
      const dateStr = String(date);
      const appointmentsForDate = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
        return aptDate === dateStr && (!staffId || apt.staffId === parseInt(String(staffId)));
      });

      // Calcular horários disponíveis
      const dayOfWeek = new Date(dateStr).getDay();
      
      // Verificar se há horários individuais do colaborador
      let availableHours = null;
      if (staffWorkingHours && staffWorkingHours.length > 0) {
        const staffDayHours = staffWorkingHours.find(h => h.dayOfWeek === dayOfWeek);
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
        // Usar horários do estabelecimento
        const businessHour = businessHours.find(bh => bh.dayOfWeek === dayOfWeek);
        availableHours = businessHour || { isOpen: false };
      }
      
      if (!availableHours || !availableHours.isOpen) {
        return res.json({
          date: dateStr,
          available: false,
          message: staffId ? "Colaborador não disponível neste dia" : "Estabelecimento fechado neste dia",
          timeSlots: []
        });
      }

      // Verificar se o colaborador está de férias (se staffId fornecido)
      if (staffId) {
        const { db } = await import("./db");
        const { staffVacations } = await import("@shared/schema");
        const { eq, and } = await import("drizzle-orm");
        
        const staffVacationsData = await db.select()
          .from(staffVacations)
          .where(and(
            eq(staffVacations.establishmentId, establishmentId), 
            eq(staffVacations.staffId, parseInt(String(staffId))),
            eq(staffVacations.isActive, true)
          ));

        // Verificar se há férias ativas na data solicitada
        const isOnVacation = staffVacationsData.some(vacation => {
          const vacationStart = new Date(vacation.startDate);
          const vacationEnd = new Date(vacation.endDate);
          const checkDate = new Date(dateStr);
          
          // Set times to start of day for accurate comparison
          vacationStart.setHours(0, 0, 0, 0);
          vacationEnd.setHours(23, 59, 59, 999);
          checkDate.setHours(12, 0, 0, 0);
          
          return checkDate >= vacationStart && checkDate <= vacationEnd;
        });

        if (isOnVacation) {
          const vacationInfo = staffVacationsData.find(vacation => {
            const vacationStart = new Date(vacation.startDate);
            const vacationEnd = new Date(vacation.endDate);
            const checkDate = new Date(dateStr);
            
            vacationStart.setHours(0, 0, 0, 0);
            vacationEnd.setHours(23, 59, 59, 999);
            checkDate.setHours(12, 0, 0, 0);
            
            return checkDate >= vacationStart && checkDate <= vacationEnd;
          });

          const typeLabels = {
            vacation: 'férias',
            sick_leave: 'atestado médico',
            time_off: 'folga'
          };

          const typeLabel = typeLabels[vacationInfo?.type as keyof typeof typeLabels] || 'ausência';

          return res.json({
            date: dateStr,
            available: false,
            message: `Profissional está de ${typeLabel} neste período`,
            timeSlots: []
          });
        }
      }

      // Gerar slots de horário disponíveis
      const timeSlots = [];
      const [openHour, openMinute] = (availableHours.openTime || "08:00").split(':').map(Number);
      const [closeHour, closeMinute] = (availableHours.closeTime || "18:00").split(':').map(Number);
      
      for (let hour = openHour; hour < closeHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          if (hour === closeHour - 1 && minute >= closeMinute) break;
          
          const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          
          // Verificar se o slot tem tempo suficiente para o serviço
          const slotTime = new Date(`${dateStr}T${timeSlot}:00`);
          const slotEndTime = new Date(slotTime.getTime() + serviceDuration * 60000);
          const dayEndTime = new Date(`${dateStr}T${availableHours.closeTime}:00`);
          
          if (slotEndTime > dayEndTime) {
            continue; // Não há tempo suficiente para o serviço
          }
          
          // Verificar conflitos com agendamentos existentes
          const hasConflict = appointmentsForDate.some(apt => {
            const aptStart = new Date(apt.appointmentDate);
            const aptEnd = new Date(apt.dataFim || new Date(aptStart.getTime() + 30 * 60000));
            
            return (slotTime < aptEnd && slotEndTime > aptStart);
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

  // Endpoint para buscar dias disponíveis de um profissional em um mês (para N8N)
  app.get("/api/n8n/establishment/:establishmentId/staff/:staffId/available-days-month", async (req, res) => {
    // Garantir headers corretos para API
    res.header('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    try {
      const establishmentId = parseInt(req.params.establishmentId);
      const staffId = parseInt(req.params.staffId);
      const { month, year } = req.query;
      
      if (!month || !year) {
        return res.status(400).json({ 
          error: "Parâmetros month e year são obrigatórios",
          example: "/api/n8n/establishment/9/staff/11/available-days-month?month=8&year=2025"
        });
      }
      
      const targetMonth = parseInt(month as string);
      const targetYear = parseInt(year as string);
      
      if (targetMonth < 1 || targetMonth > 12) {
        return res.status(400).json({ 
          error: "Mês deve estar entre 1 e 12" 
        });
      }

      // Buscar horários individuais do profissional
      const staffWorkingHours = await storage.getStaffWorkingHours(staffId, establishmentId);
      
      if (!staffWorkingHours || staffWorkingHours.length === 0) {
        return res.json({
          staffId,
          establishmentId,
          month: targetMonth,
          year: targetYear,
          availableDays: [],
          message: "Profissional não possui horários configurados"
        });
      }
      
      // Criar um mapa de dias da semana que o profissional trabalha
      const workingDays = new Set();
      staffWorkingHours.forEach(hour => {
        if (hour.isAvailable) {
          workingDays.add(hour.dayOfWeek);
        }
      });
      
      // Buscar todas as férias/folgas ativas do colaborador
      const staffVacationsData2 = await db.select()
        .from(staffVacations)
        .where(and(
          eq(staffVacations.establishmentId, establishmentId), 
          eq(staffVacations.staffId, staffId),
          eq(staffVacations.isActive, true)
        ));
      
      const availableDays = [];
      const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
      
      // Data atual para filtrar dias passados
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(targetYear, targetMonth - 1, day);
        const dayOfWeek = currentDate.getDay();
        
        // Pular dias passados
        if (currentDate < today) {
          continue;
        }
        
        // Verificar se o profissional trabalha neste dia da semana
        if (workingDays.has(dayOfWeek)) {
          // Verificar se o colaborador está de férias/folga/atestado neste dia
          const dateStr = currentDate.toISOString().split('T')[0];
          const isOnVacation = staffVacationsData2.some((vacation: any) => {
            const vacationStart = new Date(vacation.startDate);
            const vacationEnd = new Date(vacation.endDate);
            const checkDate = new Date(dateStr);
            
            // Set times to start of day for accurate comparison
            vacationStart.setHours(0, 0, 0, 0);
            vacationEnd.setHours(23, 59, 59, 999);
            checkDate.setHours(12, 0, 0, 0);
            
            return checkDate >= vacationStart && checkDate <= vacationEnd;
          });
          
          // Só incluir o dia se o colaborador não estiver de férias
          if (!isOnVacation) {
            const workingHour = staffWorkingHours.find(h => h.dayOfWeek === dayOfWeek);
            
            availableDays.push({
              date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD
              dayOfWeek,
              dayName: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][dayOfWeek],
              openTime: workingHour?.openTime || '',
              closeTime: workingHour?.closeTime || '',
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

  // Endpoint para criar agendamento via N8N (sem autenticação)
  app.post("/api/n8n/establishment/:id/appointment", async (req, res) => {
    // Garantir headers corretos para API
    res.header('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    try {
      const establishmentId = parseInt(req.params.id);
      const { clientData, appointmentData } = req.body;
      
      if (!establishmentId || !clientData || !appointmentData) {
        return res.status(400).json({ 
          error: "Dados do estabelecimento, cliente e agendamento são obrigatórios" 
        });
      }

      // Verificar se o estabelecimento existe
      const establishment = await storage.getEstablishment(establishmentId);
      if (!establishment) {
        return res.status(404).json({ 
          error: "Estabelecimento não encontrado" 
        });
      }

      // Buscar ou criar cliente
      let client = await storage.getClients(establishmentId);
      const existingClient = client.find(c => 
        c.email === clientData.email || c.phone === clientData.phone
      );

      let clientId;
      if (existingClient) {
        clientId = existingClient.id;
      } else {
        // Criar novo cliente
        const newClient = await storage.createClient({
          establishmentId,
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          notes: clientData.notes || ""
        });
        clientId = newClient.id;
      }

      // Verificar conflito de horário
      const startTime = new Date(appointmentData.dataInicio);
      const endTime = new Date(appointmentData.dataFim);
      
      const hasConflict = await storage.checkAppointmentConflict(
        appointmentData.staffId,
        startTime,
        endTime
      );

      if (hasConflict) {
        return res.status(409).json({ 
          error: "Horário já está ocupado",
          message: "Já existe um agendamento para este horário"
        });
      }

      // Criar agendamento
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

      // Send WebSocket notification for appointment change
      try {
        const { wsManager } = await import("./websocket");
        if (wsManager) {
          wsManager.notifyAppointmentChange(establishmentId, {
            type: 'created',
            appointmentId: appointment.id,
            clientId,
            staffId: appointmentData.staffId,
            serviceId: appointmentData.serviceId,
            date: appointment.appointmentDate
          });
          
          // Also send notification for new notification
          wsManager.notifyNewNotification(establishmentId, {
            type: 'appointment',
            appointmentId: appointment.id
          });
        }
      } catch (wsError) {
        // WebSocket notification error logging removed for compute optimization
      }

      // Enviar notificação automática por email usando o sistema profissional
      try {
        // Buscar informações necessárias para o email
        const [client, service, staff, establishment] = await Promise.all([
          storage.getClient(clientId, establishmentId),
          storage.getService(appointmentData.serviceId, establishmentId),
          storage.getStaffMember(appointmentData.staffId, establishmentId),
          storage.getEstablishment(establishmentId)
        ]);

        if (client && service && staff && establishment && establishment.email) {
          const appointmentDate = new Date(appointment.appointmentDate);
          const formattedDate = appointmentDate.toLocaleDateString('pt-BR');
          const formattedTime = appointmentDate.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });

          const emailSent = await sendAppointmentNotification(establishment.email, {
            establishmentName: establishment.name,
            clientName: client.name,
            serviceName: service.name,
            staffName: staff.name,
            appointmentDate: formattedDate,
            appointmentTime: formattedTime,
            clientPhone: client.phone || ''
          });

          if (emailSent) {
            // Auto notification email log removed for compute optimization
          }
        }
      } catch (emailError) {
        // Auto notification error log removed for compute optimization
        // Não falhar a criação do agendamento por causa do erro de email
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

  // Endpoint para confirmar agendamento (sem autenticação)
  app.put("/api/n8n/appointment/:id/confirm", async (req, res) => {
    // Garantir headers corretos para API
    res.header('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    try {
      const appointmentId = parseInt(req.params.id);
      
      if (!appointmentId) {
        return res.status(400).json({ 
          error: "ID do agendamento é obrigatório" 
        });
      }

      // Buscar agendamento usando método sem establishmentId para N8N
      const appointment = await storage.getAppointmentById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ 
          error: "Agendamento não encontrado" 
        });
      }

      // Confirmar agendamento
      const updatedAppointment = await storage.updateAppointmentStatus(appointmentId, "confirmado", appointment.establishmentId);

      res.json({
        success: true,
        message: "Agendamento confirmado com sucesso",
        data: {
          appointmentId: updatedAppointment.id,
          status: updatedAppointment.status,
          confirmedAt: new Date().toISOString()
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

  // Endpoint para obter próximos 12 meses a partir do mês atual
  app.get("/api/calendar/months", async (req, res) => {
    try {
      const months = [];
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      
      for (let i = 0; i < 12; i++) {
        const targetMonth = (currentMonth + i) % 12;
        const targetYear = currentYear + Math.floor((currentMonth + i) / 12);
        
        months.push({
          month: targetMonth + 1, // 1-12
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
        currentYear: currentYear
      });
    } catch (error) {
      console.error("Error fetching months:", error);
      res.status(500).json({ message: "Failed to fetch months" });
    }
  });

  // Endpoint para obter dias de um mês específico que têm horários disponíveis
  app.get("/api/calendar/days", async (req, res) => {
    try {
      const { month, year } = req.query;
      const userContext = getUserContext(req);
      
      if (!month || !year) {
        return res.status(400).json({ 
          error: "Parâmetros month e year são obrigatórios",
          example: "/api/calendar/days?month=7&year=2025"
        });
      }
      
      const targetMonth = parseInt(month as string);
      const targetYear = parseInt(year as string);
      
      if (targetMonth < 1 || targetMonth > 12) {
        return res.status(400).json({ 
          error: "Mês deve estar entre 1 e 12" 
        });
      }

      // Buscar horários de funcionamento do estabelecimento
      const businessHours = await storage.getBusinessHours(userContext.establishmentId);
      
      // Criar um mapa de dias da semana que o estabelecimento funciona
      const openDays = new Set();
      businessHours.forEach(hour => {
        if (hour.isOpen) {
          openDays.add(hour.dayOfWeek);
        }
      });
      
      const days = [];
      const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
      
      // Data atual
      const now = new Date();
      const currentDay = now.getDate();
      const currentMonth = now.getMonth() + 1; // getMonth() retorna 0-11
      const currentYear = now.getFullYear();
      
      const dayNames = [
        'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
        'Quinta-feira', 'Sexta-feira', 'Sábado'
      ];
      
      const shortDayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      
      // Determinar o dia inicial
      let startDay = 1;
      if (targetMonth === currentMonth && targetYear === currentYear) {
        startDay = currentDay; // Se for o mês atual, começar do dia atual
      }
      
      // Buscar todas as férias/folgas ativas para todos os colaboradores do estabelecimento
      const allStaffVacations = await db.select()
        .from(staffVacations)
        .where(and(
          eq(staffVacations.establishmentId, userContext.establishmentId), 
          eq(staffVacations.isActive, true)
        ));

      for (let day = startDay; day <= daysInMonth; day++) {
        const date = new Date(targetYear, targetMonth - 1, day);
        const dayOfWeek = date.getDay();
        const dateStr = `${targetYear}-${targetMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        // Só incluir dias em que o estabelecimento funciona
        if (openDays.has(dayOfWeek)) {
          // Verificar se algum colaborador está de férias neste dia
          const hasStaffOnVacation = allStaffVacations.some(vacation => {
            const vacationStart = new Date(vacation.startDate);
            const vacationEnd = new Date(vacation.endDate);
            const checkDate = new Date(dateStr);
            
            // Set times to start of day for accurate comparison
            vacationStart.setHours(0, 0, 0, 0);
            vacationEnd.setHours(23, 59, 59, 999);
            checkDate.setHours(12, 0, 0, 0);
            
            return checkDate >= vacationStart && checkDate <= vacationEnd;
          });
          
          // Só incluir o dia se não houver colaboradores de férias
          if (!hasStaffOnVacation) {
            days.push({
              day: day,
              dayOfWeek: dayOfWeek,
              dayName: dayNames[dayOfWeek],
              shortDayName: shortDayNames[dayOfWeek],
              fullDate: `${day.toString().padStart(2, '0')}/${targetMonth.toString().padStart(2, '0')}/${targetYear}`,
              formattedDate: `${day.toString().padStart(2, '0')}/${targetMonth.toString().padStart(2, '0')}/${targetYear} (${dayNames[dayOfWeek]})`,
              isoDate: date.toISOString().split('T')[0],
              isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
              isToday: day === currentDay && targetMonth === currentMonth && targetYear === currentYear,
              isAvailable: true // Todos os dias retornados têm horários disponíveis
            });
          }
        }
      }
      
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      
      res.json({
        success: true,
        data: days,
        monthInfo: {
          month: targetMonth,
          year: targetYear,
          monthName: monthNames[targetMonth - 1],
          daysInMonth: daysInMonth,
          availableDays: days.length,
          totalDays: daysInMonth - startDay + 1,
          firstDayOfWeek: days.length > 0 ? days[0].dayOfWeek : null,
          lastDayOfWeek: days.length > 0 ? days[days.length - 1].dayOfWeek : null
        },
        businessInfo: {
          openDays: Array.from(openDays).sort(),
          businessHours: businessHours.filter(h => h.isOpen).map(h => ({
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

  // ===== LOYALTY SYSTEM ROUTES =====
  
  // Get all loyalty programs for establishment
  app.get("/api/loyalty/programs", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      
      // Check if establishment has access to loyalty module
      const hasLoyaltyAccess = await storage.hasLoyaltyAccess(establishmentId);
      if (!hasLoyaltyAccess) {
        return res.status(403).json({ 
          message: "Este recurso faz parte do plano Core ou superior. Atualize seu plano para desbloquear.",
          requiredPlan: "Intermediário"
        });
      }
      
      const programs = await storage.getLoyaltyPrograms(establishmentId);
      
      // Get services for each program
      const programsWithServices = await Promise.all(
        programs.map(async (program) => {
          const services = await storage.getLoyaltyProgramServices(program.id, establishmentId);
          return { ...program, services };
        })
      );
      
      res.json(programsWithServices);
    } catch (error) {
      console.error("Get loyalty programs error:", error);
      res.status(500).json({ message: "Failed to fetch loyalty programs" });
    }
  });

  // Create loyalty program
  app.post("/api/loyalty/programs", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      
      // Check if establishment has access to loyalty module
      const hasLoyaltyAccess = await storage.hasLoyaltyAccess(establishmentId);
      if (!hasLoyaltyAccess) {
        return res.status(403).json({ 
          message: "Este recurso faz parte do plano Core ou superior. Atualize seu plano para desbloquear.",
          requiredPlan: "Intermediário"
        });
      }
      
      const { services, ...programData } = req.body;
      
      const program = await storage.createLoyaltyProgram({
        ...programData,
        establishmentId,
        isActive: true
      });

      // Add services to the program
      if (services && Array.isArray(services)) {
        for (const serviceId of services) {
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

  // Update loyalty program
  app.put("/api/loyalty/programs/:id", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      
      // Check if establishment has access to loyalty module
      const hasLoyaltyAccess = await storage.hasLoyaltyAccess(establishmentId);
      if (!hasLoyaltyAccess) {
        return res.status(403).json({ 
          message: "Este recurso faz parte do plano Core ou superior. Atualize seu plano para desbloquear.",
          requiredPlan: "Intermediário"
        });
      }
      const programId = parseInt(req.params.id);
      const { services, ...programData } = req.body;
      
      const program = await storage.updateLoyaltyProgram(programId, programData, establishmentId);

      // Update services if provided
      if (services && Array.isArray(services)) {
        // Get current services
        const currentServices = await storage.getLoyaltyProgramServices(programId, establishmentId);
        const currentServiceIds = currentServices.map(s => s.serviceId);
        
        // Remove services not in the new list
        for (const currentServiceId of currentServiceIds) {
          if (!services.includes(currentServiceId)) {
            await storage.removeServiceFromLoyaltyProgram(programId, currentServiceId, establishmentId);
          }
        }
        
        // Add new services
        for (const serviceId of services) {
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

  // Delete loyalty program
  app.delete("/api/loyalty/programs/:id", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      
      // Check if establishment has access to loyalty module
      const hasLoyaltyAccess = await storage.hasLoyaltyAccess(establishmentId);
      if (!hasLoyaltyAccess) {
        return res.status(403).json({ 
          message: "Este recurso faz parte do plano Core ou superior. Atualize seu plano para desbloquear.",
          requiredPlan: "Intermediário"
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

  // Get clients with available rewards
  app.get("/api/loyalty/clients-with-rewards", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      
      // Check if establishment has access to loyalty module
      const hasLoyaltyAccess = await storage.hasLoyaltyAccess(establishmentId);
      if (!hasLoyaltyAccess) {
        return res.status(403).json({ 
          message: "Este recurso faz parte do plano Core ou superior. Atualize seu plano para desbloquear.",
          requiredPlan: "Intermediário"
        });
      }
      
      console.log(`Buscando clientes com pontos para estabelecimento ${establishmentId}`);
      
      // First, let's try a simple query to see if it works
      const results = await db
        .select({
          clientId: clientLoyaltyPoints.clientId,
          clientName: clients.name,
          totalPoints: clientLoyaltyPoints.availablePoints,
          pointsToReward: loyaltyPrograms.pointsToReward,
          rewardDescription: loyaltyPrograms.rewardDescription,
          canRedeem: sql<boolean>`${clientLoyaltyPoints.availablePoints} >= ${loyaltyPrograms.pointsToReward}`
        })
        .from(clientLoyaltyPoints)
        .innerJoin(clients, eq(clients.id, clientLoyaltyPoints.clientId))
        .innerJoin(loyaltyPrograms, eq(loyaltyPrograms.id, clientLoyaltyPoints.loyaltyProgramId))
        .where(eq(clientLoyaltyPoints.establishmentId, establishmentId));
      
      console.log(`Encontrados ${results.length} clientes com pontos`);
      res.json(results);
    } catch (error) {
      console.error("Get clients with rewards error:", error);
      res.status(500).json({ message: "Failed to fetch clients with rewards" });
    }
  });

  // Get client loyalty points
  app.get("/api/loyalty/clients/:clientId/points", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      
      // Check if establishment has access to loyalty module
      const hasLoyaltyAccess = await storage.hasLoyaltyAccess(establishmentId);
      if (!hasLoyaltyAccess) {
        return res.status(403).json({ 
          message: "Este recurso faz parte do plano Core ou superior. Atualize seu plano para desbloquear.",
          requiredPlan: "Intermediário"
        });
      }
      
      const clientId = parseInt(req.params.clientId);
      
      const points = await storage.getClientLoyaltyPoints(clientId, establishmentId);
      const transactions = await storage.getLoyaltyPointTransactions(clientId, establishmentId);
      
      res.json({ points, transactions });
    } catch (error) {
      console.error("Get client loyalty points error:", error);
      res.status(500).json({ message: "Failed to fetch client loyalty points" });
    }
  });

  // Use loyalty points
  app.post("/api/loyalty/clients/:clientId/use-points", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      
      // Check if establishment has access to loyalty module
      const hasLoyaltyAccess = await storage.hasLoyaltyAccess(establishmentId);
      if (!hasLoyaltyAccess) {
        return res.status(403).json({ 
          message: "Este recurso faz parte do plano Core ou superior. Atualize seu plano para desbloquear.",
          requiredPlan: "Intermediário"
        });
      }
      
      const clientId = parseInt(req.params.clientId);
      const { programId, points } = req.body;
      
      await storage.useLoyaltyPoints(clientId, programId, points, establishmentId);
      res.json({ success: true, message: "Pontos utilizados com sucesso" });
    } catch (error: any) {
      console.error("Use loyalty points error:", error);
      res.status(500).json({ message: error?.message || "Failed to use loyalty points" });
    }
  });

  // Add loyalty points (for completed appointments)
  app.post("/api/loyalty/clients/:clientId/add-points", async (req, res) => {
    try {
      const { establishmentId } = getUserContext(req);
      
      // Check if establishment has access to loyalty module
      const hasLoyaltyAccess = await storage.hasLoyaltyAccess(establishmentId);
      if (!hasLoyaltyAccess) {
        return res.status(403).json({ 
          message: "Este recurso faz parte do plano Core ou superior. Atualize seu plano para desbloquear.",
          requiredPlan: "Intermediário"
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

  // Push Notifications endpoints
  app.post('/api/push-subscription', async (req, res) => {
    try {
      const { userId, establishmentId } = getUserContext(req);
      const { subscription } = req.body;
      
      if (!subscription) {
        return res.status(400).json({ message: "Subscription data is required" });
      }
      
      // Remove any existing active subscription for this user
      await db.update(pushSubscriptions)
        .set({ isActive: false })
        .where(eq(pushSubscriptions.userId, userId));
      
      // Add new subscription
      const [newSubscription] = await db.insert(pushSubscriptions)
        .values({
          userId,
          establishmentId,
          subscription: JSON.stringify(subscription),
          isActive: true
        })
        .returning();
      
      res.json({ message: "Push subscription saved successfully", subscription: newSubscription });
    } catch (error) {
      console.error("Error saving push subscription:", error);
      res.status(500).json({ message: "Failed to save push subscription" });
    }
  });

  app.delete('/api/push-subscription', async (req, res) => {
    try {
      const { userId } = getUserContext(req);
      
      // Deactivate all subscriptions for this user
      await db.update(pushSubscriptions)
        .set({ isActive: false })
        .where(eq(pushSubscriptions.userId, userId));
      
      res.json({ message: "Push subscription removed successfully" });
    } catch (error) {
      console.error("Error removing push subscription:", error);
      res.status(500).json({ message: "Failed to remove push subscription" });
    }
  });

  app.get('/api/push-subscription/status', async (req, res) => {
    try {
      const { userId } = getUserContext(req);
      
      const [subscription] = await db.select()
        .from(pushSubscriptions)
        .where(and(
          eq(pushSubscriptions.userId, userId),
          eq(pushSubscriptions.isActive, true)
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

  // Webhook principal para lembretes de agendamentos próximos (30 minutos antes)
  app.get("/webhook/lembrete", async (req, res) => {
    try {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      // Buscar todos os estabelecimentos
      const establishments = await storage.getAllEstablishments();
      
      if (!establishments || establishments.length === 0) {
        return res.json({
          success: true,
          total_lembretes: 0,
          lembretes: [],
          timestamp: new Date().toISOString(),
          message: "Nenhum estabelecimento encontrado"
        });
      }
      
      // Array para armazenar todos os lembretes
      const todosLembretes = [];
      
      // Para cada estabelecimento, buscar agendamentos próximos
      for (const establishment of establishments) {
        try {
          const nextAppointments = await storage.getNextUpcomingAppointments(establishment.id);
          
          // Formatar os lembretes para este estabelecimento
          const lembretesEstabelecimento = nextAppointments.map(appointment => ({
            // Informações do Cliente
            cliente_nome: appointment.clientName,
            cliente_id: appointment.clientId,
            cliente_telefone: appointment.clientPhone,
            cliente_email: appointment.clientEmail,
            
            // Informações do Estabelecimento
            estabelecimento_nome: appointment.establishmentName,
            estabelecimento_id: appointment.establishmentId,
            
            // Informações do Serviço
            servico_nome: appointment.serviceName,
            servico_preco: appointment.servicePrice,
            servico_duracao: appointment.duration,
            
            // Informações do Profissional
            profissional_nome: appointment.staffName,
            
            // Informações do Agendamento
            agendamento_id: appointment.id,
            agendamento_data: new Date(appointment.appointmentDate).toLocaleDateString('pt-BR'),
            agendamento_hora: new Date(appointment.appointmentDate).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            agendamento_data_completa: appointment.appointmentDate,
            agendamento_status: appointment.status,
            agendamento_observacoes: appointment.notes || ''
          }));
          
          todosLembretes.push(...lembretesEstabelecimento);
          
        } catch (error) {
          console.error(`Erro ao buscar agendamentos do estabelecimento ${establishment.id}:`, error);
          // Continuar com outros estabelecimentos mesmo se um falhar
        }
      }
      
      // URL do N8N para onde enviar os dados
      const n8nWebhookUrl = 'https://n8n-n8n-start.ayp7v6.easypanel.host/webhook/lembrete';
      
      // Enviar dados para o N8N automaticamente
      try {
        const response = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            success: true,
            total_lembretes: todosLembretes.length,
            lembretes: todosLembretes,
            timestamp: new Date().toISOString(),
            message: `Encontrados ${todosLembretes.length} lembrete(s) de agendamentos próximos de 30 minutos`
          })
        });
        
        if (response.ok) {
          console.log(`✅ Dados enviados com sucesso para o N8N. Total de lembretes: ${todosLembretes.length}`);
        } else {
          console.error(`❌ Erro ao enviar dados para o N8N. Status: ${response.status}`);
        }
        
      } catch (n8nError) {
        console.error("❌ Erro ao enviar dados para o N8N:", n8nError);
      }
      
      res.json({
        success: true,
        total_lembretes: todosLembretes.length,
        lembretes: todosLembretes,
        timestamp: new Date().toISOString(),
        message: `Encontrados ${todosLembretes.length} lembrete(s) de agendamentos próximos de 30 minutos e enviados para o N8N`
      });
      
    } catch (error) {
      console.error("Erro no webhook de lembretes:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });

  // Endpoint para enviar lembretes automaticamente para o N8N
  app.post("/webhook/enviar-lembretes-n8n", async (req, res) => {
    try {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      // Buscar todos os estabelecimentos
      const establishments = await storage.getAllEstablishments();
      
      if (!establishments || establishments.length === 0) {
        return res.json({
          success: true,
          total_lembretes: 0,
          lembretes: [],
          timestamp: new Date().toISOString(),
          message: "Nenhum estabelecimento encontrado"
        });
      }
      
      // Array para armazenar todos os lembretes
      const todosLembretes = [];
      
      // Para cada estabelecimento, buscar agendamentos próximos
      for (const establishment of establishments) {
        try {
          const nextAppointments = await storage.getNextUpcomingAppointments(establishment.id);
          
          // Formatar os lembretes para este estabelecimento
          const lembretesEstabelecimento = nextAppointments.map(appointment => ({
            // Informações do Cliente
            cliente_nome: appointment.clientName,
            cliente_id: appointment.clientId,
            cliente_telefone: appointment.clientPhone,
            cliente_email: appointment.clientEmail,
            
            // Informações do Estabelecimento
            estabelecimento_nome: appointment.establishmentName,
            estabelecimento_id: appointment.establishmentId,
            
            // Informações do Serviço
            servico_nome: appointment.serviceName,
            servico_preco: appointment.servicePrice,
            servico_duracao: appointment.duration,
            
            // Informações do Profissional
            profissional_nome: appointment.staffName,
            
            // Informações do Agendamento
            agendamento_id: appointment.id,
            agendamento_data: new Date(appointment.appointmentDate).toLocaleDateString('pt-BR'),
            agendamento_hora: new Date(appointment.appointmentDate).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            agendamento_data_completa: appointment.appointmentDate,
            agendamento_status: appointment.status,
            agendamento_observacoes: appointment.notes || ''
          }));
          
          todosLembretes.push(...lembretesEstabelecimento);
          
        } catch (error) {
          console.error(`Erro ao buscar agendamentos do estabelecimento ${establishment.id}:`, error);
          // Continuar com outros estabelecimentos mesmo se um falhar
        }
      }
      
      // URL do N8N para onde enviar os dados
      const n8nWebhookUrl = 'https://n8n-n8n-start.ayp7v6.easypanel.host/webhook/lembrete';
      
      // Enviar dados para o N8N
      try {
        const response = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            success: true,
            total_lembretes: todosLembretes.length,
            lembretes: todosLembretes,
            timestamp: new Date().toISOString(),
            message: `Encontrados ${todosLembretes.length} lembrete(s) de agendamentos próximos de 30 minutos`
          })
        });
        
        if (response.ok) {
          console.log(`✅ Dados enviados com sucesso para o N8N. Total de lembretes: ${todosLembretes.length}`);
        } else {
          console.error(`❌ Erro ao enviar dados para o N8N. Status: ${response.status}`);
        }
        
      } catch (n8nError) {
        console.error("❌ Erro ao enviar dados para o N8N:", n8nError);
      }
      
      res.json({
        success: true,
        total_lembretes: todosLembretes.length,
        lembretes: todosLembretes,
        timestamp: new Date().toISOString(),
        message: `Encontrados ${todosLembretes.length} lembrete(s) e enviados para o N8N`
      });
      
    } catch (error) {
      console.error("Erro no webhook de envio para N8N:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });

  // Endpoint de debug para verificar agendamentos e timezone
  app.get("/webhook/debug-agendamentos/:establishmentId", async (req, res) => {
    try {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      const establishmentId = parseInt(req.params.establishmentId);
      const now = new Date();
      const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
      
      // Buscar todos os agendamentos do estabelecimento
      const allAppointments = await storage.getAppointments(establishmentId);
      
      // Filtrar apenas os confirmados/agendados
      const confirmedAppointments = allAppointments.filter(apt => 
        apt.status === 'confirmed' || apt.status === 'scheduled'
      );
      
      // Filtrar os próximos de 30 minutos
      const upcomingAppointments = confirmedAppointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= now && aptDate <= thirtyMinutesFromNow;
      });
      
      res.json({
        success: true,
        debug_info: {
          current_time_utc: now.toISOString(),
          current_time_brasil: now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
          thirty_minutes_from_now_utc: thirtyMinutesFromNow.toISOString(),
          thirty_minutes_from_now_brasil: thirtyMinutesFromNow.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
        },
        total_appointments: allAppointments.length,
        confirmed_appointments: confirmedAppointments.length,
        upcoming_appointments: upcomingAppointments.length,
        upcoming_appointments_details: upcomingAppointments.map(apt => ({
          id: apt.id,
          appointmentDate: apt.appointmentDate,
          appointmentDate_brasil: new Date(apt.appointmentDate).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
          status: apt.status,
          clientName: apt.clientName,
          serviceName: apt.serviceName
        })),
        all_confirmed_appointments: confirmedAppointments.map(apt => ({
          id: apt.id,
          appointmentDate: apt.appointmentDate,
          appointmentDate_brasil: new Date(apt.appointmentDate).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
          status: apt.status,
          clientName: apt.clientName,
          serviceName: apt.serviceName
        }))
      });
      
    } catch (error) {
      console.error("Erro no debug de agendamentos:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });

  // Endpoint para debug de agendamentos e timezone
  app.get("/webhook/debug-appointments/:establishmentId", async (req, res) => {
    try {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      const establishmentId = parseInt(req.params.establishmentId);
      
      // Horário atual em diferentes timezones
      const now = new Date();
      const brazilTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
      const thirtyMinutesFromNow = new Date(brazilTime.getTime() + 30 * 60 * 1000);
      
      // Buscar todos os agendamentos do estabelecimento
      const allAppointments = await storage.getAppointments(establishmentId);
      
      // Filtrar agendamentos próximos
      const upcomingAppointments = allAppointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= brazilTime && 
               aptDate <= thirtyMinutesFromNow && 
               (apt.status === 'confirmed' || apt.status === 'scheduled');
      });
      
      res.json({
        success: true,
        debug_info: {
          current_time_utc: now.toISOString(),
          current_time_brazil: brazilTime.toISOString(),
          thirty_minutes_from_now: thirtyMinutesFromNow.toISOString(),
          total_appointments: allAppointments.length,
          upcoming_appointments_count: upcomingAppointments.length
        },
        all_appointments: allAppointments.map(apt => ({
          id: apt.id,
          appointmentDate: apt.appointmentDate,
          status: apt.status,
          clientName: apt.clientName,
          serviceName: apt.serviceName,
          is_upcoming: new Date(apt.appointmentDate) >= brazilTime && 
                      new Date(apt.appointmentDate) <= thirtyMinutesFromNow &&
                      (apt.status === 'confirmed' || apt.status === 'scheduled')
        })),
        upcoming_appointments: upcomingAppointments
      });
      
    } catch (error) {
      console.error("Erro no debug de agendamentos:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });

  // Endpoint de teste temporário para agendamento 22:30
  app.post("/webhook/teste-22h30", async (req, res) => {
    try {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      // Simular dados do agendamento das 22:30
      const testData = {
        cliente_nome: "João Pedro Damasceno",
        cliente_id: 1,
        cliente_telefone: "5511988747359",
        cliente_email: null,
        estabelecimento_nome: "Studio Expert Premium",
        estabelecimento_id: 2,
        instance_id: "1476f853-4f4d-4702-bf08-b262da636d24",
        servico_nome: "Barba",
        servico_preco: "35.00",
        servico_duracao: 20,
        profissional_nome: "Expert 01",
        agendamento_id: 128,
        agendamento_data: "20/08/2025",
        agendamento_hora: "22:30",
        agendamento_data_completa: "2025-08-20T22:30:00.000Z",
        agendamento_status: "confirmed",
        agendamento_observacoes: ""
      };

      const n8nWebhookUrl = 'https://n8n-n8n-start.ayp7v6.easypanel.host/webhook/lembrete';
      
      const requestBody = {
        success: true,
        total_lembretes: 1,
        lembretes: [testData],
        timestamp: new Date().toISOString(),
        message: "Teste do agendamento 22:30"
      };
      
      console.log("🧪 Enviando teste do agendamento 22:30:", JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const responseText = await response.text();
      
      res.json({
        success: response.ok,
        status: response.status,
        response_text: responseText,
        sent_data: requestBody,
        headers: Object.fromEntries(response.headers.entries())
      });
      
    } catch (error) {
      console.error("❌ Erro no teste do agendamento 22:30:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });

  // Endpoint de teste para criar agendamento 23:10
  app.post("/webhook/teste-agendamento-23h10", async (req, res) => {
    try {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      // Buscar o cliente João Pedro (ID 1)
      const client = await storage.getClient(1, 2);
      if (!client) {
        return res.status(404).json({ success: false, error: "Cliente não encontrado" });
      }
      
      // Buscar o serviço Barba (assumindo que existe)
      const services = await storage.getServices(2);
      const service = services.find(s => s.name.toLowerCase().includes('barba'));
      if (!service) {
        return res.status(404).json({ success: false, error: "Serviço Barba não encontrado" });
      }
      
      // Buscar o profissional Expert 01
      const staff = await storage.getStaff(2);
      const expert01 = staff.find(s => s.name === 'Expert 01');
      if (!expert01) {
        return res.status(404).json({ success: false, error: "Profissional Expert 01 não encontrado" });
      }
      
      // Data de hoje às 23:10
      const today = new Date();
      const appointmentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 10, 0);
      
      const appointmentData = {
        clientId: client.id,
        serviceId: service.id,
        staffId: expert01.id,
        establishmentId: 2,
        appointmentDate: appointmentDate.toISOString(),
        duration: service.duration,
        status: 'confirmed',
        notes: 'Teste de agendamento 23:10'
      };
      
      console.log("🧪 Criando agendamento de teste:", appointmentData);
      
      // Criar o agendamento
      const newAppointment = await storage.createAppointment(appointmentData);
      
      res.json({
        success: true,
        message: "Agendamento criado com sucesso",
        appointment: {
          id: newAppointment.id,
          client_name: client.name,
          service_name: service.name,
          staff_name: expert01.name,
          appointment_date: appointmentDate.toISOString(),
          status: newAppointment.status
        }
      });
      
    } catch (error) {
      console.error("❌ Erro ao criar agendamento de teste:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });

  // Endpoint de debug para verificar horários disponíveis
  app.get("/webhook/debug-horarios/:staffId/:serviceId", async (req, res) => {
    try {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      const staffId = parseInt(req.params.staffId);
      const serviceId = parseInt(req.params.serviceId);
      const date = req.query.date as string || new Date().toISOString().split('T')[0];
      const establishmentId = 2; // Estabelecimento fixo para teste
      
      // Buscar dados necessários
      const service = await storage.getService(serviceId, establishmentId);
      const businessHours = await storage.getBusinessHours(establishmentId);
      const staffWorkingHours = await storage.getStaffWorkingHours(staffId, establishmentId);
      const existingAppointments = await storage.getAppointments(establishmentId);
      
      const queryDate = new Date(date);
      const dayOfWeek = queryDate.getDay();
      
      // Horários do estabelecimento
      const dayHours = businessHours.find(h => h.dayOfWeek === dayOfWeek);
      const staffDayHours = staffWorkingHours.find(h => h.dayOfWeek === dayOfWeek);
      
      // Horários finais (mais restritivo)
      const openTime = staffDayHours?.openTime || dayHours?.openTime || "09:00";
      const closeTime = staffDayHours?.closeTime || dayHours?.closeTime || "18:00";
      const [openHour, openMinute] = openTime.split(':').map(Number);
      const [closeHour, closeMinute] = closeTime.split(':').map(Number);
      
      // Horário atual em diferentes timezones
      const currentTime = new Date();
      const currentBrazilTime = new Date(currentTime.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
      const currentUTC = new Date();
      
      // Filtrar agendamentos do dia
      const staffAppointments = existingAppointments.filter(apt => {
        if (apt.staffId !== staffId) return false;
        const aptDate = new Date(apt.appointmentDate);
        return aptDate.getFullYear() === queryDate.getFullYear() &&
               aptDate.getMonth() === queryDate.getMonth() &&
               aptDate.getDate() === queryDate.getDate();
      });
      
      // Testar alguns horários específicos
      const testTimes = ["22:00", "22:30", "23:00", "23:10", "23:30"];
      const timeTests = testTimes.map(timeString => {
        const slotStartBrazil = new Date(`${date}T${timeString}:00`);
        const slotStart = new Date(slotStartBrazil.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
        const slotEnd = new Date(slotStart.getTime() + (service.duration * 60000));
        
        const isPastTime = slotStart <= currentBrazilTime;
        const hasConflict = staffAppointments.some((apt: any) => {
          const aptStart = new Date(apt.appointmentDate);
          const aptDuration = apt.duration || 30;
          const aptEnd = new Date(aptStart.getTime() + (aptDuration * 60000));
          return (slotStart < aptEnd && slotEnd > aptStart);
        });
        
        return {
          time: timeString,
          slotStartBrazil: slotStartBrazil.toISOString(),
          slotStart: slotStart.toISOString(),
          currentBrazilTime: currentBrazilTime.toISOString(),
          isPastTime,
          hasConflict,
          available: !isPastTime && !hasConflict
        };
      });
      
      res.json({
        success: true,
        debug_info: {
          date,
          dayOfWeek,
          establishmentId,
          staffId,
          serviceId,
          service_duration: service.duration,
          current_time_utc: currentUTC.toISOString(),
          current_time_brazil: currentBrazilTime.toISOString()
        },
        business_hours: {
          establishment: dayHours,
          staff: staffDayHours,
          final_open: openTime,
          final_close: closeTime
        },
        appointments_today: staffAppointments.length,
        time_tests: timeTests
      });
      
    } catch (error) {
      console.error("Erro no debug de horários:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize WebSocket server
  const { initializeWebSocket } = await import("./websocket");
  initializeWebSocket(httpServer);
  
  return httpServer;
}