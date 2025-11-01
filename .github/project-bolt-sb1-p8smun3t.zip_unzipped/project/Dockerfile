FROM python:3.11-slim

RUN useradd -m emergent
WORKDIR /home/emergent/app/backend

COPY ./backend /home/emergent/app/backend

RUN pip install --no-cache-dir fastapi uvicorn motor pydantic python-jose[cryptography] passlib[bcrypt] python-dotenv python-multipart netcat-openbsd

COPY ./backend/start.sh /home/emergent/app/backend/start.sh
RUN chmod +x /home/emergent/app/backend/start.sh

USER emergent

EXPOSE 8001

CMD ["/home/emergent/app/backend/start.sh"]
