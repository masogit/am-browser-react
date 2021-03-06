let status = {
  "SUCCESSFULL" : {
    status: "ok",
    text: 'Completed successfully'
  },
  "SUCESSFULL" : {
    status: "ok",
    text: 'Completed successfully'
  },
  "FAILED" : {
    status: "critical",
    text: 'Failed'
  },
  "DISABLED" : {
    status: "disabled",
    text: 'Disabled'
  },
  "PASSED_WITH_WARNINGS" : {
    status: "warning",
    text: 'Passed with warnings'
  },
  "SUCCESSFULL_WITH_WARNINGS" : {
    status: "warning",
    text: 'Completed with warnings'
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
  },
  "RUNNING" : {
    status: "running",
    text: 'Running'
  }
};

export default (type) => {
  return status[type] || status.UNKNOWN;
};
