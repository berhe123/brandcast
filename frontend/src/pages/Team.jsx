import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, User, Ban, CheckCircle2, Trash2, Loader2, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { getUsers, updateUser, deleteUser } from '../services/api'
import { useAuth } from '../context/AuthContext'

const initials = (u) => (u.name || u.email || '?').slice(0, 2).toUpperCase()
const fmt = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—')

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
    setBusyId(id)
    try {
      await deleteUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      toast.success('Member removed')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Team members</h2>
          <p className="text-sm text-slate-500">{users.length} member{users.length !== 1 ? 's' : ''} · invite by sharing the login link</p>
        </div>
        <span className="badge bg-violet-500/15 text-violet-300 border-violet-500/30">
          <ShieldCheck size={12} /> Admin view
        </span>
      </div>

      <div className="card overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <div className="col-span-5">Member</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2 hidden sm:block">Status</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>

        {users.map((u) => {
          const isMe = u.id === me.id
          const disabled = u.status === 'disabled'
          return (
            <motion.div
              key={u.id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-slate-800/60 items-center hover:bg-slate-800/20"
            >
              {/* Member */}
              <div className="col-span-5 flex items-center gap-3 min-w-0">
                {u.avatar
                  ? <img src={u.avatar} alt="" className="w-9 h-9 rounded-lg object-cover" />
                  : <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">{initials(u)}</div>}
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{u.name} {isMe && <span className="text-xs text-slate-500">(you)</span>}</p>
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1"><Mail size={11} /> {u.email}</p>
                </div>
              </div>

              {/* Role */}
              <div className="col-span-2">
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md ${u.role === 'admin' ? 'bg-violet-500/15 text-violet-300' : 'bg-slate-800 text-slate-400'}`}>
                  {u.role === 'admin' ? <ShieldCheck size={11} /> : <User size={11} />} {u.role}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-2 hidden sm:block">
                <span className={`text-xs ${disabled ? 'text-red-400' : 'text-green-400'}`}>
                  {disabled ? 'Disabled' : 'Active'}
                </span>
                <p className="text-[11px] text-slate-600">{u.contentCount} posts · joined {fmt(u.createdAt)}</p>
              </div>

              {/* Actions */}
              <div className="col-span-3 flex items-center justify-end gap-1.5">
                {busyId === u.id ? (
                  <Loader2 size={15} className="animate-spin text-slate-500" />
                ) : isMe ? (
                  <span className="text-xs text-slate-600">—</span>
                ) : (
                  <>
                    <button
                      onClick={() => patch(u.id, { role: u.role === 'admin' ? 'member' : 'admin' }, 'Role updated')}
                      className="btn-ghost py-1 px-2 text-xs"
                      title={u.role === 'admin' ? 'Demote to member' : 'Promote to admin'}
                    >
                      {u.role === 'admin' ? <User size={13} /> : <ShieldCheck size={13} />}
                    </button>
                    <button
                      onClick={() => patch(u.id, { status: disabled ? 'active' : 'disabled' }, disabled ? 'Account enabled' : 'Account disabled')}
                      className={`btn-ghost py-1 px-2 text-xs ${disabled ? 'text-green-400' : 'text-amber-400'}`}
                      title={disabled ? 'Enable' : 'Disable'}
                    >
                      {disabled ? <CheckCircle2 size={13} /> : <Ban size={13} />}
                    </button>
                    <button
                      onClick={() => remove(u.id)}
                      className="btn-ghost py-1 px-2 text-xs text-red-400"
                      title="Remove"
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

      <p className="text-xs text-slate-600">
        The first account to sign in becomes the admin. Promote teammates to admin, disable access, or remove members here.
      </p>
    </div>
  )
}
