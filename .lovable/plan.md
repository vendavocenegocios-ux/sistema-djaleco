

# Plano: Botao "Copiar para WhatsApp" nos Pedidos

## O que sera feito

Adicionar um botao de copia em cada pedido (na tabela desktop e nos cards mobile) que monta o texto formatado com os dados do pedido e copia para a area de transferencia, pronto para colar no WhatsApp.

## Dados disponiveis vs campos solicitados

| Campo | Fonte | Disponivel |
|-------|-------|------------|
| NOME | `pedidos.cliente_nome` | Sim |
| CELULAR | `pedidos.cliente_telefone` | Sim |
| PROFISSAO | -- | Nao existe no banco |
| ENDERECO COMPLETO | -- | Nao existe no banco |
| BAIRRO | -- | Nao existe no banco |
| CIDADE | `pedidos.cidade` | Sim |
| ESTADO | `pedidos.estado` | Sim |
| CEP | -- | Nao existe no banco |
| CPF/CNPJ | `clientes.documento` | Sim (via join por nome) |
| DATA DO PEDIDO | `pedidos.data_pedido` | Sim |
| PEDIDO (itens) | `pedido_itens` | Sim (precisa fetch) |

Campos sem dados no banco serao deixados em branco (ex: `PROFISSAO:` / `CEP:`) para preenchimento manual.

## Implementacao

### `usePedidos.ts`
- Alterar `usePedidos()` para fazer join com `clientes` pelo nome ou adicionar campo `cliente_id` -- mais simples: buscar documento do cliente inline quando copiar.

### `Pedidos.tsx`
- Funcao `handleCopyWhatsApp(pedido)`:
  1. Busca `pedido_itens` do pedido (query rapida por `pedido_id`)
  2. Busca `clientes.documento` pelo `cliente_nome`
  3. Monta texto sem espacos entre linhas:
```text
NOME: João Silva
CELULAR: (11) 99999-9999
PROFISSÃO:
ENDEREÇO COMPLETO:
BAIRRO:
CIDADE: São Paulo
ESTADO: SP
CEP:
CPF/CNPJ: 123.456.789-00
DATA DO PEDIDO: 15/01/2025
PEDIDO: 2x Jaleco Branco P, 1x Scrub Azul M
```
  4. `navigator.clipboard.writeText(texto)` + toast de confirmacao

- Botao com icone `Copy` na tabela (coluna extra) e no card mobile
- Texto compacto, sem linhas em branco entre campos

### Arquivos a editar
- `src/pages/Pedidos.tsx` -- adicionar botao e funcao de copia

