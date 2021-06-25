import Task from "./Task";

export default function TodoList({ todos = [], toggleTodo, deleteTask, toggleEdition })
{
    return (
        <ul className={"list-unstyled text-left border border-white p-5 my-5"}>
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