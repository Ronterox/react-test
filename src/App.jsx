import './css/App.css'
import {Fragment, useEffect, useRef, useState} from 'react';
import {v4} from 'uuid';
import TodoList from "./components/Todolist";
import AddToHomeScreen from '@ideasio/add-to-homescreen-react';

const TODO_KEY = "ricardo.todolist"
const SHOW_DONE_KEY = "ricardo.todolist.showDone"

export default function App()
{
    const inputRef = useRef();
    const [myTodos, setTodos] = useState([]);
    const [showDoneTasks, setShowDoneTasks] = useState(true);

    //On start app
    useEffect(() =>
    {
        const savedData = localStorage.getItem(TODO_KEY);
        const wasShowingDone = localStorage.getItem(SHOW_DONE_KEY);

        if (savedData !== undefined) setTodos(JSON.parse(savedData))
        setShowDoneTasks(JSON.parse(wasShowingDone));

    }, []);

    useEffect(() => localStorage.setItem(TODO_KEY, JSON.stringify(myTodos)), [myTodos]);
    useEffect(() => localStorage.setItem(SHOW_DONE_KEY, JSON.stringify(showDoneTasks)), [showDoneTasks])

    function AddTask()
    {
        const value = inputRef.current?.value;

        if (value === '') return;

        setTodos(prevState => [...prevState, { id: v4(), text: value, completed: false, editing: false }]);
        inputRef.current.value = '';
    }

    function RemoveTasks()
    {
        setTodos(myTodos.filter(element => !element.completed));
    }

    function RemoveTask(id)
    {
        setTodos(myTodos.filter(element => element.id !== id));
    }

    function ToggleTodo(id)
    {
        setTodos(prevState =>
        {
            const copyTodos = [...prevState]

            const element = copyTodos.find(element => element.id === id);
            element.completed = !element.completed;

            return copyTodos;
        });
    }

    function ToggleEdition(id, newValue)
    {
        const copyTodos = [...myTodos]

        const element = copyTodos.find(element => element.id === id);

        if (element.editing && newValue !== '') element.text = newValue;
        element.editing = !element.editing;

        console.log(JSON.stringify(newValue));

        setTodos(copyTodos);
    }

    const tasksLeft = myTodos.filter(element => !element.completed).length;

    function FilterDoneTasks()
    {
        setShowDoneTasks(!showDoneTasks);
    }

    return (
        <Fragment>
            <AddToHomeScreen/>

            <h2>My List</h2>
            <TodoList todos={showDoneTasks ? myTodos : myTodos.filter(element => !element.completed)}
                      toggleTodo={ToggleTodo} deleteTask={RemoveTask} toggleEdition={ToggleEdition}/>

            <br/>
            <input placeholder={"Write a task..."} ref={inputRef} type={"text"}/>
            <button onClick={AddTask}>➕</button>
            <button onClick={RemoveTasks} disabled={myTodos.length === 0}>🗑️</button>

            <br/><br/>
            <span>You have {tasksLeft} {tasksLeft === 1 ? 'Task' : 'Tasks'} left!</span>
            <br/>

            <button onClick={FilterDoneTasks}>{showDoneTasks ? <>👁️‍🗨️</> : <>✖️</>}️</button>
        </Fragment>
    );
}