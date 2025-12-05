import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import * as tasksService from './services/tasks';

function App() {
  const [todo, setTodo] = useState("");
  const [todos, setTodos] = useState([]);
  const [showFinished, setShowFinished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Load todos from Supabase on initial load
  useEffect(() => {
    let mounted = true
    setLoading(true)
    tasksService.getTasks()
      .then(rows => {
        if (!mounted) return
        setTodos(rows)
      })
      .catch(err => {
        console.error(err)
        setError(err.message || String(err))
      })
      .finally(() => mounted && setLoading(false))

    return () => { mounted = false }
  }, [])

  const toggleFinished = () => {
    setShowFinished(!showFinished);
  };

  const handleEdit = (id) => {
    const todoToEdit = todos.find(item => item.id === id);
    setTodo(todoToEdit.todo);
    setEditingId(id);
  };

  const handleDelete = (id) => {
    // Optimistic UI update
    const newTodos = todos.filter(item => item.id !== id);
    setTodos(newTodos);
    tasksService.deleteTask(id).catch(err => {
      console.error(err)
      setError(err.message || String(err))
      // Revert UI on failure
      tasksService.getTasks().then(rows => setTodos(rows))
    })
  };

  const handleAdd = () => {
    if (todo.trim()) {
      setTodo("")
      setLoading(true)
      
      // If we're editing, update the existing task
      if (editingId) {
        tasksService.updateTask(editingId, { todo })
          .then(row => {
            setTodos(prev => prev.map(t => t.id === editingId ? row : t))
            setEditingId(null)
          })
          .catch(err => {
            console.error(err)
            setError(err.message || String(err))
          })
          .finally(() => setLoading(false))
      } else {
        // Otherwise, add a new task
        tasksService.addTask(todo)
          .then(row => {
            setTodos(prev => [row, ...prev])
          })
          .catch(err => {
            console.error(err)
            setError(err.message || String(err))
          })
          .finally(() => setLoading(false))
      }
    }
  };

  const handleChange = (e) => {
    setTodo(e.target.value);
  };

  const handleCheckbox = (id) => {
    const index = todos.findIndex(t => t.id === id)
    if (index === -1) return
    const item = todos[index]
    const updated = { ...item, isCompleted: !item.isCompleted }
    // Optimistic UI
    setTodos(prev => prev.map(t => t.id === id ? updated : t))

    tasksService.updateTask(id, { isCompleted: updated.isCompleted })
      .then(row => {
        // keep row in sync
        setTodos(prev => prev.map(t => t.id === id ? row : t))
      })
      .catch(err => {
        console.error(err)
        setError(err.message || String(err))
        // revert on failure
        tasksService.getTasks().then(rows => setTodos(rows))
      })
  };

  return (
    <>
      <Navbar />
{console.log("The todo-list being rendered.")}

      <div className="md:container mx-3 md:mx-auto my-5 rounded-xl p-5 bg-gray-800 min-h-[80vh] md:w-[40%]">
        <h1 className='text-green-500 text-center text-2xl max-sm:text-sm font-bold'>mySchemes - Your schemes and agenda are stored</h1>
        
        <div className="addTodo my-5">
          <h2 className="text-2xl font-bold text-green-500 my-4 max-sm:text-sm">{editingId ? 'Edit your task' : 'Add your list'}</h2>
          <div className="flex text-black max-sm:justify-between">
            <input onChange={handleChange} value={todo} type="text" className='w-full rounded-full p-1 focus:outline-none focus:border-cyan-400 bg-white' />
            <button onClick={handleAdd} disabled={todo.length < 3} className='bg-cyan-500 disabled:bg-red-500 text-black rounded-full mx-2 font-bold p-2 py-1 hover:bg-cyan-400 w-fit'>{editingId ? 'Update' : 'Save'}</button>
          </div>
        </div>
        
        <div className='text-cyan-500 flex items-center gap-5'>
          <input onChange={toggleFinished} type="checkbox" checked={showFinished} className='cursor-pointer max-sm:h-3' />
          <label className='mx-2 my-3 max-sm:my-2 max-sm:text-sm' htmlFor="show">Show Finished</label>
        </div>
        
        <div className="h-px bg-white opacity-65 mx-auto my-3 w-[90%] "></div>
        
        <h2 className='text-2xl font-bold text-green-500 my-6 max-sm:text-base'>Your List</h2>
        
        <div className="todos">
          {loading && <div className='m-5 font-bold text-green-500 text-2xl'>Loading...</div>}
          {!loading && todos.length === 0 && <div className='m-5 font-bold text-green-500 text-2xl'>List is Empty</div>}
          {error && <div className='m-5 font-bold text-red-400'>{error}</div>}
          {todos.map(item => (
            (showFinished || !item.isCompleted) && (
              <div key={item.id} className="todo flex items-center my-3 justify-between">
                <div className='flex gap-5 '>
                  <input name={item.id} onChange={() => handleCheckbox(item.id)} type="checkbox" checked={item.isCompleted} className='cursor-pointer' />
                  <div className={`text-white max-sm:text-sm ${item.isCompleted ? "line-through" : ""}`}>
                    {item.todo}
                  </div>
                </div>
                <div className="buttons flex h-full gap-1">
                  <button onClick={() => handleEdit(item.id)} className='bg-green-500 items-center py-2 text-sm text-black rounded-xl flex justify-center w-10 font-bold mx-1 hover:bg-green-400'>
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className='bg-red-500 items-center py-2 text-sm text-black rounded-xl flex justify-center w-10 font-bold mx-1 hover:bg-red-400'>
                    <MdDelete />
                  </button>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default App;

