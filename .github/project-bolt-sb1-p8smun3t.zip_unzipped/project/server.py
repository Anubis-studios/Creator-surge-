\
import os
from pathlib import Path
from dotenv import load_dotenv
import base64

# Ensure .env exists and load it
ROOT_DIR = Path(__file__).parent
ENV_PATH = ROOT_DIR / '.env'
if not ENV_PATH.exists():
    ENV_PATH.write_text('', encoding='utf-8')

load_dotenv(ENV_PATH)

# Auto-generate JWT secret if missing
if not os.environ.get('JWT_SECRET_KEY'):
    token = base64.urlsafe_b64encode(os.urandom(32)).decode('utf-8')
    text = ENV_PATH.read_text(encoding='utf-8')
    if 'JWT_SECRET_KEY=' in text:
        lines = text.splitlines()
        new_lines = []
        replaced = False
        for line in lines:
            if line.strip().startswith('JWT_SECRET_KEY=') and not replaced:
                new_lines.append(f'JWT_SECRET_KEY={token}')
                replaced = True
            else:
                new_lines.append(line)
        if not replaced:
            new_lines.append(f'JWT_SECRET_KEY={token}')
        ENV_PATH.write_text('\\n'.join(new_lines), encoding='utf-8')
    else:
        with open(ENV_PATH, 'a', encoding='utf-8') as f:
            f.write(f"\\nJWT_SECRET_KEY={token}\\n")
    # reload
    load_dotenv(ENV_PATH, override=True)

# Now import rest
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, status
from fastapi.responses import FileResponse, JSONResponse
from fastapi.openapi.utils import get_openapi
from dotenv import load_dotenv as _load
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import logging
from datetime import timedelta, datetime

from models.user import User, UserCreate, UserLogin, UserResponse, TokenResponse
from models.project import Project, ProjectCreate, ProjectResponse
from utils.auth import verify_password, get_password_hash, create_access_token, decode_token
from utils.zip_handler import create_app_zip

_load(ENV_PATH)

# Config
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://mongodb:27017')
DB_NAME = os.environ.get('DB_NAME', 'emergent_db')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@example.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'change-this-password')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get('ACCESS_TOKEN_EXPIRE_MINUTES', 60*24*7))

# MongoDB connection
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# App
app = FastAPI(title='Emergent v1.0', version='1.0')
api_router = APIRouter(prefix='/api')

# logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger('emergent')

# Security: get_current_user
async def get_current_user(authorization: Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail='Not authenticated')
    try:
        scheme, token = authorization.split()
        if scheme.lower() != 'bearer':
            raise HTTPException(status_code=401, detail='Invalid auth scheme')
    except Exception:
        raise HTTPException(status_code=401, detail='Invalid authorization header')
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail='Invalid token')
    user_email = payload.get('sub')
    if not user_email:
        raise HTTPException(status_code=401, detail='Invalid token payload')
    user_data = await db.users.find_one({'email': user_email})
    if not user_data:
        raise HTTPException(status_code=401, detail='User not found')
    return User(**user_data)

# Auth endpoints
@api_router.post('/auth/register', response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({'email': user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail='User already exists')
    hashed = get_password_hash(user_data.password)
    user = User(email=user_data.email, password_hash=hashed)
    await db.users.insert_one(user.dict())
    token = create_access_token(data={'sub': user.email}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return TokenResponse(access_token=token, user=UserResponse(id=user.id, email=user.email, credits=user.credits, is_admin=user.is_admin, created_at=user.created_at))

@api_router.post('/auth/login', response_model=TokenResponse)
async def login(creds: UserLogin):
    user_data = await db.users.find_one({'email': creds.email})
    if not user_data:
        raise HTTPException(status_code=401, detail='Invalid credentials')
    user = User(**user_data)
    if not verify_password(creds.password, user.password_hash):
        raise HTTPException(status_code=401, detail='Invalid credentials')
    token = create_access_token(data={'sub': user.email}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return TokenResponse(access_token=token, user=UserResponse(id=user.id, email=user.email, credits=user.credits, is_admin=user.is_admin, created_at=user.created_at))

@api_router.get('/auth/me', response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return UserResponse(id=current_user.id, email=current_user.email, credits=current_user.credits, is_admin=current_user.is_admin, created_at=current_user.created_at)

# Projects
@api_router.post('/projects', response_model=ProjectResponse)
async def create_project(project: ProjectCreate, current_user: User = Depends(get_current_user)):
    proj = Project(user_id=current_user.id, name=project.name, description=project.description)
    await db.projects.insert_one(proj.dict())
    return ProjectResponse(id=proj.id, user_id=proj.user_id, name=proj.name, description=proj.description, created_at=proj.created_at, updated_at=proj.updated_at)

@api_router.get('/projects')
async def list_projects(current_user: User = Depends(get_current_user)):
    projects = await db.projects.find({'user_id': current_user.id}).to_list(100)
    return [ProjectResponse(**p) for p in projects]

# Download app zip
@api_router.get('/download/app')
async def download_app(current_user: User = Depends(get_current_user)):
    try:
        z = create_app_zip()
        return FileResponse(z, media_type='application/zip', filename='emergent_app_full.zip')
    except Exception:
        raise HTTPException(status_code=500, detail='Error creating zip')

# Health
@api_router.get('/health')
async def health():
    try:
        await client.admin.command('ping')
        return {'status':'ok','mongo':'ok','timestamp':datetime.utcnow().isoformat()}
    except Exception:
        return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content={'status':'degraded','mongo':'unreachable'})

# Root
@api_router.get('/')
async def root():
    return {'message':'Emergent v1.0 API running'}

# Include router
app.include_router(api_router)

# Add OpenAPI bearerAuth
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(title=app.title, version=app.version, routes=app.routes)
    components = openapi_schema.setdefault('components', {})
    security_schemes = components.setdefault('securitySchemes', {})
    security_schemes['bearerAuth'] = {'type':'http','scheme':'bearer','bearerFormat':'JWT'}
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Startup: admin + demo seed
@app.on_event('startup')
async def startup_event():
    logger.info('🚀 Emergent v1.0 is starting up')
    logger.info(f'Admin seed email: {ADMIN_EMAIL}')
    try:
        existing = await db.users.find_one({'email': ADMIN_EMAIL})
        if not existing:
            hashed = get_password_hash(ADMIN_PASSWORD)
            admin_user = User(email=ADMIN_EMAIL, password_hash=hashed, credits=1000000, is_admin=True)
            await db.users.insert_one(admin_user.dict())
            logger.info(f'Admin {ADMIN_EMAIL} created')
        else:
            logger.info('Admin already exists')

        admin = await db.users.find_one({'email': ADMIN_EMAIL})
        if admin:
            proj = await db.projects.find_one({'user_id': admin.get('id'), 'name': 'Welcome Project'})
            if not proj:
                from datetime import datetime
                demo = {
                    'id': __import__('uuid').uuid4().hex,
                    'user_id': admin.get('id'),
                    'name': 'Welcome Project',
                    'description': 'A starter project to showcase the Emergent API.',
                    'files': [],
                    'created_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow()
                }
                await db.projects.insert_one(demo)
                logger.info('Demo project \"Welcome Project\" created for admin')
            else:
                logger.info('Demo project already exists')
    except Exception:
        logger.exception('Error during startup seeding')

# Shutdown
@app.on_event('shutdown')
async def shutdown_event():
    client.close()
