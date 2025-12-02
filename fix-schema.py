#!/usr/bin/env python3
"""
Fix Prisma schema to use lowercase table names for Linux MySQL compatibility
"""

import re

# Read schema
with open('prisma/schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

# Models that need mapping
models_to_map = [
    'Wine', 'WineVariant', 'WineImage',
    'Cart', 'CartItem', 'WishlistItem',
    'Order', 'OrderItem', 'Review',
    'Event', 'EventTicket', 'BlogPost',
    'KlaraSync', 'KlaraProductOverride', 'MediaAsset'
]

for model_name in models_to_map:
    lowercase_name = model_name.lower()

    # Find the model block and add @@map if not present
    pattern = rf'(model {model_name} \{{[\s\S]*?)(  @@index\[.*?\]\s*\n)?(\}})'

    def replace_func(match):
        model_content = match.group(1)
        last_index = match.group(2) if match.group(2) else ''
        closing_brace = match.group(3)

        # Check if @@map already exists
        if f'@@map("{lowercase_name}")' in model_content or f"@@map('{lowercase_name}')" in model_content:
            return match.group(0)

        # Add @@map before closing brace
        if last_index:
            return f'{model_content}{last_index}\n  @@map("{lowercase_name}")\n{closing_brace}'
        else:
            return f'{model_content}\n  @@map("{lowercase_name}")\n{closing_brace}'

    content = re.sub(pattern, replace_func, content)

# Write back
with open('prisma/schema.prisma', 'w', encoding='utf-8') as f:
    f.write(content)

print("Schema fixed! All models now map to lowercase table names.")
print("Models updated:", ', '.join(models_to_map))
