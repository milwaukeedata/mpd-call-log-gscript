# mpd-call-log-gscript
This is a Google Script to scrape the MPD Call Log located here: http://itmdapps.milwaukee.gov/MPDCallData/currentCADCalls/callsService.faces

The script pulls from the table every minute, making sure that call number and status are de-duplicated, and then appends the new records at the bottom of the sheet. 

The link to the sheet (View Only) is here. https://docs.google.com/spreadsheets/d/1tlUT8r9vWSGReVsfUuI-NHeFTpffBmD7xAVY7wLreII/edit?usp=sharing
