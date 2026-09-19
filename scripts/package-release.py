"""Create portable source + document-root ZIPs using only the Python standard library.
Run a production build first. Usage: python scripts/package-release.py OUTPUT_DIRECTORY
"""
from pathlib import Path
import hashlib
import json
import os
import shutil
import subprocess
import sys
import zipfile

ROOT = Path(__file__).resolve().parent.parent
ROOT_FILES = ['package.json', 'package-lock.json', '.env.example', '.gitignore',
              'CLAUDE.md', 'README.md', 'PHASE2_PROGRESS.md', 'PHASE3_PROGRESS.md', 'QA_REPORT.md']
SOURCE_DIRS = ['src', 'public', 'scripts', 'tests', 'docs', 'dist']
REQUIRED_DOCS = ['SITE_ARCHITECTURE', 'SEO_STRATEGY', 'DESIGN_SYSTEM', 'CONTENT_GUIDE',
                 'CASE_STUDY_GUIDE', 'ASSET_REGISTER', 'DEPLOYMENT', 'HANDOFF']
BLOCKED_DIRS = {'.git', '.openai', '.sites-runtime', 'node_modules', '__pycache__', '.cache'}
OMITTED = {'public/assets/singapore.jpg', 'public/assets/singapore.mp4'}


def allowed(file):
    relative = file.relative_to(ROOT)
    if set(relative.parts) & BLOCKED_DIRS or relative.as_posix() in OMITTED:
        return False
    if file.name.startswith('.env') and file.name != '.env.example':
        return False
    if file.suffix.lower() in {'.tmp', '.log', '.pyc', '.pem', '.key', '.zip', '.tar', '.gz'}:
        return False
    if file.is_symlink() or ROOT not in file.resolve().parents:
        raise RuntimeError('Unexpected export path: ' + str(relative))
    return file.is_file()


def source_files():
    files = [ROOT / name for name in ROOT_FILES]
    for directory in SOURCE_DIRS:
        files.extend(p for p in (ROOT / directory).rglob('*') if p.is_file())
    return sorted((p for p in files if allowed(p)), key=lambda p: p.relative_to(ROOT).as_posix())


def digest_file(target):
    digest = hashlib.sha256()
    with target.open('rb') as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def create_zip(target, files, base):
    with zipfile.ZipFile(target, 'x', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
        for file in files:
            archive.write(file, file.relative_to(base).as_posix())
    with zipfile.ZipFile(target) as archive:
        if archive.testzip() is not None:
            raise RuntimeError('ZIP integrity check failed: ' + target.name)
        names = archive.namelist()
        if len(names) != len(set(names)):
            raise RuntimeError('Duplicate ZIP entries')
    return {'name': target.name, 'bytes': target.stat().st_size, 'files': len(names),
            'sha256': digest_file(target)}


def main():
    if len(sys.argv) != 2:
        raise SystemExit('Usage: python scripts/package-release.py OUTPUT_DIRECTORY')
    output = Path(sys.argv[1]).resolve()
    if output == ROOT or ROOT in output.parents:
        raise SystemExit('Choose an output directory outside the source project.')
    output.mkdir(parents=True, exist_ok=True)
    targets = [output / 'innooryze-production-source.zip', output / 'innooryze-live-deploy.zip']
    if any(p.exists() for p in targets):
        raise SystemExit('A release ZIP already exists. Preserve it and choose a fresh output directory.')
    for name in ROOT_FILES + ['docs/' + d + '.md' for d in REQUIRED_DOCS]:
        if not (ROOT / name).is_file():
            raise SystemExit('Missing required source file: ' + name)
    node = os.environ.get('NODE') or shutil.which('node')
    if not node:
        raise SystemExit('Node is required to validate the existing production build before packaging.')
    subprocess.run([node, 'scripts/validate.mjs', '--production'], cwd=ROOT, check=True)
    live = sorted((p for p in (ROOT / 'dist').rglob('*') if p.is_file() and allowed(p)))
    for name in ['index.html', '.htaccess', 'sitemap.xml', 'robots.txt', 'style.css', 'app.js']:
        if ROOT / 'dist' / name not in live:
            raise SystemExit('Missing required production file: ' + name)
    records = [create_zip(targets[0], source_files(), ROOT), create_zip(targets[1], live, ROOT / 'dist')]
    manifest = {'productionOrigin': 'https://innooryze.com', 'indexable': True,
                'liveZipRoot': 'index.html and production assets (no outer directory)', 'packages': records}
    (output / 'innooryze-release-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf8')
    print(json.dumps(manifest, indent=2))


if __name__ == '__main__':
    main()
