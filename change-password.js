#!/usr/bin/env node

/**
 * Script para alterar a senha de um usuário
 * 
 * Uso: node change-password.js
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcrypt';
import { users } from './shared/schema.js';
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

async function changePassword() {
  try {
    console.log('🔐 Alterando senha do usuário...\n');

    const email = "jpamdoliveira@gmail.com";
    const newPassword = "123456"; // Nova senha

    console.log('📧 Email:', email);
    console.log('🔑 Nova senha:', newPassword);
    console.log('');

    // Verificar se o usuário existe
    console.log('🔍 Verificando se o usuário existe...');
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!existingUser) {
      console.error('❌ Usuário não encontrado!');
      console.log(`   Email: ${email}`);
      return;
    }

    console.log('✅ Usuário encontrado!');
    console.log(`   ID: ${existingUser.id}`);
    console.log(`   Nome: ${existingUser.name}`);
    console.log(`   Email: ${existingUser.email}`);
    console.log(`   Establishment ID: ${existingUser.establishmentId}`);
    console.log('');

    // Criptografar nova senha
    console.log('🔐 Criptografando nova senha...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    console.log('💾 Atualizando senha no banco...');
    const [updatedUser] = await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.email, email))
      .returning();

    console.log('✅ Senha alterada com sucesso!');
    console.log('='.repeat(50));
    console.log('📋 RESUMO:');
    console.log(`   Usuário: ${updatedUser.name}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Nova senha: ${newPassword}`);
    console.log(`   Alterado em: ${updatedUser.updatedAt}`);
    console.log('='.repeat(50));
    console.log('\n🔗 Para acessar o sistema:');
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Senha: ${newPassword}\n`);

  } catch (error) {
    console.error('❌ Erro ao alterar senha:', error.message);
  } finally {
    await client.end();
  }
}

changePassword();
