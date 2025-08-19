// Brazilian timezone options
export const BRAZILIAN_TIMEZONES = [
  {
    value: "America/Sao_Paulo",
    label: "Brasília (GMT-3) - São Paulo, Rio de Janeiro, Minas Gerais, Sul",
    description: "Horário de Brasília - Região Sudeste, Sul e parte do Nordeste"
  },
  {
    value: "America/Manaus",
    label: "Manaus (GMT-4) - Amazonas, Rondônia, Roraima",
    description: "Horário do Amazonas - Região Norte (exceto alguns estados)"
  },
  {
    value: "America/Campo_Grande",
    label: "Campo Grande (GMT-4) - Mato Grosso do Sul, Mato Grosso",
    description: "Horário do Centro-Oeste - Mato Grosso do Sul e Mato Grosso"
  },
  {
    value: "America/Cuiaba",
    label: "Cuiabá (GMT-4) - Mato Grosso",
    description: "Horário de Cuiabá - Mato Grosso"
  },
  {
    value: "America/Porto_Velho",
    label: "Porto Velho (GMT-4) - Rondônia",
    description: "Horário de Rondônia"
  },
  {
    value: "America/Boa_Vista",
    label: "Boa Vista (GMT-4) - Roraima",
    description: "Horário de Roraima"
  },
  {
    value: "America/Rio_Branco",
    label: "Rio Branco (GMT-5) - Acre",
    description: "Horário do Acre"
  },
  {
    value: "America/Eirunepe",
    label: "Eirunepé (GMT-5) - Acre (oeste)",
    description: "Horário do oeste do Acre"
  },
  {
    value: "America/Fortaleza",
    label: "Fortaleza (GMT-3) - Ceará, Maranhão, Paraíba, Pernambuco, Piauí, Rio Grande do Norte",
    description: "Horário do Nordeste"
  },
  {
    value: "America/Recife",
    label: "Recife (GMT-3) - Pernambuco",
    description: "Horário de Pernambuco"
  },
  {
    value: "America/Salvador",
    label: "Salvador (GMT-3) - Bahia",
    description: "Horário da Bahia"
  },
  {
    value: "America/Maceio",
    label: "Maceió (GMT-3) - Alagoas, Sergipe",
    description: "Horário de Alagoas e Sergipe"
  },
  {
    value: "America/Belem",
    label: "Belém (GMT-3) - Pará, Amapá",
    description: "Horário do Pará e Amapá"
  },
  {
    value: "America/Santarem",
    label: "Santarém (GMT-3) - Pará (oeste)",
    description: "Horário do oeste do Pará"
  },
  {
    value: "America/Araguaina",
    label: "Araguaína (GMT-3) - Tocantins",
    description: "Horário do Tocantins"
  },
  {
    value: "America/Noronha",
    label: "Fernando de Noronha (GMT-2) - Fernando de Noronha, Atol das Rocas",
    description: "Horário de Fernando de Noronha"
  }
];

// Helper function to get timezone label by value
export const getTimezoneLabel = (timezone: string): string => {
  const tz = BRAZILIAN_TIMEZONES.find(tz => tz.value === timezone);
  return tz?.label || timezone;
};

// Helper function to get current establishment timezone
export const getEstablishmentTimezone = (): string => {
  // This would be set from establishment settings
  return localStorage.getItem('establishment_timezone') || 'America/Sao_Paulo';
};