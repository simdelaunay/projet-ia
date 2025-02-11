import getpass
import os
from langchain_openai import OpenAIEmbeddings
from langchain.chat_models import init_chat_model
from langchain_chroma import Chroma
import requests
from bs4 import BeautifulSoup
import time
from urllib.parse import urljoin, urlparse

from langchain import hub
from langchain_community.document_loaders import WebBaseLoader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langgraph.graph import START, StateGraph
from typing_extensions import List, TypedDict

if not os.environ.get("OPENAI_API_KEY"):
  os.environ["OPENAI_API_KEY"] = "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"

llm = init_chat_model("gpt-4o-mini", model_provider="openai")
embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
vector_store = Chroma(embedding_function=embeddings)      
# ------------------ PARAMÈTRES ------------------
BASE_URL = "https://makeprops.com"
CRAWL_DELAY = 1  # Pause entre chaque requête pour éviter d'être bloqué
MAX_PAGES = 100  # Pour éviter de scraper un trop grand nombre de pages

# ------------------ SCRAPER LE SITE ------------------
def get_internal_links(url, visited):
    """Récupère tous les liens internes valides d'une page."""
    links = set()
    try:
        response = requests.get(url)
        if response.status_code != 200:
            return links
        
        soup = BeautifulSoup(response.text, "html.parser")
        for a_tag in soup.find_all("a", href=True):
            link = urljoin(BASE_URL, a_tag["href"])
            parsed_link = urlparse(link)

            # Filtrer uniquement les liens internes et éviter les doublons
            if parsed_link.netloc == urlparse(BASE_URL).netloc and link not in visited:
                links.add(link)

    except requests.RequestException as e:
        print(f"Erreur lors de la récupération de {url} : {e}")
    return links


def scrape_site(start_url):
    """Parcourt le site et extrait les contenus de chaque page."""
    visited = set()
    to_visit = {start_url, "https://makeprops.com/equipe"}
    pages_content = []

    while to_visit and len(visited) < MAX_PAGES:
        url = to_visit.pop()
        print(f"Scraping : {url}")
        visited.add(url)

        try:
            response = requests.get(url)
            if response.status_code != 200:
                continue

            soup = BeautifulSoup(response.text, "html.parser")
            text = soup.get_text(separator=" ", strip=True)  # Extraction du texte brut
            
            if len(text) > 500:  # Éviter d'indexer des pages vides
                pages_content.append(Document(page_content=text, metadata={"source": url}))

            # Récupérer de nouveaux liens internes
            new_links = get_internal_links(url, visited)
            to_visit.update(new_links - visited)

        except requests.RequestException as e:
            print(f"Erreur lors du scraping de {url}: {e}")

        time.sleep(CRAWL_DELAY)

    return pages_content

# ------------------ CHARGEMENT DES DONNÉES ------------------
print("Début du scraping...")
documents = scrape_site(BASE_URL)

print(f"{len(documents)} pages récupérées.")

# Chargement des documents
#loader = WebBaseLoader(
#    web_paths=["https://makeprops.com/equipe"], 
#    bs_kwargs=dict(),
#)
#docs = loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
all_splits = text_splitter.split_documents(documents)

# Index chunks
_ = vector_store.add_documents(documents=all_splits)

# Define prompt for question-answering
prompt = hub.pull("rlm/rag-prompt")


# Define state for application
class State(TypedDict):
    question: str
    context: List[Document]
    answer: str


# Define application steps
def retrieve(state: State):
    retrieved_docs = vector_store.similarity_search(state["question"])
    return {"context": retrieved_docs}


def generate(state: State):
    docs_content = "\n\n".join(doc.page_content for doc in state["context"])
    messages = prompt.invoke({"question": state["question"], "context": docs_content})
    response = llm.invoke(messages)
    return {"answer": response.content}




# Compile application and test
graph_builder = StateGraph(State).add_sequence([retrieve, generate])
graph_builder.add_edge(START, "retrieve")
graph = graph_builder.compile()
