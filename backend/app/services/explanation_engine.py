import json
import logging
from typing import List, Dict, Any, Optional
from app.models.schemas import (
    AuditResult,
    AssistantResponse,
    FindingExplanation,
    Severity
)
from app.config import GEMINI_API_KEY, ENABLE_GEMINI
from app.utils.masking import sanitize_for_ai

logger = logging.getLogger(__name__)

# Multilingual Local Explanations Repository
MULTILINGUAL_TEMPLATES = {
    "en": {
        "lang_name": "English",
        "headline": "Pre-Submission Document Readiness Analysis",
        "summary_high": "Critical issues detected. Resolving these discrepancies before official portal submission will prevent delays or rejection.",
        "summary_review": "Minor discrepancies detected. Review the highlighted items to ensure smooth application processing.",
        "summary_pass": "Excellent! Your documents show high concordance across identity, banking, and address records.",
        "checklist": [
            "Verify that your name spelling is identical on Aadhaar and Bank Passbook.",
            "Confirm that the 11-digit IFSC code and branch details are active.",
            "Ensure the address proof matches your current residential ward/panchayat.",
            "Verify all scanned copies are clear, uncropped, and fully legible."
        ],
        "default_rules": {
            "NAME": {
                "title": "Name Spelling Concordance",
                "explanation": "Difference detected in name spelling between documents. Welfare DBT systems require accurate name matching.",
                "action": "Visit your bank branch with your original Aadhaar card to update your passbook name."
            },
            "IFSC": {
                "title": "Bank Branch IFSC Code Verification",
                "explanation": "The IFSC code does not adhere to the 11-character RBI standard format (5th character must be '0').",
                "action": "Check the front page of your latest bank passbook or recent cheque leaf for the correct IFSC."
            },
            "ACC": {
                "title": "Bank Account Number Verification",
                "explanation": "Account number format appears irregular or has missing digits.",
                "action": "Ensure the complete account number (9 to 18 digits) is clearly visible without blur."
            },
            "ADDR": {
                "title": "Residential Address Alignment",
                "explanation": "Discrepancy in PIN code or locality observed between submitted proofs.",
                "action": "Attach a valid local residence certificate or updated utility bill."
            },
            "DOC": {
                "title": "Required Supporting Document",
                "explanation": "A mandatory document required by the scheme rules has not been uploaded.",
                "action": "Upload the missing document before submitting your welfare application."
            }
        }
    },
    "te": {
        "lang_name": "తెలుగు (Telugu)",
        "headline": "దరఖాస్తు సమర్పణకు ముందు పత్రాల సంసిద్ధత పరిశీలన",
        "summary_high": "ముఖ్యమైన పత్రాల తేడాలు గుర్తించబడ్డాయి. దరఖాస్తు తిరస్కరణకు గురికాకుండా ఉండటానికి ముందుగా వీటిని సరిదిద్దుకోండి.",
        "summary_review": "చిన్నపాటి వ్యత్యాసాలు ఉన్నట్లు గుర్తించబడింది. ప్రభుత్వ పోర్టల్‌లో సమర్పించే ముందు వివరాలను సరిచూసుకోండి.",
        "summary_pass": "చాలా బాగుంది! మీ గుర్తింపు, బ్యాంక్ మరియు చిరునామా పత్రాలన్నీ సంపూర్ణంగా సరిపోలుతున్నాయి.",
        "checklist": [
            "ఆధార్ కార్డు మరియు బ్యాంక్ పాస్‌బుక్‌లోని పేరు స్పెల్లింగ్ ఒకేలా ఉందో లేదో సరిచూసుకోండి.",
            "బ్యాంక్ పాస్‌బుక్‌లోని 11 అంకెల IFSC కోడ్ సరిగ్గా ముద్రించబడిందో లేదో ధృవీకరించుకోండి.",
            "చిరునామా ధృవీకరణ పత్రం మీ ప్రస్తుత నివాస ప్రాంతానికే చెందినదని నిర్ధారించుకోండి.",
            "అన్ని పత్రాల ఫోటోలు/స్కాన్లు అక్షరాలు స్పష్టంగా కనిపించేలా అప్‌లోడ్ చేయండి."
        ],
        "default_rules": {
            "NAME": {
                "title": "పేరు స్పెల్లింగ్ సరిపోలిక (Name Matching)",
                "explanation": "గుర్తింపు పత్రం మరియు బ్యాంక్ పాస్‌బుక్‌లోని పేరులో స్పెల్లింగ్ తేడా ఉన్నది. DBT పథకాల ద్వారా నగదు జమ కావడానికి పేరు సమానంగా ఉండాలి.",
                "action": "మీ అసలు ఆధార్ కార్డును తీసుకుని బ్యాంకు శాఖకు వెళ్లి పాస్‌బుక్‌లో సరైన పేరును నమోదు చేయించండి."
            },
            "IFSC": {
                "title": "బ్యాంక్ IFSC కోడ్ నిబంధన (Bank IFSC)",
                "explanation": "నమోదు చేసిన IFSC కోడ్ RBI ప్రమాణాలకు (11 అక్షరాలు, 5వ అక్షరం '0') సరిపోలడం లేదు.",
                "action": "మీ తాజా బ్యాంక్ పాస్‌బుక్ మొదటి పేజీ లేదా చెక్కు పుస్తకం చూసి సరైన IFSC కోడ్‌ను తనిఖీ చేయండి."
            },
            "ACC": {
                "title": "బ్యాంక్ ఖాతా సంఖ్య (Account Number)",
                "explanation": "ఖాతా సంఖ్యలో అంకెలు సరిగ్గా కనిపించడం లేదు లేదా అసంపూర్ణంగా ఉన్నాయి.",
                "action": "బ్యాంక్ పాస్‌బుక్ స్పష్టమైన ఫోటోను అప్‌లోడ్ చేసి ఖాతా సంఖ్య (9-18 అంకెలు) సరిగ్గా ఉండేలా చూడండి."
            },
            "ADDR": {
                "title": "నివాస చిరునామా పరిశీలన (Address Check)",
                "explanation": "పత్రాల మధ్య పిన్ కోడ్ లేదా గ్రామ/మండల చిరునామాలో తేడాలు ఉన్నట్లు కనిపించాయి.",
                "action": "ప్రస్తుత నివాస ధృవీకరణ పత్రం లేదా విద్యుత్ బిల్లు జత చేయండి."
            },
            "DOC": {
                "title": "తప్పనిసరి పత్రం అవసరం (Mandatory Document)",
                "explanation": "ఈ ప్రభుత్వ సంక్షేమ పథకానికి అవసరమైన ఒక ముఖ్యమైన పత్రం అప్‌లోడ్ చేయబడలేదు.",
                "action": "దరఖాస్తు పూర్తి కావడానికి తప్పనిసరి పత్రాన్ని జతచేయండి."
            }
        }
    },
    "hi": {
        "lang_name": "हिन्दी (Hindi)",
        "headline": "आवेदन पूर्व दस्तावेज़ सत्यापन एवं तत्परता विश्लेषण",
        "summary_high": "महत्वपूर्ण विसंगतियां पाई गई हैं। आवेदन अस्वीकृति या विलंब से बचने के लिए सरकारी पोर्टल पर जमा करने से पहले इन्हें ठीक करें।",
        "summary_review": "कुछ अंतर पाए गए हैं। सुचारू आवेदन प्रक्रिया सुनिश्चित करने के लिए चिन्हित बिंदुओं की समीक्षा करें।",
        "summary_pass": "बहुत अच्छा! आपके सभी पहचान, बैंक और पते के दस्तावेज़ पूरी तरह सुसंगत हैं।",
        "checklist": [
            "जांचें कि आधार कार्ड और बैंक पासबुक में नाम की स्पेलिंग बिल्कुल एक जैसी हो।",
            "पुष्टि करें कि 11-अंकों का IFSC कोड सही और शाखा सक्रिय है।",
            "सुनिश्चित करें कि निवास प्रमाण पत्र आपके वर्तमान वार्ड/ग्राम से मेल खाता है।",
            "सभी अपलोड किए गए दस्तावेज़ स्पष्ट, सीधे और पढ़ने योग्य होने चाहिए।"
        ],
        "default_rules": {
            "NAME": {
                "title": "नाम की वर्तनी का मिलान (Name Match)",
                "explanation": "पहचान पत्र और बैंक पासबुक में नाम की वर्तनी (Spelling) में अंतर है। प्रत्यक्ष लाभ अंतरण (DBT) के लिए नाम समान होना आवश्यक है।",
                "action": "अपने मूल आधार कार्ड के साथ बैंक शाखा में जाएं और पासबुक में सही नाम दर्ज करवाएं।"
            },
            "IFSC": {
                "title": "बैंक आईएफएससी कोड सत्यापन (IFSC Code)",
                "explanation": "दर्ज किया गया IFSC कोड आरबीआई के 11-अक्षरीय मानक (5वां अक्षर शून्य '0') के अनुरूप नहीं है।",
                "action": "अपनी बैंक पासबुक के मुख्य पृष्ठ या चेक से सही IFSC कोड देखकर पुष्टि करें।"
            },
            "ACC": {
                "title": "बैंक खाता संख्या सत्यापन (Bank Account)",
                "explanation": "खाता संख्या के अंक अस्पष्ट या अपूर्ण प्रतीत होते हैं।",
                "action": "पासबुक की स्पष्ट प्रति अपलोड करें ताकि पूरी खाता संख्या (9-18 अंक) दिखाई दे।"
            },
            "ADDR": {
                "title": "निवास पते की सुसंगतता (Address Verification)",
                "explanation": "दस्तावेज़ों के बीच पिन कोड या ग्राम/मोहल्ले के पते में अंतर पाया गया।",
                "action": "वर्तमान निवास प्रमाण पत्र या राशन कार्ड संलग्न करें।"
            },
            "DOC": {
                "title": "अनिवार्य दस्तावेज़ अनुपलब्ध (Required Document)",
                "explanation": "योजना के नियमों के अनुसार आवश्यक दस्तावेज़ अपलोड नहीं किया गया है।",
                "action": "आवेदन पूरा करने के लिए आवश्यक दस्तावेज़ अपलोड करें।"
            }
        }
    }
}

def generate_local_explanations(
    audit_result: AuditResult,
    lang: str = "en"
) -> AssistantResponse:
    """
    Generates deterministic, high-quality multilingual explanations and recommendations
    without relying on external network/API calls.
    """
    t = MULTILINGUAL_TEMPLATES.get(lang, MULTILINGUAL_TEMPLATES["en"])

    if audit_result.high_priority_count > 0:
        summary_text = t["summary_high"]
    elif audit_result.review_required_count > 0:
        summary_text = t["summary_review"]
    else:
        summary_text = t["summary_pass"]

    finding_explanations: List[FindingExplanation] = []
    step_guidance: List[str] = []

    for finding in audit_result.findings:
        if finding.severity == Severity.PASSED:
            continue

        rule_key = "NAME"
        fid = finding.id.upper()
        if "IFSC" in fid:
            rule_key = "IFSC"
        elif "ACC" in fid:
            rule_key = "ACC"
        elif "ADDR" in fid or "PIN" in fid:
            rule_key = "ADDR"
        elif "DOC" in fid or "FIELD" in fid:
            rule_key = "DOC"

        rule_info = t["default_rules"].get(rule_key, t["default_rules"]["NAME"])

        # Add specific context if available
        custom_exp = f"{rule_info['explanation']} ({finding.field_name}: '{finding.doc_a_value or ''}')"
        if finding.doc_b_value and finding.doc_b_name:
            custom_exp += f" vs '{finding.doc_b_value}' in {finding.doc_b_name}."

        fe = FindingExplanation(
            finding_id=finding.id,
            field_name=finding.field_name,
            severity=finding.severity,
            title=rule_info["title"],
            simple_explanation=custom_exp,
            action_step=rule_info["action"]
        )
        finding_explanations.append(fe)
        step_guidance.append(f"{rule_info['title']}: {rule_info['action']}")

    if not step_guidance:
        if lang == "te":
            step_guidance.append("మీ పత్రాలు అన్నీ సరిగ్గా ఉన్నాయి. సంక్షేమ పథక పోర్టల్‌లో నేరుగా సమర్పించవచ్చు.")
        elif lang == "hi":
            step_guidance.append("आपके सभी दस्तावेज़ सही हैं। आप आधिकारिक पोर्टल पर सुरक्षित रूप से आवेदन जमा कर सकते हैं।")
        else:
            step_guidance.append("All document checks passed. You can proceed with official welfare portal submission.")

    return AssistantResponse(
        language=lang,
        language_name=t["lang_name"],
        headline=t["headline"],
        summary=summary_text,
        checklist=t["checklist"],
        finding_explanations=finding_explanations,
        step_by_step_guidance=step_guidance,
        source="deterministic_template"
    )

def generate_assistant_explanation(
    audit_result: AuditResult,
    lang: str = "en"
) -> AssistantResponse:
    """
    Orchestrates multilingual explanations:
    - Uses local fallback by default or if Gemini is disabled.
    - If Gemini API key is configured, uses Gemini with masked inputs to enrich explanations.
    """
    # 1. Generate guaranteed deterministic baseline
    base_response = generate_local_explanations(audit_result, lang)

    if not ENABLE_GEMINI:
        return base_response

    # Optional: Call Gemini if key is provided
    try:
        import requests
        # Prepare strictly sanitized/masked findings
        sanitized_findings = [
            {
                "field": f.field_name,
                "severity": f.severity.value,
                "rule": f.validation_rule,
                "explanation": f.explanation
            }
            for f in audit_result.findings if f.severity != Severity.PASSED
        ]

        prompt = (
            f"You are SetuCheck, an explainable pre-submission welfare document auditor. "
            f"Provide compassionate, plain-language guidance in {base_response.language_name} for a citizen applying for {audit_result.scheme_name}. "
            f"Issues found: {json.dumps(sanitized_findings)}. "
            f"Provide JSON with keys: 'summary' (str), 'step_by_step_guidance' (list of strings). "
            f"Do NOT invent government policies or rules. Keep it clear and respectful."
        )

        headers = {"Content-Type": "application/json"}
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"}
        }
        res = requests.post(url, headers=headers, json=payload, timeout=8)
        if res.status_code == 200:
            res_data = res.json()
            cand_text = res_data["candidates"][0]["content"]["parts"][0]["text"]
            parsed = json.loads(cand_text)
            if "summary" in parsed and parsed["summary"]:
                base_response.summary = parsed["summary"]
            if "step_by_step_guidance" in parsed and parsed["step_by_step_guidance"]:
                base_response.step_by_step_guidance = parsed["step_by_step_guidance"]
            base_response.source = "gemini"
    except Exception as e:
        logger.warning(f"Gemini API request failed, falling back to deterministic templates: {e}")

    return base_response
