import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { wsService } from '@/services/websocket';
import { encryptionService } from '@/lib/encryption';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Send, MoreVertical, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ChatInterfaceProps {
  userId: string;
  onBack?: () => void;
}

const ChatInterface = ({ userId, onBack }: ChatInterfaceProps) => {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<any>(null);
  const [blockStatus, setBlockStatus] = useState({ isBlocked: false, blockedByMe: false });
  const [showUserDetails, setShowUserDetails] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load other user details first, then messages
  useEffect(() => {
    const init = async () => {
      try {
        const user = await api.getUserDetails(userId);
        setOtherUser(user);
      } catch (error) {
        console.error('Failed to load user details:', error);
      }
    };
    init();
    checkBlockStatus();
  }, [userId]);

  // Load messages only after otherUser is available
  useEffect(() => {
    if (otherUser?.publicKey) {
      loadMessages();
    }
  }, [otherUser?.publicKey, userId]);

  useEffect(() => {
    if (!otherUser?.publicKey) return;

    const unsubscribe = wsService.onMessage((data) => {
      if (data.type === 'new_message' && data.message.senderId === userId) {
        try {
          const decryptedContent = encryptionService.decrypt(
            data.message.content, 
            data.message.sender?.publicKey || otherUser.publicKey
          );
          setMessages(prev => [...prev, { ...data.message, content: decryptedContent }]);
        } catch (error) {
          console.error('Decryption error:', error);
          setMessages(prev => [...prev, data.message]);
        }
      }
      if (data.type === 'message_sent') {
        try {
          const decryptedContent = encryptionService.decrypt(data.message.content, otherUser.publicKey);
          setMessages(prev => [...prev, { ...data.message, content: decryptedContent }]);
        } catch (error) {
          console.error('Decryption error:', error);
          setMessages(prev => [...prev, data.message]);
        }
      }
    });

    return unsubscribe;
  }, [userId, otherUser?.publicKey]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const loadMessages = async () => {
    try {
      const msgs = await api.getMessages(userId);
      const myPublicKey = localStorage.getItem('publicKey');
      
      // Decrypt messages
      const decryptedMsgs = msgs.map((msg: any) => {
        try {
          // For decryption with crypto_box:
          // If I sent it, use RECIPIENT's public key. If they sent it, use THEIR public key.
          const decryptionKey = msg.senderId === currentUser?.id 
            ? otherUser?.publicKey  // I sent it - use recipient's key
            : msg.sender?.publicKey; // They sent it - use sender's key
          
          if (!decryptionKey) {
            console.error('Missing decryption key for message:', msg.id);
            return msg;
          }
          
          const decryptedContent = encryptionService.decrypt(msg.content, decryptionKey);
          return { ...msg, content: decryptedContent };
        } catch (error) {
          console.error('Decryption error for message:', msg.id, error);
          return msg;
        }
      });
      setMessages(decryptedMsgs);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };


  const checkBlockStatus = async () => {
    try {
      const status = await api.checkBlockStatus(userId);
      setBlockStatus(status);
    } catch (error) {
      console.error('Failed to check block status:', error);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || blockStatus.isBlocked || !otherUser?.publicKey) return;

    try {
      const encryptedMessage = encryptionService.encrypt(newMessage, otherUser.publicKey);
      
      wsService.sendMessage(userId, encryptedMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Encryption error:', error);
      toast.error('Failed to encrypt message');
    }
  };

  const handleBlock = async () => {
    try {
      if (blockStatus.blockedByMe) {
        await api.unblockUser(userId);
        toast.success('User unblocked');
      } else {
        await api.blockUser(userId);
        toast.success('User blocked');
      }
      checkBlockStatus();
      setShowUserDetails(false);
    } catch (error) {
      toast.error('Failed to update block status');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="md:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </Button>
          )}
          <button
            onClick={() => setShowUserDetails(true)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser?.profilePicture} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {otherUser ? getInitials(otherUser.name) : '??'}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <h2 className="font-semibold">{otherUser?.name || 'User'}</h2>
              <p className="text-xs text-muted-foreground">Click for details</p>
            </div>
          </button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowUserDetails(true)}
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4 bg-muted/10">
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwn = message.senderId === currentUser?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isOwn
                      ? 'bg-chat-sent text-chat-text-sent rounded-br-sm'
                      : 'bg-chat-received text-chat-text-received rounded-bl-sm'
                  }`}
                >
                  <p className="break-words">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    isOwn ? 'text-chat-text-sent/70' : 'text-chat-text-received/70'
                  }`}>
                    {format(new Date(message.createdAt), 'HH:mm')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        {blockStatus.isBlocked ? (
          <div className="text-center text-muted-foreground py-2">
            {blockStatus.blockedByMe
              ? 'You have blocked this user'
              : 'You are blocked by this user'}
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={otherUser?.profilePicture} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {otherUser ? getInitials(otherUser.name) : '??'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{otherUser?.name}</h3>
                <p className="text-muted-foreground">{otherUser?.phoneNumber}</p>
              </div>
            </div>

            {otherUser?.bio && (
              <div>
                <p className="text-sm font-medium mb-1">Bio</p>
                <p className="text-sm text-muted-foreground">{otherUser.bio}</p>
              </div>
            )}

            <Button
              onClick={handleBlock}
              variant={blockStatus.blockedByMe ? 'outline' : 'destructive'}
              className="w-full"
            >
              {blockStatus.blockedByMe ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Unblock User
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4 mr-2" />
                  Block User
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatInterface;