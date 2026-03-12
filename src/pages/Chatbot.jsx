// import { useState, useEffect, useRef } from "react";
// import { authApi, rolesApi } from "@/lib/api";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Loader2, Send, Bot, User } from "lucide-react";
// import Navbar from "@/components/Navbar";
// import { useToast } from "@/hooks/use-toast";
// // ... (your other imports)
// import { authApi, rolesApi, chatApi } from "@/lib/api"; // <-- ADD chatApi

// const Chatbot = () => {
//   const { toast } = useToast();
//   const [messages, setMessages] = useState([
//     {
//       role: "assistant",
//       content: "Namaste! I'm your agricultural assistant. Ask me anything about farming, crops, pest management, fertilizers, or government schemes for farmers."
//     }
//   ]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [userRole, setUserRole] = useState(null);
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const checkAuth = async () => {
//     const { session } = await authApi.getSession();
//     if (session) {
//       setIsAuthenticated(true);
//       if (session.roles && session.roles.length > 0) {
//         setUserRole(session.roles[0]);
//       }
//     }
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   if (!input.trim()) return;

//   //   const userMessage = input.trim();
//   //   setInput("");
//   //   setMessages(prev => [...prev, { role: "user", content: userMessage }]);
//   //   setLoading(true);

//   //   try {
//   //     // TODO: Implement chatbot API endpoint in backend
//   //     // For now, provide a simple response
//   //     const response = `I understand you're asking about: "${userMessage}". As an agricultural assistant, I can help with farming advice, crop management, pest control, fertilizers, and government schemes. However, the full AI assistant feature is being migrated to the new backend. Please check back soon!`;
      
//   //     setMessages(prev => [...prev, { role: "assistant", content: response }]);
//   //   } catch (error) {
//   //     console.error('Chatbot error:', error);
//   //     toast({
//   //       title: "Error",
//   //       description: error.message || "Failed to get response. Please try again.",
//   //       variant: "destructive",
//   //     });
      
//   //     setMessages(prev => [...prev, { 
//   //       role: "assistant", 
//   //       content: "Sorry, I encountered an error. Please try again." 
//   //     }]);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
//   // REPLACE your old handleSubmit with this:

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!input.trim()) return;

//     // 1. Create the new user message object
//     const userMessage = { role: "user", content: input.trim() };
    
//     // 2. Create the full message history to send to the backend
//     const newMessages = [...messages, userMessage];

//     // 3. Update the UI immediately with the user's question
//     setMessages(newMessages);
//     setInput("");
//     setLoading(true);

//     try {
//       // 4. THIS IS THE NEW CODE
//       // It calls your backend AI (which uses the "Guardrail" prompt)
//       const response = await chatApi.ask(newMessages); 

//       // 5. Create the new assistant message
//       const assistantMessage = { role: "assistant", content: response.text };
      
//       // 6. Update the UI with the bot's real response
//       setMessages(prev => [...prev, assistantMessage]);

//     } catch (error) {
//       console.error('Chatbot error:', error);
//       toast({
//         title: "Error",
//         description: error.message || "Failed to get response. Please try again.",
//         variant: "destructive",
//       });
      
//       setMessages(prev => [...prev, { Read
//         role: "assistant", 
//         content: "Sorry, I encountered an error. Please try again." 
//       }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <Navbar isAuthenticated={isAuthenticated} userRole={userRole} />
      
//       <div className="container mx-auto px-4 py-8 max-w-4xl">
//         <Card className="h-[calc(100vh-200px)] flex flex-col">
//           <CardHeader className="border-b">
//             <CardTitle className="flex items-center gap-2">
//               <Bot className="h-6 w-6 text-primary" />
//               Agricultural AI Assistant
//             </CardTitle>
//             <CardDescription>
//               Get expert advice on farming, crops, and agriculture
//             </CardDescription>
//           </CardHeader>
          
//           <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
//             {messages.map((message, index) => (
//               <div
//                 key={index}
//                 className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
//               >
//                 {message.role === "assistant" && (
//                   <div className="bg-primary p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
//                     <Bot className="h-4 w-4 text-primary-foreground" />
//                   </div>
//                 )}
                
//                 <div
//                   className={`max-w-[80%] rounded-lg p-4 ${
//                     message.role === "user"
//                       ? "bg-primary text-primary-foreground"
//                       : "bg-muted"
//                   }`}
//                 >
//                   <p className="whitespace-pre-wrap">{message.content}</p>
//                 </div>

//                 {message.role === "user" && (
//                   <div className="bg-secondary p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
//                     <User className="h-4 w-4 text-secondary-foreground" />
//                   </div>
//                 )}
//               </div>
//             ))}
            
//             {loading && (
//               <div className="flex gap-3 justify-start">
//                 <div className="bg-primary p-2 rounded-full h-8 w-8 flex items-center justify-center">
//                   <Bot className="h-4 w-4 text-primary-foreground" />
//                 </div>
//                 <div className="bg-muted rounded-lg p-4">
//                   <Loader2 className="h-5 w-5 animate-spin" />
//                 </div>
//               </div>
//             )}
            
//             <div ref={messagesEndRef} />
//           </CardContent>

//           <div className="border-t p-4">
//             <form onSubmit={handleSubmit} className="flex gap-2">
//               <Input
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 placeholder="Ask about farming, crops, fertilizers..."
//                 disabled={loading}
//                 className="flex-1"
//               />
//               <Button type="submit" disabled={loading || !input.trim()}>
//                 {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
//               </Button>
//             </form>
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Chatbot;

import { useState, useEffect, useRef } from "react";
// 1. Make sure chatApi is imported
import { authApi, rolesApi, chatApi } from "@/lib/api"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send, Bot, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

const Chatbot = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Namaste! I'm your agricultural assistant. Ask me anything about farming, crops, pest management, fertilizers, or government schemes for farmers."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkAuth = async () => {
    const { session } = await authApi.getSession();
    if (session) {
      setIsAuthenticated(true);
      if (session.roles && session.roles.length > 0) {
        // Assuming roles are like { role: 'farmer' }
        setUserRole(session.roles[0].role); 
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!input.trim()) return;
  //   const userMessage = input.trim();
  //   setInput("");
  //   setMessages(prev => [...prev, { role: "user", content: userMessage }]);
  //   setLoading(true);
  //   try {
  //     const response = `I understand you're asking about: "${userMessage}". ...`;
  //     setMessages(prev => [...prev, { role: "assistant", content: response }]);
  //   } catch (error) {
  //     ...
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
  // 2. This is the new, correct handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // This calls your backend AI
      const response = await chatApi.ask(newMessages); 
      const assistantMessage = { role: "assistant", content: response.text };
      
      // Update the UI with the bot's real response
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Chatbot error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to get response. Please try again.",
        variant: "destructive",
      });
      
      // 3. THIS IS THE FIXED CATCH BLOCK (no "Read" typo)
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, I encountered an error. Please try again." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={isAuthenticated} userRole={userRole} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              Agricultural AI Assistant
            </CardTitle>
            <CardDescription>
              Get expert advice on farming, crops, and agriculture
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="bg-primary p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {/* Using whitespace-pre-wrap to respect newlines from the AI */}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.role === "user" && (
                  <div className="bg-secondary p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="bg-primary p-2 rounded-full h-8 w-8 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about farming, crops, fertilizers..."
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Chatbot;