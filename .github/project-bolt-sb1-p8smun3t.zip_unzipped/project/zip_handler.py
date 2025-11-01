import os, zipfile, tempfile
from pathlib import Path

def create_app_zip(exclude_dirs=None):
    if exclude_dirs is None:
        exclude_dirs = ['node_modules','__pycache__','.git','venv','build','dist','.pytest_cache','.vscode','.idea']
    temp_zip = tempfile.NamedTemporaryFile(delete=False, suffix='.zip')
    zip_path = temp_zip.name
    temp_zip.close()
    root_dir = Path('/app') if Path('/app').exists() else Path('.')
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(root_dir):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            for file in files:
                file_path = Path(root) / file
                if any(excluded in file_path.parts for excluded in exclude_dirs):
                    continue
                arcname = file_path.relative_to(root_dir)
                zipf.write(file_path, arcname)
    return zip_path
