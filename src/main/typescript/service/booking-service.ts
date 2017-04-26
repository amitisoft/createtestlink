import {Observable, Observer} from 'rxjs';
import {Booking} from '../domain/booking';
import {Candidate} from '../domain/candidate';
import {DynamoDB, SES} from "aws-sdk";


import DocumentClient = DynamoDB.DocumentClient;

var uuid = require('uuid');
var AWS = require("aws-sdk");


AWS.config.update({
    region: "us-east-1"
});

export interface BookingService {
     getBookingDetails(): Observable<Booking[]>;
     //create(data: any): Observable<Candidate>;
     //find(candidateId:string) : Observable<Candidate>;
    update(data: any): Observable<Booking>;
}

export class BookingServiceImpl implements BookingService {

    constructor() {

    }

     update(data: any): Observable<Booking> {
        console.log("in CandidateServiceImpl update()");
        console.log(`data received ${data.category}`);
        console.log(`data received ${data.dateofExam}`);
        console.log(`data received ${data.jobPosition}`);
        console.log(`data received ${data.candiateId}`);
          console.log(`data received ${data.testStatus}`);
          //console.log(`data received ${data.paperType}`);
         // console.log(`data received ${data.startTime}`);

        const documentClient = new DocumentClient();
        const params = {
            TableName: "booking",
            Key: {
                candidateId: data.candiateId,
            },
            ExpressionAttributeNames: {
                '#ct': 'category',
                '#doe': 'dateofExam',
                '#ts': 'testStatus',
                //'#pt':'paperType',
                '#jp':'jobPosition',
                //'#st':'startTime'
            },
            ExpressionAttributeValues: {
                ':ct': data.category,
                ':doe': data.dateofExam,
                ':jp': data.jobPosition,
                ':ts':data.testStatus,
                //':pt':data.paperType,
               // ':st':data.startTime
            },
            UpdateExpression: 'SET #ct = :ct, #doe = :doe, #jp = :jp, #ts = :ts',
            ReturnValues: 'ALL_NEW',
        };

        return Observable.create((observer:Observer<Booking>) => {

            documentClient.update(params, (err, data: any) => {
                if(err) {
                    console.error(err);
                    observer.error(err);
                    return;
                }
                console.log(`result ${JSON.stringify(data)}`);
                observer.next(data.Attributes);
                observer.complete();
            });
        });
    }


    find(candidateId:string): Observable<Booking> {
         console.log("in BookingServiceImpl find()");

         const queryParams: DynamoDB.Types.QueryInput = {
             TableName: "bookings",
             ProjectionExpression: "candidateId,category,dateofExam",
             KeyConditionExpression: "#candidateId = :candidateIdFilter",
             ExpressionAttributeNames:{
              "#candidateId": "candidateId"
             },
            ExpressionAttributeValues: {
                ":candidateIdFilter": candidateId
         }
     }

     const documentClient = new DocumentClient();
        return Observable.create((observer:Observer<Booking>) => {
             console.log("Executing query with parameters " + queryParams);
             documentClient.query(queryParams,(err,data:any) => {
                console.log(`did we get error ${err}`);
                 if(err) {
                     observer.error(err);
                   throw err;
                }
                 console.log(`data items receieved ${data.Items.length}`);
                if(data.Items.length === 0) {
                   console.log("no data received for Booking candidates Info ");
                   // freshers point  :no previous data for category and doe
                   this.update(candidateId);
                   // generate & send link to candiate and that link store in candidate table
                     observer.complete();
                     return;
                }
                else
                {
                    //chcek category and DOE
                     data.Items.forEach((item) => {
                       console.log(`candidate category ${item.category}`);
                      let cate=item.category;
                       console.log(`candidate previous dateofexam ${item.dateofExam}`);
                           let de=item.dateofexam;

                           if( "java" ||"JAVA" || "IOS" || "ios" || "QA" || "qa" === cate )
                           {
                               //DOE < 1 month
                            //    if()
                            //    {
                            //          // not eligible to attended the exam.
                            //    }
                            //    else{
                            //        //tokend ID generate
                            //    }
                           }
                        
                    
                    
                     
                   });
                }

                 observer.next(data.Items[0]);
                observer.complete();

          });
        });

  }


    // getAll(): Observable<Candidate[]> {
    //     console.log("in CandidateServiceImpl getAll()");

    //     const queryParams: DynamoDB.Types.QueryInput = {
    //         TableName: "candidates",
    //         ProjectionExpression: "candidateId, firstName, lastName, email, phoneNumber",
    //         KeyConditionExpression: "#candidateId = :candidateIdFilter",
    //         ExpressionAttributeNames:{
    //             "#candidateId": "candidateId"
    //         },
    //         ExpressionAttributeValues: {
    //             ":candidateIdFilter": "1"
    //         }
    //     }

    //     const documentClient = new DocumentClient();
    //     return Observable.create((observer:Observer<Candidate>) => {
    //         console.log("Executing query with parameters " + queryParams);
    //         documentClient.query(queryParams,(err,data:any) => {
    //             console.log(`did we get error ${err}`);
    //             if(err) {
    //                 observer.error(err);
    //                 throw err;
    //             }
    //             console.log(`data items receieved ${data.Items.length}`);
    //             if(data.Items.length === 0) {
    //                 console.log("no data received for getAll candidates");
    //                 observer.complete();
    //                 return;
    //             }
    //             data.Items.forEach((item) => {
    //                 console.log(`candidate Id ${item.candidateId}`);
    //                 console.log(`candidate firstName ${item.firstName}`);
    //                 console.log(`candidate lastName ${item.lastName}`);
    //                 console.log(`candidate email ${item.email}`);
    //             });
    //             observer.next(data.Items);
    //             observer.complete();

    //         });

    //     });





    getBookingDetails(): Observable<Booking[]> {
        console.log("in BookingServiceImpl getBookingDetails()");

         const queryParams: DynamoDB.Types.QueryInput = {
             TableName: "booking",
             ProjectionExpression: "candidateId,category, dateofExam",
             KeyConditionExpression: "#candidateId = :candidateIdFilter",
             ExpressionAttributeNames:{
                 "#candidateId": "candidateId"
             },
             ExpressionAttributeValues: {
                 ":candidateIdFilter": "1"
             }
         }

         const documentClient = new DocumentClient();
         return Observable.create((observer:Observer<Booking>) => {
             console.log("Executing query with parameters " + queryParams);
             documentClient.query(queryParams,(err,data:any) => {
                 console.log(`did we get error ${err}`);
                 if(err) {
                     observer.error(err);
                     throw err;
                 }
                 console.log(`data items receieved ${data.Items.length}`);
                 if(data.Items.length === 0) {
                     console.log("no data received for getBooking ");
                     observer.complete();
                     return;
                 }
                 data.Items.forEach((item) => {
                     console.log(`candidate Id ${item.candidateId}`);
                     console.log(`candidate firstName ${item.category}`);
                     console.log(`candidate lastName ${item.dateofExam}`);
                });
                 observer.next(data.Items);
                 observer.complete();

             });

         });

    }

//    private createEmailParamConfig(email, message): AWS.SES.SendEmailRequest {
//        const params = {
//            Destination: {
//                BccAddresses: [],
//                CcAddresses: [],
//                ToAddresses: [ email ]
//            },
//            Message: {
//                Body: {
//                    Html: {
//                        Data: this.generateEmailTemplate("ashok@amitisoft.com", message),
//                        Charset: 'UTF-8'
//                    }
//                },
//                Subject: {
//                    Data: 'Testing Email',
//                    Charset: 'UTF-8'
//                }
//            },
//            Source: 'ashok@amitisoft.com',
//            ReplyToAddresses: [ 'ashok@amitisoft.com' ],
//            ReturnPath: 'ashok@amitisoft.com'
//        }
//        return params;
//    }

//    private generateEmailTemplate(emailFrom:string, message:string) : string {
//        return `
//          <!DOCTYPE html>
//          <html>
//            <head>
//              <meta charset='UTF-8' />
//              <title>title</title>
//            </head>
//            <body>
//             <table border='0' cellpadding='0' cellspacing='0' height='100%' width='100%' id='bodyTable'>
//              <tr>
//                  <td align='center' valign='top'>
//                      <table border='0' cellpadding='20' cellspacing='0' width='600' id='emailContainer'>
//                          <tr style='background-color:#99ccff;'>
//                              <td align='center' valign='top'>
//                                  <table border='0' cellpadding='20' cellspacing='0' width='100%' id='emailBody'>
//                                      <tr>
//                                          <td align='center' valign='top' style='color:#337ab7;'>
//                                              <h3><a href="http://mail.amiti.in/verify.html?token=${message}">http://mail.amiti.in/verify.html?token=${message}</a>
//                                              </h3>
//                                          </td>
//                                      </tr>
//                                  </table>
//                              </td>
//                          </tr>
//                          <tr style='background-color:#74a9d8;'>
//                              <td align='center' valign='top'>
//                                  <table border='0' cellpadding='20' cellspacing='0' width='100%' id='emailReply'>
//                                      <tr style='font-size: 1.2rem'>
//                                          <td align='center' valign='top'>
//                                              <span style='color:#286090; font-weight:bold;'>Send From:</span> <br/> ${emailFrom}
//                                          </td>
//                                      </tr>
//                                  </table>
//                              </td>
//                          </tr>
//                      </table>
//                  </td>
//              </tr>
//              </table>
//            </body>
//          </html>
// `
//    }

//
}