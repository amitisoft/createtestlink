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

    // getAll(): Observable<CandidatesDto> {
    //     console.log("in CandidateFacade getAll()");

    //     return this.candidateService.getAll()
    //         .map((candidates) => {
    //             return {
    //                 candidates: candidates.map(this.mapCandidateToDto)
    //             }
    //         });
    // }

    // findbyId(candidateId: string): Observable<Candidate> {
    //     console.log("in CandidateFacade findById()");
    //     return this.candidateService.findById(candidateId);
    // }

    // findbyEmail(candidateId:string): Observable<Candidate> {
    //     console.log("in CandidateFacade findById()");
    //     return this.candidateService.findById(candidateId);
    // }


    // private mapCandidateToDto(candidate: Candidate): CandidateDto {
    //     console.log("in mapCandidateToDto" + JSON.stringify(candidate));
    //     return {
    //         candidateId: candidate.candiateId,
    //         fullName: `${candidate.firstName} ${candidate.lastName}`,
    //         email: candidate.email
    //     }
    // }


//     findByEmail(data :any): Observable<Candidate> {
//     return this.candidateService.findByEmail(data);
//   }

//   findById(data :any): Observable<Candidate> {
//     return this.candidateService.getCandidateBookingInfo(data);
//   }
}