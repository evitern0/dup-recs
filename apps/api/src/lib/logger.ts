let requestCounter = 0;

function nextRequestId() {
  requestCounter += 1;
  return `req_${String(requestCounter).padStart(8, '0')}`;
}

export function createRequestId() {
  return nextRequestId();
}

export function logEvent(level, event, data = {}) {
  const payload = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...data
  };

  const target = level === 'error' ? console.error : console.log;
  target(JSON.stringify(payload));
}

export function redactError(error) {
  return {
    message: error?.message ?? 'unknown error',
    code: error?.code ?? 'UNKNOWN_ERROR'
  };
}
