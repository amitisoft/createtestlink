import { Observable, Observer } from 'rxjs';
import { CandidateService } from '../service/candidate-service';
import { CandidateDto } from '../dto/candidate-dto';
import { CandidatesDto } from '../dto/candidates-dto';
import { Candidate } from '../domain/candidate';

import { BookingService } from '../service/booking-service';
import { BookingDto } from '../dto/booking-dto';
import { BookingsDto } from '../dto/bookings-dto';
import { Booking } from '../domain/booking';

export class BookingFacade {

    constructor(private bookingService: BookingService) {
    }

    //   getAll(): Observable<CandidatesDto> {
    //      console.log("in CandidateFacade getAll()");
    //   return this.candidateService.getAll()
    //           .map((candidates) => {
    //              return {
    //                  candidates: candidates.map(this.mapCandidateToDto)
    //               }
    //           });
    //   }

    //   private mapCandidateToDto(candidate: Candidate): CandidateDto {
    //       console.log("in mapCandidateToDto");
    //       return {
    //           candidateId: candidate.candiateId,
    //           fullName: `${candidate.firstName} ${candidate.lastName}`,
    //           email: candidate.email
    //       }
    //   }


    //  createCandidate(data: any) : Observable<Candidate> {
    //       validate data as per business logic
    //       return this.candidateService.create(data);
    //   }

    //  createCandidate(data: any) : Observable<Candidate> {
    //     //validate data as per business logic
    //      return this.candidateService.create(data);
    //  }

    updateBookingCandidate(data: any) :Observable<Booking> {
        return this.bookingService.update(data);
    }


     getBookingDetails():Observable<Booking[]>{
         // get all data from booking table
     return this.bookingService.getBookingDetails();
     }
}
//      findCandidate(candidateId: string) : Observable<Candidate> {
//      return this.candidateService.find(candidateId);
    
//  }

