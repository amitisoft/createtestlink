import { CandidateFacade } from '../facade/candidate-facade';
import { Injector } from '@angular/core';
import { HttpContextImpl } from "../http/http-context-impl";

export class TestLinkHandler {


    static checkIsEmailExist(httpContext: HttpContextImpl, injector: Injector): void {
        let data = httpContext.getRequestBody();
        //console.log(JSON.stringify(data)); 
        injector.get(CandidateFacade).checkIsEmailExist(data)
            .subscribe(result => {
                injector.get(CandidateFacade).findById(JSON.parse(JSON.stringify(result)).candidateId, data)
                    .subscribe(result => {
                        httpContext.ok(200, result);
                    }, err => {
                        httpContext.fail(err, 500);
                    });
            });
    }


}



