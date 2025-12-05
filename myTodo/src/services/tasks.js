import { supabase } from '../lib/supabaseClient'

// NOTE: This code expects a Supabase table named `tasks` with columns:
// id (primary key), todo (text), is_completed (boolean), created_at (timestamp)

export async function getTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  return data.map(row => ({ id: row.id, todo: row.todo, isCompleted: row.is_completed }))
}

export async function addTask(todo) {
  const { data, error } = await supabase.from('tasks').insert([{ todo, is_completed: false }]).select()

  if (error) throw error
  const row = data[0]
  return { id: row.id, todo: row.todo, isCompleted: row.is_completed }
}

export async function updateTask(id, updates) {
  // updates expects { todo?, isCompleted? }
  const payload = {}
  if (typeof updates.todo !== 'undefined') payload.todo = updates.todo
  if (typeof updates.isCompleted !== 'undefined') payload.is_completed = updates.isCompleted

  const { data, error } = await supabase
    .from('tasks')
    .update(payload)
    .eq('id', id)
    .select()

  if (error) throw error
  const row = data[0]
  return { id: row.id, todo: row.todo, isCompleted: row.is_completed }
}

export async function deleteTask(id) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}
