import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Bonjour, je suis un assistant IA spécialiste de MakeProps. Envoyez-moi un message pour commencer !",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); // Indicateur de chargement
  const messagesEndRef = useRef<HTMLDivElement | null>(null); // Référence pour le scroll automatique
  const [typing, setTyping] = useState(false); // Animation de "typing..."

  // Fonction pour envoyer un message
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const newMessage = { sender: "user", text: input };
    setMessages([...messages, newMessage]);
    setInput("");
    setLoading(true);
    setTyping(true); // Démarrer l'animation de "typing..."

    setTimeout(async () => {
      try {
        const response = await fetch("http://localhost:8000/ask", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: input }),
        });

        const data = await response.json();

        if (response.ok) {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: data.answer },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "Erreur lors de la communication avec le serveur.",
            },
          ]);
        }
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Impossible de contacter le serveur." },
        ]);
      } finally {
        setLoading(false);
        setTyping(false); // Arrêter l'animation typing après la réponse
      }
    }, 1500);
  };

  // Gérer l'appui sur la touche "Entrée"
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  // Faire défiler automatiquement jusqu'au dernier message avec un léger délai
  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }, [messages]);

  return (
    <div className="w-full flex flex-col h-screen p-4 bg-white">
      {/* Liste des messages */}
      <div className="flex-grow overflow-y-auto space-y-4 p-4">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex items-end ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "bot" && (
              <img
                src="/images/chatbot.png"
                alt="Bot"
                className="w-10 h-10 rounded-full mr-3"
              />
            )}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`max-w-lg ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white rounded-2xl p-3 shadow-md"
                  : "text-gray-900 bg-gray-100 p-3 rounded-2xl shadow-sm"
              }`}
              style={{
                padding: "10px 15px",
                borderRadius: "20px",
                maxWidth: "70%",
                textAlign: "left",
              }}
            >
              {msg.text}
            </motion.div>
            {msg.sender === "user" && (
              <img
                src="/images/utilisateur.png"
                alt="User"
                className="w-10 h-10 rounded-full ml-3"
              />
            )}
          </motion.div>
        ))}

        {/* Animation de typing du bot */}
        {typing && (
          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gray-100 p-3 rounded-2xl text-gray-900 max-w-lg shadow-md flex items-center">
              <span className="mr-2">En train d'écrire</span>
              <motion.div
                className="flex space-x-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <motion.span
                  className="w-2 h-2 bg-gray-500 rounded-full"
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ repeat: Infinity, duration: 0.6 }}
                />
                <motion.span
                  className="w-2 h-2 bg-gray-500 rounded-full"
                  animate={{ y: [2, -2, 2] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                />
                <motion.span
                  className="w-2 h-2 bg-gray-500 rounded-full"
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Élément invisible pour le scroll automatique */}
        <div ref={messagesEndRef} />
      </div>

      {/* Champ de saisie et bouton d'envoi */}
      <div className="mt-4 flex items-center bg-gray-200 p-3 rounded-lg shadow-md">
        <input
          type="text"
          className="flex-grow p-2 border-none rounded-lg bg-white text-gray-900 focus:outline-none"
          placeholder="Écrivez un message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress} // Envoi avec Entrée
        />
        <motion.button
          className="ml-2 px-4 py-2 bg-transparent text-gray-900 rounded-full"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          onClick={sendMessage}
          disabled={loading} // Désactiver le bouton si l'IA charge
        >
          <Icon
            icon="solar:round-arrow-up-bold"
            className={`w-10 h-10 ${
              loading ? "text-gray-400" : "text-blue-700 hover:text-blue-500"
            }`}
          />
        </motion.button>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <ChatBox />
    </div>
  );
};

export default App;
