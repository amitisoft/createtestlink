import {Injectable} from "@angular/core";
import {Observable, Observer} from 'rxjs';
import {Booking} from '../domain/booking';
import {DynamoDB, SES} from "aws-sdk";

const AWS = require('aws-sdk');

import DocumentClient = DynamoDB.DocumentClient;

AWS.config.update({
    region: "us-east-1"
});

@Injectable()
export class BookingServiceImpl {

    constructor() {
        console.log("in BookingServiceImpl constructor()");
    }


}