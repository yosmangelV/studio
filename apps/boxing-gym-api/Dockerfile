FROM python:3.12-slim

WORKDIR /app

RUN pip install uv --no-cache-dir

COPY apps/boxing-gym-api/pyproject.toml apps/boxing-gym-api/uv.lock ./

RUN uv sync --frozen --no-dev

COPY apps/boxing-gym-api/ .

EXPOSE 8080

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
