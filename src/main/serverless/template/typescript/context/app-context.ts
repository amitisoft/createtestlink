import {CandidateServiceImpl} from "../service/candidate-service";
import {CandidateFacade} from "../facade/candidate-facade";
import {BookingServiceImpl} from '../service/booking-service';
import {BookingFacade} from "../facade/booking-facade";

export const AppProviders = [
    CandidateServiceImpl,
    CandidateFacade,
    BookingFacade,
    BookingServiceImpl
];
