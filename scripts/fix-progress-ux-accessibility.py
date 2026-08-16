from pathlib import Path

path = Path('scripts/apply-progress-tracker-production-ux.py')
text = path.read_text()

replacements = [
    (
        '<div className="responsive-container pb-24 pt-6 md:pb-28 md:pt-8">',
        '<div className="responsive-container pb-24 pt-6 md:pb-28 md:pt-8 [&_.text-muted-foreground]:text-slate-600 dark:[&_.text-muted-foreground]:text-slate-300">',
        'scoped muted-text contrast',
    ),
    (
        '<Button asChild size="lg" className="w-full shrink-0 gap-2 sm:w-auto" data-testid="next-required-step-action">',
        '<Button asChild size="lg" className="w-full shrink-0 gap-2 bg-emerald-800 text-white hover:bg-emerald-900 focus-visible:ring-emerald-700 sm:w-auto" data-testid="next-required-step-action">',
        'next action contrast',
    ),
    (
        '<Button asChild size="sm" variant={step.status === "not-started" ? "default" : "secondary"} className="flex-1 gap-1.5 sm:flex-none">',
        '<Button asChild size="sm" variant={step.status === "completed" ? "outline" : "default"} className={`flex-1 gap-1.5 sm:flex-none ${step.status === "completed" ? "" : "bg-emerald-800 text-white hover:bg-emerald-900 focus-visible:ring-emerald-700"}`}>',
        'step action contrast',
    ),
]

for old, new, label in replacements:
    if old not in text:
        raise SystemExit(f'{label}: expected source text not found')
    text = text.replace(old, new, 1)

path.write_text(text)
print('Applied Progress Tracker WCAG contrast hardening to staging patcher')
