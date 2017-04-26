import { Context, Callback } from 'aws-lambda';
import { BookingFacade } from '../facade/booking-facade';

export class GetBookingHandler {

    constructor(private facade: BookingFacade) {
        console.log("in GetCandidateHandler constructor");
    }

    handler = (event: any, context: Context, callback: Callback) => {
        console.log("calling facade get all candidates");
        this.facade.getBookingDetails().subscribe(
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
                console.log("completed loading all candidates");
            }
        );

    }
}