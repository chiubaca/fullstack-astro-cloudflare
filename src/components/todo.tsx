import { useState } from "react";
import { Image } from "@unpic/react";

import { actions, getActionProps } from "astro:actions";

import { makeImageUrl } from "../lib/bucket-access";


export type TodoProps = {
  todos: {
    id: string | number;
    text: string;
    createdAt: string;
    imageRef: string | null;
  }[];
};

export const Todo: React.FC<TodoProps> = ({ todos: initialTodos }) => {
  const [todos, setTodos] = useState<TodoProps["todos"]>(initialTodos);

  return (
    <>
      <form
        method="POST"
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);

          const resp = await actions.createTodo(formData);

          if (!resp.data) return;

          setTodos([...todos, resp.data]);
        }}
      >
        <input {...getActionProps(actions.createTodo)} />
        <input name="text" type="text" />
        <input type="file" id="file-upload" name="imageFile" accept="image/*" />
        <button type="submit">Add Todo</button>
      </form>

      {todos.map((todo) => (
        <div key={todo.id}>
          <div>{todo.text}</div>

          {todo.imageRef && (
            <Image
              src={makeImageUrl(todo.imageRef)}
              width={400}
              height={400}
            />
          )}
        </div>
      ))}
    </>
  );
};
