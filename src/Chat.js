// Chat.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";


const API_URL = "https://chatsy-backend-vfqq.onrender.com/messages"; // Replace with your backend URL

export default function Chat() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [saveChat, setSaveChat] = useState(true);
  const scrollRef = useRef(null);
  const [isServerWarming, setIsServerWarming] = useState(false);
  const [warmupTime, setWarmupTime] = useState(0);
const [isSending, setIsSending] = useState(false);


  const room = window.location.search?.substring(1) || "default";

 useEffect(() => {
  const askUsernameAndSaveChat = async () => {
    let storedName = localStorage.getItem("chat_username");
    let storedSave = localStorage.getItem("save_chat");

    while (!storedName) {
      const result = await Swal.fire({
        title: "Enter your name",
        input: "text",
        inputPlaceholder: "e.g. Gaurav",
        allowOutsideClick: false,
        inputValidator: (value) => !value && "Name is required"
      });

      if (result.value) {
        storedName = result.value;
        localStorage.setItem("chat_username", storedName);
      }
    }

    if (!storedSave) {
      const saveResult = await Swal.fire({
        title: "Save chat messages?",
        text: "Do you want to save chat after leaving tab?",
        showDenyButton: true,
        confirmButtonText: "Save",
        denyButtonText: "Trash",
      });

      storedSave = saveResult.isConfirmed;
      localStorage.setItem("save_chat", storedSave);
    }

    setUsername(storedName);
    setSaveChat(storedSave === "true" || storedSave === true);
  };

  askUsernameAndSaveChat();
}, []);


  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [room]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleUnload = () => {
      if (!saveChat) {
        localStorage.removeItem("chat_username");
        localStorage.removeItem("save_chat");
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [saveChat]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_URL}?room=${room}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

const sendMessage = async () => {
  if (!message.trim()) return;

  let warmupTimer, countInterval;

  setIsSending(true);
  setIsServerWarming(false);
  setWarmupTime(0);

  try {
    warmupTimer = setTimeout(() => {
      setIsServerWarming(true);
      countInterval = setInterval(() => {
        setWarmupTime((prev) => prev + 1);
      }, 1000);
    }, 2000);

    await axios.post(`${API_URL}?room=${room}`, {
      name: username,
      message: message.trim(),
    });

    setMessage("");
    fetchMessages();
  } catch (err) {
    console.error("Send failed", err);
  } finally {
    clearTimeout(warmupTimer);
    clearInterval(countInterval);
    setIsSending(false);
    setIsServerWarming(false);
    setWarmupTime(0);
  }
};



  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    Swal.fire({
      title: "Clear Chat?",
      text: "This will delete all messages from this room.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, clear it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`${API_URL}?room=${room}`).then(() => {
          setMessages([]);
        });
      }
    });
  };

  return (
    <div className="min-h-screen w-full bg-black text-green-400 font-mono p-4 overflow-x-auto">
      <h1 className="text-center text-2xl mb-4 text-green-300">💻 Terminal Chat - Room: {room}</h1>

      <div className="border border-green-500 rounded p-4 max-w-2xl mx-auto shadow-[0_0_10px_#00ff0050]">
        <div ref={scrollRef} className="h-[400px] overflow-y-auto mb-4 bg-[#111] p-4 rounded">
          {messages.length === 0 ? (
            <div className="text-green-600">No messages yet...</div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="mb-2 border-b border-green-800 pb-1">
                <span className="text-green-300 font-bold">{msg.name}:</span> {msg.message}
                <div className="text-xs text-green-600">{new Date(msg.time).toLocaleTimeString()}</div>
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
        {isServerWarming && (
  <div className="text-yellow-400 mt-2 text-center animate-pulse">
    ⚙️ Server is starting up, please wait... ({warmupTime}s)
  </div>
)}

        <div className="flex gap-2 mt-2">
         <button
  onClick={sendMessage}
  disabled={isSending}
  className={`w-full font-bold py-2 rounded transition ${
    isSending
      ? "bg-gray-600 cursor-not-allowed"
      : "bg-green-700 hover:bg-green-600 text-black"
  }`}
>
  {isSending ? "Sending..." : "Send"}
</button>


          <button
            onClick={clearChat}
            className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
