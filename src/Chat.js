import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = "https://chatsy-backend-vfqq.onrender.com/messages"; // 🔁 Replace with your Render backend URL

export default function Chat() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // Ask for username if not stored
  useEffect(() => {
    const storedName = localStorage.getItem("chat_username");
    if (storedName) {
      setUsername(storedName);
    } else {
      Swal.fire({
        title: "Enter your name",
        input: "text",
        inputPlaceholder: "e.g. Gaurav",
        allowOutsideClick: false,
        backdrop: true,
        inputValidator: (value) => !value && "Name is required"
      }).then((res) => {
        setUsername(res.value);
        localStorage.setItem("chat_username", res.value);
      });
    }
  }, []);

  // Fetch messages from backend
  const fetchMessages = async () => {
    try {
      const res = await axios.get(API_URL);
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages", err);
    }
  };

  // Send new message
  const sendMessage = async () => {
    if (!message.trim()) return;
    try {
      await axios.post(API_URL, {
        name: username,
        message: message.trim()
      });
      setMessage("");
      fetchMessages();
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  // Load messages every 3s
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <h1 className="text-center text-2xl mb-4 text-green-300">
        💻 Terminal Chat
      </h1>

      <div className="border border-green-500 rounded p-4 max-w-2xl mx-auto shadow-[0_0_10px_#00ff0050]">
        <div className="h-[400px] overflow-y-auto mb-4 bg-[#111] p-4 rounded">
          {messages.length === 0 ? (
            <div className="text-green-600">No messages yet...</div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className="mb-2 border-b border-green-800 pb-1"
              >
                <span className="text-green-300 font-bold">
                  {msg.name}:
                </span>{" "}
                {msg.message}
                <div className="text-xs text-green-600">
                  {new Date(msg.time).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>

        <textarea
          className="w-full p-2 rounded bg-black border border-green-600 text-green-300 outline-none resize-none"
          rows="3"
          placeholder="Type a message and press Enter..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        ></textarea>

        <button
          onClick={sendMessage}
          className="mt-2 w-full bg-green-700 hover:bg-green-600 text-black font-bold py-2 rounded transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}