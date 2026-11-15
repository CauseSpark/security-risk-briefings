"""Check that writing for non-technical readers stays readable.

Uses the Flesch-Kincaid grade level: 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59.
Markdown tables, code, headings, block quotes, and link targets are left out, because they are
reference material rather than prose. Syllables are estimated with a simple vowel-group rule, so
treat scores as within about one grade.

    python src/readability.py              # check every target in TARGETS
    python src/readability.py FILE.md      # score one file
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Maximum grade level by audience.
TARGETS = {
    "explainers/*.md": 6.0,                     # anyone in the company
    "briefings/executive_summary_*.md": 8.0,    # senior leaders reading quickly
    "templates/status_update_email.md": 6.0,    # read on a phone
}

# Security terms the reader is expected to learn; scored as two syllables so one long
# acronym-heavy term does not dominate a short explainer.
VOCAB = {"authentication": 2, "multi-factor": 2, "vulnerability": 2, "vulnerabilities": 2}


def syllables(word: str) -> int:
    raw = word.strip(".,;:!?()\"'")
    w = raw.lower()
    if w in VOCAB:
        return VOCAB[w]
    if not w:
        return 0
    if w.isdigit() or re.fullmatch(r"[\d,.$%-]+", w):
        return 1
    letters = re.sub(r"[^A-Za-z]", "", raw)
    if letters.isupper() and len(letters) <= 5:   # acronyms such as MFA, SOC, POA&M read letter by letter
        return max(1, len(letters))
    w = re.sub(r"[^a-z]", "", w)
    if not w:
        return 1
    groups = re.findall(r"[aeiouy]+", w)
    n = len(groups)
    if w.endswith("e") and not w.endswith(("le", "ee")) and n > 1:
        n -= 1
    if w.endswith(("ed", "es")) and n > 1 and not re.search(r"[td]ed$|[sxz]es$|[cs]hes$|ges$|ces$", w):
        n -= 1
    return max(1, n)


def prose(markdown: str) -> str:
    """Strip markdown down to the sentences a reader reads."""
    text = re.sub(r"```.*?```", " ", markdown, flags=re.S)
    # Rejoin hard-wrapped lines into blocks first. A blank line, heading, table row, or new
    # list item starts a new block; any other line continues the one before it.
    blocks: list[str] = []
    current: list[str] = []
    for line in text.splitlines():
        s = line.strip()
        skip = not s or s.startswith(("#", "|", ">", "---"))
        new_item = bool(re.match(r"^([-*] |\d+\. )", s))
        if (skip or new_item) and current:
            blocks.append(" ".join(current))
            current = []
        if skip:
            continue
        current.append(re.sub(r"^([-*] |\d+\. )", "", s))
    if current:
        blocks.append(" ".join(current))

    keep = []
    for s in blocks:
        s = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", s)   # keep link text, drop URL
        s = re.sub(r"`[^`]*`", "it", s)
        s = s.replace("**", "").replace("*", "")
        if not re.search(r"[.!?:]$", s):
            s += "."
        keep.append(s)
    return " ".join(keep)


def grade(markdown: str) -> float:
    text = prose(markdown)
    sentences = [x for x in re.split(r"(?<=[.!?:])\s+", text) if re.search(r"[A-Za-z]", x)]
    words = re.findall(r"[A-Za-z0-9$][A-Za-z0-9&'$,.%-]*", text)
    words = [w for w in words if re.search(r"[A-Za-z0-9]", w)]
    if not words or not sentences:
        return 0.0
    syl = sum(syllables(w) for w in words)
    return round(0.39 * len(words) / len(sentences) + 11.8 * syl / len(words) - 15.59, 1)


def check(root: Path = ROOT) -> list[tuple[Path, float, float]]:
    """Return (file, grade, limit) for every target file."""
    rows = []
    for pattern, limit in TARGETS.items():
        for path in sorted(root.glob(pattern)):
            rows.append((path, grade(path.read_text(encoding="utf-8")), limit))
    return rows


def main(argv: list[str]) -> int:
    if len(argv) == 2:
        print(f"{argv[1]}: grade {grade(Path(argv[1]).read_text(encoding='utf-8'))}")
        return 0
    failed = 0
    for path, g, limit in check():
        ok = g <= limit
        failed += not ok
        print(f"{'ok  ' if ok else 'FAIL'} grade {g:>4}  (limit {limit:>4})  {path.relative_to(ROOT)}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
