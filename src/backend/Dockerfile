# Use slim Python image
FROM python:3.13-slim

# Set working directory
WORKDIR /app/backend

# Copy backend source and models
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose FastAPI port
EXPOSE 8000

# Run Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
