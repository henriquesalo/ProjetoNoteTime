// backend/prisma/seed.js

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // LIMPAR DADOS EXISTENTES
  console.log('🗑️  Limpando dados existentes...');
  
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.appointmentService.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.unit.deleteMany();

  console.log('✅ Dados limpos\n');

  // CRIAR UNIDADE
  console.log('🏢 Criando unidade...');
  
  const unit = await prisma.unit.create({
    data: {
      id: randomUUID(),
      name: 'Barbearia Central',
      address: 'Rua Principal, 123 - Centro',
      latitude: -15.7939,
      longitude: -47.8828,
      isActive: true,
    },
  });
  
  console.log(`✅ Unidade criada: ${unit.name}\n`);

  // CRIAR USUÁRIOS
  console.log('👥 Criando usuários...');

  // Admin
  const adminPassword = await bcrypt.hash('Admin@123456', 10);
  const admin = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: 'admin@notetime.com',
      name: 'Administrador',
      passwordHash: adminPassword,
      role: 'ADMINISTRATOR',
      unitId: unit.id,
      isActive: true,
    },
  });
  console.log('✅ Admin criado:');
  console.log('   📧 Email: admin@notetime.com');
  console.log('   🔑 Senha: Admin@123456\n');

  // Barbeiros
  const barberPassword = await bcrypt.hash('Barber@123456', 10);
  
  const barbeiro1 = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: 'joao@notetime.com',
      name: 'João Silva',
      passwordHash: barberPassword,
      role: 'BARBER',
      phone: '61999887766',
      specialties: ['Corte', 'Barba', 'Design'],
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=João',
      unitId: unit.id,
      isActive: true,
    },
  });

  const barbeiro2 = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: 'pedro@notetime.com',
      name: 'Pedro Santos',
      passwordHash: barberPassword,
      role: 'BARBER',
      phone: '61988776655',
      specialties: ['Corte', 'Sobrancelha'],
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
      unitId: unit.id,
      isActive: true,
    },
  });

  console.log('✅ Barbeiros criados:');
  console.log('   1. João Silva (joao@notetime.com)');
  console.log('   2. Pedro Santos (pedro@notetime.com)');
  console.log('   🔑 Senha: Barber@123456\n');

  // CRIAR SERVIÇOS
  console.log('✂️  Criando serviços...');

  const servicos = await Promise.all([
    prisma.service.create({
      data: {
        id: randomUUID(),
        name: 'Corte Tradicional',
        description: 'Corte de cabelo masculino com máquina e tesoura',
        durationMinutes: 30,
        price: 50.0,
        unitId: unit.id,
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        id: randomUUID(),
        name: 'Corte + Barba',
        description: 'Corte completo com barba aparada e finalizada',
        durationMinutes: 45,
        price: 70.0,
        unitId: unit.id,
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        id: randomUUID(),
        name: 'Barba Completa',
        description: 'Barba aparada, navalha e hidratação',
        durationMinutes: 30,
        price: 40.0,
        unitId: unit.id,
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        id: randomUUID(),
        name: 'Design de Sobrancelha',
        description: 'Design e modelagem de sobrancelha masculina',
        durationMinutes: 15,
        price: 25.0,
        unitId: unit.id,
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        id: randomUUID(),
        name: 'Corte Infantil',
        description: 'Corte de cabelo para crianças até 12 anos',
        durationMinutes: 25,
        price: 35.0,
        unitId: unit.id,
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ ${servicos.length} serviços criados\n`);

  // CRIAR CLIENTES
  console.log('👤 Criando clientes...');

  const clientes = await Promise.all([
    prisma.client.create({
      data: {
        id: randomUUID(),
        name: 'Carlos Oliveira',
        email: 'carlos@email.com',
        phone: '61999998888',
        cpf: '12345678901',
        isActive: true,
      },
    }),
    prisma.client.create({
      data: {
        id: randomUUID(),
        name: 'Ricardo Mendes',
        email: 'ricardo@email.com',
        phone: '61988887777',
        cpf: '98765432100',
        isActive: true,
      },
    }),
    prisma.client.create({
      data: {
        id: randomUUID(),
        name: 'Fernando Costa',
        phone: '61977776666',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ ${clientes.length} clientes criados\n`);

  // CRIAR AGENDAMENTOS
  console.log('📅 Criando agendamentos de exemplo...');

  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);
  
  const depoisDeAmanha = new Date(hoje);
  depoisDeAmanha.setDate(depoisDeAmanha.getDate() + 2);

  // Agendamento 1 - Hoje às 14:00 (Confirmado)
  const agendamento1Date = new Date(hoje);
  agendamento1Date.setHours(14, 0, 0, 0);

  await prisma.appointment.create({
    data: {
      id: randomUUID(),
      clientId: clientes[0].id,
      barberId: barbeiro1.id,
      serviceId: servicos[0].id,
      unitId: unit.id,
      scheduledDate: agendamento1Date,
      status: 'CONFIRMED',
      observations: 'Cliente preferiu máquina 2',
      createdBy: admin.id,
      services: {
        create: [
          {
            serviceId: servicos[0].id,
            price: Number(servicos[0].price),
            durationMinutes: servicos[0].durationMinutes
          }
        ]
      }
    },
  });

  // Agendamento 2 - Hoje às 16:00 (Pendente)
  const agendamento2Date = new Date(hoje);
  agendamento2Date.setHours(16, 0, 0, 0);

  await prisma.appointment.create({
    data: {
      id: randomUUID(),
      clientId: clientes[1].id,
      barberId: barbeiro2.id,
      serviceId: servicos[1].id,
      unitId: unit.id,
      scheduledDate: agendamento2Date,
      status: 'SCHEDULED',
      createdBy: admin.id,
      services: {
        create: [
          {
            serviceId: servicos[1].id,
            price: Number(servicos[1].price),
            durationMinutes: servicos[1].durationMinutes
          }
        ]
      }
    },
  });

  // Agendamento 3 - Amanhã às 10:00 (Pendente)
  const agendamento3Date = new Date(amanha);
  agendamento3Date.setHours(10, 0, 0, 0);

  await prisma.appointment.create({
    data: {
      id: randomUUID(),
      clientId: clientes[2].id,
      barberId: barbeiro1.id,
      serviceId: servicos[2].id,
      unitId: unit.id,
      scheduledDate: agendamento3Date,
      status: 'SCHEDULED',
      createdBy: admin.id,
      services: {
        create: [
          {
            serviceId: servicos[2].id,
            price: Number(servicos[2].price),
            durationMinutes: servicos[2].durationMinutes
          }
        ]
      }
    },
  });

  // Agendamento 4 - Amanhã às 14:30 (Confirmado)
  const agendamento4Date = new Date(amanha);
  agendamento4Date.setHours(14, 30, 0, 0);

  await prisma.appointment.create({
    data: {
      id: randomUUID(),
      clientId: clientes[0].id,
      barberId: barbeiro2.id,
      serviceId: servicos[3].id,
      unitId: unit.id,
      scheduledDate: agendamento4Date,
      status: 'CONFIRMED',
      createdBy: admin.id,
      services: {
        create: [
          {
            serviceId: servicos[3].id,
            price: Number(servicos[3].price),
            durationMinutes: servicos[3].durationMinutes
          }
        ]
      }
    },
  });

  // Agendamento 5 - Depois de amanhã às 15:00 (Pendente)
  const agendamento5Date = new Date(depoisDeAmanha);
  agendamento5Date.setHours(15, 0, 0, 0);

  await prisma.appointment.create({
    data: {
      id: randomUUID(),
      clientId: clientes[1].id,
      barberId: barbeiro1.id,
      serviceId: servicos[4].id,
      unitId: unit.id,
      scheduledDate: agendamento5Date,
      status: 'SCHEDULED',
      observations: 'Filho de 8 anos',
      createdBy: admin.id,
      services: {
        create: [
          {
            serviceId: servicos[4].id,
            price: Number(servicos[4].price),
            durationMinutes: servicos[4].durationMinutes
          }
        ]
      }
    },
  });

  console.log('✅ 5 agendamentos criados\n');

  // RESUMO
  console.log('═══════════════════════════════════════');
  console.log('🎉 SEED CONCLUÍDO COM SUCESSO!');
  console.log('═══════════════════════════════════════\n');

  console.log('📊 RESUMO:');
  console.log(`   • 1 Unidade`);
  console.log(`   • 3 Usuários (1 Admin + 2 Barbeiros)`);
  console.log(`   • ${servicos.length} Serviços`);
  console.log(`   • ${clientes.length} Clientes`);
  console.log(`   • 5 Agendamentos\n`);

  console.log('🔐 CREDENCIAIS DE ACESSO:\n');
  
  console.log('   👨‍💼 ADMINISTRADOR:');
  console.log('   Email: admin@notetime.com');
  console.log('   Senha: Admin@123456\n');

  console.log('   💈 BARBEIROS:');
  console.log('   Email: joao@notetime.com');
  console.log('   Email: pedro@notetime.com');
  console.log('   Senha: Barber@123456\n');

  console.log('═══════════════════════════════════════');
  console.log('🚀 Agora você pode iniciar o servidor!');
  console.log('   npm run dev');
  console.log('═══════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('\n❌ ERRO AO EXECUTAR SEED:\n', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });