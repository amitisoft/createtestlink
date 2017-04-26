import { GetCandidateHandler } from '../../typescript/web/get-candidate-handler';
import { CreateCandidateHandler } from '../../typescript/web/create-candidate-handler';
import { FindCandidateHandler } from '../../typescript/web/find-candidate-handler';
import { UpdateCandidateHandler } from '../../typescript/web/update-candidate-handler';
import { DeleteCandidateHandler } from '../../typescript/web/delete-candidate-handler';
import { CandidateFacade } from '../../typescript/facade/candidate-facade';
import { CandidateService, CandidateServiceImpl } from '../../typescript/service/candidate-service';

import { GetBookingHandler } from '../../typescript/web/get-booking-handler';
import { UpdateBookingHandler } from '../../typescript/web/update-booking-handler';
import { FindCandidateEmailHandler} from '../../typescript/web/find-candidateemail-handler';
import { BookingFacade } from '../../typescript/facade/booking-facade';
import { BookingService, BookingServiceImpl } from '../../typescript/service/booking-service';


class AppContext {

    endPoint: string = process.env.CANDIDATE_ALL_END_POINT;

    candidateService() : CandidateService {
         return new CandidateServiceImpl();
     }

     candidateFacade(): CandidateFacade {
         return new CandidateFacade(this.candidateService());
     }

    bookingService() : BookingService {
          return new BookingServiceImpl();
      }

    bookingFacade(): BookingFacade {
        return new BookingFacade(this.bookingService());
  }
}

let appContext: AppContext = new AppContext();
 //exports.getAllCandidatesHandler = new GetCandidateHandler(appContext.candidateFacade()).handler;
// exports.createCandiateHandler = new CreateCandidateHandler(appContext.candidateFacade()).handler;
 //exports.getCandiateHandler = new FindCandidateHandler(appContext.candidateFacade()).handler;
exports.findEmailHandler = new FindCandidateEmailHandler(appContext.candidateFacade()).handler;
//exports.updateCandidateHandler = new UpdateCandidateHandler(appContext.candidateFacade()).handler;
//exports.updateBookingHandler= new UpdateBookingHandler(appContext.bookingFacade()).handler;
//exports.getBookingHandler = new GetBookingHandler(appContext.bookingFacade()).handler;