"""Edit the page template embedded in index.html.

index.html is a design-tool export: the real page lives as a JSON string inside
<script type="__bundler/template">. This script decodes it, applies the edits
below (each one idempotent), and writes it back.

    python3 scripts/patch_bundle.py
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"
TAG = re.compile(r'(<script type="__bundler/template">\s*)(.*?)(\s*</script>)', re.S)

SPEC_FILES = [
    "budget", "budgeting", "projects", "procurement", "tender", "oversight",
    "complaints", "inventory", "assets", "workforce", "tax", "teams", "executive",
]
HEAD_SCRIPTS = (
    '<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script>\n'
    '<script src="dash/dash.js"></script>\n<script src="dash/data.js"></script>\n'
    + "".join(f'<script src="dash/specs/{n}.js"></script>\n' for n in SPEC_FILES)
)

# (marker proving the edit is already applied, old text, new text)
EDITS = [
    (
        'src="dash/dash.js"',
        "</head>",
        HEAD_SCRIPTS + "</head>",
    ),
    (
        "const dashKey",
        "const isOther = !(isVoice || isHealth || isMinutes || isBudget || isTender || isGis);",
        "const dashKey = s.mod + '-' + s.tab;\n"
        "    const isGen = !!(window.__DASH && window.__DASH.has(dashKey));\n"
        "    const isOther = !(isVoice || isHealth || isMinutes || isBudget || isTender || isGis) && !isGen;",
    ),
    (
        "isOther, isGen, dashKey,",
        "isOther, showPageBar",
        "isOther, isGen, dashKey, showPageBar",
    ),
    (
        "data-dash-mount",
        "<!-- ================= PLACEHOLDER FOR OUT-OF-SCOPE TABS ================= -->",
        '<sc-if value="{{ isGen }}" hint-placeholder-val="{{ false }}">\n'
        '        <div data-dash-mount="{{ dashKey }}" style="flex:1;display:flex;flex-direction:column;gap:12px;min-width:0"></div>\n'
        "      </sc-if>\n\n"
        "      <!-- ================= PLACEHOLDER FOR OUT-OF-SCOPE TABS ================= -->",
    ),
]


def main():
    html = INDEX.read_text()
    m = TAG.search(html)
    if not m:
        sys.exit("template script tag not found")
    tpl = json.loads(m.group(2))
    for marker, old, new in EDITS:
        if marker in tpl:
            continue
        if tpl.count(old) != 1:
            sys.exit(f"expected exactly one match for: {old[:60]!r}")
        tpl = tpl.replace(old, new)
        print("applied:", marker)
    encoded = json.dumps(tpl, ensure_ascii=False).replace("</", "<\\u002F")
    html = html[: m.start(2)] + encoded + html[m.end(2):]
    INDEX.write_text(html)


if __name__ == "__main__":
    main()
