TEST_QUERIES = [
    {
        "id": "TC001",
        "category": "Complex Polypharmacy & Organ Risk",
        "complexity": "Complex",
        "query": "Can a diabetic patient with chronic kidney disease who is taking Warfarin safely use Ibuprofen?",
        "expected_safety_verdict": "CONTRAINDICATED",
        "expected_risk_factors": ["Warfarin + Ibuprofen GI Bleeding", "Ibuprofen in CKD Acute Renal Vasoconstriction"],
        "critical_contraindication_present": True
    },
    {
        "id": "TC002",
        "category": "Infectious Disease Symptoms",
        "complexity": "Simple",
        "query": "What are the core clinical symptoms and presentation of Dengue Fever?",
        "expected_safety_verdict": "INFORMATIONAL",
        "expected_risk_factors": ["Thrombocytopenia warning with NSAIDs"],
        "critical_contraindication_present": False
    },
    {
        "id": "TC003",
        "category": "Renal Dose Adjustment & Guideline",
        "complexity": "Moderate",
        "query": "What is the KDIGO and ADA guideline recommendation for Metformin dosage in patients with declining kidney function?",
        "expected_safety_verdict": "CAUTION_DOSE_ADJUST",
        "expected_risk_factors": ["Metformin in eGFR < 30 lactic acidosis risk"],
        "critical_contraindication_present": True
    },
    {
        "id": "TC004",
        "category": "Cardiovascular Drug Interaction",
        "complexity": "Complex",
        "query": "Can a hypertensive patient taking Lisinopril safely add Spironolactone without monitoring?",
        "expected_safety_verdict": "MODERATE_RISK_MONITOR",
        "expected_risk_factors": ["Hyperkalemia risk with dual RAAS blockade"],
        "critical_contraindication_present": False
    }
]
