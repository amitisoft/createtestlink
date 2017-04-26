import { Context, Callback } from 'aws-lambda';
import { CandidateFacade } from '../facade/candidate-facade';

export class FindCandidateEmailHandler {

    constructor(private facade: CandidateFacade) {
        console.log("in GetCandidateEmailHandler constructor");
    }

   handler = (event: any, context: Context, callback: Callback) => {
        console.log("calling facade find candidates");
        console.log("got event data" + JSON.stringify(event));
        // let emaildata = event.Res;
        // console.log("emails = ",emaildata.emails);
        // console.log("subject = ",emaildata.subject);
               let emails = "monica@amitisoft.com";
               
       //event.pathParameters.email || "abc";
         this.facade.findByEmail(emails).subscribe(
            result => {
                const response = {
                    statusCode: 200,
                    body: result
                }
                console.log("responses:" + response);
                callback(null, response);
            },
            error => {
                callback(error);
            },
            () => {
                console.log("completed find single candidate Information");
            }
        );

   }
}