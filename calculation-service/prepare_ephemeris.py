"""Retrieve pinned official test files locally, preserving provenance; never deploy."""
from hashlib import sha256
from pathlib import Path
import argparse
from urllib.request import urlopen
from app.ephemeris import FILES

def main():
    parser = argparse.ArgumentParser(description="Download Swiss data for approved private AGPL testing.")
    parser.add_argument("--destination", type=Path, required=True)
    args = parser.parse_args()
    args.destination.mkdir(parents=True, exist_ok=True)
    for name, expected in FILES.items():
        with urlopen(f"https://raw.githubusercontent.com/aloistr/swisseph/master/ephe/{name}", timeout=60) as response:
            data = response.read()
        if sha256(data).hexdigest() != expected:
            raise RuntimeError(f"Upstream file changed: {name}. Review before approving a new hash.")
        (args.destination / name).write_bytes(data)
        print(f"Verified {name}: {expected}")

if __name__ == "__main__":
    main()