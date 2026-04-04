#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CSS_FILES = sorted(ROOT.rglob("*.css"))


class CssCheckError(Exception):
    pass


def read_css(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8-sig")
    except UnicodeDecodeError as exc:
        raise CssCheckError(f"UTF-8로 읽을 수 없습니다: {exc}") from exc


def scan_css(text: str, path: Path) -> list[str]:
    errors: list[str] = []
    brace_stack: list[int] = []
    in_comment = False
    in_string: str | None = None
    escape = False
    line = 1
    string_start_line = 1

    i = 0
    while i < len(text):
        ch = text[i]
        nxt = text[i + 1] if i + 1 < len(text) else ""

        if ch == "\n":
            line += 1

        if in_comment:
            if ch == "*" and nxt == "/":
                in_comment = False
                i += 2
                continue
            i += 1
            continue

        if in_string:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == in_string:
                in_string = None
            i += 1
            continue

        if ch == "/" and nxt == "*":
            in_comment = True
            i += 2
            continue

        if ch in ("'", '"'):
            in_string = ch
            string_start_line = line
            i += 1
            continue

        if ch == "{":
            brace_stack.append(line)
        elif ch == "}":
            if not brace_stack:
                errors.append(f"{path}: line {line}: 닫는 중괄호가 더 많습니다.")
            else:
                brace_stack.pop()
        i += 1

    if in_comment:
        errors.append(f"{path}: 파일 끝까지 닫히지 않은 주석이 있습니다.")
    if in_string:
        errors.append(f"{path}: line {string_start_line}: 닫히지 않은 문자열이 있습니다.")
    for open_line in brace_stack:
        errors.append(f"{path}: line {open_line}: 닫히지 않은 중괄호가 있습니다.")

    return errors


def check_content_rules(text: str, path: Path) -> list[str]:
    errors: list[str] = []
    blocks = re.finditer(r"(?<![-\w])content\s*:\s*([^;\n]+)(;?)", text)
    for match in blocks:
        value = match.group(1).strip()
        has_semicolon = match.group(2) == ";"
        line = text.count("\n", 0, match.start()) + 1

        if not has_semicolon:
            errors.append(f"{path}: line {line}: content 선언 끝의 세미콜론이 없습니다.")
            continue

        if value.startswith(("'", '"')):
            quote = value[0]
            if not value.endswith(quote):
                errors.append(f"{path}: line {line}: content 문자열 따옴표가 닫히지 않았습니다.")
        elif value not in ("none", "normal", "open-quote", "close-quote", "no-open-quote", "no-close-quote"):
            errors.append(f"{path}: line {line}: content 값이 문자열 또는 표준 키워드가 아닙니다: {value}")

    return errors


def main() -> int:
    if not CSS_FILES:
        print("CSS 파일을 찾지 못했습니다.")
        return 1

    all_errors: list[str] = []
    for path in CSS_FILES:
        text = read_css(path)
        all_errors.extend(scan_css(text, path.relative_to(ROOT)))
        all_errors.extend(check_content_rules(text, path.relative_to(ROOT)))

    if all_errors:
        print("CSS 무결성 검사 실패:")
        for err in all_errors:
            print(f"- {err}")
        return 1

    print("CSS 무결성 검사 통과")
    for path in CSS_FILES:
        print(f"- {path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
