#!/usr/bin/env python3
"""Serve the prototype to phones on the same local network."""

from __future__ import annotations

import argparse
import os
import socket
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def announce(message: str = "") -> None:
    print(message, flush=True)


class PrototypeHandler(SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()


def local_ipv4_addresses() -> list[str]:
    addresses: set[str] = set()
    try:
        for result in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            address = result[4][0]
            if not address.startswith("127."):
                addresses.add(address)
    except socket.gaierror:
        pass

    try:
        probe = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        probe.connect(("8.8.8.8", 80))
        addresses.add(probe.getsockname()[0])
        probe.close()
    except OSError:
        pass

    return sorted(addresses)


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve the mobile drawer prototype over LAN.")
    parser.add_argument("--port", type=int, default=4173, help="TCP port (default: 4173)")
    args = parser.parse_args()

    os.chdir(ROOT)
    server = ThreadingHTTPServer(("0.0.0.0", args.port), PrototypeHandler)

    announce("\nMobile prototype is ready:")
    announce(f"  This computer: http://127.0.0.1:{args.port}")
    addresses = local_ipv4_addresses()
    for address in addresses:
        announce(f"  Phone on same Wi-Fi: http://{address}:{args.port}")
    if not addresses:
        announce("  No LAN address detected. Connect both devices to the same Wi-Fi and retry.")
    announce("\nPress Ctrl+C to stop.\n")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        announce("\nServer stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
