import { Injectable } from "@angular/core";
import { Observable, Observer } from 'rxjs';
import { CandidateServiceImpl } from '../service/candidate-service';
import { CandidateDto } from '../dto/candidate-dto';
import { CandidatesDto } from '../dto/candidates-dto';
import { Candidate } from '../domain/candidate';
import { BookingDto } from '../dto/booking-dto';
import { BookingsDto } from '../dto/bookings-dto';
import { Booking } from '../domain/booking';
import { BookingServiceImpl } from '../service/booking-service';

@Injectable()
export class CandidateFacade {

  constructor(private candidateService: CandidateServiceImpl) {
    console.log("in CandidateFacade constructor()");
  }

  findCandidateByEmailId(data: any): Observable<Candidate> {
    return this.candidateService.findCandidateByEmailId(data);
  }

 }