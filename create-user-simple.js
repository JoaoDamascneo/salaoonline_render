#!/usr/bin/env node

/**
 * Script simples para criar um usuário
 * 
 * Uso: node create-user-simple.js
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcrypt';
import { establishments, users, plans } from './shared/schema.js';
import { eq } from 'drizzle-orm';

// Configuração do banco de dados
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL não encontrada!');
  console.log('Configure a variável DATABASE_URL ou adicione no .env');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function createUser() {
  try {
    console.log('🚀 Criando usuário de teste...\n');

    // Dados do establishment
    const establishmentData = {
      name: "Salão Teste",
      ownerName: "João Teste",
      email: "joao@salaoteste.com",
      phone: "(11) 88888-8888",
      whatsappNumber: "(11) 88888-8888",
      segment: "Salão de Beleza",
      address: "Rua Teste, 123 - São Paulo, SP",
      planId: 1, // Plano Base
      subscriptionStatus: "active"
    };

    // Dados do usuário
    const userData = {
      name: "João Teste",
      email: "joao@salaoteste.com",
      password: "123456",
      role: "admin"
    };

    // Verificar se já existe
    const [existing] = await db
      .select()
      .from(establishments)
      .where(eq(establishments.email, establishmentData.email));

    if (existing) {
      console.log('⚠️  Establishment já existe!');
      console.log(`   Email: ${existing.email}`);
      console.log(`   ID: ${existing.id}`);
      return;
    }

    // Criar establishment
    const [establishment] = await db
      .insert(establishments)
      .values(establishmentData)
      .returning();

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Criar usuário
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        establishmentId: establishment.id,
        password: hashedPassword
      })
      .returning();

    console.log('✅ Usuário criado com sucesso!');
    console.log('='.repeat(40));
    console.log(`🏢 Establishment: ${establishment.name}`);
    console.log(`👤 Usuário: ${user.name}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Senha: ${userData.password}`);
    console.log(`🎯 Plano: Base (ID: 1)`);
    console.log('='.repeat(40));
    console.log('\n🔗 Para acessar:');
    console.log(`   URL: http://localhost:5000`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Senha: ${userData.password}\n`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

createUser();
