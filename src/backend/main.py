from fastapi import FastAPI
from contextlib import asynccontextmanager
from llama_cpp import Llama
from services.memory_manager import MemoryManager
from routes.chat import router as chat_router
from fastapi.middleware.cors import CORSMiddleware

# ------------------------
# Model Init
# ------------------------
def init_model() -> Llama:
    print("Loading model from local file...")
    llm = Llama(
        model_path="models/qwen/Qwen3-4B-Q5_K_M.gguf",  # your local path
        n_ctx=8192,
        n_threads=8,
        n_gpu_layers=0,
        verbose=False
    )
    print("Model loaded.")
    return llm

# ------------------------
# Lifespan
# ------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.llm = init_model()
    app.state.memory = MemoryManager()
    yield
    # cleanup if needed

# ------------------------
# FastAPI App
# ------------------------
app = FastAPI(lifespan=lifespan)

# ------------------------
# CORS Setup
# ------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # your Next.js dev server
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routers
app.include_router(chat_router)