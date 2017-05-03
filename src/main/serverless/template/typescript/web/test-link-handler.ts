import { CandidateFacade } from '../facade/candidate-facade';
import { Injector } from '@angular/core';
import { HttpContextImpl } from "../http/http-context-impl";
import { BookingFacade } from '../facade/booking-facade';

export class TestLinkHandler {


    static findCandidateByEmailId(httpContext: HttpContextImpl, injector: Injector): void {
        let data = httpContext.getRequestBody();
        //console.log(JSON.stringify(data)); 
        injector.get(CandidateFacade).findCandidateByEmailId(data)
            .subscribe(result => {
                injector.get(BookingFacade).findByCandidateId(JSON.parse(JSON.stringify(result)).candidateId,data)
                    .subscribe(result => {
                        httpContext.ok(200, result);
                    }, err => {
                        httpContext.fail(err, 500);
                    });
            });
    }


}



