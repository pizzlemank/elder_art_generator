import json

with open('public/data/themes.json', 'r') as f:
    data = json.load(f)

for theme in data['themes']:
    if 'backgroundLabels' not in theme:
        theme['backgroundLabels'] = {
            "01": "風格一",
            "02": "風格二",
            "03": "風格三",
            "04": "風格四"
        }
    if 'backgroundGradients' not in theme:
        dg = theme.get('defaultGradient', 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)')
        theme['backgroundGradients'] = {
            "01": dg,
            "02": dg,
            "03": dg,
            "04": dg
        }

with open('public/data/themes.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
