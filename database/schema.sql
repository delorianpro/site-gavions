-- Referência documental da configuração informada para public.leads (gavions-leads).
-- NÃO é migration, dump remoto verificado ou script de provisionamento.
-- Não executar no Supabase. Nenhuma alteração remota foi feita nesta implementação.
-- Os nomes reais de constraints e a expressão do default UUID não foram fornecidos;
-- gen_random_uuid() abaixo apenas representa a geração automática de UUID descrita.
/*
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  company TEXT,
  city TEXT NOT NULL,
  property_type TEXT NOT NULL,
  camera_quantity TEXT NOT NULL,
  internet_type TEXT NOT NULL,
  email TEXT,
  notes TEXT,
  contact_consent BOOLEAN NOT NULL, -- o backend exige TRUE
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Permissões efetivas informadas pelo responsável, representadas como referência:
REVOKE ALL PRIVILEGES ON TABLE public.leads FROM PUBLIC, anon, authenticated, service_role;
GRANT INSERT ON TABLE public.leads TO service_role;
-- Sem GRANT de SELECT, UPDATE ou DELETE.
-- service_role utiliza BYPASSRLS; não é necessário criar policy pública de INSERT.
-- Não foram consultados nomes/definições de eventuais policies, grants herdados,
-- constraints adicionais nem default privileges remotos.
*/
