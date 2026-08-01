#!/usr/bin/env python3
"""Add server-only stub alias to all vitest.config.ts files that need it."""
import re
from pathlib import Path

REPO_ROOT = Path("/home/z/my-project/maison")
STUB_PATH = "scripts/server-only-stub.js"

# All vitest.config.ts files in the repo (excluding node_modules)
configs = list(REPO_ROOT.rglob("vitest.config.ts"))
configs = [c for c in configs if "node_modules" not in str(c)]

for cfg_path in configs:
    rel = cfg_path.relative_to(REPO_ROOT)
    text = cfg_path.read_text()

    if "server-only" in text:
        print(f"  = {rel} already has server-only alias")
        continue

    # Add resolve.alias block with server-only stub
    # Look for existing resolve.alias block and add to it, or add a new one
    if "resolve:" in text and "alias:" in text:
        # Add to existing alias block
        text = text.replace(
            "alias: {",
            f'alias: {{\n      "server-only": resolve(__dirname, "{STUB_PATH}"),',
            1,  # only first occurrence
        )
        # Need to import resolve from path
        if "import { resolve }" not in text and "resolve(" in text:
            text = text.replace(
                "import { defineConfig }",
                "import { resolve } from 'node:path';\nimport { defineConfig }",
                1,
            )
        print(f"  ~ added server-only alias to existing resolve block in {rel}")
    else:
        # Add a new resolve block before the closing })
        # Find the last closing }) and insert before it
        text = text.rstrip()
        if text.endswith("});"):
            text = text[:-3] + f"""
  resolve: {{
    alias: {{
      "server-only": resolve(__dirname, "{STUB_PATH}"),
    }},
  }},
}});"""
            # Need to import resolve from path
            if "import { resolve }" not in text and "resolve(" in text:
                text = text.replace(
                    "import { defineConfig }",
                    "import { resolve } from 'node:path';\nimport { defineConfig }",
                    1,
                )
            print(f"  ~ added new resolve block with server-only alias to {rel}")

    cfg_path.write_text(text)

print(f"\n== Done: processed {len(configs)} vitest configs ==")
