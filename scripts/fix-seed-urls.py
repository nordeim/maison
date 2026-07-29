#!/usr/bin/env python3
"""Replace all Unsplash URLs in seed data with working Pexels URLs."""
import re

filepath = 'packages/db/src/seed/fixtures/products.ts'

# Read the file
with open(filepath, 'r') as f:
    content = f.read()

# Mapping of Unsplash photo IDs to Pexels URLs
# Using the Pexels URLs from the reference mockup (space-z.ai landing page)
URL_MAP = {
    # Lighting
    'photo-1524484485831-a92ffc0de03f': 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
    'photo-1540932239986-30128078f3c5': 'https://images.pexels.com/photos/36299919/pexels-photo-36299919.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
    'photo-1513506003901-1e6a229e2d15': 'https://images.pexels.com/photos/36299919/pexels-photo-36299919.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
    'photo-1507473885765-e6ed057f782c': 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
    # Ceramics
    'photo-1565193566173-7a0ee3dbe261': 'https://images.pexels.com/photos/4053188/pexels-photo-4053188.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600',
    'photo-1578749556568-bc2c40e68b61': 'https://images.pexels.com/photos/5754097/pexels-photo-5754097.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600',
    'photo-1610701596007-11502861dcfa': 'https://images.pexels.com/photos/13712877/pexels-photo-13712877.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
    # Furniture
    'photo-1615066390971-03e4e1c36ddf': 'https://images.pexels.com/photos/29559667/pexels-photo-29559667.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
    'photo-1555041469-a586c61ea9bc': 'https://images.pexels.com/photos/29559667/pexels-photo-29559667.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
    'photo-1567538096630-e0c55bd6374c': 'https://images.pexels.com/photos/2082090/pexels-photo-2082090.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
    'photo-1506439773649-6e0eb8cfb237': 'https://images.pexels.com/photos/23471276/pexels-photo-23471276.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
    'photo-1538688525198-9b88f6f53126': 'https://images.pexels.com/photos/22743854/pexels-photo-22743854.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
    # Textiles
    'photo-1584100936595-c0654b55a2e2': 'https://images.pexels.com/photos/31034512/pexels-photo-31034512.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600',
    'photo-1616486338812-3dadae4b4ace': 'https://images.pexels.com/photos/31034508/pexels-photo-31034508.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600',
    # Objects
    'photo-1578500494198-246f612d3b3d': 'https://images.pexels.com/photos/5754116/pexels-photo-5754116.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600',
    # Seasonal
    'photo-1602028923579-99e1f9d8d4f0': 'https://images.pexels.com/photos/8311558/pexels-photo-8311558.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600',
}

# Replace each Unsplash URL
for unsplash_id, pexels_url in URL_MAP.items():
    # Match the full Unsplash URL with any query params
    pattern = r'https://images\.unsplash\.com/' + re.escape(unsplash_id) + r'[^"\']*'
    content = re.sub(pattern, pexels_url, content)

# Write the fixed content
with open(filepath, 'w') as f:
    f.write(content)

# Verify
remaining = re.findall(r'images\.unsplash\.com', content)
if remaining:
    print(f'WARNING: {len(remaining)} Unsplash URLs still remain')
else:
    print('✓ All Unsplash URLs replaced with Pexels URLs')

# Count Pexels URLs
pexels_count = len(re.findall(r'images\.pexels\.com', content))
print(f'✓ {pexels_count} Pexels URLs in seed data')
