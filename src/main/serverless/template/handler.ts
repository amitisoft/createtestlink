import 'reflect-metadata';
import { AppProviders } from './typescript/context/app-context';
import { ExecutionContextImpl } from "./typescript/context/execution-context-impl";
import { TestLinkHandler } from './typescript/web/test-link-handler';

exports.createTestLinkFunction = ExecutionContextImpl.createHttpHandler(AppProviders, TestLinkHandler.checkIsEmailExist);

