const SHEET_NAME = 'Records';
function doPost(e) {
  const data = JSON.parse(e.postData.contents || '{}');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { sh = ss.insertSheet(SHEET_NAME); sh.appendRow(['เวลา','ประเภท','ชื่อ','ชั้นเรียน','เลขที่','คะแนน','คะแนนเต็ม','ข้อมูล']); }
  sh.appendRow([data.at || new Date().toISOString(), data.kind || '', data.name || '', data.className || '', data.no || '', data.score ?? '', data.total ?? '', JSON.stringify(data)]);
  return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
}
function doGet() { return ContentService.createTextOutput('Endpoint ready'); }
