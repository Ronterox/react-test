import Task from "./Task";

export default function TodoList({ todos = [], toggleTodo, deleteTask, toggleEdition })
{
    return (
        <ul>
            {
                todos.map(function (item)
                {
                    return <Task key={item.id}
                                 todo={item}
                                 toggleTodo={toggleTodo}
                                 deleteTask={deleteTask}
                                 toggleEdition={toggleEdition}
                    />;
                })
            }
        </ul>
    );
};