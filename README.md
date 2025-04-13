# Painel de Sinais de Trading

Um sistema completo para enviar sinais de trading do MetaTrader para um painel web, usando Google Sheets como banco de dados e GitHub Pages para hospedagem.

## Visão Geral

Este projeto consiste em três componentes principais:

1. **Código MQL5 para MetaTrader**: Envia sinais e resultados para o Google Sheets
2. **Script do Google Apps Script**: Processa os sinais e os armazena em uma planilha
3. **Página Web (GitHub Pages)**: Exibe os sinais e estatísticas em tempo real

## Configuração

### 1. Configurar o Google Sheets

1. Crie uma nova planilha no Google Sheets
2. Vá para Extensões > Apps Script
3. Cole o código do arquivo `google_script.js` no editor
4. Salve o projeto e implante como aplicativo web:
   - Quem tem acesso: "Qualquer pessoa, mesmo anônima"
   - Execute como: "Eu"
5. Copie a URL do aplicativo web

### 2. Configurar a Página Web (GitHub Pages)

1. Crie um novo repositório no GitHub chamado "trading-signals"
2. Faça upload do arquivo `index.html` para o repositório
3. Vá para Settings > Pages e ative o GitHub Pages na branch main
4. Seu site estará disponível em `https://seu-usuario.github.io/trading-signals/`

### 3. Integrar com seu EA MetaTrader

1. Abra seu EA existente no MetaEditor
2. Adicione as funções do arquivo `ea_integration.mq5` ao seu EA
3. No método `OnInit()` do seu EA, adicione:
   ```mql5
   InitGoogleSheets();
   ```
4. Nos pontos onde seu EA envia sinais para o Telegram, adicione:
   ```mql5
   SendSignalToGoogleSheets(simbolo, tipo, timeframe);
   ```
5. Nos pontos onde seu EA envia resultados para o Telegram, adicione:
   ```mql5
   SendResultToGoogleSheets(simbolo, resultado);
   ```

### 4. Configurar Permissões no MetaTrader

1. Vá para Ferramentas > Opções > Expert Advisors
2. Marque "Permitir WebRequest para URLs listadas"
3. Adicione a URL do Google Apps Script à lista

## Personalização

- **Chave de API**: Você pode alterar a chave de API no código MQL5 e no Google Apps Script para maior segurança
- **Design da Página**: Modifique o arquivo HTML para personalizar o design do painel
- **Intervalo de Atualização**: Ajuste o intervalo de atualização no arquivo HTML (padrão: 30 segundos)

## Solução de Problemas

- **Erro 4060 no MetaTrader**: Verifique se a URL do Google Apps Script foi adicionada à lista de URLs permitidas
- **Sinais não aparecem no painel**: Verifique se a URL do Google Apps Script está correta no arquivo HTML
- **Erros no Google Apps Script**: Verifique o log de execução no editor do Google Apps Script

## Notas Importantes

- O Google Apps Script tem limites de execução. Se você estiver enviando muitos sinais, pode atingir esses limites.
- O GitHub Pages é gratuito, mas tem limitações de tráfego. Se seu painel receber muito tráfego, considere uma hospedagem alternativa.
- Certifique-se de que seu EA esteja configurado para enviar "CALL/PUT" para sinais e "VITORIA/DERROTA" para resultados.

## Licença

Este projeto é livre para uso pessoal e comercial.
