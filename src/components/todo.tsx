import { actions, getActionProps } from "astro:actions";
import { useState } from "react";

type Props = {
  todos: {
    id: string | number;
    text: string;
  }[];
};

export const Todo: React.FC<Props> = ({todos:initialTodos}) => {
  const [todos, setTodos] = useState<Props['todos']>(initialTodos);

  return (
    <>
      <form
        method="POST"
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);

          const resp = await actions.createTodo(formData);

          setTodos([...todos, resp]);
        }}
      >
        <input {...getActionProps(actions.createTodo)} />
        <input name="text" type="text" />
        <button type="submit">Add Todo</button>
      </form>

      {todos.map((todo, idx) => (
        <div key={idx}>{todo.text}</div>
      ))}
    </>
  );
};
