import Task from "./Task";

export default function TodoList({ todos = [], toggleTodo, deleteTask, toggleEdition })
{
    return (
        <ul className={"list-unstyled text-left border border-white bg-dark my-5"} style={{minHeight: "150px"}}>
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