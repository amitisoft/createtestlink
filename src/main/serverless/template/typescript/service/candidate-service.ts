import { Injectable } from "@angular/core";
import { Observable, Observer } from 'rxjs';
import { Candidate } from '../domain/candidate';
import { Booking } from '../domain/booking';
import { DynamoDB, SES } from "aws-sdk";


const AWS = require('aws-sdk');
var uuid = require('uuid');
import DocumentClient = DynamoDB.DocumentClient;

AWS.config.update({
    region: "us-east-1"
});

@Injectable()
export class CandidateServiceImpl {

    constructor() {
        console.log("in CandidateServiceImpl constructor()");
    }


    // checking email is Exist or not
    checkIsEmailExist(data: any): Observable<Candidate> {
        console.log("in CandidateServiceImpl checkIsEmailExist()");

        let emailid = data.emails;
        const queryParams: DynamoDB.Types.QueryInput = {
            TableName: "candidate1",
            IndexName: "emailIndex",
            ProjectionExpression: "candidateId",
            KeyConditionExpression: "#emailId = :emailIdFilter",
            ExpressionAttributeNames: {
                "#emailId": "email"
            },
            ExpressionAttributeValues: {
                ":emailIdFilter": emailid
            }
        }
        const documentClient = new DocumentClient();
        return Observable.create((observer: Observer<Candidate>) => {
            console.log("Executing query with parameters " + queryParams);
            documentClient.query(queryParams, (err, data: any) => {
                console.log(`did we get error ${err}`);
                if (err) {
                    observer.error(err);
                    throw err;
                }
                console.log(`data items:Email receieved ${data.Items.length}`);
                if (data.Items.length === 0) {
                    console.log("no Email exist in candidates"); // Email is not present
                    observer.complete();
                    return;
                }
                console.log("candidateID", data.Items[0].candidateId); // if email is exist then get the candidate Id
                observer.next(data.Items[0]);
                observer.complete();
            });
        });
    }

    // check Cabdidate ID exist or not in Booking table
    findById(candidateId: string, data: any): Observable<Booking[]> {
        console.log("in CandidateServiceImpl findById()");
        console.log(candidateId);
        const queryParams: DynamoDB.Types.QueryInput = {
            TableName: "booking1",
            IndexName: "b_candidateId",
            ProjectionExpression: "category,dateofExam,jobPosition,bookingId",
            KeyConditionExpression: "#candidateId = :candidateIdFilter",
            ExpressionAttributeNames: {
                "#candidateId": "candidateId"
            },
            ExpressionAttributeValues: {
                ":candidateIdFilter": candidateId
            }
        }
        const documentClient = new DocumentClient();
        return Observable.create((observer: Observer<Booking[]>) => {
            console.log("Executing query with parameters " + queryParams);
            documentClient.query(queryParams, (err, data1: any) => {
                console.log(`did we get error ${err}`);
                if (err) {
                    observer.error(err);
                    throw err;
                }
                console.log(`data items receieved ${data1.Items.length}`);

                if (data1.Items.length === 0) {
                    console.log(` this candidateID  ${candidateId} is not Exist in the Booking Table  `); //consider as a frehser
                    let token = Math.random().toString(36).substr(2);
                    let bookingId = uuid.v4();

                    this.updateBookingInfo(bookingId, candidateId, token, data.category, data.jobPosition)
                        .then(this.updateCandidateInfo);
                    this.sendEmail(data.emails, data.emailsubject, data.emailbody, token);
                    observer.complete();
                    return;
                }
                // let categoryArray: any = [];
                // let dateOfExamArray: any = [];
                // data1.Items.forEach((item) => {
                //     console.log(`this Booking Id(s) ${item.bookingId}`);
                //       console.log(`Booking Categorie(s) ${item.category}`);
                //       console.log(`Applied Job Position(s) ${item.jobPosition}`);
                //       console.log(`Attended Exam Date(s) ${item.dateofExam}`);
                //     categoryArray.push(item.category);
                //     dateOfExamArray.push(item.dateofExam);
                // });

                var cate = data.category;
                var sortingDatesArray = [];
                for (var i = 0; i < data1.Items.length; i++) {
                    if (cate === data1.Items[i].category)
                        sortingDatesArray.push(data1.Items[i].dateofExam); //by me
                }
                var srtarr = [];
                for (var i = 0; i < sortingDatesArray.length; i++) {
                    var df = sortingDatesArray[i].split('-');
                    srtarr.push(Date.UTC(df[0], df[1] - 1, df[2]));
                }
                srtarr.sort();
                var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                var diffDays = Math.round(Math.abs((new Date(srtarr[i - 1]).getTime() - new Date().getTime()) / (oneDay)));
                //console.log(diffDays);
                if (30 < diffDays) {
                    console.log(" allow");
                    //send mail
                }
                else {
                    console.log("System does not allow with in 30 Days")
                }
                observer.next(data1.Items);
                observer.complete();

            });
        });
    }


    updateCandidateInfo(result: any) {
        console.log(`Update the tokenId :  ${result.token} in candidate table `);
        const documentClient = new DocumentClient();
        const params = {
            TableName: "candidate1",
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
                //console.log(`result ${JSON.stringify(data)}`);
                console.log("update the TokenId in Candidate Table");
                resolve({ result: result.token });
            });
        });
    }

    updateBookingInfo(bookingId: string, candidateId: string, token: string, category: string, jobPosition: string) {
        console.log(" update the information in Booking");
        console.log(`data received ${candidateId}`);
        console.log(`data received ${category}`);
        console.log(`data received ${jobPosition}`);
        console.log(`data received ${bookingId}`);

        let testStatus = "Nottaken";
        const documentClient = new DocumentClient();
        const params = {
            TableName: "booking1",
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
                    console.log("updated booking...")
                    resolve({ candidateId, token });
                }

            });
        });
    }

    sendEmail(emailid: string, esubject: string, ebody: string, tokenid: string) {
        const emailConfig = {
            region: 'us-east-1'
        };

        const emailSES = new SES(emailConfig);

        const p = new Promise((res, rej) => {

            if (!emailid) {
                rej('Please provide email');
                return;
            }

            const emailParams: AWS.SES.SendEmailRequest = this.createEmailParamConfig(emailid, esubject, ebody, tokenid);
            emailSES.sendEmail(emailParams, (err: any, data: AWS.SES.SendEmailResponse) => {
                if (err) {
                    console.log(err);
                    rej(`Error in sending out email ${err}`)
                    return;
                }

                res(`Successfully sent email to ${emailid}`);

            });

        });
    }

    private createEmailParamConfig(email, subject, body, tokenid): AWS.SES.SendEmailRequest {
        const params = {
            Destination: {
                BccAddresses: [],
                CcAddresses: [],
                ToAddresses: [email]
            },
            Message: {
                Body: {

                    Html: {
                        Data: this.generateEmailTemplate("ashok@amitisoft.com", tokenid, body),
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

    private generateEmailTemplate(emailFrom: string, tokenid: string, emailbody: string): string {
        return `
         <!DOCTYPE html>
         <html>
           <head>
             <meta charset='UTF-8' />
             <title>title</title>
           </head>
           <body>
            emailbody       
            <table border='0' cellpadding='0' cellspacing='0' height='100%' width='100%' id='bodyTable'>
             <tr>
                 <td align='center' valign='top'>
                     <table border='0' cellpadding='20' cellspacing='0' width='600' id='emailContainer'>
                         <tr style='background-color:#99ccff;'>
                             <td align='center' valign='top'>
                                 <table border='0' cellpadding='20' cellspacing='0' width='100%' id='emailBody'>
                                     <tr>
                                         <td align='center' valign='top' style='color:#337ab7;'>
                                             <h3><a href="http://mail.amiti.in/verify.html?token=${tokenid}">http://mail.amiti.in/verify.html?token=${tokenid}</a>
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