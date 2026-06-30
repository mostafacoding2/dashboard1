import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Send, Paperclip, Image, Smile, Phone, Video, MoreVertical, Check, CheckCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ChatContact = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  avatar?: string;
};

type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  time: string;
  status: "sent" | "delivered" | "read";
};

export default function Chat() {
  const [selectedContact, setSelectedContact] = useState<string | null>("1");
  const [messageInput, setMessageInput] = useState("");
  const [search, setSearch] = useState("");

  const contacts: ChatContact[] = [
    { id: "1", name: "أحمد محمد", lastMessage: "هل المنتج متوفر؟", time: "منذ 5 دقائق", unread: 2, online: true },
    { id: "2", name: "فاطمة علي", lastMessage: "شكراً جزيلاً", time: "منذ 15 دقيقة", unread: 0, online: true },
    { id: "3", name: "محمد حسن", lastMessage: "متى سيتم التوصيل؟", time: "منذ ساعة", unread: 1, online: false },
    { id: "4", name: "سارة أحمد", lastMessage: "أريد استرجاع المنتج", time: "منذ 3 ساعات", unread: 0, online: false },
    { id: "5", name: "خالد محمود", lastMessage: "هل يوجد خصم؟", time: "أمس", unread: 0, online: true },
  ];

  const messages: Record<string, ChatMessage[]> = {
    "1": [
      { id: "m1", senderId: "1", text: "مرحباً، أنا مهتم بالمنتج", time: "10:30 ص", status: "read" },
      { id: "m2", senderId: "admin", text: "مرحباً بك! نعم المنتج متوفر حالياً", time: "10:32 ص", status: "read" },
      { id: "m3", senderId: "1", text: "هل يمكنني الحصول على خصم؟", time: "10:35 ص", status: "delivered" },
      { id: "m4", senderId: "1", text: "هل المنتج متوفر؟", time: "10:40 ص", status: "sent" },
    ],
    "2": [
      { id: "m5", senderId: "2", text: "تم استلام الطلب، شكراً", time: "9:15 ص", status: "read" },
      { id: "m6", senderId: "admin", text: "شكراً لك! لا تتردد في التواصل معنا", time: "9:20 ص", status: "read" },
    ],
    "3": [
      { id: "m7", senderId: "3", text: "مرحباً، متى سيتم توصيل طلبي؟", time: "8:00 ص", status: "delivered" },
    ],
  };

  const filteredContacts = contacts.filter(c =>
    c.name.includes(search) || c.lastMessage.includes(search)
  );

  const currentMessages = selectedContact ? messages[selectedContact] || [] : [];

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-4">
      {/* Contacts Sidebar */}
      <Card className="w-80 flex flex-col">
        <CardContent className="p-4 border-b">
          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث في المحادثات..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="pr-9" />
          </div>
        </CardContent>
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-accent transition-colors ${selectedContact === contact.id ? "bg-accent" : ""}`}
              onClick={() => setSelectedContact(contact.id)}
            >
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {contact.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {contact.online && (
                  <span className="absolute bottom-0 left-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{contact.name}</p>
                  <span className="text-xs text-muted-foreground">{contact.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground truncate">{contact.lastMessage}</p>
                  {contact.unread > 0 && (
                    <Badge className="bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                      {contact.unread}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <CardContent className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {contacts.find(c => c.id === selectedContact)?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{contacts.find(c => c.id === selectedContact)?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {contacts.find(c => c.id === selectedContact)?.online ? "متصل الآن" : "غير متصل"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon"><Phone className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><Video className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
              </div>
            </CardContent>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === "admin" ? "justify-start" : "justify-end"}`}
                >
                  <div className={`max-w-[70%] rounded-lg p-3 ${msg.senderId === "admin" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <p className="text-sm">{msg.text}</p>
                    <div className={`flex items-center gap-1 mt-1 ${msg.senderId === "admin" ? "justify-start" : "justify-end"}`}>
                      <span className="text-[10px] opacity-70">{msg.time}</span>
                      {msg.senderId === "admin" && (
                        msg.status === "read" ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <CardContent className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon"><Paperclip className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><Image className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><Smile className="h-4 w-4" /></Button>
                <Input
                  placeholder="اكتب رسالة..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1"
                />
                <Button size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Send className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">اختر محادثة للبدء</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}