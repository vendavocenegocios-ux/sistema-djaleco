

## Plan

### 1. Novo formato do texto copiado para WhatsApp

Alterar `handleCopyWhatsApp` para gerar o texto com:
- **Data em negrito** no topo (usando `*` do WhatsApp: `*dd/MM/yyyy*`)
- **Número do pedido** logo abaixo
- Depois os demais campos como estão

Exemplo do novo formato:
```text
*05/03/2026*
#001-ZAP

NOME: Fulano
CELULAR: (11) 99999-9999
...
```

### 2. Nova etapa "Comercial" antes de "Planejamento"

Atualizar o array `ETAPAS` para incluir "Comercial" como primeira etapa:
```
["Comercial", "Planejamento", "Corte", "Costura", "Acabamento", "Embalagem", "Despachado", "Entregue"]
```

### 3. Avançar etapa automaticamente ao copiar

Após copiar o texto, se o pedido estiver na etapa "Comercial", avançar automaticamente para "Planejamento" usando `updatePedido.mutate`.

### 4. Sobre automação com WhatsApp

Explicação para o usuario: Nao e possivel integrar diretamente com o WhatsApp pessoal (a API oficial do WhatsApp Business e paga e requer conta Business verificada). Porem, ha duas alternativas viáveis:

- **Zapier/n8n**: Ao clicar no botão de copiar, alem de copiar o texto e avançar a etapa, podemos enviar um webhook para o Zapier/n8n que dispara uma automação (ex: enviar mensagem via WhatsApp Business API, notificar no Slack, etc.)
- **Fluxo manual otimizado** (o que sera implementado): copiar texto formatado para WhatsApp + avançar etapa automaticamente. O usuario cola manualmente no WhatsApp.

### Arquivos alterados
- `src/pages/Pedidos.tsx` — formato do texto, array ETAPAS, lógica de avanço automático de etapa no clique de copiar

