"use client";

import useConversation from "@/hooks/useConversation";
import { FullMessageType } from "@/types";
import { useEffect, useRef, useState } from "react";

import MessageBox from "./MessageBox";
import axios from "axios";
import { pusherClient } from "@/libs/pusher";
import { find } from "lodash";

interface BodyProps {
  initialMessages: FullMessageType[]
}

const Body: React.FC<BodyProps> = ({
  initialMessages
}) => {

  const [messages, setMessages] = useState(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { conversationId } = useConversation();

  useEffect(() => {
    // 打开页面后,标记为已读
    axios.post(`/api/conversations/${conversationId}/seen`)
  }, [conversationId])

  useEffect(() => {
    pusherClient.subscribe(conversationId);
    bottomRef?.current?.scrollIntoView();

    const messageHandler = (message: FullMessageType) => {
      axios.post(`/api/conversations/${conversationId}/seen`);
      setMessages((current) => {
        if (find(current, { id: message.id })) {
          return current;
        }
        return [...current, message];
      })
    }

    const updateMessageHandler = (newMessage: FullMessageType) => {
      setMessages((current) => {
        return current.map((currentMessage) => {
          if (currentMessage.id === newMessage.id) {
            return newMessage;
          }
          return currentMessage;
        })
      })
    }

    pusherClient.bind('messages:new', messageHandler);
    pusherClient.bind('message:update', updateMessageHandler);

    return () => {
      pusherClient.unsubscribe(conversationId);
      pusherClient.unbind('messages:new');
      pusherClient.unbind('message:update');
    }
  }, [conversationId]);

  return (
    <div
      className="flex-1 overflow-y-auto"
    >
      {
        messages.map((message, i) => {
          return (
            <MessageBox
              key={message.id}
              data={message}
              isLast={i === messages.length - 1}
            />
          )
        })
      }
      <div
        ref={bottomRef}
        className="pt-24"
      />
    </div>
  )
}

export default Body;
