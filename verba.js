const API_URL = "https://api.verba.ink/v1/response";

const MAX_CONCURRENT_REQUESTS = Number(process.env.VERBA_MAX_CONCURRENT || 2);
const MAX_QUEUE_SIZE = Number(process.env.VERBA_MAX_QUEUE || 50);
const MAX_RETRIES = 2;

let activeRequests = 0;
const queue = [];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function processQueue() {
  while (activeRequests < MAX_CONCURRENT_REQUESTS && queue.length > 0) {
    const job = queue.shift();
    activeRequests++;

    runRequest(job.options)
      .then(job.resolve, job.reject)
      .finally(() => {
        activeRequests--;
        processQueue();
      });
  }
}

function enqueue(options) {
  if (queue.length >= MAX_QUEUE_SIZE) {
    throw new Error("VERBA_QUEUE_FULL");
  }

  return new Promise((resolve, reject) => {
    queue.push({ options, resolve, reject });
    processQueue();
  });
}

async function runRequest({ apiKey, character, sessionId, messages }) {
  const body = { character, messages, stream: false };
  if (sessionId) body.session_id = sessionId;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    let response;

    try {
      response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120_000)
      });
    } catch (error) {
      if (attempt < MAX_RETRIES) {
        await sleep(1000 * 2 ** attempt);
        continue;
      }
      throw new Error("VERBA_NETWORK_ERROR");
    }

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      return {
        content: data?.choices?.[0]?.message?.content?.trim() || "",
        sessionId: data?.session_id || sessionId || null
      };
    }

    if ([502, 503, 504].includes(response.status) && attempt < MAX_RETRIES) {
      await sleep(1000 * 2 ** attempt);
      continue;
    }

    if (response.status === 401) throw new Error("VERBA_AUTH_ERROR");
    if (response.status === 403) throw new Error("VERBA_PLAN_ERROR");
    if (response.status === 429) throw new Error("VERBA_RATE_LIMIT");
    if ([502, 503, 504].includes(response.status)) throw new Error("VERBA_UNAVAILABLE");

    throw new Error(
      data?.error?.message ||
      data?.message ||
      `VERBA_HTTP_${response.status}`
    );
  }

  throw new Error("VERBA_UNAVAILABLE");
}

export function generateReply(options) {
  return enqueue(options);
}

export function getQueueStats() {
  return {
    active: activeRequests,
    queued: queue.length,
    maxConcurrent: MAX_CONCURRENT_REQUESTS,
    maxQueue: MAX_QUEUE_SIZE
  };
}
