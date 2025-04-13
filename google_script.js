// Código para o Google Apps Script
// Cole este código no editor do Google Apps Script

function doGet(e) {
  // Parâmetros da requisição
  var params = e.parameter;
  var action = params.action;
  var apiKey = params.api_key;
  
  // Verifica a chave de API
  if (apiKey !== "trading_signals_key") {
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': 'API key inválida'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Abre a planilha ativa
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var signalsSheet = ss.getSheetByName("Sinais") || ss.insertSheet("Sinais");
  var statsSheet = ss.getSheetByName("Estatísticas") || ss.insertSheet("Estatísticas");
  
  // Configura as colunas se for a primeira vez
  if (signalsSheet.getLastRow() === 0) {
    signalsSheet.appendRow(["ID", "Símbolo", "Tipo", "Timeframe", "Resultado", "Data/Hora", "Data/Hora Resultado"]);
    signalsSheet.getRange("A1:G1").setFontWeight("bold");
    signalsSheet.setFrozenRows(1);
  }
  
  if (statsSheet.getLastRow() === 0) {
    statsSheet.appendRow(["Símbolo", "Total", "Vitórias", "Derrotas", "Win Rate", "Última Atualização"]);
    statsSheet.getRange("A1:F1").setFontWeight("bold");
    statsSheet.setFrozenRows(1);
  }
  
  // Processa a ação solicitada
  if (action === "add_signal") {
    return addSignal(params, signalsSheet, statsSheet);
  } else if (action === "add_result") {
    return addResult(params, signalsSheet, statsSheet);
  } else if (action === "get_signals") {
    return getSignals(signalsSheet, statsSheet);
  } else {
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': 'Ação inválida'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Função para adicionar um novo sinal
function addSignal(params, signalsSheet, statsSheet) {
  var symbol = params.symbol;
  var signalType = params.signal_type;
  var timeframe = params.timeframe;
  var timestamp = new Date();
  
  // Gera um ID único
  var id = Utilities.getUuid();
  
  // Adiciona o sinal à planilha
  signalsSheet.appendRow([id, symbol, signalType, timeframe, "", timestamp, ""]);
  
  // Atualiza estatísticas
  updateStats(statsSheet);
  
  return ContentService.createTextOutput(JSON.stringify({
    'status': 'success',
    'message': 'Sinal adicionado com sucesso',
    'data': {
      'id': id,
      'symbol': symbol,
      'signal_type': signalType,
      'timeframe': timeframe,
      'timestamp': timestamp
    }
  })).setMimeType(ContentService.MimeType.JSON);
}

// Função para adicionar um resultado a um sinal
function addResult(params, signalsSheet, statsSheet) {
  var symbol = params.symbol;
  var result = params.result;
  var timestamp = new Date();
  
  // Encontra o último sinal sem resultado para este símbolo
  var data = signalsSheet.getDataRange().getValues();
  var rowIndex = -1;
  
  for (var i = data.length - 1; i > 0; i--) {
    if (data[i][1] === symbol && data[i][4] === "") {
      rowIndex = i + 1; // +1 porque as linhas começam em 1, não 0
      break;
    }
  }
  
  if (rowIndex === -1) {
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': 'Nenhum sinal pendente encontrado para este símbolo'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Atualiza o resultado
  signalsSheet.getRange(rowIndex, 5).setValue(result);
  signalsSheet.getRange(rowIndex, 7).setValue(timestamp);
  
  // Atualiza estatísticas
  updateStats(statsSheet);
  
  return ContentService.createTextOutput(JSON.stringify({
    'status': 'success',
    'message': 'Resultado adicionado com sucesso',
    'data': {
      'symbol': symbol,
      'result': result,
      'timestamp': timestamp
    }
  })).setMimeType(ContentService.MimeType.JSON);
}

// Função para obter todos os sinais e estatísticas
function getSignals(signalsSheet, statsSheet) {
  var signalsData = signalsSheet.getDataRange().getValues();
  var statsData = statsSheet.getDataRange().getValues();
  
  var signals = [];
  var stats = [];
  
  // Converte dados de sinais
  for (var i = 1; i < signalsData.length; i++) {
    signals.push({
      'id': signalsData[i][0],
      'symbol': signalsData[i][1],
      'signal_type': signalsData[i][2],
      'timeframe': signalsData[i][3],
      'result': signalsData[i][4],
      'timestamp': signalsData[i][5],
      'result_timestamp': signalsData[i][6]
    });
  }
  
  // Converte dados de estatísticas
  for (var j = 1; j < statsData.length; j++) {
    stats.push({
      'symbol': statsData[j][0],
      'total': statsData[j][1],
      'wins': statsData[j][2],
      'losses': statsData[j][3],
      'win_rate': statsData[j][4],
      'last_update': statsData[j][5]
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    'status': 'success',
    'data': {
      'signals': signals,
      'stats': stats
    }
  })).setMimeType(ContentService.MimeType.JSON);
}

// Função para atualizar estatísticas
function updateStats(statsSheet) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var signalsSheet = ss.getSheetByName("Sinais");
  var signalsData = signalsSheet.getDataRange().getValues();
  
  // Limpa estatísticas anteriores
  if (statsSheet.getLastRow() > 1) {
    statsSheet.deleteRows(2, statsSheet.getLastRow() - 1);
  }
  
  // Calcula estatísticas por símbolo
  var stats = {};
  
  for (var i = 1; i < signalsData.length; i++) {
    var symbol = signalsData[i][1];
    var result = signalsData[i][4];
    
    if (!stats[symbol]) {
      stats[symbol] = {
        total: 0,
        wins: 0,
        losses: 0
      };
    }
    
    if (result === "win" || result === "loss") {
      stats[symbol].total++;
      
      if (result === "win") {
        stats[symbol].wins++;
      } else {
        stats[symbol].losses++;
      }
    }
  }
  
  // Adiciona estatísticas à planilha
  var timestamp = new Date();
  
  for (var symbol in stats) {
    var winRate = stats[symbol].total > 0 ? (stats[symbol].wins / stats[symbol].total * 100).toFixed(2) + "%" : "0%";
    statsSheet.appendRow([
      symbol,
      stats[symbol].total,
      stats[symbol].wins,
      stats[symbol].losses,
      winRate,
      timestamp
    ]);
  }
}

// Função para teste
function testAddSignal() {
  var e = {
    parameter: {
      action: "add_signal",
      api_key: "trading_signals_key",
      symbol: "EURUSD",
      signal_type: "CALL",
      timeframe: "5 minutos"
    }
  };
  
  doGet(e);
}

// Função para teste
function testAddResult() {
  var e = {
    parameter: {
      action: "add_result",
      api_key: "trading_signals_key",
      symbol: "EURUSD",
      result: "win"
    }
  };
  
  doGet(e);
}
