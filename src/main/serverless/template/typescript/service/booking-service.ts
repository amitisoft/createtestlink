import {Injectable} from "@angular/core";
import {Observable, Observer} from 'rxjs';
import {Booking} from '../domain/booking';
import {DynamoDB, SES} from "aws-sdk";

const AWS = require('aws-sdk');
var uuid = require('uuid');
import DocumentClient = DynamoDB.DocumentClient;

AWS.config.update({
    region: "us-east-1"
});

@Injectable()
export class BookingServiceImpl {

    constructor() {
        console.log("in BookingServiceImpl constructor()");
    }


/**
 * check Candidate ID 
 * exist or not in 
 * Booking table
 */
  
 findByCandidateId(candidateId:string,reqdata:any):Observable<any> {
          console.log("in BookingServiceImpl findByCandidateId()");
                        const queryParams: DynamoDB.Types.QueryInput = {
                        TableName: "booking",
                        IndexName: "candidateIdGSI",
                        ProjectionExpression:"category,dateofExam,jobPosition,bookingId,testStatus",
                        KeyConditionExpression: "#candidateId = :candidateIdFilter",
                                ExpressionAttributeNames: {
                                                            "#candidateId": "candidateId"
                                                            },
                                ExpressionAttributeValues: {
                                                            ":candidateIdFilter": candidateId
                                                            }
                                                                                    }
                                const documentClient = new DocumentClient();
                                return Observable.create((observer: Observer<any>) => {
                                console.log("Executing query with parameters " + queryParams);
                                            documentClient.query(queryParams, (err, data: any) => {
                                                console.log(`did we get error ${err}`);
                                                        if (err) {
                                                                    observer.error(err);
                                                                    throw err;
                                                                }
                                console.log(`data items receieved ${data.Items.length}`);
               /**
                 *  CandidateId is not exist in the Booking Table consider as a frehser  then book the slot.
                 */
    if (data.Items.length === 0)
    {
                    console.log(` this candidateID  ${candidateId} is not Exist in the Booking Table  `); 
                    let token = uuid.v4();
                    let bookingId = uuid.v4();
                    this.updateBookingInfo(bookingId,candidateId,token,reqdata.category,reqdata.jobPosition, reqdata.emails, reqdata.emailsubject, reqdata.emailbody)
                        .then(this.updateCandidateInfo.bind(this))
                        .then(this.sendEmail.bind(this))
                        .then(() => {
                            //console.log(" Success fully Sending mail");
                             let msg=" Success fully Sending mail";
                             observer.next(msg);
                              observer.complete();
                                  }, (rej) => {
                            console.log("rejected", rej);
                        });
                                   
                     return;
    }
    else
    { 
                let cate = reqdata.category;
                console.log(cate);
                var sortingDatesArray = [];
                console.log(data.Items);
                for (var i = 0; i < data.Items.length; i++) {
                    if (cate === data.Items[i].category && data.Items[i].testStatus === "taken")
                        {
                        sortingDatesArray.push(data.Items[i].dateofExam); 
                        }
                    }
                
         if(sortingDatesArray.length ===0)
           {
                    let token = uuid.v4();
                    let bookingId = uuid.v4();
                    this.updateBookingInfo(bookingId, candidateId,token,reqdata.category, reqdata.jobPosition, reqdata.emails, reqdata.emailsubject, reqdata.emailbody)
                        .then(this.updateCandidateInfo.bind(this))
                        .then(this.sendEmail.bind(this))
                        .then(() => {
                             observer.next("Success fully Sending mail");
                             observer.complete();
                        }, (rej) => {
                            console.log("rejected", rej);
                        });
                   return;      
            }
            else
            {
                             var srtarr = [];
                             for (var i = 0; i < sortingDatesArray.length; i++) {
                                    var df = sortingDatesArray[i].split('-'); 
                                    srtarr.push(Date.UTC(df[0], df[1] - 1, df[2]));// convert UTC format
                                                                                }
                            srtarr.sort();// dates sorting 
                            var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                            var diffDays = Math.round(Math.abs((new Date(srtarr[i - 1]).getTime() - new Date().getTime()) / (oneDay)));
                            console.log(diffDays);
          
                            // validation of dates
                                if (30 < diffDays) {
                                                    let token = uuid.v4();
                                                    let bookingId = uuid.v4();
                         this.updateBookingInfo(bookingId, candidateId, token, reqdata.category, reqdata.jobPosition, reqdata.emails, reqdata.emailsubject, reqdata.emailbody)
                        .then(this.updateCandidateInfo.bind(this))
                        .then(this.sendEmail.bind(this))
                        .then(() => {
                            //console.log(" Success fully Sending mail");
                              observer.next(" Success fully Sending mail");
                              observer.complete();
                        }, (rej) => {
                            console.log("rejected", rej);
                        });
                                                    }
                                    else {
                                       // console.log("System does not allow with in 30 Days");
                                         observer.next("System does not allow with in 30 Days");
                                         observer.complete();
                                        }
               }
               
              }    
                
            });
        });
    }

    // Before send  a mail: step 2->  Update the tokenid in Candidate table based on CandidateID
    updateCandidateInfo(result:any) {
        console.log(`Update the tokenId :${result.token} in candidate table `);
        const documentClient = new DocumentClient();
        const params = {
            TableName: "candidate",
            Key: {
                candidateId: result.candidateId,
            },
            ExpressionAttributeNames: {
                '#tok': 'tokenId'
            },
            ExpressionAttributeValues: {
                ':tok': result.token
            },
            UpdateExpression: 'SET #tok=:tok',
            ReturnValues: 'ALL_NEW',
        };

        return new Promise(function (resolve, reject) {
            documentClient.update(params, (err, data: any) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }
                //console.log("update the TokenId in Candidate Table", result);
                resolve({ result:result });

            });
        });
    }

    // Before Sending a mail, Step->1 Update Booking table - bookingid,candidateid,category,jobposition
    updateBookingInfo(bookingId: string, candidateId: string, token: string, category: string, jobPosition: string, emailids: any, emailsubject: string, emailbody: any) {
        console.log(" update the information in Booking");
        console.log(`data received CandidateId : ${candidateId}`);
        console.log(`data received Category :${category}`);
        console.log(`data received jobPosition :${jobPosition}`);
        console.log(`data received bookingId :${bookingId}`);

        let testStatus = "notTaken";
        const documentClient = new DocumentClient();
        const params = {
            TableName: "booking",
            Key: {
                bookingId: bookingId,
            },
            ExpressionAttributeNames: {
                '#cid': 'candidateId',
                '#ct': 'category',
                '#jp': 'jobPosition',
                "#ts": 'testStatus'
           },
            ExpressionAttributeValues: {
                ':cid': candidateId,
                ':ct': category,
                ':jp': jobPosition,
                ':ts': testStatus
            },
            UpdateExpression: 'SET #cid=:cid,#ct=:ct,#jp=:jp, #ts=:ts',
            ReturnValues: 'ALL_NEW',
        };
        return new Promise(function (resolve, reject) {
            documentClient.update(params, (err, data: any) => {
                if (err) {
                    console.log(err);
                    reject("data is not inserted");
                } else {
                    console.log("updated booking Information in Booking Table")
                    resolve({ candidateId, token, emailids, emailsubject, emailbody });
                }
            });
        });
    }
     // send  mail to respective emailid - {email,body,subject}
    sendEmail(result:any) {
        const mydata = (JSON.parse(JSON.stringify(result)));
        //console.log("emailids", mydata.result.emailids);
        const emailConfig = {
            region: 'us-east-1'
        };
        let that = this;
        //console.log('that:' + JSON.stringify(that));
        const emailSES = new SES(emailConfig);
        const prom = new Promise((res, rej) => {
            if (!mydata.result.emailids) {
                rej('Please provide email');
                return prom;
            }
          const emailParams: AWS.SES.SendEmailRequest = that.createEmailParamConfig(mydata.result.emailids, 
                                                        mydata.result.emailsubject,mydata.result.emailbody,result.tokenid);
            emailSES.sendEmail(emailParams,(err: any, data: AWS.SES.SendEmailResponse) => {
                if (err) {
                    console.log(err);
                    rej(`Error in sending out email ${err}`)
                    return prom;
                }
                res(`Successfully sent email to ${mydata.result.emails}`);
            });
        });
        return prom;
    }

    private createEmailParamConfig(email,subject,body,tokenid): AWS.SES.SendEmailRequest {
            const params = {
            Destination: {
                BccAddresses: [],
                CcAddresses: [],
                ToAddresses: [email]
            },
            Message: {
                Body: {

                    Html: {
                        Data:body,
                         // this.generateEmailTemplate("ashok@amitisoft.com", tokenid, body),
                        Charset: 'UTF-8'
                    }
                },
                Subject: {
                    Data: subject,
                    Charset: 'UTF-8'
                }
            },
            Source: 'ashok@amitisoft.com',
            ReplyToAddresses: ['ashok@amitisoft.com'],
            ReturnPath: 'ashok@amitisoft.com'
        }
        return params;
    }

    private generateEmailTemplate(emailFrom: string, tokenid: any, embody: any): string {
        console.log("generate email");
        return `
         <!DOCTYPE html>
         <html>
           <head>
             <meta charset='UTF-8' />
             <title>title</title>
           </head>
           <body>
                  
            <table border='0' cellpadding='0' cellspacing='0' height='100%' width='100%' id='bodyTable'>
             <tr>
                 <td align='center' valign='top'>
                     <table border='0' cellpadding='20' cellspacing='0' width='600' id='emailContainer'>
                         <tr style='background-color:#99ccff;'>
                             <td align='center' valign='top'>
                                 <table border='0' cellpadding='20' cellspacing='0' width='100%' id='emailBody'>
                                     <tr>
                                         <td align='center' valign='top' style='color:#337ab7;'>
                                             <h3>embody

                                             <a href="http://mail.amiti.in/verify.html?token=${tokenid}">http://mail.amiti.in/verify.html?token=${tokenid}</a>
                                             </h3>
                                         </td>
                                     </tr>
                                 </table>
                             </td>
                         </tr>
                         <tr style='background-color:#74a9d8;'>
                             <td align='center' valign='top'>
                                 <table border='0' cellpadding='20' cellspacing='0' width='100%' id='emailReply'>
                                     <tr style='font-size: 1.2rem'>
                                         <td align='center' valign='top'>
                                             <span style='color:#286090; font-weight:bold;'>Send From:</span> <br/> ${emailFrom}
                                         </td>
                                     </tr>
                                 </table>
                             </td>
                         </tr>
                     </table>
                 </td>
             </tr>
             </table>
           </body>
         </html>
`
    }



}