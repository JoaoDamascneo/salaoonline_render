import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, Play, Check } from 'lucide-react';

export default function N8NTest() {
  const [establishmentId, setEstablishmentId] = useState('9');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState('');

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const testEndpoint = async (endpoint: string, method: string = 'GET', body?: any) => {
    setLoading(true);
    try {
      const url = `${window.location.origin}${endpoint}`;
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const res = await fetch(url, options);
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse(JSON.stringify({ error: error.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const endpoints = [
    {
      title: 'Informações do Estabelecimento',
      method: 'GET',
      endpoint: `/api/n8n/establishment/${establishmentId}/info`,
      description: 'Busca informações completas do estabelecimento (serviços, profissionais, horários)',
      curl: `curl -X GET "${window.location.origin}/api/n8n/establishment/${establishmentId}/info" \\
  -H "Accept: application/json"`
    },
    {
      title: 'Verificar Disponibilidade',
      method: 'GET',
      endpoint: `/api/n8n/establishment/${establishmentId}/availability?date=2025-07-08&staffId=11`,
      description: 'Verifica horários disponíveis para uma data específica',
      curl: `curl -X GET "${window.location.origin}/api/n8n/establishment/${establishmentId}/availability?date=2025-07-08&staffId=11" \\
  -H "Accept: application/json"`
    },
    {
      title: 'Criar Agendamento',
      method: 'POST',
      endpoint: `/api/n8n/establishment/${establishmentId}/appointment`,
      description: 'Cria um novo agendamento (e cliente se não existir)',
      curl: `curl -X POST "${window.location.origin}/api/n8n/establishment/${establishmentId}/appointment" \\
  -H "Content-Type: application/json" \\
  -d '{
    "clientData": {
      "name": "Cliente Teste N8N",
      "email": "teste.n8n@email.com",
      "phone": "11999887766",
      "notes": "Cliente criado via N8N"
    },
    "appointmentData": {
      "staffId": 11,
      "serviceId": 3,
      "dataInicio": "2025-07-08T10:00:00.000Z",
      "dataFim": "2025-07-08T11:00:00.000Z",
      "duration": 60,
      "notes": "Agendamento via N8N"
    }
  }'`,
      body: {
        clientData: {
          name: "Cliente Teste N8N",
          email: "teste.n8n@email.com",
          phone: "11999887766",
          notes: "Cliente criado via N8N"
        },
        appointmentData: {
          staffId: 11,
          serviceId: 3,
          dataInicio: "2025-07-08T10:00:00.000Z",
          dataFim: "2025-07-08T11:00:00.000Z",
          duration: 60,
          notes: "Agendamento via N8N"
        }
      }
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">N8N Endpoints - Teste</h1>
        <p className="text-muted-foreground">
          Teste os endpoints criados para integração com N8N
        </p>
      </div>

      <div className="mb-6">
        <Label htmlFor="establishment-id">ID do Estabelecimento</Label>
        <Input
          id="establishment-id"
          value={establishmentId}
          onChange={(e) => setEstablishmentId(e.target.value)}
          placeholder="9"
          className="w-32"
        />
      </div>

      <div className="grid gap-6">
        {endpoints.map((endpoint, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{endpoint.title}</CardTitle>
                <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                  {endpoint.method}
                </Badge>
              </div>
              <CardDescription>{endpoint.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label>Endpoint:</Label>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {endpoint.endpoint}
                  </code>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => testEndpoint(endpoint.endpoint, endpoint.method, endpoint.body)}
                    disabled={loading}
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {loading ? 'Testando...' : 'Testar'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(endpoint.curl, `curl-${index}`)}
                  >
                    {copied === `curl-${index}` ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    {copied === `curl-${index}` ? 'Copiado!' : 'Copiar cURL'}
                  </Button>
                </div>
              </div>

              <div>
                <Label>Comando cURL:</Label>
                <Textarea
                  value={endpoint.curl}
                  readOnly
                  rows={endpoint.method === 'POST' ? 12 : 2}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {response && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resposta da API</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              {response}
            </pre>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold mb-2">Para usar no N8N:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Copie a URL do endpoint que deseja usar</li>
          <li>Configure o método HTTP correto (GET, POST, PUT)</li>
          <li>Adicione o header: <code>Content-Type: application/json</code></li>
          <li>Para POST, adicione o body JSON no formato mostrado</li>
          <li>Não precisa de autenticação</li>
        </ol>
      </div>
    </div>
  );
}