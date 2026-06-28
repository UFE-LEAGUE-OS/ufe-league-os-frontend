import os

dirs_to_skip = {'node_modules', '.git', '__pycache__', '.venv', '.github', '.vscode-test'}
empty_files = []

for root, dirs, files in os.walk('.'):
    # Modify dirs in-place to skip unwanted directories
    dirs[:] = [d for d in dirs if d not in dirs_to_skip]
    
    for f in files:
        filepath = os.path.join(root, f)
        try:
            if os.path.getsize(filepath) == 0:
                empty_files.append(filepath)
        except OSError:
            continue

for path in empty_files:
    print(path)