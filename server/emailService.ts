import nodemailer from 'nodemailer';

// Configuração do transportador SMTP profissional
function createProfessionalTransporter() {
  // Configurações para o email profissional contato@salaoonline.site
  if (process.env.PROFESSIONAL_SMTP_HOST && process.env.PROFESSIONAL_SMTP_USER && process.env.PROFESSIONAL_SMTP_PASS) {
    // SMTP configuration logging removed for compute optimization
    return nodemailer.createTransport({
      host: process.env.PROFESSIONAL_SMTP_HOST,
      port: parseInt(process.env.PROFESSIONAL_SMTP_PORT || '587'),
      secure: process.env.PROFESSIONAL_SMTP_PORT === '465',
      auth: {
        user: process.env.PROFESSIONAL_SMTP_USER, // contato@salaoonline.site
        pass: process.env.PROFESSIONAL_SMTP_PASS,
      },
    });
  }
  return null;
}

// Configuração do transportador SMTP padrão (para recuperação de senha)
function createTransporter() {
  // Se não houver configurações SMTP, retorna null
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    // SMTP not found logging removed for compute optimization
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  const transporter = createTransporter();
  
  if (!transporter) {
    // Email not configured logging removed for compute optimization
    return false;
  }

  try {
    await transporter.sendMail({
      from: params.from,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    // Email success logging removed for compute optimization
    return true;
  } catch (error) {
    // Email error log removed for compute optimization - using return false
    return false;
  }
}

interface AppointmentEmailData {
  establishmentName: string;
  clientName: string;
  serviceName: string;
  staffName: string;
  appointmentDate: string;
  appointmentTime: string;
  clientPhone?: string;
}

// Função para enviar notificação de agendamento usando email profissional
export async function sendAppointmentNotification(
  establishmentEmail: string,
  appointmentData: AppointmentEmailData
): Promise<boolean> {
  // Email notification call log removed for compute optimization
  
  // Tenta usar o transportador profissional primeiro
  const professionalTransporter = createProfessionalTransporter();
  const transporter = professionalTransporter || createTransporter();
  
  if (!transporter) {
    // Email transporter error log removed for compute optimization
    return false;
  }

  const fromEmail = process.env.PROFESSIONAL_SMTP_USER || process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@salaoonline.com';
  const isFromProfessionalEmail = fromEmail.includes('@salaoonline.site');
  
  // Appointment notification logging removed for compute optimization
  const subject = `🗓️ Novo Agendamento - ${appointmentData.establishmentName}`;
  
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
                <h1>📅 Novo Agendamento Recebido</h1>
                <p>${appointmentData.establishmentName}</p>
            </div>
            <div class="content">
                <p>Olá! Você recebeu um novo agendamento no seu salão:</p>
                
                <div class="appointment-details">
                    <h3>📋 Detalhes do Agendamento</h3>
                    
                    <div class="detail-row">
                        <span class="label">Cliente:</span>
                        <span>${appointmentData.clientName}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="label">Serviço:</span>
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
                        <span class="label">Horário:</span>
                        <span>${appointmentData.appointmentTime}</span>
                    </div>
                    
                    ${appointmentData.clientPhone ? `
                    <div class="detail-row">
                        <span class="label">Telefone:</span>
                        <span>${appointmentData.clientPhone}</span>
                    </div>
                    ` : ''}
                </div>
                
                <p><strong>👨‍💼 Ação Necessária:</strong></p>
                <ul>
                    <li>Acesse o Salão Online para confirmar o agendamento</li>
                    <li>Entre em contato com o cliente se necessário</li>
                    <li>Prepare-se para o atendimento na data e horário marcados</li>
                </ul>
            </div>
            
            <div class="footer">
                <p>Este email foi gerado automaticamente pelo Salão Online</p>
                <p>Sistema de Gestão para Salões de Beleza</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const textContent = `
NOVO AGENDAMENTO - ${appointmentData.establishmentName}

Detalhes do Agendamento:
- Cliente: ${appointmentData.clientName}
- Serviço: ${appointmentData.serviceName}
- Profissional: ${appointmentData.staffName}
- Data: ${appointmentData.appointmentDate}
- Horário: ${appointmentData.appointmentTime}
${appointmentData.clientPhone ? `- Telefone: ${appointmentData.clientPhone}` : ''}

Acesse o Salão Online para confirmar o agendamento.

---
Este email foi gerado automaticamente pelo Salão Online
Sistema de Gestão para Salões de Beleza
  `;

  try {
    await transporter.sendMail({
      from: `"Salão Online" <${fromEmail}>`,
      to: establishmentEmail,
      subject,
      text: textContent,
      html: htmlContent,
    });
    // Appointment notification success logging removed for compute optimization
    return true;
  } catch (error) {
    // Appointment notification error log removed for compute optimization
    return false;
  }
}

// Mantém a função original para compatibilidade 
export async function sendNewAppointmentEmail(
  establishmentEmail: string,
  appointmentData: AppointmentEmailData
): Promise<boolean> {
  return await sendAppointmentNotification(establishmentEmail, appointmentData);
}

// Enviar email de recuperação de senha
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  establishmentName?: string
): Promise<boolean> {
  // Detectar URL do ambiente automaticamente
  const baseUrl = process.env.BASE_URL || process.env.FRONTEND_URL || 'https://salaoonline-render.onrender.com';
  
  const resetUrl = `${baseUrl}/redefinir-senha?token=${resetToken}`;
  const subject = '🔐 Redefinir Senha - Salão Online';
  
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
                <h1>🔐 Redefinir Senha</h1>
                <p>Salão Online${establishmentName ? ` - ${establishmentName}` : ''}</p>
            </div>
            <div class="content">
                <p>Olá!</p>
                
                <p>Recebemos uma solicitação para redefinir a senha da sua conta. Para continuar, clique no botão abaixo:</p>
                
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="reset-button">Redefinir Minha Senha</a>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Importante:</strong>
                    <ul>
                        <li>Este link é válido por apenas 1 hora</li>
                        <li>Se você não solicitou esta redefinição, ignore este email</li>
                        <li>Sua senha atual permanecerá ativa até que seja alterada</li>
                    </ul>
                </div>
                
                <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
                <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 4px; font-family: monospace;">
                    ${resetUrl}
                </p>
                
                <div class="footer">
                    <p>Este email foi enviado automaticamente pelo sistema Salão Online.</p>
                    <p>Se você não solicitou esta redefinição, pode ignorar este email com segurança.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;

  const textContent = `
Redefinir Senha - Salão Online

Olá!

Recebemos uma solicitação para redefinir a senha da sua conta.

Para redefinir sua senha, acesse o link abaixo:
${resetUrl}

IMPORTANTE:
- Este link é válido por apenas 1 hora
- Se você não solicitou esta redefinição, ignore este email
- Sua senha atual permanecerá ativa até que seja alterada

Este email foi enviado automaticamente pelo sistema Salão Online.
  `;

  return await sendEmail({
    to: email,
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@salaoonline.com',
    subject,
    text: textContent,
    html: htmlContent
  });
}