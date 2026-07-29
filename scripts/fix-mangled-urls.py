#!/usr/bin/env python3
"""Fix mangled URLs in section components — replace with clean Pexels URLs."""
import re

# Mapping: pexels_photo_id → clean URL template
REPLACEMENTS = {
    # CategoryGrid
    '29559667': 'https://images.pexels.com/photos/29559667/pexels-photo-29559667.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=800',
    '36299919': 'https://images.pexels.com/photos/36299919/pexels-photo-36299919.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=800',
    '31034508': 'https://images.pexels.com/photos/31034508/pexels-photo-31034508.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=600&w=800',
    '4053188': 'https://images.pexels.com/photos/4053188/pexels-photo-4053188.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=600&w=800',
    # FeaturedCollection + JournalSection
    '1112598_900': 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1100&w=900',
    '1112598_700': 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=700',
    # HyggeEdit
    '667829_1600': 'https://images.pexels.com/photos/667829/pexels-photo-667829.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1400&w=2000',
    # Philosophy
    '38428357_600': 'https://images.pexels.com/photos/38428357/pexels-photo-38428357.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1100&w=600',
    '38428357_700': 'https://images.pexels.com/photos/38428357/pexels-photo-38428357.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=700',
    '13712877': 'https://images.pexels.com/photos/13712877/pexels-photo-13712877.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=400',
}

files = [
    'apps/web/src/components/shop/sections/CategoryGrid.tsx',
    'apps/web/src/components/shop/sections/FeaturedCollection.tsx',
    'apps/web/src/components/shop/sections/HyggeEdit.tsx',
    'apps/web/src/components/shop/sections/JournalSection.tsx',
    'apps/web/src/components/shop/sections/Philosophy.tsx',
]

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Replace any mangled URL that starts with pexels and contains unsplash
    # Pattern: 'https://images.pexels.com/photos/XXXX/...unsplash...'
    def replace_mangled(match):
        url = match.group(0)
        # Extract the pexels photo ID
        pid_match = re.search(r'pexels\.com/photos/(\d+)/', url)
        if not pid_match:
            return url
        pid = pid_match.group(1)
        
        # Determine which variant based on context
        if 'w=900' in url or (pid == '1112598' and 'w=900' in filepath):
            key = f'{pid}_900'
        elif 'w=700' in url or (pid == '1112598' and 'JournalSection' in filepath):
            key = f'{pid}_700'
        elif 'w=1600' in url or (pid == '667829' and 'HyggeEdit' in filepath):
            key = f'{pid}_1600'
        elif 'w=600' in url and pid == '38428357':
            key = f'{pid}_600'
        elif 'w=700' in url and pid == '38428357':
            key = f'{pid}_700'
        else:
            key = pid
        
        return REPLACEMENTS.get(key, url)
    
    # Match any URL containing both pexels and unsplash
    content = re.sub(r'https://images\.pexels\.com/[^"\'\s]*unsplash[^"\'\s]*', replace_mangled, content)
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f'Fixed: {filepath}')

# Verify no mangled URLs remain
import subprocess
result = subprocess.run(['grep', '-rn', 'pexels.*unsplash', 'apps/web/src/components/shop/sections/'], 
                       capture_output=True, text=True)
if result.stdout:
    print(f'\nWARNING: Mangled URLs still remain:\n{result.stdout}')
else:
    print('\n✓ All mangled URLs fixed')
