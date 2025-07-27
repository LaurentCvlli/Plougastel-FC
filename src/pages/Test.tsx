import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Test() {
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('Utilisateurs').select('*')
      if (error) {
        console.error(error)
      } else {
        setUsers(data || [])
      }
    }

    fetchUsers()
  }, [])

  return (
    <div style={{ padding: '20px' }}>
      <h1>Liste des joueurs Supabase</h1>
      <ul>
        {users.map((user) => (
          <li key={user['ID key']}>
            {user.identifiant} — {user.Nom}
          </li>
        ))}
      </ul>
    </div>
  )
}
