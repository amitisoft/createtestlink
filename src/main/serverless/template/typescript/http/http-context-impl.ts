import {Injector} from "@angular/core";
import {Callback, Context} from "aws-lambda";


export interface LambdaHandler { (event: any, context: Context, callback: Callback):void }

export interface HttpHandler { (context:HttpContextImpl, injector:Injector):void }

export class HttpContextImpl {

    constructor(private lambdaEvent:any, private lambdaCallback: Callback) {

    }
     ok(httpCode:number = 200, response?: any) {
         const result = {
             statusCode: httpCode,
             headers:{
                 "Access-Control-Allow-Headers":"*",
                 "Access-Control-Allow-Methods":"*",
                 "Access-Control-Allow-Origin":"*"
             },
             body: null
         };
         if(response) {
             result.body = JSON.stringify(response);
         }
         this.lambdaCallback(null,result);
     }

    fail(error: any,httpCode:number = 500,response?:any) {
        const result = {
            statusCode: httpCode,
            headers:{},
            body: null
        };
        if(response) {
            result.body = JSON.stringify(response);
        }
        this.lambdaCallback(error,result);
    }

    getPathParameters(): any {
        return this.lambdaEvent.pathParameters;
    }

    // getRequestBody(): string {
    //  return this.lambdaEvent.body;
    //  }

     getRequestBody(): any {
     if (typeof this.lambdaEvent.body === 'string'){
     this.lambdaEvent.body = JSON.parse(this.lambdaEvent.body);
    }
    return this.lambdaEvent.body;
      }
    getRequestContext():any {
        return this.lambdaEvent.requestContext;
    }
}