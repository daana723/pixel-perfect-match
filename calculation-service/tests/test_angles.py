import pytest
from app.angles import normalize, signed_difference, opposite

def test_normalize_wraps():
    assert normalize(360) == 0 and normalize(-10) == 350 and normalize(725) == 5

def test_signed_difference_wrap_boundary():
    assert signed_difference(1, 359) == 2
    assert signed_difference(359, 1) == -2
    assert signed_difference(180, 0) == -180

def test_opposite():
    assert opposite(350) == 170

def test_rejects_nan():
    with pytest.raises(ValueError):
        normalize(float("nan"))
