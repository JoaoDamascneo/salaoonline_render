#!/usr/bin/env node

/**
 * Script para criar um usuário com establishment e plano
 * 
 * Uso: node create-user.js
 * 
 * Este script vai:
 * 1. Criar um establishment (salão/empresa)
 * 2. Criar um usuário admin para esse establishment
 * 3. Associar um plano ao establishment
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcrypt';
import { establishments, users, plans } from './shared/schema.js';
import { eq } from 'drizzle-orm';

// Configuração do banco de dados
const connectionString = process.env.DATABASE_URL || 'postgresql://username:password@host:port/database';
const client = postgres(connectionString);
const db = drizzle(client);

async function createUserWithEstablishment() {
  try {
    console.log('🚀 Iniciando criação de usuário...\n');

    // Dados do establishment (você pode modificar aqui)
    const establishmentData = {
      name: "Salão da Maria",
      ownerName: "Maria Silva",
      email: "maria@salao.com",
      phone: "(11) 99999-9999",
      whatsappNumber: "(11) 99999-9999",
      segment: "Salão de Beleza",
      address: "Rua das Flores, 123 - São Paulo, SP",
      planId: 1, // 1 = Base, 2 = Core, 3 = Expert
      subscriptionStatus: "active"
    };

    // Dados do usuário
    const userData = {
      name: "Maria Silva",
      email: "maria@salao.com",
      password: "123456", // Senha que será criptografada
      role: "admin"
    };

    console.log('📋 Dados do Establishment:');
    console.log(`   Nome: ${establishmentData.name}`);
    console.log(`   Proprietário: ${establishmentData.ownerName}`);
    console.log(`   Email: ${establishmentData.email}`);
    console.log(`   Telefone: ${establishmentData.phone}`);
    console.log(`   Segmento: ${establishmentData.segment}`);
    console.log(`   Endereço: ${establishmentData.address}`);
    console.log(`   Plano ID: ${establishmentData.planId}\n`);

    console.log('👤 Dados do Usuário:');
    console.log(`   Nome: ${userData.name}`);
    console.log(`   Email: ${userData.email}`);
    console.log(`   Senha: ${userData.password}`);
    console.log(`   Função: ${userData.role}\n`);

    // Verificar se o plano existe
    console.log('🔍 Verificando plano...');
    const [plan] = await db.select().from(plans).where(eq(plans.id, establishmentData.planId));
    
    if (!plan) {
      console.error('❌ Plano não encontrado! Planos disponíveis:');
      const allPlans = await db.select().from(plans);
      allPlans.forEach(p => {
        console.log(`   ID: ${p.id} - ${p.name} - R$ ${p.price}/mês`);
      });
      return;
    }

    console.log(`✅ Plano encontrado: ${plan.name} - R$ ${plan.price}/mês\n`);

    // Verificar se o establishment já existe
    console.log('🔍 Verificando se o establishment já existe...');
    const [existingEstablishment] = await db
      .select()
      .from(establishments)
      .where(eq(establishments.email, establishmentData.email));

    if (existingEstablishment) {
      console.log('⚠️  Establishment já existe!');
      console.log(`   ID: ${existingEstablishment.id}`);
      console.log(`   Nome: ${existingEstablishment.name}`);
      console.log(`   Email: ${existingEstablishment.email}\n`);
      
      // Perguntar se quer continuar
      console.log('Deseja criar um novo establishment com dados diferentes?');
      console.log('Modifique os dados no script e execute novamente.\n');
      return;
    }

    // Criar establishment
    console.log('🏢 Criando establishment...');
    const [newEstablishment] = await db
      .insert(establishments)
      .values(establishmentData)
      .returning();

    console.log(`✅ Establishment criado com ID: ${newEstablishment.id}\n`);

    // Verificar se o usuário já existe
    console.log('🔍 Verificando se o usuário já existe...');
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email));

    if (existingUser) {
      console.log('⚠️  Usuário já existe!');
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Nome: ${existingUser.name}`);
      console.log(`   Email: ${existingUser.email}\n`);
      
      console.log('Deseja criar um novo usuário com dados diferentes?');
      console.log('Modifique os dados no script e execute novamente.\n');
      return;
    }

    // Criptografar senha
    console.log('🔐 Criptografando senha...');
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Criar usuário
    console.log('👤 Criando usuário...');
    const [newUser] = await db
      .insert(users)
      .values({
        ...userData,
        establishmentId: newEstablishment.id,
        password: hashedPassword
      })
      .returning();

    console.log(`✅ Usuário criado com ID: ${newUser.id}\n`);

    // Resumo final
    console.log('🎉 Usuário criado com sucesso!');
    console.log('='.repeat(50));
    console.log('📋 RESUMO:');
    console.log(`   Establishment ID: ${newEstablishment.id}`);
    console.log(`   Establishment: ${newEstablishment.name}`);
    console.log(`   Usuário ID: ${newUser.id}`);
    console.log(`   Usuário: ${newUser.name}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Senha: ${userData.password}`);
    console.log(`   Plano: ${plan.name} (R$ ${plan.price}/mês)`);
    console.log('='.repeat(50));
    console.log('\n🔗 Para acessar o sistema:');
    console.log(`   URL: http://localhost:5000`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Senha: ${userData.password}\n`);

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
  } finally {
    await client.end();
  }
}

// Executar o script
createUserWithEstablishment();
