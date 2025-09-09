from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pinecone import Pinecone, ServerlessSpec
from services.memory_manager import MemoryManager
from routes.chat import router as chat_router
import os
from dotenv import load_dotenv
import logging

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

# ------------------------
# Lifespan
# ------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.info("Starting FastAPI lifespan...")

    # ---- OpenAI ----
    openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    app.state.openai = openai_client
    logging.info("OpenAI client initialized.")

    # ---- Pinecone ----
    logging.info("Creating Pinecone client instance...")
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

    index_name = os.getenv("PINECONE_INDEX", "chatbot-memory")

    # Check existing indexes
    existing_indexes = [idx.name for idx in pc.list_indexes().indexes]
    if index_name not in existing_indexes:
        logging.info(f"Index '{index_name}' not found, creating new index...")
        pc.create_index(
            name=index_name,
            dimension=1536,  # must match your embedding vector size
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )
        logging.info(f"Index '{index_name}' created.")
    else:
        logging.info(f"Index '{index_name}' already exists.")

    # Connect to index
    pinecone_index = pc.Index(index_name)
    logging.info(f"Connected to Pinecone index '{index_name}'.")

    # ---- Memory Manager ----
    app.state.memory = MemoryManager(
        openai_client=openai_client,
        vector_index=pinecone_index
    )
    logging.info("MemoryManager initialized and ready.")

    yield
    logging.info("FastAPI lifespan shutdown complete.")

# ------------------------
# FastAPI App
# ------------------------
app = FastAPI(lifespan=lifespan)

# ------------------------
# CORS Setup
# ------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in prod
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------
# Register routers
# ------------------------
app.include_router(chat_router)
