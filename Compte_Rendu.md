### DELAUNAY Simon & PINAUD Nathan

# COMPTE RENDU DU PROJET CHATBOT IA (RAG)

## Introduction

Ce projet consiste en la création d’un chatbot intelligent exploitant une architecture RAG (Retrieval-Augmented Generation), capable de répondre aux questions des utilisateurs en s'appuyant sur des contenus récupérés dynamiquement depuis un site web précis (ici : MakeProps). Le chatbot est développé avec une approche full-stack en intégrant Python (FastAPI) côté serveur et React côté client.

Ce document présente les choix techniques effectués, l'architecture logicielle mise en œuvre, ainsi que des recommandations concrètes pour améliorer l’efficacité et l'expérience utilisateur de l'application.

## Explications Techniques

### 1) Architecture globale

Le chatbot se divise en trois grandes parties distinctes :

- Serveur (Backend) : API REST réalisée avec FastAPI.
- Base documentaire : Indexation de contenu web via Chroma avec des embeddings OpenAI (text-embedding-3-large).
- Client (Frontend) : Interface utilisateur réalisée en React avec des interactions animées pour améliorer l’expérience utilisateur.

### 2) Fonctionnement côté Serveur (Python / FastAPI) :

a. Scraping de données :

- Le contenu des pages du site MakeProps est récupéré grâce à une fonction de scraping exploitant requests et BeautifulSoup.
- Un mécanisme de crawling récursif récupère jusqu'à 100 pages internes, avec un délai entre les requêtes pour éviter le blocage du scraper.
- Le contenu texte extrait est segmenté en chunks grâce à RecursiveCharacterTextSplitter pour optimiser les recherches.

b. Indexation des données avec Chroma :

- Les données segmentées sont converties en embeddings via OpenAI puis stockées dans la base vectorielle Chroma, ce qui permet une récupération rapide des documents pertinents lors des requêtes utilisateurs.

c. Mécanisme RAG (LangGraph / LangChain) :

- Retrieve : La requête utilisateur est utilisée pour rechercher les documents les plus pertinents via la recherche par similarité.
- Generate : Les documents récupérés sont transmis au modèle d’IA GPT (gpt-4o-mini) via un prompt issu du hub LangChain pour générer une réponse cohérente et pertinente à la question posée.

d. API REST avec FastAPI :
Une API REST minimaliste est mise en place, exposant une route `/ask` qui reçoit une requête utilisateur et renvoie une réponse générée par l’IA.

- La gestion du CORS est configurée pour permettre les échanges avec le frontend React.

Pour que le projet fonctionne correctement côté serveur, il est nécessaire d’insérer votre clé API OpenAI `(OPENAI_API_KEY)` dans la configuration du serveur Python.

### 3. Fonctionnement côté Frontend (React) :

a. Interface utilisateur intuitive :

- L’interface propose une expérience utilisateur interactive grâce à la librairie d’animation Framer Motion.
- Un chat intuitif où les messages utilisateurs et réponses de l’IA apparaissent distinctement.

b. Gestion des échanges :

- Envoi asynchrone des questions à l'API REST FastAPI via des requêtes HTTP (`fetch`).
- Gestion claire des états d’attente (`loading`, animation `typing...`) pour améliorer la fluidité et l’interaction utilisateur.
- Scroll automatique vers le dernier message pour faciliter la lecture.

Pour lancer correctement l’application frontend :

Installer toutes les dépendances avec la commande :

```bash
npm install
```

Démarrer l’application avec :

```bash
npm run dev
```

## Conclusion et Axes d'Amélioration

Le chatbot réalisé est fonctionnel, interactif, et s'appuie efficacement sur la technologie RAG pour offrir des réponses pertinentes issues directement du site web ciblé (MakeProps). L’intégration technique entre les technologies Python (FastAPI, LangChain) et React est réussie, permettant une communication fluide entre client et serveur.

Cependant, des axes d’amélioration notables peuvent être explorés pour renforcer la qualité et l'efficacité du projet :

### Axes d'amélioration suggérés :

1.  Gestion des historiques de conversation :

        - Problématique actuelle : Actuellement, le chatbot ne mémorise pas l'historique des conversations. Cela limite fortement l’expérience utilisateur, car l’IA ne dispose d’aucun contexte historique sur la conversation.
        - Recommandation : Utiliser une base de données côté serveur (ex : Redis, PostgreSQL, ou MongoDB) pour stocker et gérer les historiques de conversation.

        Cela permettrait à l'IA d'accéder aux messages précédents pour produire des réponses plus cohérentes sur le plan conversationnel.

2.  Gestion des erreurs et des exceptions :

    - Problématique actuelle : Les messages d'erreur côté utilisateur restent basiques (« Impossible de contacter le serveur »).
    - Recommandation : Affiner la gestion des erreurs côté frontend en fournissant des retours utilisateurs plus détaillés (par exemple en distinguant erreurs réseau et erreurs de génération côté IA).

3.  Optimisation du scraping :

    - Problématique actuelle : Actuellement, toutes les pages sont scrapées de manière brute sans mécanisme d’optimisation spécifique aux contenus pertinents.
    - Recommandation : Ajouter un filtrage intelligent avant l'indexation afin d’ignorer des contenus répétitifs ou non pertinents (par exemple, pied de page, header commun, ou publicités éventuelles).

En conclusion, le chatbot basé sur RAG est fonctionnel et pertinent technologiquement. Toutefois, l’intégration de l’historique de conversation, une meilleure gestion des erreurs, une sécurisation accrue des clés API, ainsi qu’une optimisation UX/UI pourraient considérablement améliorer la qualité et la convivialité du produit final.
