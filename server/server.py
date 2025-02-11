from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

# Import your existing AI pipeline
from langgraph.graph import StateGraph
from langchain_core.documents import Document

# Your existing AI graph
from model import graph  # Replace with the correct import

app = FastAPI()

# Request body model
class QuestionRequest(BaseModel):
    question: str

@app.post("/ask")
async def ask_question(request: QuestionRequest):
    try:
        response = graph.invoke({"question": request.question})
        return {"answer": response["answer"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)