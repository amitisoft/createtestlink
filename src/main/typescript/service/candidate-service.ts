import {Observable, Observer} from 'rxjs';
import {Candidate} from '../domain/candidate';
import {Booking} from '../domain/booking';
import {DynamoDB, SES} from "aws-sdk";


import DocumentClient = DynamoDB.DocumentClient;

var uuid = require('uuid');
var AWS = require("aws-sdk");
// var randtoken = require('rand-token').generator();


AWS.config.update({
    region: "us-east-1"
});

export interface CandidateService {
    getAll(): Observable<Candidate[]>;
    create(data: any): Observable<Candidate>;
    find(candidateId:string) : Observable<Candidate>;
    update(data: any): Observable<Candidate>;
    findByEmail(email:string):Observable<Candidate>;
   
}

export class CandidateServiceImpl implements CandidateService {

    constructor() {

    }
        getAll(): Observable<Candidate[]> {
        console.log("in CandidateServiceImpl getAll()");


        const queryParams: DynamoDB.Types.QueryInput = {
            TableName: "candidate",
            ProjectionExpression: "candidateId, firstName, lastName, email, phoneNumber",
            KeyConditionExpression: "#candidateId = :candidateIdFilter",
            ExpressionAttributeNames:{
                "#candidateId": "candidateId"
            },
            ExpressionAttributeValues: {
                ":candidateIdFilter": "1"
            }
        }
        const documentClient = new DocumentClient();
        return Observable.create((observer:Observer<Candidate>) => {
            console.log("Executing query with parameters " + queryParams);
            documentClient.query(queryParams,(err,data:any) => {
                console.log(`did we get error ${err}`);
                if(err) {
                    observer.error(err);
                    throw err;
                }
                console.log(`data items receieved ${data.Items.length}`);
                if(data.Items.length === 0) {
                    console.log("no data received for getAll candidates");
                    observer.complete();
                    return;
                }
                data.Items.forEach((item) => {
                    console.log(`candidate Id ${item.candidateId}`);
                    console.log(`candidate firstName ${item.firstName}`);
                    console.log(`candidate lastName ${item.lastName}`);
                    console.log(`candidate email ${item.email}`);
                });
                observer.next(data.Items);
                observer.complete();

            });

        });

    }


   

    create(data: any): Observable<Candidate> {
        console.log("in CandidateServiceImpl create()");
        const documentClient = new DocumentClient();

        const params = {
            TableName: "candidate",
            Item: {
                candidateId: data.candidateId,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phoneNumber: data.phoneNumber,
            },
            ConditionExpression: "attribute_not_exists(candidateId)"
        };

        return Observable.create((observer:Observer<Candidate>) => {

            documentClient.put(params, (err, data: any) => {
                if(err) {
                    if(err.code === 'ConditionalCheckFailedException'){
                        console.error('candidate already exists',data.candidateId);
                        observer.error(err);
                        return;
                    }
                }

                observer.next(data.Item[0]);
                observer.complete();
            });
        });

    }


    update(data: any): Observable<Candidate> {
        console.log("in CandidateServiceImpl update()");
        console.log(`data received ${data.firstName}`);
        console.log(`data received ${data.lastName}`);
        console.log(`data received ${data.email}`);
        console.log(`data received ${data.candidateId}`);
          console.log(`data received ${data.tokenId}`);

        const documentClient = new DocumentClient();
        const params = {
            TableName: "candidate",
            Key: {
                candidateId: data.candiateId,
            },
            ExpressionAttributeNames: {
                '#fn': 'firstName',
                '#ln': 'lastName',
                '#em': 'email',
                '#to':'tokenId'
            },
            ExpressionAttributeValues: {
                ':fn': data.firstName,
                ':ln': data.lastName,
                ':em': data.email,
                ':to': data.tokenId
            },
            UpdateExpression: 'SET #fn = :fn, #ln = :ln, #em = :em, #to = :to',
            ReturnValues: 'ALL_NEW',
        };

        return Observable.create((observer:Observer<Candidate>) => {

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

    

    find(candidateId:string): Observable<Candidate> {
        console.log("in CandidateServiceImpl find()");

        const queryParams: DynamoDB.Types.QueryInput = {
            TableName: "candidate",
            ProjectionExpression: "candidateId, firstName, lastName, email, phoneNumber",
            KeyConditionExpression: "#candidateId = :candidateIdFilter",
            ExpressionAttributeNames:{
                "#candidateId": "candidateId"
            },
            ExpressionAttributeValues: {
                ":candidateIdFilter": candidateId
            }
        }

        const documentClient = new DocumentClient();
        return Observable.create((observer:Observer<Candidate>) => {
            console.log("Executing query with parameters " + queryParams);
            documentClient.query(queryParams,(err,data:any) => {
                console.log(`did we get error ${err}`);
                if(err) {
                    observer.error(err);
                    throw err;
                }
                console.log(`data items receieved ${data.Items.length}`);
                if(data.Items.length === 0) {
                    console.log("no data received for getAll candidates");
                    observer.complete();
                    return;
                }
                data.Items.forEach((item) => {
                    console.log(`candidate Id ${item.candidateId}`);
                    console.log(`candidate firstName ${item.firstName}`);
                    console.log(`candidate lastName ${item.lastName}`);
                    console.log(`candidate email ${item.email}`);
                });
                observer.next(data.Items[0]);
                observer.complete();

            });
        });

    }

 

// Email is exist or not in database
      findByEmail(email:string): Observable<Candidate>{
        console.log("in CandidateServiceImpl findByEmail()");

        const queryParams: DynamoDB.Types.QueryInput = {
            TableName: "candidate",
            IndexName:"emailIndex",
            ProjectionExpression: "email,candidateId",
            KeyConditionExpression: "#emailId = :emailIdFilter",
            ExpressionAttributeNames:{
                "#emailId": "email"
            },
            ExpressionAttributeValues: {
                ":emailIdFilter": email
            }
        }
        const documentClient = new DocumentClient();
        return Observable.create((observer:Observer<Candidate>) => {
            console.log("Executing query with parameters " + queryParams);
            documentClient.query(queryParams,(err,data:any) => {
               console.log(`did we get error ${err}`);
                if(err) {
                   observer.error(err);
                    throw err;
                }
                console.log(`data items:Email receieved ${data.Items.length}`);
                if(data.Items.length === 0) {
                    console.log("no Email exist in candidates"); // Email is not present
                    observer.complete();
                    return; 
                }
               console.log("candidateID",data.Items[0].candidateId); // if email is exist then get the candidate Id
               this.findByCategory(data.Items[0].candidateId,email); // Based on candidateId fetch the DOE,Category
                 //this.getCandidateBookingInfo(data.Items[0].candidateId);
                 observer.next(data.Items);
                // observer.complete();
                           
            });
          });
       
      }

  private  getCandidateBookingInfo(candidateId:String) {
              console.log("Booking Inforamtion");
         const params = {
                  ProjectionExpression: "candidateId,category, dateofExam",
                              Key: {
                                            "candidateId": candidateId
                                   }, 
                            TableName: "booking"
                                  };
                              const documentClient = new DocumentClient();
                                documentClient.get(params, function(err, data) {
                                   if (err){
                                   console.log(err, err.stack);
                                    } 
                                          else{
                                            console.log(data);
                                           // console.log(data.Item[0].category);
                                            //console.log(data.Item[0].dateofExam);
                                                 
                                  } 
                              });

      }

 
 private   findByCategory(candidateId:string,email:string) {
         console.log("findByCategory  Exist or not ");
                 let id=candidateId;
             console.log(id);
             const queryParams: DynamoDB.Types.QueryInput = {
             TableName: "booking",
             ProjectionExpression: "category,dateofExam",
             KeyConditionExpression:   "#candidateId = :candidateIdFilter",
             ExpressionAttributeNames:{
                 "#candidateId": "candidateId"
             },
             ExpressionAttributeValues: {
                 ":candidateIdFilter": candidateId
             }
         }
         const documentClient = new DocumentClient();
          //return Observable.create((observer:Observer<Booking>) => {
             console.log("Executing query with parameters " + queryParams);
             documentClient.query(queryParams,(err,data:any) => {
                console.log(`did we get error ${err}`);
                 if(err) {
                    //  observer.error(err);
                     throw err;
                 }
                 console.log("Data comes from DB",data);
                 console.log("data length",data.Items.length);
                    if(data.Items.length === 1)
                     {
                     console.log(`category is not exist in this Candidate ID : ${candidateId}`);
                     // consider as a fresher
                    let token=  this.randomnumber();
                    console.log(token);
                    this.sendEmail(email,token);
                    this.updateBookingInfo(candidateId,"java","26-04-2017","JavaDeveloper");
                    this.updateCandidateInfo(candidateId,token);
                    //observer.complete();
                    // return;
                    }

                 //console.log("Booking Category",data.Items[0].category);
                 //console.log("Attended DateofExam",data.Items[0].dateofExam);
                
                  let cate=data.Items[0].category;
                  let doe=data.Items[0].dateofExam;
                  
                  let token=  this.randomnumber();
                  console.log(token);
                  switch(cate)
                  {
                      
                      case 'java'||'Java'||'JAVA': 
                      var diffdays = this.diffDays();
                      if(diffdays>30)
                      {
                        this.sendEmail(email,token);
                        this.updateCandidateInfo(candidateId,token);
                      }
                      else
                      {
                          console.log(`not eligible this time : ${email}`);
                      }
                  }       
                       //observer.next(data.Items);
                       //observer.complete();
                });
         //});
     }


   private randomnumber():string
   {
     return Math.random().toString(36).substr(2); // remove `0.
    }

private diffDays()
               {
var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
var previousDate = new Date(2017,1,12);
var sysDate = new Date();
console.log(sysDate);
var diffDays = Math.round(Math.abs((previousDate.getTime() - sysDate.getTime())/(oneDay)));
console.log("differnet between twodays",diffDays);
return diffDays;

 }
    
   sendEmail(email, messageBody) {
            const emailConfig = {
                region: 'us-east-1'
            };

            const emailSES = new SES(emailConfig);

            const p = new Promise((res, rej)=>{

                if(!email || !messageBody) {
                    rej('Please provide email and message');
                    return;
                }

                const emailParams: AWS.SES.SendEmailRequest = this.createEmailParamConfig(email, messageBody);
                emailSES.sendEmail(emailParams, (err:any, data: AWS.SES.SendEmailResponse) => {
                    if(err) {
                        console.log(err);
                        rej(`Error in sending out email ${err}`)
                        return;
                    }

                    res(`Successfully sent email to ${email}`);

                });

            });
    }


private createEmailParamConfig(email, message): AWS.SES.SendEmailRequest {
       const params = {
           Destination: {
               BccAddresses: [],
               CcAddresses: [],
               ToAddresses:[email] 
           },
           Message: {
               Body: {
                   Html: {
                       Data: this.generateEmailTemplate("ashok@amitisoft.com",message),
                       Charset: 'UTF-8'
                   }
               },
               Subject: {
                   Data: 'Intimation for Java/QA/IOS  Interview  Schedule for 23rd May 2017',
                   Charset: 'UTF-8'
               }
           },
           Source: 'ashok@amitisoft.com',
           ReplyToAddresses: [ 'ashok@amitisoft.com' ],
           ReturnPath: 'ashok@amitisoft.com'
       }
       return params;
   }

   private generateEmailTemplate(emailFrom:string, message:string) : string {
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
                         <tr style='background-color:#99ccdd;'>
                             <td align='center' valign='top'>
                                 <table border='0' cellpadding='20' cellspacing='0' width='100%' id='emailBody'>
                                     <tr>
                                         <td align='center' valign='top' style='color:#337ab7;'>
                                             <h3><a href="http://mail.amiti.in/verify.html?token=${message}">http://mail.amiti.in/verify.html?token=${message}</a>
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
 private updateCandidateInfo(candidateId:string,token:string) {
        console.log(`Update the tokenId :  ${token} in candidate table `);
        //console.log(` token received ${token}`);
        
        const documentClient = new DocumentClient();
        const params = {
            TableName: "candidate",
            Key: {
                candidateId: candidateId,
            },
            ExpressionAttributeNames: {
                '#tok': 'tokenId'
                                      },
            ExpressionAttributeValues: {
                ':tok': token
            },
            UpdateExpression: 'SET #tok=:tok',
            ReturnValues: 'ALL_NEW',
        };

        //return Observable.create((observer:Observer<Candidate>) => {

            documentClient.update(params, (err, data: any) => {
                if(err) {
                    console.error(err);
                   // observer.error(err);
                    return;
                }
                //console.log(`result ${JSON.stringify(data)}`);
                 //observer.next(data.Attributes);
                //observer.complete();
            });
        //});
    }


 private updateBookingInfo(candidateId:string,cate:string,doe:string,jobPos:string)
 {
        //  console.log(" update the information in Booking");
        //  console.log(`data received ${cate}`);
        //  console.log(`data received ${doe}`);
        //  console.log(`data received ${jobPos}`);
         var testStatus="Nottaken";
         const documentClient = new DocumentClient();
         const params = {
             TableName: "booking",
             Key: {
                 candidateId: candidateId,
             },
             ExpressionAttributeNames: {
                 '#ct': 'category',
                 '#de': 'dateofExam',
                 '#jp': 'jobPosition',
                 "#ts": 'testStatus'
                
             },
             ExpressionAttributeValues: {
                 ':ct': cate,
                 ':de': doe,
                 ':jp': jobPos,
                 ':ts': testStatus
             },
             UpdateExpression: 'SET #ct=:ct, #de=:de, #jp=:jp, #ts=:ts',
             ReturnValues: 'ALL_NEW',
         };

         //return Observable.create((observer:Observer<Booking>) => {
             documentClient.update(params, (err, data: any) => {
                 if(err) {
                     console.error(err);
                    // observer.error(err);
                     return;
                 }
                 //console.log(`result ${JSON.stringify(data)}`);
                  //observer.next(data.Attributes);
                 //observer.complete();
             });
         //});
     }

 

}
     