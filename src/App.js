import React, { useEffect, useState } from "react";
import { db, ref, push, onValue } from "./firebaseConfig";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const messagesRef = ref(db, "messages");
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const list = data ? Object.values(data) : [];
      setMessages(list);
    });
  }, []);

  const sendMessage = async () => {
    if (input.trim()) {
      await push(ref(db, "messages"), {
        text: input,
        timestamp: Date.now(),
      });
      setInput("");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">💬 Simple Chat</h1>
      <div className="my-4 h-64 overflow-auto bg-gray-100 p-2">
        {messages.map((msg, i) => (
          <div key={i} className="mb-2">
            {msg.text}
          </div>
        ))}
      </div>
      <input
        className="border p-2"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
      <button className="ml-2 px-4 py-2 bg-blue-500 text-white" onClick={sendMessage}>
        Send
      </button>
    </div>
  );
}

export default App;
