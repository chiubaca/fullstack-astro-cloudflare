import { useState } from "react";
import { Image } from "@unpic/react";

import { actions, getActionProps } from "astro:actions";

import { makeImageUrl } from "../lib/bucket-access";

import type { Todo } from "../types";

export type TodoProps = {
  todos: Todo[];
};

export const Todos: React.FC<TodoProps> = ({ todos: initialTodos }) => {
  const [todos, setTodos] = useState<TodoProps["todos"]>(initialTodos);
  const [error, setError] = useState<string>("");

  return (
    <>
      {error && <>{error}</>}

      <form
        method="POST"
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);

          const resp = await actions.createTodo(formData);

          if (resp.type === "error") {
            setError(resp.message);
            return;
          }

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
            <Image src={makeImageUrl(todo.imageRef)} width={400} height={400} />
          )}
        </div>
      ))}
    </>
  );
};
