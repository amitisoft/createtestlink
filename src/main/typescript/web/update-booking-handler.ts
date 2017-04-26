import { Context, Callback } from 'aws-lambda';
import { BookingFacade } from '../facade/booking-facade';

export class UpdateBookingHandler {

    constructor(private facade: BookingFacade) {
        console.log("in UpdateBookingHandler constructor");
    }

    handler = (event: any, context: Context, callback: Callback) => {
        console.log(`calling facade update candidate exam booking details ${JSON.stringify(event)}`);
        const data = event.body;
        console.log(`updating candidate with data from request ${data}`);

        this.facade.updateBookingCandidate(data).subscribe(
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
                console.log("completed updating candidate");
            }
        );

    }
}