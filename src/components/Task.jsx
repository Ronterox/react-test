import React, {useRef} from 'react';

export default function Task({ todo, toggleTodo, deleteTask, toggleEdition })
{
    const checkBoxTodo = (
        <>
            <input type={"checkbox"} checked={todo.completed} onChange={() => toggleTodo(todo.id)}/>
            {
                todo.completed?<strike>{todo.text}</strike> : <>{todo.text}</>
            }
            &nbsp;
        </>
    );

    const inputRef = useRef('');

    const inputBoxTodo = (
        <>
            <input type={"text"} ref={inputRef} placeholder={todo.text}/>&nbsp;
        </>
    );

    return (
        <li>
            {
                todo.editing ? inputBoxTodo : checkBoxTodo
            }
            <button onClick={() => toggleEdition(todo.id, inputRef.current?.value)}>✏️</button>
            <button onClick={() => deleteTask(todo.id)}>🗑️</button>
        </li>
    );
}