# Incident Report: DB Leaky Connections

## 1. Metrics Analysis (Prometheus)
- **Endpoint**: `/students/db-leaky-connections`
- **Pattern Observed**: The first two requests succeeded (HTTP 200) with response times around ~15ms. Subsequent requests failed (HTTP 500) consistently with a 100% failure rate.
- **Response Times**: The failed requests exhibited response times of ~1000ms, indicating a timeout when waiting for a resource. This matches the `connectionTimeoutMillis: 1000` pool configuration.

## 2. Logs Analysis (Loki)
- **Error Pattern**: A clear pattern emerged showing successful initial requests followed entirely by failures.
- **Extracted Error Message**: `timeout exceeded when trying to connect`
- **Stack Traces**: The error originated from `pool.connect` at `main.ts:51` which was called by the handler at `main.ts:84`.
- **Correlation**: The 1000ms timeout in the logs perfectly matches the slow response times seen in the Prometheus metrics for the 500 errors.

## 3. Traces Analysis (Tempo)
- **Span Hierarchy**: The HTTP request span encapsulates database operation spans.
- **Observations**: For the successful requests, the database query spans are present, but there are NO cleanup or connection release spans after the queries complete. 
- **Error Spans**: For the failed requests, the trace includes an error exception noting the connection pool timeout, correlating exactly with the `timeout exceeded when trying to connect` log.

## 4. Root Cause Analysis
- **Root Cause**: A database connection leak. Connections are acquired using `this.pool.connect()` but are never released back to the pool using `client.release()`.
- **Exact Location**: `c:\DEV\Unipds\exemplo-09-grafana-mcp\alumnus\_alumnus\src\scenarios\db-leaky-connections\main.ts` around line 84.
- **Mechanism**: The pool is limited to 2 connections. The first two requests exhaust the pool. Because `client.release()` is never called, the connections remain checked out indefinitely. The third and subsequent requests wait for a connection until they hit the 1000ms timeout, throwing the error that results in the 500 status.

## 5. Diagnosis Table
| Telemetry Data | Observation | Implication |
| --- | --- | --- |
| **Metrics** | 2 successes, then 100% 500s | Pool of size 2 is exhausted and not recovering. |
| **Metrics** | 500 errors take ~1000ms | Requests are hitting a 1s timeout waiting for a resource. |
| **Logs** | "timeout exceeded when trying to connect" | The resource being waited on is the DB connection pool. |
| **Traces** | Missing DB cleanup/release spans | Connections are acquired but never explicitly released. |

## 6. Resolution
Added a `try...finally` block in `main.ts` to ensure `client.release()` is called unconditionally after the database query finishes, whether it succeeds or fails.
