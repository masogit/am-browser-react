export const statusAdapter = {
  "SUCESSFULL" : {
    status: "ok",
    text: 'Completed successfully'
  },
  "FAILED" : {
    status: "critical",
    text: 'Failed'
  },
  "SUCCESS_WITH_WARNINGS" : {
    status: "warning",
    text: 'Completed with warnings'
  },
  "DID_NOT_RUN" : {
    status: "disabled",
    text: 'Did not run'
  },
  "NEVER_RUN": {
    status: "disabled",
    text: 'Did not run'
  },
  "PASSED_WITH_FAILURES" : {
    status: "warning",
    text: 'Completed with failures'
  },
  "UNKNOWN" : {
    status: "unknown",
    text: 'Unknown'
  },
  "PREPARING_TO_RUN" : {
    status: "unknown",
    text: 'Preparing to run'
  }
};
