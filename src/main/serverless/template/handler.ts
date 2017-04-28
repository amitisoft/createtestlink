import 'reflect-metadata';
import { GetCandidateHandler } from './typescript/web/get-candidate-handler';
import { AppProviders } from './typescript/context/app-context';
import { ExecutionContextImpl } from "./typescript/context/execution-context-impl";
import { TestLinkHandler } from './typescript/web/test-link-handler';

 //exports.getAllCandidatesFunction = ExecutionContextImpl.createHttpHandler(AppProviders, GetCandidateHandler.getAllCandidates);
//exports.findCandiateByIdFunction = ExecutionContextImpl.createHttpHandler(AppProviders, GetCandidateHandler.findCandidateById);
exports.createTestLinkFunction = ExecutionContextImpl.createHttpHandler(AppProviders, TestLinkHandler.checkIsEmailExist);

