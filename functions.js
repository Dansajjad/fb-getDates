const Promise = require('bluebird');
const moment = require('moment');
const async = require('async');
const fs = require('fs');

var data = require('./rawJSON');


/*
  Function below takes the rawData from Firebase and processes each student
  Any student with end date after the cutOffDate is returned and written to 
  'studentsParsed.json' 
*/

const cutOffDate = '2016-10-31';

parseJSON(data)
.then(function(dataAfterCutOff) {
  console.log(dataAfterCutOff);

  fs.writeFile('./studentsParsed.json', JSON.stringify(dataAfterCutOff), function(err) {
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
    endDate = "NA";


    if (student.info) {
      FirstName = student.info.first ? student.info.first : "NA";
      LastName = student.info.last ? student.info.last : "NA";
      GitHub__c = student.info.github ? student.info.github : "NA";
      Email = student.info.email ? student.info.email : "NA";
      endDate = student.info.endDate ? moment(student.info.endDate, 'MM/DD/YYYY').format('YYYY-MM-DD') : "NA";
    }

    if(moment(endDate).isAfter(cutOffDate, 'day')) {
        recordObj[GitHub__c] = { 
          Name: FirstName + " " + LastName,
          Email: Email,
          Fulcrum_End_Date__c: endDate
        }; 
    }
}//processStudent
