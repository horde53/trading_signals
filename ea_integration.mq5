//+------------------------------------------------------------------+
//|                                              ea_integration.mq5 |
//+------------------------------------------------------------------+
// Funções para integrar seu EA existente com o Google Sheets
// Adicione estas funções ao seu EA que já envia sinais para o Telegram

// Configurações da API do Google Sheets
string googleScriptUrl = "https://script.google.com/macros/s/AKfycbxk6gqwfrm_PUVGbK7a7LchcZ0AyH5z7q2tn8KNHLlhCvOcHM1P_lhuF07HWKWJoQDFTA/exec";
string googleApiKey = "trading_signals_key";

//+------------------------------------------------------------------+
//| Função para inicializar a conexão com o Google Sheets            |
//+------------------------------------------------------------------+
bool InitGoogleSheets()
{
   // Testa a conexão com o Google Sheets
   if(!WebRequest("GET", googleScriptUrl + "?test=1", NULL, NULL, 5000, NULL, 0, NULL, NULL))
   {
      int errorCode = GetLastError();
      if(errorCode == 4060)
      {
         MessageBox("Adicione a URL '" + googleScriptUrl + "' à lista de URLs permitidas nas configurações do Expert Advisor.", "Erro de WebRequest", MB_ICONERROR);
         Print("Adicione a URL '" + googleScriptUrl + "' à lista de URLs permitidas em Ferramentas -> Opções -> Expert Advisors");
      }
      else
      {
         MessageBox("Erro ao testar conexão com o Google Sheets: " + IntegerToString(errorCode), "Erro", MB_ICONERROR);
         Print("Erro ao testar conexão com o Google Sheets: ", errorCode);
      }
      return false;
   }
   
   Print("Conexão com o Google Sheets inicializada com sucesso!");
   return true;
}

//+------------------------------------------------------------------+
//| Função para enviar sinal para o Google Sheets                    |
//+------------------------------------------------------------------+
bool SendSignalToGoogleSheets(string symbol, string signalType, string timeframe)
{
   // Converte CALL/PUT para o formato esperado pelo Google Sheets
   string type = signalType;
   
   // URL para enviar o sinal
   string url = googleScriptUrl + 
                "?action=add_signal" + 
                "&api_key=" + googleApiKey + 
                "&symbol=" + symbol + 
                "&signal_type=" + type + 
                "&timeframe=" + timeframe;
   
   // Prepara os arrays para a requisição
   char result[];
   string result_headers;
   
   // Envia a requisição
   int res = WebRequest("GET", url, NULL, NULL, 5000, result, 0, result_headers);
   
   // Verifica o resultado
   if(res == -1)
   {
      int errorCode = GetLastError();
      Print("Erro ao enviar sinal para o Google Sheets: ", errorCode);
      return false;
   }
   
   Print("Sinal ", signalType, " enviado para o Google Sheets: ", symbol, " (", timeframe, ")");
   return true;
}

//+------------------------------------------------------------------+
//| Função para enviar resultado para o Google Sheets                |
//+------------------------------------------------------------------+
bool SendResultToGoogleSheets(string symbol, string result)
{
   // Converte VITORIA/DERROTA para win/loss
   string googleResult = "";
   if(StringFind(result, "VITORIA") >= 0)
      googleResult = "win";
   else if(StringFind(result, "DERROTA") >= 0)
      googleResult = "loss";
   else
      googleResult = result; // Usa o valor original se não for VITORIA/DERROTA
   
   // URL para enviar o resultado
   string url = googleScriptUrl + 
                "?action=add_result" + 
                "&api_key=" + googleApiKey + 
                "&symbol=" + symbol + 
                "&result=" + googleResult;
   
   // Prepara os arrays para a requisição
   char response[];
   string response_headers;
   
   // Envia a requisição
   int res = WebRequest("GET", url, NULL, NULL, 5000, response, 0, response_headers);
   
   // Verifica o resultado
   if(res == -1)
   {
      int errorCode = GetLastError();
      Print("Erro ao enviar resultado para o Google Sheets: ", errorCode);
      return false;
   }
   
   Print("Resultado ", result, " enviado para o Google Sheets: ", symbol);
   return true;
}

//+------------------------------------------------------------------+
//| Como integrar estas funções no seu EA existente                  |
//+------------------------------------------------------------------+
/*

// 1. Adicione a inicialização no OnInit() do seu EA:
int OnInit()
{
   // Seu código existente...
   
   // Inicializa a conexão com o Google Sheets
   InitGoogleSheets();
   
   // Resto do seu código...
   return(INIT_SUCCEEDED);
}

// 2. Quando seu EA detecta um sinal e envia para o Telegram, adicione:
void EnviarSinalTelegram(string simbolo, string tipo, string timeframe)
{
   // Seu código para enviar sinal ao Telegram...
   
   // Agora também envia para o Google Sheets
   SendSignalToGoogleSheets(simbolo, tipo, timeframe);
}

// 3. Quando seu EA detecta um resultado e envia para o Telegram, adicione:
void EnviarResultadoTelegram(string simbolo, string resultado)
{
   // Seu código para enviar resultado ao Telegram...
   
   // Agora também envia para o Google Sheets
   SendResultToGoogleSheets(simbolo, resultado);
}

*/
