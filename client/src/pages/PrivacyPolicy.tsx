import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Login
            </Button>
          </Link>
          
          {/* Mobile Logo */}
          <div className="text-center lg:hidden mb-6">
            <img 
              src="/attached_assets/logo-mobile-light.png" 
              alt="Salão Online" 
              className="h-12 mx-auto block dark:hidden"
            />
            <img 
              src="/attached_assets/logo-mobile-dark.png" 
              alt="Salão Online" 
              className="h-12 mx-auto hidden dark:block"
            />
          </div>

          {/* Desktop Logo */}
          <div className="text-center mb-8 hidden lg:block">
            <img 
              src="/attached_assets/logo-desktop-light.png" 
              alt="Salão Online" 
              className="h-16 mx-auto block dark:hidden"
            />
            <img 
              src="/attached_assets/logo-desktop-dark.png" 
              alt="Salão Online" 
              className="h-16 mx-auto hidden dark:block"
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            📜 Política de Privacidade — Salão Online
          </h1>
          
          <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                1. Coleta de Informações
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Coletamos informações pessoais fornecidas pelo usuário, incluindo:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Nome e dados de contato (e-mail, telefone, endereço).</li>
                <li>Informações comerciais (nome do estabelecimento, serviços oferecidos, horário de funcionamento).</li>
                <li>Dados de uso do sistema (agendamentos, vendas, histórico de acessos).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                2. Uso das Informações
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Os dados coletados são utilizados para:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Fornecer e manter o funcionamento do sistema.</li>
                <li>Personalizar a experiência do usuário.</li>
                <li>Fornecer suporte técnico.</li>
                <li>Enviar comunicações operacionais e avisos importantes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                3. Compartilhamento de Informações
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Não compartilhamos dados pessoais com terceiros, exceto quando necessário para:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Cumprimento de obrigações legais.</li>
                <li>Prestação de serviços essenciais ao funcionamento do sistema (como hospedagem e integrações).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                4. Integração com WhatsApp
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                O sistema oferece integração com o WhatsApp através de tecnologia de terceiros não oficial.
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Essa integração não é fornecida pela Meta e pode estar sujeita a instabilidades ou banimento de contas.</li>
                <li>O usuário é responsável por manter backups e canais alternativos de comunicação com seus clientes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                5. Segurança dos Dados
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Adotamos medidas técnicas e organizacionais para proteger os dados contra acesso não autorizado, 
                perda ou alteração.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                6. Direitos do Usuário
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                O usuário pode solicitar a qualquer momento:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Acesso aos seus dados pessoais.</li>
                <li>Correção ou atualização de informações.</li>
                <li>Exclusão definitiva de seus dados (respeitadas obrigações legais).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                7. Alterações na Política de Privacidade
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Esta política pode ser alterada a qualquer momento, sendo a versão mais recente sempre 
                disponibilizada no sistema.
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Versão 1.0 • Última atualização: {new Date().toLocaleDateString('pt-BR')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/terms-of-service">
                  <Button variant="outline" size="sm">
                    Ver Termos de Uso
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Voltar ao Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}