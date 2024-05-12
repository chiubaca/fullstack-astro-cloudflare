import { actions, getActionProps } from "astro:actions";
import { useState } from "react";

export const Todo = () => {
  const [todos, setTodos] = useState<string[]>([]);

  return (
    <>
      <form
        method="POST"
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);

          const todo = await actions.createTodo(formData);

          setTodos([...todos, todo]);
        }}
      >
        <input {...getActionProps(actions.createTodo)} />
        <input name="text" type="text" />
        <button type="submit">Add Todo</button>
      </form>

      {todos.map((todo, idx) => (
        <div key={idx}>{todo}</div>
      ))}

      <div>test..</div>
    </>
  );
};
