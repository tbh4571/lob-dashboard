#!/usr/bin/env bash
# Start/stop/restart the BFF + web dev servers as detached background
# processes, so they survive after this script exits.
#
# Usage:
#   ./scripts/dev.sh start     # start both (no-op if already running)
#   ./scripts/dev.sh stop      # stop both
#   ./scripts/dev.sh restart   # stop then start both
#   ./scripts/dev.sh status    # show whether each is up
#   ./scripts/dev.sh logs      # tail both logs (Ctrl+C to stop tailing)
#   ./scripts/dev.sh logs bff  # tail just the BFF log
#   ./scripts/dev.sh logs web  # tail just the web log

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_DIR="$ROOT_DIR/.dev"
BFF_PORT=4000
WEB_PORT=5173

mkdir -p "$RUN_DIR"

BFF_LOG="$RUN_DIR/bff.log"
WEB_LOG="$RUN_DIR/web.log"
BFF_PID_FILE="$RUN_DIR/bff.pid"
WEB_PID_FILE="$RUN_DIR/web.pid"

port_pid() {
  lsof -ti "tcp:$1" -sTCP:LISTEN 2>/dev/null || true
}

is_up() {
  [ -n "$(port_pid "$1")" ]
}

start_bff() {
  if is_up "$BFF_PORT"; then
    echo "BFF already running on :$BFF_PORT"
    return
  fi
  echo "Starting BFF on :$BFF_PORT..."
  (cd "$ROOT_DIR" && nohup npm run dev:bff > "$BFF_LOG" 2>&1 & echo $! > "$BFF_PID_FILE")
  for _ in $(seq 1 20); do
    is_up "$BFF_PORT" && break
    sleep 0.5
  done
  if is_up "$BFF_PORT"; then
    echo "BFF up (pid $(port_pid "$BFF_PORT"))"
  else
    echo "BFF failed to start — see $BFF_LOG" >&2
    tail -n 30 "$BFF_LOG" >&2 || true
    exit 1
  fi
}

start_web() {
  if is_up "$WEB_PORT"; then
    echo "Web already running on :$WEB_PORT"
    return
  fi
  echo "Starting web on :$WEB_PORT..."
  (cd "$ROOT_DIR/apps/web" && nohup npx vite > "$WEB_LOG" 2>&1 & echo $! > "$WEB_PID_FILE")
  for _ in $(seq 1 20); do
    is_up "$WEB_PORT" && break
    sleep 0.5
  done
  if is_up "$WEB_PORT"; then
    echo "Web up (pid $(port_pid "$WEB_PORT"))"
  else
    echo "Web failed to start — see $WEB_LOG" >&2
    tail -n 30 "$WEB_LOG" >&2 || true
    exit 1
  fi
}

stop_port() {
  local port="$1" name="$2"
  local pid
  pid="$(port_pid "$port")"
  if [ -z "$pid" ]; then
    echo "$name already stopped"
    return
  fi
  echo "Stopping $name (pid $pid)..."
  kill $pid 2>/dev/null || true
  for _ in $(seq 1 10); do
    is_up "$port" || break
    sleep 0.3
  done
  if is_up "$port"; then
    kill -9 $(port_pid "$port") 2>/dev/null || true
  fi
}

cmd_start() {
  start_bff
  start_web
}

cmd_stop() {
  stop_port "$BFF_PORT" "BFF"
  stop_port "$WEB_PORT" "web"
  rm -f "$BFF_PID_FILE" "$WEB_PID_FILE"
}

cmd_status() {
  if is_up "$BFF_PORT"; then
    echo "BFF:  up   (:$BFF_PORT, pid $(port_pid "$BFF_PORT"))"
  else
    echo "BFF:  down (:$BFF_PORT)"
  fi
  if is_up "$WEB_PORT"; then
    echo "web:  up   (:$WEB_PORT, pid $(port_pid "$WEB_PORT"))"
  else
    echo "web:  down (:$WEB_PORT)"
  fi
}

cmd_logs() {
  case "${1:-}" in
    bff) tail -n 50 -f "$BFF_LOG" ;;
    web) tail -n 50 -f "$WEB_LOG" ;;
    *) tail -n 30 -f "$BFF_LOG" "$WEB_LOG" ;;
  esac
}

case "${1:-}" in
  start) cmd_start ;;
  stop) cmd_stop ;;
  restart) cmd_stop; cmd_start ;;
  status) cmd_status ;;
  logs) shift; cmd_logs "${1:-}" ;;
  *)
    echo "Usage: $0 {start|stop|restart|status|logs [bff|web]}" >&2
    exit 1
    ;;
esac
