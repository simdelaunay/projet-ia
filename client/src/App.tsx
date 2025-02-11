import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";

const Sidebar: React.FC = () => {
  return (
    <div className="w-1/4 bg-gray-100 p-4 h-screen border-r border-gray-300">
      <h2 className="text-lg font-semibold mb-4">ChatBOT MakeIA</h2>
      <ul className="space-y-2">
        <li className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg cursor-pointer">
          GO
        </li>
        <li className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg cursor-pointer">
          Go
        </li>
        <li className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg cursor-pointer">
          salut
        </li>
      </ul>
    </div>
  );
};

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Bonjour, je suis un assistant spécialisé en recrutement, conçu pour analyser en profondeur la compatibilité de votre CV avec une offre d'emploi spécifique. Mon objectif est de vous fournir une évaluation détaillée et objective, afin de maximiser vos chances de décrocher le poste. Pour commencer, pourriez-vous me fournir votre CV en format PDF ou .doc (word) ?",
    },
    {
      sender: "user",
      text: "GO",
    },
    {
      sender: "bot",
      text: "Merci pour votre message ! 😊",
    },
  ]);

  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages([...messages, { sender: "user", text: input }]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Merci pour votre message ! 😊" },
      ]);
    }, 1000);
  };

  return (
    <div className="w-3/4 flex flex-col h-screen p-4 bg-white">
      <div className="flex-grow overflow-y-auto space-y-4 p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "bot" && (
              <img
                src="/images/chatbot.png" // Icône bot
                alt="Bot"
                className="w-10 h-10 rounded-full mr-3"
              />
            )}

            <div
              className={`max-w-lg ${
                msg.sender === "user"
                  ? "bg-gray-500 text-white rounded-2xl p-3"
                  : "text-gray-900 bg-gray-100 p-3 rounded-2xl"
              }`}
              style={{
                padding: "10px 15px",
                borderRadius: "20px",
                maxWidth: "70%",
                textAlign: "left",
              }}
            >
              {msg.text}
            </div>

            {msg.sender === "user" && (
              <img
                src="/images/utilisateur.png" // Icône user
                alt="User"
                className="w-10 h-10 rounded-full ml-3"
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center bg-gray-200 p-3 rounded-lg">
        <input
          type="text"
          className="flex-grow p-2 border-none rounded-lg bg-white text-gray-900 focus:outline-none"
          placeholder="Écrivez un message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="ml-2 px-4 py-2 bg-transparent text-gray-900 rounded-full"
          onClick={sendMessage}
        >
          <Icon
            icon="solar:round-arrow-up-bold"
            className="w-10 h-10 text-gray-700 hover:text-gray-500"
          />
        </button>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <ChatBox />
    </div>
  );
};

export default App;
