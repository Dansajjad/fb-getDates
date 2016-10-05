const Promise = require('bluebird');
const moment = require('moment');
const async = require('async');
const fs = require('fs');

var data = require('./rawJSON');


/*
  Function below takes the rawData from Firebase and process each student
  Any student with end date after Oct 31, 2016 is returned and writtend to file
  studentsParsed.json 
*/

parseJSON(data)
.then(function(datesAfterNov) {
  console.log(datesAfterNov);

  fs.writeFile('./studentsParsed.json', JSON.stringify(datesAfterNov), function(err) {
   if(err) console.log(err);
   else console.log('>>>>>>>>>>Write complete')
  });

});




//--------------------------------------------------Helpers
function parseJSON(rawData) {
  return new Promise(function(resolve, reject) {
    // const students = JSON.parse(rawData);
    const students = (rawData);
    let parsedData = {};
    let studentCount = 0;


    async.each(students, function(student) {
      processStudent(student, parsedData);
      studentCount++;
    }, function(err) {
      if (err) {
        console.log('Process failed'.orange);
        reject(err);
      }
    });
    resolve(parsedData);
  })
} //parseJSON


function processStudent(student, recordObj) {
  let
    FirstName = "NA",
    LastName = "NA",
    GitHub__c = "NA",
    Email = "NA",
    startDate = "NA",
    endDate = "NA",
    progress = "NA",
    accountId = "NA",
    contactId = "NA";

  if (student.salesforce && student.salesforce.contactId) { //needs to have contactId to match record in sf

    if (student.info) {
      FirstName = student.info.first ? student.info.first : "NA";
      LastName = student.info.last ? student.info.last : "NA";
      GitHub__c = student.info.github ? student.info.github : "NA";
      Email = student.info.email ? student.info.email : "NA";

      startDate = student.info.startDate ? moment(student.info.startDate, 'MM/DD/YYYY').format('YYYY-MM-DD') : "NA";
      endDate = student.info.endDate ? moment(student.info.endDate, 'MM/DD/YYYY').format('YYYY-MM-DD') : "NA";


    }

    if (student.modules) {
      var progressNum = student.progress;
      var len = student.modules.length;
      var lastModule = student.modules[progressNum];
      progress = lastModule ? lastModule.name : "NA"; //captures the name of the last completed checkpoint   
      // console.log(`Student: ${FirstName} ${LastName} Progress#: ${progressNum} lastModule: , ${progress}, endDate: ${endDate}`);
    }

    if (student.salesforce) {
      accountId = student.salesforce.accountId ? student.salesforce.accountId : "NA";
      contactId = student.salesforce.contactId ? student.salesforce.contactId : "NA";
    }

    if(moment(endDate).isAfter('2016-10-31', 'day')) {
        recordObj[GitHub__c] = { // add new student object to parsedData, keys should match salesforce fields
          FirstName: FirstName,
          LastName: LastName,
          Email: Email,

          Fulcrum_Start_Date__c: startDate,
          Fulcrum_End_Date__c: endDate,
          Fulcrum_Student_Progress__c: progress,
          accountId: accountId,
          Id: contactId
        }; 
    } else {
      return "No relevant";
    }
  }
}//processStudent
