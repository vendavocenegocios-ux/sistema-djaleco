
# Plano: Ajustes em Pedidos, Comissoes, Financeiro Pagarme e Logo

## 1. Numeracao de Pedidos WhatsApp

Pedidos com `origem = "site"` mantem o numero vindo da Nuvemshop (ex: #1234).
Pedidos com `origem = "whatsapp"` recebem numeracao automatica no formato `#001-WP`, `#002-WP`, etc.

**Logica**: Ao criar um pedido via WhatsApp, buscar o ultimo numero WP no banco e incrementar.

Arquivos afetados:
- `src/hooks/usePedidos.ts` -- adicionar helper para gerar proximo numero WP
- Formulario de criacao de pedido (quando existir) -- aplicar automaticamente

---

## 2. Comissao Padrao com William Nogueira

No sync da Nuvemshop e na criacao de pedidos do site:
- Vendedor padrao: **William Nogueira** (id: `97f16c11-121d-47d3-9212-ece04cbcb348`)
- Formula da comissao: `(valor_bruto - taxa_pagarme - frete) * taxa_comissao / 100`
- Drop-down no detalhe do pedido para poder trocar o vendedor se necessario

Arquivos afetados:
- `supabase/functions/nuvemshop-sync/index.ts` -- calcular comissao automaticamente usando William como padrao
- `supabase/functions/nuvemshop-webhook/index.ts` -- mesmo calculo
- `src/pages/PedidoDetalhe.tsx` -- adicionar select de vendedor com William como default

---

## 3. Nova Aba "Pagarme" no Financeiro

Criar uma edge function `pagarme-extrato` que consulta a API v5 do Pagarme:
- Endpoint: `GET https://api.pagar.me/core/v5/charges` e/ou `GET https://api.pagar.me/core/v5/orders`
- Autenticacao: Basic Auth com `PAGARME_API_KEY` (ja configurada nos secrets)
- Retorna transacoes com valores bruto, taxa, liquido e datas de pagamento

Na pagina Financeiro:
- Nova aba **"Pagarme"** ao lado de "Visao Geral" e "Comissoes"
- Exibe tabela estilo extrato: data, pedido, valor bruto, taxa, valor liquido, status
- Filtros: por ano, por mes, e personalizado (range de datas)
- Agrupamento por periodo de deposito (payment date) quando disponivel
- Cards de resumo: total bruto, total taxas, total liquido no periodo filtrado

Arquivos a criar:
- `supabase/functions/pagarme-extrato/index.ts` -- edge function que consulta a API Pagarme

Arquivos a editar:
- `src/pages/Financeiro.tsx` -- adicionar aba "Pagarme" com filtros e tabela
- `supabase/config.toml` -- registrar nova edge function

---

## 4. Logo da Djaleco na Sidebar

- Copiar a imagem `logo_Djaleco.png` para `src/assets/`
- Substituir o emoji e texto "Djaleco" na sidebar pela imagem da logo
- Garantir que a logo fica visivel tanto na sidebar expandida quanto colapsada (versao menor)

Arquivos afetados:
- `src/components/layout/AppSidebar.tsx` -- importar e usar a logo

---

## 5. Cores (sem mudanca)

As cores rosa/rose ja aplicadas no `src/index.css` permanecem inalteradas. O grafico de barras no Financeiro sera atualizado para usar `hsl(350, 45%, 65%)` em vez do azul antigo.

---

## Detalhes Tecnicos

### Edge Function `pagarme-extrato`

```text
GET https://api.pagar.me/core/v5/orders?page=1&size=50
Authorization: Basic base64(PAGARME_API_KEY + ":")

Retorno esperado: lista de orders com charges contendo:
- amount (centavos)
- paid_amount
- gateway_fee (taxa)
- status
- paid_at / payment_date
- last_transaction
```

A funcao recebe query params `year`, `month`, `start_date`, `end_date` para filtrar e retorna os dados formatados para o frontend.

### Calculo de Comissao no Sync

No `nuvemshop-sync`, apos calcular `valorLiquido`:

```text
baseComissao = valorBruto - taxaPagarme - frete
comissao = baseComissao * (taxaComissaoWilliam / 100)
vendedor_id = "97f16c11-..."
```

### Numeracao WhatsApp

Consulta SQL para proximo numero:
```text
SELECT numero_pedido FROM pedidos 
WHERE numero_pedido LIKE '%-WP' 
ORDER BY created_at DESC LIMIT 1
```
Incrementa o numero e formata como `###-WP` (ex: `001-WP`, `002-WP`).

### Ordem de implementacao

1. Copiar logo e atualizar sidebar
2. Ajustar sync Nuvemshop (comissao + vendedor padrao)
3. Ajustar numeracao WP nos hooks/formularios
4. Criar edge function pagarme-extrato
5. Adicionar aba Pagarme no Financeiro com filtros
6. Corrigir cor do grafico de barras
