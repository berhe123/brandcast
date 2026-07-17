import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, User, Ban, CheckCircle2, Trash2, Mail, Clock3 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getUsers, updateUser, deleteUser } from '../services/api'
import { useAuth } from '../context/AuthContext'

const initials = (u) => (u.name || u.email || '?').slice(0, 2).toUpperCase()
const fmt = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—')

export default function Team() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const load = () => {
    setLoading(true)
    getUsers()
      .then((res) => setUsers(res.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const patch = async (id, body, okMsg) => {
    setBusyId(id)
    try {
      const res = await updateUser(id, body)
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...res.data } : u)))
      toast.success(okMsg)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Remove this user from Brandcast?')) return
    setBusyId(id)
    try {
      await deleteUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      toast.success('User removed')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Users</h2>
          <p className="text-sm text-slate-500">
            Admin control of everyone who signed in with email or Google · {users.length} account{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <span className="badge bg-green-500/15 text-green-700 border-green-500/30">
          <ShieldCheck size={12} /> Admin
        </span>
      </div>

      <div className="card overflow-hidden">
        <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-3 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <div className="col-span-4">User</div>
          <div className="col-span-2">Provider</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Last login</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {users.length === 0 ? (
          <p className="text-center text-slate-500 text-sm py-12">No users yet — they’ll appear here after login.</p>
        ) : users.map((u) => {
          const isMe = u.id === me.id
          const disabled = u.status === 'disabled'
          return (
            <motion.div
              key={u.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 px-4 py-3 border-b border-slate-200 items-center hover:bg-slate-50"
            >
              <div className="sm:col-span-4 flex items-center gap-3 min-w-0">
                {u.avatar
                  ? <img src={u.avatar} alt="" className="w-9 h-9 rounded-lg object-cover" />
                  : (
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                      {initials(u)}
                    </div>
                  )}
                <div className="min-w-0">
                  <p className="text-sm text-slate-900 truncate">
                    {u.name} {isMe && <span className="text-xs text-slate-500">(you)</span>}
                  </p>
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                    <Mail size={11} /> {u.email}
                  </p>
                </div>
              </div>

              <div className="sm:col-span-2">
                <span className="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-600 capitalize">
                  {u.provider || 'email'}
                </span>
              </div>

              <div className="sm:col-span-2">
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md ${u.role === 'admin' ? 'bg-green-500/15 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                  {u.role === 'admin' ? <ShieldCheck size={11} /> : <User size={11} />} {u.role}
                </span>
                {disabled && <span className="ml-1 text-[10px] text-red-600">disabled</span>}
              </div>

              <div className="sm:col-span-2 text-xs text-slate-500 flex items-center gap-1">
                <Clock3 size={12} /> {fmt(u.lastLoginAt)}
              </div>

              <div className="sm:col-span-2 flex justify-end gap-1 flex-wrap">
                {!isMe && (
                  <>
                    <button
                      disabled={busyId === u.id}
                      onClick={() => patch(u.id, { role: u.role === 'admin' ? 'member' : 'admin' }, 'Role updated')}
                      className="btn-ghost py-1.5 px-2 text-xs"
                    >
                      {u.role === 'admin' ? 'Make member' : 'Make admin'}
                    </button>
                    <button
                      disabled={busyId === u.id}
                      onClick={() => patch(u.id, { status: disabled ? 'active' : 'disabled' }, disabled ? 'Enabled' : 'Disabled')}
                      className="btn-ghost py-1.5 px-2 text-xs"
                    >
                      {disabled ? <CheckCircle2 size={13} /> : <Ban size={13} />}
                    </button>
                    <button
                      disabled={busyId === u.id}
                      onClick={() => remove(u.id)}
                      className="btn-ghost py-1.5 px-2 text-xs text-red-600"
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
