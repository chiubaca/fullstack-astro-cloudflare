import { useState } from "react";
import { Image } from "@unpic/react";

import { actions, getActionProps } from "astro:actions";

import { makeImageUrl } from "../lib/bucket-access";

import type { Message } from "../types";

export type MessagesProps = {
  messages: Message[];
};

export const Messages: React.FC<MessagesProps> = ({
  messages: initialMessages,
}) => {
  const [messages, setMessages] =
    useState<MessagesProps["messages"]>(initialMessages);
  const [error, setError] = useState<string>("");

  return (
    <>
      {error && <>{error}</>}

      <form
        method="POST"
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);

          const resp = await actions.createMessage(formData);

          if (resp.type === "error") {
            setError(resp.message);
            return;
          }

          setMessages([...messages, resp.data]);
        }}
      >
        <input {...getActionProps(actions.createMessage)} />
        <input name="text" type="text" />
        <input type="file" id="file-upload" name="imageFile" accept="image/*" />
        <button type="submit">Add Message</button>
      </form>

      {messages.map((message) => (
        <div key={message.id}>
          <div>{message.text}</div>

          {message.imageRef && (
            <Image
              src={makeImageUrl(message.imageRef)}
              width={400}
              height={400}
            />
          )}
        </div>
      ))}
    </>
  );
};
