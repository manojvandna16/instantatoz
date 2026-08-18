"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelJob = exports.completeJob = exports.verifyJobOTP = exports.respondToJobRequest = exports.createJobRequest = void 0;
/**
 * jobs.ts � Job lifecycle Cloud Functions
 * PHASE 5 IMPLEMENTATION
 * Stub created � functions will be implemented in Phase 5
 */
const https_1 = require("firebase-functions/v2/https");
exports.createJobRequest = (0, https_1.onCall)({ region: 'asia-south1' }, async (_request) => {
    throw new https_1.HttpsError('unimplemented', 'Job requests will be implemented in Phase 5.');
});
exports.respondToJobRequest = (0, https_1.onCall)({ region: 'asia-south1' }, async (_request) => {
    throw new https_1.HttpsError('unimplemented', 'Job response will be implemented in Phase 5.');
});
exports.verifyJobOTP = (0, https_1.onCall)({ region: 'asia-south1' }, async (_request) => {
    throw new https_1.HttpsError('unimplemented', 'OTP verification will be implemented in Phase 6.');
});
exports.completeJob = (0, https_1.onCall)({ region: 'asia-south1' }, async (_request) => {
    throw new https_1.HttpsError('unimplemented', 'Job completion will be implemented in Phase 6.');
});
exports.cancelJob = (0, https_1.onCall)({ region: 'asia-south1' }, async (_request) => {
    throw new https_1.HttpsError('unimplemented', 'Job cancellation will be implemented in Phase 5.');
});
//# sourceMappingURL=jobs.js.map