import os
from pathlib import Path
from typing import Tuple, Optional, Dict, Any
import cv2
import numpy as np
from PIL import Image

try:
    import pytesseract
    default_win_tesseract = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    if os.path.exists(default_win_tesseract):
        pytesseract.pytesseract.tesseract_cmd = default_win_tesseract
    TESSERACT_AVAILABLE = True
except Exception:
    TESSERACT_AVAILABLE = False

def deskew_image(image: np.ndarray) -> np.ndarray:
    """
    Detects skew angle and rotates image upright.
    Improves OCR accuracy for angled mobile phone scans.
    """
    try:
        # Convert to binary
        coords = np.column_stack(np.where(image > 0))
        if len(coords) < 100:
            return image
        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle

        # Only deskew if significant skew (< 30 degrees)
        if abs(angle) > 0.5 and abs(angle) < 35:
            (h, w) = image.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, angle, 1.0)
            rotated = cv2.warpAffine(
                image, M, (w, h),
                flags=cv2.INTER_CUBIC,
                borderMode=cv2.BORDER_REPLICATE
            )
            return rotated
    except Exception:
        pass
    return image

def preprocess_image_for_ocr(image_path: Path) -> np.ndarray:
    """
    Applies comprehensive computer vision preprocessing:
    - Grayscale conversion
    - Resize scaling for small document scans
    - Noise filtering with Gaussian blur
    - Deskewing / orientation correction
    - Otsu adaptive thresholding
    """
    img = cv2.imread(str(image_path))
    if img is None:
        raise ValueError(f"Failed to read image at {image_path}")

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Resize if resolution is low
    h, w = gray.shape
    if w < 1000:
        scale = 1000.0 / w
        gray = cv2.resize(gray, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)

    # Gaussian blur to filter out high-frequency scanner/sensor noise
    blurred = cv2.GaussianBlur(gray, (3, 3), 0)

    # Otsu thresholding
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Deskew
    corrected = deskew_image(thresh)
    return corrected

def run_image_ocr(image_path: Path) -> Tuple[str, float, bool]:
    """
    Extracts text from an image file using Tesseract if installed,
    with OpenCV preprocessing.
    Returns: (extracted_text, confidence, success)
    """
    if not image_path.exists():
        return "", 0.0, False

    try:
        preprocessed = preprocess_image_for_ocr(image_path)

        if TESSERACT_AVAILABLE:
            try:
                custom_config = r'--oem 3 --psm 6'
                text = pytesseract.image_to_string(preprocessed, config=custom_config)
                data = pytesseract.image_to_data(preprocessed, output_type=pytesseract.Output.DICT)
                confs = [int(c) for c in data['conf'] if str(c).isdigit() and int(c) > 0]
                avg_conf = (sum(confs) / len(confs) / 100.0) if confs else 0.75

                if text.strip():
                    return text.strip(), avg_conf, True
            except Exception:
                pass

        return "[Scanned Image document: OCR engine not configured on system, manual verification recommended]", 0.5, False

    except Exception as e:
        return f"[Image processing error: {str(e)}]", 0.0, False
