from pathlib import Path

path = Path('scripts/apply-progress-tracker-production-ux.py')
text = path.read_text()
old_header = "progress, count = header_pattern.subn('\\n' + header_replacement, progress, count=1)"
new_header = "progress, count = header_pattern.subn(lambda _: '\\n' + header_replacement, progress, count=1)"
old_phase = "progress, count = phase_pattern.subn('\\n' + phase_replacement, progress, count=1)"
new_phase = "progress, count = phase_pattern.subn(lambda _: '\\n' + phase_replacement, progress, count=1)"
if old_header not in text or old_phase not in text:
    raise SystemExit('Expected regex replacement calls were not found')
text = text.replace(old_header, new_header, 1).replace(old_phase, new_phase, 1)
path.write_text(text)
print('Fixed Progress Tracker UX patcher literal replacements')
