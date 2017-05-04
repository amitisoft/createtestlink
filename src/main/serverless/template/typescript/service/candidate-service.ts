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
   
        // checking email is Exist or not in Candidate table
        findCandidateByEmailId(data: any): Observable<Candidate> {
        
        console.log("in CandidateServiceImpl findCandidateByEmail()");
        let emailid = data.emails;
        const queryParams: DynamoDB.Types.QueryInput = {
            TableName: "candidate",
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
               // console.log(`did we get error ${err}`);
                if (err) {
                    observer.error(err);
                    throw err;
                }
               console.log(`data items:Email receieved ${data.Items.length}`);
                if (data.Items.length === 0) {
                   console.log(" Email is not exist in candidates table "); //  Email is not present send to this msg
                   //let msg=" Email is not exist in candidates table ";
                    return;
                }
                console.log("candidateID", data.Items[0].candidateId); // if email is exist then get the candidate Id
                observer.next(data.Items[0]);                         
                observer.complete();
            });
        });
    }
      
   
}