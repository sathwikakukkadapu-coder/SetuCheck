import re
from typing import List, Optional, Dict, Any
from app.models.schemas import ChatRequest, ChatResponse, AuditResult, Finding
from app.config import GEMINI_API_KEY, ENABLE_GEMINI

SUGGESTIONS_EN = [
    "Why was my IFSC code flagged?",
    "How do I fix a name spelling variation?",
    "What address proofs are accepted?",
    "Can I submit an electricity bill?",
    "How does the readiness score work?"
]

SUGGESTIONS_TE = [
    "నా IFSC కోడ్ ఎందుకు తిరస్కరించబడింది?",
    "బ్యాంక్ పాస్‌బుక్‌లో పేరు ఎలా మార్చుకోవాలి?",
    "చిరునామా రుజువు కోసం ఏ పత్రాలు అవసరం?",
    "దరఖాస్తు సిద్ధత స్కోర్ ఎలా పనిచేస్తుంది?"
]

SUGGESTIONS_HI = [
    "मेरा IFSC कोड क्यों अमान्य बताया गया?",
    "बैंक पासबुक में नाम की स्पेलिंग कैसे सुधारें?",
    "निवास प्रमाण के लिए कौन से दस्तावेज मान्य हैं?",
    "तैयारी स्कोर (Readiness Score) कैसे तय होता है?"
]

def generate_chat_reply(request: ChatRequest) -> ChatResponse:
    """
    Generates an explainable, contextual conversational response from SetuMitra AI Co-Pilot.
    Grounded in the active audit findings, welfare scheme requirements, and regional language.
    """
    user_query = request.message.strip()
    query_lower = user_query.lower()
    lang = request.language.lower() if request.language in ["en", "te", "hi"] else "en"
    audit = request.audit_result
    
    # If Gemini is configured, we can optionally use it with strict grounding
    if ENABLE_GEMINI:
        try:
            import google.generativeai as genai
            genai.configure(api_key=GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-1.5-flash")
            
            grounding_context = f"Scheme: {audit.scheme_name if audit else 'Generic Pre-Submission Audit'}\n"
            if audit:
                grounding_context += f"Readiness Score: {audit.readiness_score}/100\n"
                grounding_context += "Active Findings:\n"
                for f in audit.findings:
                    grounding_context += f"- [{f.severity.value}] {f.field_name}: {f.explanation} (Recommendation: {f.recommended_correction})\n"

            system_instruction = (
                f"You are 'SetuMitra', an explainable AI assistant for pre-submission welfare document auditing in India. "
                f"Reply in language '{lang}' (en = English, te = Telugu, hi = Hindi). "
                f"Be polite, citizen-centric, clear, and reassuring. "
                f"Never claim to be an official government officer or guarantee government acceptance. "
                f"Use this audit context:\n{grounding_context}\n"
                f"Citizen Question: {user_query}"
            )
            gemini_resp = model.generate_content(system_instruction)
            if gemini_resp and gemini_resp.text:
                return ChatResponse(
                    reply=gemini_resp.text.strip(),
                    language=lang,
                    suggested_questions=SUGGESTIONS_TE if lang == "te" else (SUGGESTIONS_HI if lang == "hi" else SUGGESTIONS_EN),
                    referenced_rules=[f.validation_rule for f in (audit.findings if audit else [])[:3]],
                    source="gemini_ai"
                )
        except Exception:
            pass  # Fall back to high-fidelity deterministic grounded engine

    # Grounded Deterministic Civic Knowledge Engine
    reply = ""
    referenced_rules = []

    # 1. IFSC Code Inquiries
    if any(k in query_lower for k in ["ifsc", "ifsc code", "bank code", "ఐఎఫ్ఎస్సీ", "आईएफएससी"]):
        if lang == "te":
            reply = (
                "మీ బ్యాంక్ IFSC కోడ్ ఆర్‌బీఐ (RBI) నిబంధనల ప్రకారం 11 అక్షరాల పొడవు కలిగి ఉండాలి. "
                "ముఖ్యంగా 5వ అక్షరం ఎల్లప్పుడూ అంకె '0' (సున్నా) అయి ఉండాలి, ఆంగ్ల అక్షరం 'O' కాకూడదు. "
                "సలహా: మీ బ్యాంక్ పాస్‌బుక్ మొదటి పేజీని లేదా చెక్ బుక్‌ను సరిచూసి, సంబంధిత బ్రాంచ్ అధికారిక IFSC కోడ్‌ను నమోదు చేయండి."
            )
        elif lang == "hi":
            reply = (
                "भारतीय रिज़र्व बैंक (RBI) के नियमानुसार बैंक IFSC कोड ठीक 11 अक्षरों का होना चाहिए। "
                "सबसे महत्वपूर्ण नियम यह है कि 5वां अक्षर हमेशा शून्य '0' होना चाहिए (अंग्रेजी अक्षर 'O' नहीं)। "
                "सलाह: अपने बैंक पासबुक के मुख्य पृष्ठ या चेकबुक से सही IFSC कोड देखकर आवेदन में सुधार करें।"
            )
        else:
            reply = (
                "Under Reserve Bank of India (RBI) standards, every IFSC code is exactly 11 characters. "
                "The first 4 characters represent the bank name, the 5th character MUST always be the numeric digit '0' (zero, never the letter 'O'), "
                "and the remaining 6 characters identify the branch. "
                "Recommended Action: Check the first folio of your physical bank passbook or cancelled cheque to ensure the 5th character is zero."
            )
        referenced_rules.append("RBI IFSC Format Standard")

    # 2. Name Spelling & Transliteration
    elif any(k in query_lower for k in ["name", "spelling", "mismatch", "రమేష్", "పేరు", "नाम", "वर्तनी"]):
        if lang == "te":
            reply = (
                "ఆధార్ కార్డు మరియు బ్యాంక్ పాస్‌బుక్ మధ్య పేరు స్పెల్లింగ్‌లో తేడా ఉంటే డీబీటీ (DBT) చెల్లింపులు ఆగిపోయే ప్రమాదం ఉంది. "
                "ఉదాహరణకు 'Kumar' మరియు 'Kumer' ఒకేలా పలికినా ప్రభుత్వ సర్వర్లు అక్షరాల సరిపోలికను చూస్తాయి. "
                "సలహా: మీ ఆధార్ కార్డును తీసుకుని మీ హోమ్ బ్రాంచ్‌కు వెళ్లి పాస్‌బుక్‌లో పేరును ఆధార్‌తో సమానంగా మార్చమని దరఖాస్తు ఇవ్వండి."
            )
        elif lang == "hi":
            reply = (
                "आधार कार्ड और बैंक खाते के नाम में वर्तनी (spelling) का अंतर होने पर डीबीटी (DBT) पेंशन या लाभ अटक सकता है। "
                "जैसे 'Kumar' और 'Kumer' क्षेत्रीय उच्चारण में समान हैं, लेकिन कंप्यूटर पोर्टल सख्त मिलान की जांच करते हैं। "
                "सलाह: अपने नजदीकी बैंक शाखा जाकर आधार कार्ड के अनुसार बैंक खाते में सही नाम अपडेट करवाएं।"
            )
        else:
            reply = (
                "When your name is spelled differently across your Identity Proof (Aadhaar) and Bank Passbook (e.g. 'Ramesh Kumar' vs 'Ramesh Kumer'), "
                "automated welfare portals like PFMS/DBT often flag it as a discrepancy. "
                "Recommended Action: Request a name harmonization update at your home bank branch by submitting an Aadhaar self-attested photocopy, "
                "or obtain a Mandal Tehsildar Gazette certificate of alias identity."
            )
        referenced_rules.append("Cross-Document Name Concordance")

    # 3. Address & Electricity Bill
    elif any(k in query_lower for k in ["address", "electricity", "bill", "చిరునామా", "కరెంట్ బిల్లు", "पता", "बिजली बिल"]):
        if lang == "te":
            reply = (
                "అవును, జాతీయ వృద్ధాప్య పింఛను (NOAPS) మరియు సాధారణ సంక్షేమ పథకాలకు గత 3 నెలల తాజా విద్యుత్ బిల్లు లేదా రేషన్ కార్డును చెల్లుబాటు అయ్యే చిరునామా రుజువుగా సమర్పించవచ్చు. "
                "గుర్తుంచుకోండి: విద్యుత్ బిల్లులోని పిన్ కోడ్ మరియు మండలం మీ ఆధార్ కార్డ్‌లోని ప్రాంతంతో ఏకీభవించాలి."
            )
        elif lang == "hi":
            reply = (
                "हाँ, वृद्धावस्था पेंशन (NOAPS) और अधिकांश कल्याणकारी योजनाओं के लिए पिछले 3 महीने का बिजली बिल या राशन कार्ड पते के वैध प्रमाण के रूप में स्वीकार्य है। "
                "ध्यान रखें: बिजली बिल पर उल्लिखित पिन कोड और वार्ड आपके पहचान पत्र के क्षेत्र से मेल खाना चाहिए।"
            )
        else:
            reply = (
                "Yes! Recent electricity utility bills (not older than 3 months) or NFSA Ration Cards are widely accepted as residential address proofs for welfare schemes. "
                "Important requirement: Ensure the 6-digit postal PIN code and locality on the utility bill match the administrative ward/panchayat specified on your application."
            )
        referenced_rules.append("Address Concordance & Utility Proof Standard")

    # 4. Bank Account Number Length / Format
    elif any(k in query_lower for k in ["account", "account number", "ఖాతా", "खाता"]):
        if lang == "te":
            reply = (
                "భారతదేశంలోని అన్ని ప్రముఖ బ్యాంకుల్లో కోర్ బ్యాంకింగ్ ఖాతా నంబర్లు సాధారణంగా 9 నుండి 18 అంకెల మధ్య ఉంటాయి. "
                "మీ ఖాతా నంబర్ 9 అంకెల కంటే తక్కువగా ఉంటే, స్కాన్ చేసేటప్పుడు ముందున్న సున్నాలు (Leading Zeros) కత్తిరించబడి ఉండవచ్చు. "
                "సలహా: పాస్‌బుక్ పైభాగం స్పష్టంగా కనిపించేలా మళ్ళీ స్కాన్ చేయండి."
            )
        elif lang == "hi":
            reply = (
                "भारत में राष्ट्रीयकृत और प्रमुख बैंकों के खाता नंबर 9 से 18 अंकों के बीच होते हैं। "
                "यदि खाता नंबर 9 अंकों से छोटा है, तो हो सकता है स्कैनिंग के दौरान शुरुआती शून्य (0) छूट गए हों। "
                "सलाह: बैंक पासबुक के मुख्य पृष्ठ को साफ और पूरे अंकों के साथ पुनः अपलोड करें।"
            )
        else:
            reply = (
                "Standard Indian core banking systems (SBI, PNB, HDFC, Canara, etc.) require account numbers between 9 and 18 digits. "
                "If your account number was flagged as truncated or short, leading zeros may have been cut off during photography or scanning. "
                "Recommended Action: Re-upload a clear, un-cropped scan of the first passbook folio showing all printed digits."
            )
        referenced_rules.append("Core Banking Account Number Standard")

    # 5. Readiness Score Explanation
    elif any(k in query_lower for k in ["score", "readiness", "స్కోర్", "స్కోరు", "स्कोर"]):
        score = audit.readiness_score if audit else 100
        if lang == "te":
            reply = (
                f"మీ ప్రస్తుత దరఖాస్తు సంసిద్ధత స్కోర్ {score}/100. "
                "ఈ స్కోరు 4 వర్గాలపై ఆధారపడి ఉంటుంది: పత్రాల సంపూర్ణత (30 మార్కులు), పత్రాల మధ్య పోలిక (30 మార్కులు), ఫీల్డ్ ధృవీకరణ (20 మార్కులు), మరియు OCR స్పష్టత (20 మార్కులు). "
                "స్కోర్ 80 కంటే ఎక్కువగా ఉంటే దరఖాస్తును సమర్పించవచ్చని సూచిస్తుంది."
            )
        elif lang == "hi":
            reply = (
                f"आपके आवेदन का वर्तमान तैयारी स्कोर {score}/100 है। "
                "यह स्कोर 4 पैमानों पर आधारित है: दस्तावेजों की पूर्णता (30), आपसी समानता (30), प्रारूप शुद्धता (20), और स्कैन गुणवत्ता (20)। "
                "80 से अधिक का स्कोर सुरक्षित और अस्वीकृति-मुक्त आवेदन का संकेत है।"
            )
        else:
            reply = (
                f"Your current Document Readiness Score is {score}/100. "
                "It is deterministically computed across 4 transparent categories: Completeness (30 pts), Cross-Document Consistency (30 pts), Field Format Validation (20 pts), and Quality/OCR Clarity (20 pts). "
                "A score of 80+ indicates low pre-submission rejection risk. Remember: SetuCheck is a decision support tool, not an official government approval."
            )
        referenced_rules.append("4-Category Readiness Scoring Rubric")

    # General Fallback
    else:
        if lang == "te":
            reply = (
                f"నమస్కారం! నేను సేతుమిత్ర (SetuMitra) AI సహాయకుడిని. మీ దరఖాస్తు పరిశీలనలో ఏవైనా సందేహాలు ఉంటే అడగవచ్చు. "
                f"మీకు బ్యాంక్ పాస్‌బుక్, ఆధార్ కార్డు, IFSC కోడ్ లేదా పిన్ కోడ్ లోపాలను సరిచేసే విధానాన్ని నేను వివరించగలను."
            )
        elif lang == "hi":
            reply = (
                f"नमस्ते! मैं सेतुमित्र (SetuMitra) AI नागरिक सहायक हूँ। आपके दस्तावेज सत्यापन से जुड़े किसी भी सवाल में मैं आपकी सहायता कर सकता हूँ। "
                f"आप बैंक पासबुक, आधार, IFSC कोड या नाम सुधार के बारे में पूछ सकते हैं।"
            )
        else:
            scheme_title = audit.scheme_name if audit else "Welfare Scheme"
            issues = audit.issues_detected if audit else 0
            reply = (
                f"Hello! I am SetuMitra, your civic document auditor assistant. "
                f"For your {scheme_title} dossier, {issues} potential item(s) were analyzed. "
                f"You can ask me how to rectify any flagged field, understand IFSC or name matching rules, or explore accepted supporting proofs."
            )

    return ChatResponse(
        reply=reply,
        language=lang,
        suggested_questions=SUGGESTIONS_TE if lang == "te" else (SUGGESTIONS_HI if lang == "hi" else SUGGESTIONS_EN),
        referenced_rules=referenced_rules or ["Deterministic Civic Verification Standard"],
        source="setumitra_deterministic_grounded"
    )
