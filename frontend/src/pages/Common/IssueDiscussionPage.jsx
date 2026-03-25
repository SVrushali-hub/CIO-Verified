import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";
import "../../styles/issue.css";

export default function IssueDiscussionPage() {
  const { id } = useParams();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [resolved, setResolved] = useState(false);
const [rejected, setRejected] = useState(false);
  const chatRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchMessages();
  }, [id]);

  useEffect(() => {
    // 🔥 auto scroll
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
  try {
    const res = await API.get(`/invoices/issues/${id}`);
    setMessages(res.data);

    if (res.data.length) {
      const status = res.data[0].status;

      if (status === "RESOLVED") setResolved(true);
      if (status === "REJECTED") setRejected(true);
    }

  } catch (err) {
    if (err.response?.status === 403) {
      alert("You are not authorized to view this issue ❌");
    } else {
      alert("Something went wrong");
    }
  }
};

  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      await API.post(`/invoices/reply/${id}`, {
        message: text,
      });

      setText("");
      fetchMessages();
    } catch (err) {
      if (err.response?.status === 403) {
        alert("You are not allowed to reply ❌");
      } else {
        alert("Failed to send");
      }
    }
  };

  // 🔥 END CHAT
 const handleResolve = async () => {
  if (!window.confirm("Resolve this issue and update pricing?")) return;

  try {
    const res = await API.post(`/invoices/resolve/${id}`);

    alert("Issue resolved ✅");

    // 🔥 REDIRECT TO PRICING PAGE
    window.location.href = `/internal/application/${id}?pricing=true`;

  } catch {
    alert("Failed to resolve");
  }
};

  const handleReject = async () => {
  if (!window.confirm("Reject this issue? This will revert to invoice.")) return;

  try {
    await API.post(`/invoices/reject/${id}`);
    alert("Issue rejected ❌");

    setRejected(true);
    fetchMessages();

  } catch (err) {
    console.error(err);
    alert("Failed to reject issue");
  }
};
  return (
    <div className="issue-page">

      {/* HEADER */}
      <div className="chat-header">
        <h2>Issue Discussion</h2>

        {!resolved && !rejected && (user.role === "ADMIN" || user.role === "SUPERADMIN") && (
  <div className="action-buttons">
    
    <button className="resolve-btn" onClick={handleResolve}>
      Resolve
    </button>

    <button className="reject-btn" onClick={handleReject}>
      Reject
    </button>

  </div>
)}
        {resolved && <span className="resolved-badge">Resolved ✅</span>}
        {rejected && <span className="rejected-badge">Rejected ❌</span>}
      </div>

      <div className="chat-container">

        {/* MESSAGES */}
        <div className="chat-messages">
          {messages.map((msg) => {
            const isMine = msg.user_id === user.id;

            return (
              <div
                key={msg.id}
                className={`chat-row ${isMine ? "right" : "left"}`}
              >
                <div className={`chat-bubble ${msg.role.toLowerCase()}`}>
                  
                  <div className="chat-role">{msg.role}</div>

                  <div className="chat-text">{msg.message}</div>

                  <div className="chat-time">
                    {new Date(msg.created_at).toLocaleString()}
                  </div>

                </div>
              </div>
            );
          })}

          <div ref={chatRef}></div>
        </div>

        {/* INPUT */}
        {!resolved && !rejected && (
          <div className="chat-input">
            <textarea
              placeholder="Type your message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <button onClick={sendMessage}>Send</button>
          </div>
        )}

      </div>
    </div>
  );
}