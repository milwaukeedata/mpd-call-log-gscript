function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Get Data')
      .addItem('Add new dispatch items','addNewThings')
      .addToUi();
}


function addNewThings() {
  // get page
  var html = UrlFetchApp.fetch("http://itmdapps.milwaukee.gov/MPDCallData/currentCADCalls/callsService.faces").getContentText();

  // bypass google's new XmlService because html isn't well-formed
  var doc = Xml.parse(html, true);
  var bodyHtml = doc.html.body.toXmlString();
  // but still use XmlService so we can use getDescendants() and getChild(), etc.
  //   see: https://developers.google.com/apps-script/reference/xml-service/
  doc = XmlService.parse(bodyHtml);
  var html = doc.getRootElement();

  // a way to dig around
  // Logger.log(doc.getRootElement().getChild('form').getChildren('table'));
  // find and dig into table using getElementById and getElementsByTagName (by class fails)
  var tablecontents = getElementById(html, 'formId:tableExUpdateId');
  // we could dig deeper by tag name (next two lines)
  // var tbodycontents = getElementsByTagName(tablecontents, 'tbody');
  // var trcontents = getElementsByTagName(tbodycontents, 'tr');
  // or just get it directly, since we know it's immediate children
  var trcontents = tablecontents.getChild('tbody').getChildren('tr');
  // create a nice little array to pass
  var current_adds_array = Array();
  // now let's iterate through them
  for (var i=0; i<trcontents.length; i++) {
    //Logger.log(trcontents[i].getDescendants());
    // and grab all the spans
    var trcontentsspan = getElementsByTagName(trcontents[i], 'span');
    // if there's as many as expected, let's get values
    if (trcontentsspan.length > 5) {
      var call_num = trcontentsspan[0].getValue();
      var call_time = trcontentsspan[1].getValue();
      var rptd_location = trcontentsspan[2].getValue();
      var rptd_district = trcontentsspan[3].getValue();
      var call_nature = trcontentsspan[4].getValue();
      var call_status = trcontentsspan[5].getValue();
      //saveRow(call_num, call_time, rptd_location, rptd_district, call_nature, call_status);
      current_adds_array.push(Array(call_num, call_time, rptd_location, rptd_district, call_nature, call_status));
    }
  }
  saveRow(current_adds_array);
}  
//doGet();

function saveRow(current_adds_array) {
  // load in sheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  // find the current last row to make data range
  var current_last_row = sheet.getLastRow();
  var current_last_row_begin = current_last_row - 50;
  if (current_last_row_begin < 1) current_last_row_begin = 1;
  if (current_last_row < 1) current_last_row = 1;
  //Logger.log("A"+current_last_row_begin+":F"+current_last_row);
  var last_x_rows = sheet.getRange("A"+current_last_row_begin+":F"+current_last_row).getValues();

  var call_num, call_time, rptd_location, rptd_district, call_nature, call_status;
  // iterate through the current adds array
  for (var c=0; c<current_adds_array.length; c++) {
    call_num = current_adds_array[c][0];
    call_time = current_adds_array[c][1];
    rptd_location = current_adds_array[c][2];
    rptd_district = current_adds_array[c][3];
    call_nature = current_adds_array[c][4];
    call_status = current_adds_array[c][5];

    // find out if the ID is already there
    var is_in_spreadsheet = false;
    for (var i=0; i<last_x_rows.length; i++) {
      //Logger.log(call_num+" == "+last_15_rows[i][0]);
      if (call_num == last_x_rows[i][0] && call_time != last_x_rows[i][1]) is_in_spreadsheet = true;
    }
    Logger.log(is_in_spreadsheet);
    //Logger.log(last_15_rows.length);
    if (!is_in_spreadsheet) {
      Logger.log("Adding "+call_num);
      sheet.appendRow([call_num,call_time,rptd_location,rptd_district,call_nature,call_status]);
    }
  }

}

function getElementById(element, idToFind) {  
  var descendants = element.getDescendants();  
  for(i in descendants) {
    var elt = descendants[i].asElement();
    if( elt !=null) {
      var id = elt.getAttribute('id');
      if( id !=null && id.getValue()== idToFind) return elt;    
    }
  }
}

function getElementsByTagName(element, tagName) {  
  var data = [];
  var descendants = element.getDescendants();  
  for(i in descendants) {
    var elt = descendants[i].asElement();     
    if( elt !=null && elt.getName()== tagName) data.push(elt);      
  }
  return data;
}
