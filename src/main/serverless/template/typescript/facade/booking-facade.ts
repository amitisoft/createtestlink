import {Injectable} from "@angular/core";
import {Observable, Observer} from 'rxjs';
import {CandidateServiceImpl} from '../service/candidate-service';
import {CandidateDto} from '../dto/candidate-dto';
import {CandidatesDto} from '../dto/candidates-dto';
import {Candidate} from '../domain/candidate';
import {BookingServiceImpl} from '../service/booking-service';


@Injectable()
export class  BookingFacade {

     constructor(private bookingService: BookingServiceImpl) {
        console.log("in BookingFacade constructor()");
    }

    
}