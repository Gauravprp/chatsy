import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://chatsy-backend-vfqq.onrender.com/messages"; // 🔁 Replace with your Render URL

function Chat() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // Load messages from backend
  const fetchMessages = async () => {
    const res = await axios.get(API_URL);
    setMessages(res.data);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // refresh every 3 sec
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async () => {
    if (!name || !message) return alert("Enter both name and message");
    await axios.post(API_URL, { name, message });
    setMessage("");
    fetchMessages(); // refresh immediately
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 20 }}>
      <input
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />
      <textarea
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        style={{ width: "100%", padding: 10 }}
      />
      <button onClick={sendMessage} style={{ marginTop: 10, width: "100%" }}>
        Send
      </button>

      <div style={{ marginTop: 20 }}>
        <h3>Messages:</h3>
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: 10 }}>
            <strong>{msg.name}:</strong> {msg.message}
            <div style={{ fontSize: "0.75em", color: "#888" }}>{new Date(msg.time).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Chat;
