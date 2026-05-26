import { getAccessToken } from "./firebase";

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  date: string;
  isUnread: boolean;
}

export async function fetchEmails(maxResults = 20): Promise<GmailMessage[]> {
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated with Gmail");

  const listRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=in:inbox`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listData = await listRes.json();
  
  if (!listData.messages) return [];

  const emails = await Promise.all(
    listData.messages.map(async (msg: any) => {
      const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const detailData = await detailRes.json();
      
      const headers = detailData.payload?.headers || [];
      const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || "";

      return {
        id: detailData.id,
        threadId: detailData.threadId,
        snippet: detailData.snippet,
        subject: getHeader("Subject") || "(No Subject)",
        from: getHeader("From"),
        date: getHeader("Date"),
        isUnread: detailData.labelIds?.includes("UNREAD") || false,
      };
    })
  );
  
  return emails;
}

export async function sendEmail(to: string, subject: string, message: string) {
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated with Gmail");

  const emailLines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "",
    message,
  ];
  
  const rawEmail = btoa(emailLines.join("\n")).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: rawEmail }),
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error?.message || "Failed to send email");
  }
}
