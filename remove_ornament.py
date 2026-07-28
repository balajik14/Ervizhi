import glob
import os
import re

files = glob.glob('d:/Ervizhi/mobile/app/**/*.tsx', recursive=True) + glob.glob('d:/Ervizhi/web/app/**/*.tsx', recursive=True)
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        
    if '<CornerOrnament />' in content:
        # Remove all variations of spacing before <CornerOrnament />
        content = re.sub(r'^[ \t]*<CornerOrnament />\r?\n?', '', content, flags=re.MULTILINE)
        content = content.replace('<CornerOrnament />', '')
        
        # Optionally remove the import if we want, but TS will just warn if unused.
        # Let's remove the import too to be clean.
        content = re.sub(r'import CornerOrnament from [\'"].*?CornerOrnament[\'"];\r?\n?', '', content)
        
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Removed CornerOrnament from {f}")
