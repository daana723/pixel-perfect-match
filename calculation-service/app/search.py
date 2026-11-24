"""Generic candidate search over a time interval. Ephemeris-agnostic: the caller supplies
residual functions. Keeps every orientation separate; reports minima of a declared objective,
never claims simultaneous roots or probabilities."""
from dataclasses import dataclass
import math
from typing import Callable

Objective = Callable[[float], float]

@dataclass(frozen=True)
class Minimum:
    orientation: str
    jd_ut: float
    objective: float

def scan_minima(f: Objective, start: float, end: float, step: float, tol: float = 1e-7) -> list[tuple[float, float]]:
    if not all(math.isfinite(v) for v in (start, end, step, tol)) or end < start or step <= 0 or tol <= 0 or (end - start) / step > 10000:
        raise ValueError("Invalid scan interval.")
    if end == start:
        return [(start, f(start))]
    xs, x = [], start
    while x < end:
        xs.append(x); x += step
    xs.append(end)
    ys = [f(v) for v in xs]
    out = []
    for i in range(len(xs)):
        left = ys[i - 1] if i > 0 else float("inf")
        right = ys[i + 1] if i < len(xs) - 1 else float("inf")
        if ys[i] <= left and ys[i] <= right:
            a, b = xs[max(i - 1, 0)], xs[min(i + 1, len(xs) - 1)]
            refined = _golden(f, a, b, tol)
            # Keep a true boundary minimum instead of nudging it into the interval.
            out.append(min([refined, (xs[i], ys[i])], key=lambda pair: pair[1]))
    return _dedupe(out, tol * 2)

def _golden(f, a, b, tol):
    g = (5 ** 0.5 - 1) / 2
    c, d = b - g * (b - a), a + g * (b - a)
    while abs(b - a) > tol:
        if f(c) < f(d): b = d
        else: a = c
        c, d = b - g * (b - a), a + g * (b - a)
    x = (a + b) / 2
    return x, f(x)

def _dedupe(items, tol):
    items.sort()
    result = []
    for x, y in items:
        if result and abs(x - result[-1][0]) <= tol:
            if y < result[-1][1]: result[-1] = (x, y)
        else:
            result.append((x, y))
    return result

def search_orientations(objectives: dict[str, Objective], start: float, end: float, step: float) -> list[Minimum]:
    """Each orientation is searched independently; results are never merged across orientations."""
    return [Minimum(o, x, y) for o, f in objectives.items() for x, y in scan_minima(f, start, end, step)]
