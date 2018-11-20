# Improvements to original bustimings

## Security
  - [X] Added CSP and other security headers to block XSS
  - [X] Docker container does not have to run as root
  - [X] Loads LTA API over HTTPS
  - [X] Requires HTTPS
  
## Performance
  - [X] Reduced docker image size

    | Version             | Size  | Base image   |
    | ------------------- | ----- | ------------ |
    | Original busTimings | 504MB | Ubuntu 16.04 |
    | New busTimings      | 83MB  | Alpine 3.8   |
  - [X] Uses WebSockets to eliminate polling overhead

## Accessibility
  - [X] Works on mobile devices as well as larger screens
  - [X] Works even if server is down or user is offline*
  - [X] Uses HTTP polling if WebSocket is blocked or unavailable

*Does not work in Internet explorer. Only shows cached data.