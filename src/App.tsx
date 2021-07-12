import './css/App.css'
import { Button, Card, Container, FormControl, Image, InputGroup, NavLink, OverlayTrigger, Tooltip } from "react-bootstrap";
import { BrowserRouter, Switch, Route, useHistory } from "react-router-dom";
import { useEffect, useRef, useState } from 'react';
import { AuthProvider, useAuth, User } from "./contexts/AuthContext";
import TodoList, { DEFAULT_LIST_NAME } from "./components/objects/Todolist";
import Signup from "./components/account/Signup";
import Login from "./components/account/Login";
import { database } from "./firebase";
import { v4 } from 'uuid';
import WhatsNew from "./components/WhatsNew";
import AccountForm from "./components/account/config/AccountForm";
import Profile from "./components/account/config/Profile";
import { PrivateRoute, PublicRoute } from "./components/utils/MyRoutes";
import DeleteAccount from "./components/account/config/DeleteAccount";

const UNNECESSARY_TEXT = "default.todolist.";

const DEFAULT_KEY = UNNECESSARY_TEXT + "lists";
const SHOW_DONE_KEY = UNNECESSARY_TEXT + "showDone";
const DEVICE_KEY = UNNECESSARY_TEXT + "deviceId";

const CHILD_DEVICE_TAG = "lastDeviceId";
const CHILD_TODOLIST_TAG = "todolist";
const CHILD_DELETED_TAG = "deletedTodos";

const DELETED_TASKS_LENGTH_LIMIT = 10;

export const getToolTip = text => <Tooltip id="tooltip-show-button">{text}️</Tooltip>;

const getTime = () => Date.now();

type TaskArray = (TaskData | TaskList)[];

interface TaskList
{
    listName: string,
    tasks: TaskData[]
}

interface TaskInfo
{
    taskId: string,
    taskText: string,
    isCompleted: boolean,
    isEditing: boolean,
    lastModification: number
}

class TaskData
{
    taskId: string;
    taskText: string;
    isCompleted: boolean;
    isEditing: boolean;
    lastModification: number;

    constructor(taskText = "")
    {
        this.taskId = v4();
        this.taskText = taskText;
        this.isCompleted = false;
        this.isEditing = false;
        this.lastModification = getTime();
    }

    setTask(task: TaskInfo)
    {
        this.taskId = task.taskId;
        this.setTaskValues(task);
    }

    setTaskValues(task)
    {
        this.taskText = task.taskText;
        this.isCompleted = task.isCompleted;
        this.isEditing = task.isEditing;
        this.lastModification = task.lastModification;
    }

    updateTaskParameter(props)
    {
        if (props.taskText) this.taskText = props.taskText;
        else if (props.isCompleted !== undefined) this.isCompleted = props.isCompleted;
        else if (props.isEditing !== undefined) this.isEditing = props.isEditing;
        else return;

        this.lastModification = getTime();
    }

    updateTask(props)
    {
        if (props.taskText) this.taskText = props.taskText;
        if (props.isCompleted !== undefined) this.isCompleted = props.isCompleted;
        if (props.isEditing !== undefined) this.isEditing = props.isEditing;

        this.lastModification = getTime();
    }

    static createTask(task: TaskInfo)
    {
        const taskData = new TaskData();
        taskData.setTask(task);

        return taskData;
    }
}

export default function App()
{
    const [myTodos, setTodos] = useState<TaskArray>([]);
    const [showDoneTasks, setShowDoneTasks] = useState(true);
    const inputRef = useRef<HTMLInputElement>();

    const [connectedUser, setConnectedUser] = useState<User>();

    const lastUserId = useRef<string>();
    const thisDeviceId = useRef<string>();

    const isUserRefresh = useRef(false);

    //TODO: Context Database

    //On start app
    useEffect(() =>
    {
        const savedData = localStorage.getItem(DEFAULT_KEY);
        const wasShowingDone = localStorage.getItem(SHOW_DONE_KEY) || "";

        let localDevice = localStorage.getItem(DEVICE_KEY);
        if (localDevice === 'undefined') localDevice = null;

        thisDeviceId.current = localDevice || v4();

        if (savedData)
        {
            let todos: TaskArray = [];
            const parsedData: TaskArray = JSON.parse(savedData);
            /*
                        parsedData.forEach(todo =>
                        {
                            if (todo.tasks)
                            {
                                const todolist: TaskData[] = [];
                                todo.tasks.forEach(task => todolist.push(TaskData.createTask(task)));
                                todos.push({ listName: todo.listName, tasks: todolist } as TaskList);
                            }
                            else if (todo.taskId) todos.push(TaskData.createTask(todo));
                            else todos.push({ listName: todo.listName, tasks: [] } as TaskList);
                        });*/

            todos = parsedData;


            updateTaskList(todos, false);
        }

        setShowDoneTasks(JSON.parse(wasShowingDone));
    }, []);

    useEffect(() =>
    {
        const lastId = lastUserId.current;
        if (lastId) database.child(`/${lastId}/${CHILD_TODOLIST_TAG}`).off();

        if (!connectedUser) return;

        const setDownloadUserValues = snapshot =>
        {
            const userUploadTodos: TaskArray = [];

            const allLists = snapshot.val();
            allLists?.forEach((element: TaskList | TaskInfo) =>
            {
                if (element)
                {
                    if ("listName" in element)
                    {
                        if (element.tasks)
                        {
                            const todoList: TaskData[] = [];
                            element.tasks.forEach(task => todoList.push(TaskData.createTask(task)));
                            userUploadTodos.push({ listName: element.listName, tasks: todoList } as TaskList);
                        }
                        else userUploadTodos.push(element);
                    }
                    else if ("taskId" in element) userUploadTodos.push(TaskData.createTask(element));
                }
            });

            const checkForNewOrUpdatedElement = (otherElement, array) =>
            {
                const element = array.find(e => e.taskId === otherElement.taskId);

                if (element && element.lastModification < otherElement.lastModification) element.setTaskValues(otherElement);
                else if (!element)
                {
                    obtainDeletedList().then(deletedListSnapshot =>
                    {
                        const deletedElement = deletedListSnapshot.val().find(deleted => deleted.taskId === otherElement.taskId)
                        if (!deletedElement) array.push(otherElement);
                    });
                }
            }

            if (userUploadTodos.length > 0)
            {
                myTodos.forEach(todoElement =>
                {
                    if ("listName" in todoElement)
                    {
                        const list = userUploadTodos.find(l => (l as TaskList).listName === todoElement.listName);

                        if (list)
                        {
                            const index = userUploadTodos.indexOf(list);

                            (list as TaskList).tasks?.forEach(task => checkForNewOrUpdatedElement(task, todoElement.tasks));

                            userUploadTodos[index] = todoElement;
                        }
                        else
                        {
                            obtainDeletedList().then(deleteListSnapshot =>
                            {
                                const deletedList = deleteListSnapshot.val();
                                const deletedGroup = deletedList.find(deleted => deleted.listName === todoElement.listName);

                                if (!deletedGroup) userUploadTodos.push(todoElement);
                            });
                        }
                    }
                    else checkForNewOrUpdatedElement(todoElement, userUploadTodos);
                });
                updateTaskList(userUploadTodos, false);
            }
        };

        database.child(`/${lastUserId.current = connectedUser.uid}/${CHILD_TODOLIST_TAG}`).on("value", todolistSnapshot =>
        {
            database.child(`/${connectedUser.uid}/${CHILD_DEVICE_TAG}`).once("value").then(deviceIdSnapshot =>
                {
                    const lastDevice = deviceIdSnapshot.val();
                    if (lastDevice && lastDevice !== thisDeviceId.current) setDownloadUserValues(todolistSnapshot);
                }
            );
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connectedUser]);

    useEffect(() =>
    {
        localStorage.setItem(DEFAULT_KEY, JSON.stringify(myTodos));
        localStorage.setItem(DEVICE_KEY, thisDeviceId.current || "");

        if (!connectedUser) return;

        const uploadConnectedUserValues = () =>
        {
            if (!isUserRefresh.current) return;

            const userUrl = database.child(connectedUser.uid);
            userUrl.child(CHILD_TODOLIST_TAG).set(myTodos).then(() => console.log("Uploaded values to database: " + JSON.stringify(myTodos)));
            userUrl.child(CHILD_DEVICE_TAG).set(thisDeviceId.current).then(() => console.log("Set device: " + thisDeviceId.current));
        }

        uploadConnectedUserValues();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [myTodos])

    useEffect(() => localStorage.setItem(SHOW_DONE_KEY, JSON.stringify(showDoneTasks)), [showDoneTasks]);

    function updateTaskList(todos, isUser = true)
    {
        isUserRefresh.current = isUser;
        setTodos(todos);
    }

    function obtainDeletedList()
    {
        const deletedDatabaseRef = database.child(`/${connectedUser?.uid}/${CHILD_DELETED_TAG}`);
        return deletedDatabaseRef.once('value');
    }

    function getUserInput(action)
    {
        if (!inputRef.current) return;

        const value = inputRef.current.value;
        inputRef.current.value = '';

        if (value) action(value);
    }

    const addTask = () => getUserInput(value => updateTaskList([...myTodos, new TaskData(value)]));

    const addTaskGroup = () => getUserInput(value => updateTaskList([...myTodos, { listName: value, tasks: [] }]));

    function updateRemovedList(values)
    {
        if (connectedUser)
        {
            obtainDeletedList().then(deletedListSnapshot =>
            {
                const deletedList = deletedListSnapshot.val();
                const newDeletedList = [...deletedList || [], ...values];

                console.log(newDeletedList);

                if (newDeletedList.length > DELETED_TASKS_LENGTH_LIMIT) newDeletedList.splice(0, newDeletedList.length - DELETED_TASKS_LENGTH_LIMIT);

                const deletedDatabaseRef = database.child(`/${connectedUser.uid}/${CHILD_DELETED_TAG}`);
                deletedDatabaseRef.set(newDeletedList).then(() => console.log("Added deleted list data: " + JSON.stringify(newDeletedList)));
            });
        }
    }

    function removeTasks()
    {
        const completedTodos = filterTodos(myTodos, element => element.taskId ? element.isCompleted : true);
        const notCompletedTodos = filterTodos(myTodos, element => element.taskId ? !element.isCompleted : true);

        updateRemovedList(completedTodos);
        updateTaskList(notCompletedTodos);
    }

    const findElement = (id: string, copyTodos: TaskArray) =>
    {
        copyTodos.forEach(element =>
        {
            if ("tasks" in element)
            {
                const e = element.tasks.find(e => e.taskId === id);
                if (e) return e;
            }
            else if (element?.taskId === id) return element;
        });
        return null;
    }

    const filterTodos = (copyTodos: TaskArray, condition: (e) => boolean) =>
    {
        const indexesToFilter: number[] = [];
        const filteredCopy = copyTodos.filter(condition);

        filteredCopy.forEach((todo, index) =>
        {
            if ("tasks" in todo) indexesToFilter.push(index);
        });

        indexesToFilter.forEach(index =>
        {
            const taskList = filteredCopy[index] as TaskList;
            taskList.tasks = taskList.tasks.filter(condition)
        });

        return filteredCopy;
    };

    function removeTask(id)
    {
        const deletedElement = findElement(id, myTodos);
        const todosWithoutDeletedOne = filterTodos(myTodos, element => element.taskId ? element.taskId !== id : true);

        if (!deletedElement) return;

        updateRemovedList([deletedElement]);
        updateTaskList(todosWithoutDeletedOne);
    }

    function toggleTodo(id)
    {
        const copyTodos = [...myTodos]
        const foundElement = findElement(id, copyTodos);

        if (!foundElement) return;

        const element: TaskData = foundElement as TaskData;

        element.updateTaskParameter({ isCompleted: !element.isCompleted });
        updateTaskList(copyTodos);
    }

    function toggleEdition(id, newValue)
    {
        const copyTodos = [...myTodos]
        const foundElement = findElement(id, copyTodos);

        if (!foundElement) return;

        const element: TaskData = foundElement as TaskData;

        if (element.isEditing && newValue && newValue !== element.taskText) element.updateTask({ isEditing: !element.isEditing, taskText: newValue });
        else element.updateTaskParameter({ isEditing: !element.isEditing });

        updateTaskList(copyTodos);
    }

    const getTaskLeft = () =>
    {
        let total = 0;

        myTodos.forEach(element =>
        {
            if ("tasks" in element) total += element.tasks.filter(e => !e.isCompleted).length;
            else if ("taskId" in element && !element.isCompleted) total++;
        });

        return total;
    };

    const tasksLeft = getTaskLeft();

    const handleDoneTaskToggle = () => setShowDoneTasks(!showDoneTasks);

    const filterList = list => showDoneTasks ? list : list?.filter(element => !element.isCompleted);

    const moveElementToOtherGroup = (taskId, copyTodos, otherGroup, groupToRemoveFrom) =>
    {
        if (!otherGroup) return;

        const element = groupToRemoveFrom.find(element => element.taskId === taskId);

        if (!element) return;

        const elementPosition = groupToRemoveFrom.indexOf(element);
        groupToRemoveFrom.splice(elementPosition, 1);

        if (!otherGroup.tasks) otherGroup.tasks = [element];
        else otherGroup.tasks.push(element);

        updateTaskList(copyTodos);
    }

    const DefaultTodolist = () =>
    {
        const defaultList: TaskData[] = [];

        myTodos.forEach(element =>
        {
            if (element && "taskId" in element) defaultList.push(element);
        });

        return <TodoList todos={filterList(defaultList)}
                         toggleTodo={toggleTodo}
                         deleteTask={removeTask}
                         toggleEdition={toggleEdition}
                         changeGroup={id =>
                         {
                             const copyTodos = [...myTodos];
                             const otherList = [...copyTodos].reverse().find(element =>
                             {
                                 const list = element as TaskList;
                                 return list.listName && list.listName !== DEFAULT_LIST_NAME
                             });

                             moveElementToOtherGroup(id, copyTodos, otherList, copyTodos);
                         }}
        />
    }

    function AppLayout()
    {
        const { currentUser, logout, userImage } = useAuth();
        const [loading, setLoading] = useState(false);

        const history = useHistory();

        useEffect(() => setConnectedUser(currentUser), [currentUser]);

        async function handleLogout()
        {
            try
            {
                setLoading(true)

                localStorage.clear();

                if (logout) await logout();

                history.push('/login');
            }
            catch (e)
            {
                console.log(`Controlled error: ${e}`);
            }
            setLoading(false)
        }

        return (
            <>
                {
                    (currentUser &&
                        <div className={"m-3 text-center"} style={{ width: "120px" }}>
                            <div>
                                <Image src={userImage} roundedCircle className={"profile-pic"}/>
                                <h3 className={"text-primary"}>@{currentUser.email.split('@')[0]}</h3>
                                <NavLink className={"btn btn-success text-dark"} href={"/profile"}>See Profile</NavLink>
                            </div>
                            <Button className={"w-100"} onClick={handleLogout} variant={"danger"} disabled={loading}>Log out</Button>
                        </div>
                    )
                    || <NavLink href={"/login"}>Log in</NavLink>
                }
                <NavLink className={"top-right"} href={"/whatsnew"}>What's new?</NavLink>
                <Container className={"d-flex justify-content-center align-items-center text-center"}>
                    <Card className={"w-100"} style={{ maxWidth: "500px" }}>
                        <Card.Body>
                            <h2>My List ☑️</h2>
                            <small>v2.0</small>
                            {
                                myTodos.map((todolist, index) => todolist && (
                                        todolist.tasks || !todolist.taskId ?
                                            <TodoList key={index}
                                                      todos={filterList(todolist.tasks)}
                                                      toggleTodo={toggleTodo}
                                                      deleteTask={removeTask}
                                                      toggleEdition={toggleEdition}

                                                      removeGroup={() =>
                                                      {
                                                          const copyTodos = [...myTodos];
                                                          const deletedGroup = copyTodos.splice(index, 1);
                                                          updateTaskList(copyTodos);
                                                          updateRemovedList(deletedGroup);
                                                      }}
                                                      editGroup={newName =>
                                                      {
                                                          const copyTodos = [...myTodos];
                                                          copyTodos[index].listName = newName;
                                                          updateTaskList(copyTodos);
                                                      }}
                                                      changeGroup={id =>
                                                      {
                                                          const copyTodos = [...myTodos];
                                                          const reversedTodos = [...copyTodos].reverse();

                                                          let otherList = null;

                                                          const reversedIndex = reversedTodos.indexOf(copyTodos[index]);
                                                          let i = reversedIndex;

                                                          while ((i = (i + 1) % reversedTodos.length) !== reversedIndex && !otherList)
                                                          {
                                                              if (reversedTodos[i].listName) otherList = reversedTodos[i];
                                                          }

                                                          const oldGroup = copyTodos[index];
                                                          const taskGroup = oldGroup.tasks;

                                                          moveElementToOtherGroup(id, copyTodos, otherList, taskGroup);
                                                      }}
                                                      listName={todolist.listName}/> : null
                                    )
                                )
                            }
                            <DefaultTodolist/>
                            <span>You have {tasksLeft} {tasksLeft === 1 ? 'task' : 'tasks'} left!</span>
                            <InputGroup size={"sm"}>
                                <FormControl className={"bg-dark text-primary"} style={{ maxWidth: '400px' }} type={"text"} ref={inputRef} placeholder={"Write your task here..."}/>

                                <OverlayTrigger placement={"top"} overlay={getToolTip("Add a task")}>
                                    <Button className={"icon-button-md"} variant={"primary"} size={"lg"} onClick={addTask}>+</Button>
                                </OverlayTrigger>

                                <OverlayTrigger placement={"top"} overlay={getToolTip("Add task group")}>
                                    <Button className={"icon-button-md"} variant={"dark"} size={"lg"} onClick={addTaskGroup}>✅+✅</Button>
                                </OverlayTrigger>

                                <OverlayTrigger placement={"top"} overlay={getToolTip("Remove done tasks")}>
                                    <Button className={"icon-button-md"} variant={"danger"} size={"lg"} onClick={removeTasks} disabled={myTodos.length === 0 || myTodos.length === tasksLeft}>🗑️</Button>
                                </OverlayTrigger>
                            </InputGroup>

                            <br/>
                            <OverlayTrigger placement={"top"} overlay={getToolTip(showDoneTasks ? 'Hide done tasks' : 'Show done tasks')}>
                                <Button variant={"dark"} onClick={handleDoneTaskToggle}>{showDoneTasks ? <span className={"text-danger"}>Hide</span> : <span className={"text-primary"}>Show</span>}️</Button>
                            </OverlayTrigger>
                        </Card.Body>
                    </Card>
                </Container>
            </>
        );
    }

    return (
        <BrowserRouter>
            <AuthProvider>
                <Switch>
                    <Route exact path={"/"} component={AppLayout}/>
                    <Route path={"/whatsnew"} component={WhatsNew}/>
                    <PublicRoute path={"/signup"} component={Signup}/>
                    <PublicRoute path={"/login"} component={Login}/>
                    <PrivateRoute path={"/profile"} component={Profile}/>
                    <PrivateRoute path={"/password-reset"} component={AccountForm}/>
                    <PrivateRoute path={"/delete"} component={DeleteAccount}/>
                </Switch>
            </AuthProvider>
        </BrowserRouter>
    );
}