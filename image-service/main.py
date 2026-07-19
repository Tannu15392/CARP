"""
FindIt Image-Matching Service
-----------------------------
Small FastAPI microservice that turns a photo URL into a CLIP embedding
(a 512-number "fingerprint" of what's in the image). The Node backend
stores these vectors on each Item and does cosine-similarity search to
suggest "this found item might be that lost item" matches.

Deploy this as its own service (Railway/Render) separate from the Node
backend, since it needs a Python + PyTorch runtime.
"""

import io
import os

import requests
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel

app = FastAPI(title="FindIt Image Matching Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to your backend's URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Loaded lazily on first request so the service boots instantly (useful on
# free hosting tiers that sleep/wake the process).
_model = None
_preprocess = None
_device = "cuda" if torch.cuda.is_available() else "cpu"


def get_model():
    global _model, _preprocess
    if _model is None:
        import open_clip

        _model, _, _preprocess = open_clip.create_model_and_transforms(
            "ViT-B-32", pretrained="openai"
        )
        _model.to(_device).eval()
    return _model, _preprocess


class EmbedRequest(BaseModel):
    image_url: str


class EmbedResponse(BaseModel):
    embedding: list[float]


@app.get("/")
def health():
    return {"status": "ok", "service": "findit-image-matching"}


@app.post("/embed", response_model=EmbedResponse)
def embed(req: EmbedRequest):
    """Download an image (e.g. a Cloudinary URL) and return its CLIP embedding."""
    try:
        resp = requests.get(req.image_url, timeout=10)
        resp.raise_for_status()
        image = Image.open(io.BytesIO(resp.content)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not load image: {e}")

    model, preprocess = get_model()
    tensor = preprocess(image).unsqueeze(0).to(_device)

    with torch.no_grad():
        features = model.encode_image(tensor)
        features = features / features.norm(dim=-1, keepdim=True)

    return {"embedding": features[0].tolist()}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 9000)))
