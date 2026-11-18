"""
Deterministic validation rule definitions and weights for SetuCheck.
All scoring and classifications are transparent, rule-driven, and auditable.
"""

# Deductions for transparent scoring (Base score: 100)
SCORE_WEIGHTS = {
    "CRITICAL_NAME_MISMATCH": 25,
    "MINOR_NAME_VARIATION": 10,
    "INVALID_IFSC_FORMAT": 25,
    "MISSING_BANK_ACCOUNT": 30,
    "INVALID_BANK_ACCOUNT_FORMAT": 20,
    "ADDRESS_DISTRICT_MISMATCH": 20,
    "ADDRESS_MINOR_DIFFERENCE": 8,
    "MISSING_REQUIRED_DOCUMENT": 25,
    "MISSING_MANDATORY_FIELD": 15,
    "DOB_MISMATCH": 20,
    "LOW_CONFIDENCE_EXTRACTION": 10,
}

# Standard RBI IFSC Format
# 4 uppercase letters, then '0', then 6 alphanumeric characters
IFSC_REGEX = r'^[A-Z]{4}0[A-Z0-9]{6}$'

# Common Indian Address Abbreviations for normalization
ADDRESS_ABBREVIATIONS = {
    r'\bstr\b': 'street',
    r'\brd\b': 'road',
    r'\bave\b': 'avenue',
    r'\bvill\b': 'village',
    r'\bvlg\b': 'village',
    r'\bdist\b': 'district',
    r'\bdt\b': 'district',
    r'\bteh\b': 'tehsil',
    r'\bmand\b': 'mandal',
    r'\bmdl\b': 'mandal',
    r'\bpo\b': 'post office',
    r'\bps\b': 'police station',
    r'\bh\.?no\.?\b': 'house number',
    r'\bd\.?no\.?\b': 'door number',
    r'\bflt\b': 'flat',
    r'\bapt\b': 'apartment',
    r'\bn\.?g\.?r\b': 'nagar',
    r'\bcol\b': 'colony',
    r'\bap\b': 'andhra pradesh',
    r'\bts\b': 'telangana',
    r'\bup\b': 'uttar pradesh',
    r'\bmp\b': 'madhya pradesh',
}
