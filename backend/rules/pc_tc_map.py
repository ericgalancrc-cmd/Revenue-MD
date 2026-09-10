"""
CPT codes with a well-established professional/technical component split
(modifier 26 = professional component, TC = technical component). When a
physician bills one of these codes for a service performed in a facility
setting (the facility owns the equipment), the professional component
modifier is typically required — the facility bills the technical
component separately. This is a narrow, well-documented reference set,
not exhaustive.
"""
from __future__ import annotations
from typing import Dict

# CPT code -> short description, for message building
PC_TC_SPLIT_CODES: Dict[str, str] = {
    "93000": "ECG with interpretation and report",
    "93005": "ECG, tracing only",
    "93010": "ECG, interpretation and report only",
    "71046": "Chest X-ray, 2 views",
    "71047": "Chest X-ray, 3 views",
    "73030": "Shoulder X-ray",
    "73110": "Wrist X-ray",
    "73562": "Knee X-ray, 3 views",
    "76700": "Abdominal ultrasound, complete",
    "93306": "Echocardiography, complete",
}

# Facility place-of-service codes where the facility (not the billing
# physician) typically owns the equipment.
FACILITY_POS: set = {"19", "21", "22", "23"}  # off-campus/on-campus outpatient, inpatient, ER
