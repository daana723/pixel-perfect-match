"""Offline file-based private calculation. Never starts an HTTP listener."""
import argparse
import json
from pathlib import Path
from .astronomy import calculate_pair
from .ephemeris import SwissEphemerisAdapter
from .experimental import search_candidates

def main():
    parser = argparse.ArgumentParser(description="Private astronomy; not historical birth-time rectification.")
    parser.add_argument("archive", type=Path)
    parser.add_argument("--case-index", type=int, required=True)
    parser.add_argument("--local-time", required=True)
    parser.add_argument("--assumption-index", type=int, required=True)
    parser.add_argument("--ephemeris-path", type=Path, required=True)
    parser.add_argument("--topocentric", action="store_true")
    parser.add_argument("--search-experimental", action="store_true")
    parser.add_argument("--step-seconds", type=float, default=60)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    try:
        archive = json.loads(args.archive.read_text())
        if archive.get("format") != "hermes-trutine" or archive.get("version") != 1:
            raise ValueError("A version 1 Hermes case archive is required.")
        if args.case_index < 0:
            raise ValueError("Case index must be nonnegative.")
        record = archive["cases"][args.case_index]
        adapter = SwissEphemerisAdapter(args.ephemeris_path)
        result = calculate_pair(record, args.local_time, args.assumption_index, adapter, args.topocentric)
        if args.search_experimental:
            result = search_candidates(record, result, adapter, args.step_seconds)
        args.output.write_text(json.dumps(result, indent=2, ensure_ascii=False, allow_nan=False))
        print("Private natal/prenatal calculations written. No historical rule was applied.")
    except (ValueError, KeyError, IndexError, RuntimeError) as error:
        parser.exit(1, f"Calculation refused: {error}\n")

if __name__ == "__main__":
    main()