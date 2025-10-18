'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { boardsApi } from '../utils/boardsApi';

export default function ManageAccessModal({ boardId, onClose, onChanged }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [roleToAdd, setRoleToAdd] = useState('viewer');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await boardsApi.getBoardPermissions(boardId);
        setPermissions(data.permissions || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [boardId]);

  const refreshPermissions = async () => {
    const data = await boardsApi.getBoardPermissions(boardId);
    setPermissions(data.permissions || []);
  };

  const handleSearch = async (q) => {
    setSearch(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await boardsApi.searchUsers(q, 8);
      setSearchResults(res.users || []);
    } catch (err) {
      // ignore
    }
  };

  const handleAdd = async (userId) => {
    try {
      await boardsApi.addBoardPermission(boardId, { user_id: userId, role: roleToAdd });
      setSearch('');
      setSearchResults([]);
      await refreshPermissions();
      if (onChanged) onChanged();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await boardsApi.updateBoardPermission(boardId, userId, { role });
      await refreshPermissions();
      if (onChanged) onChanged();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemove = async (userId) => {
    if (!confirm('Remove this user from the board?')) return;
    try {
      await boardsApi.removeBoardPermission(boardId, userId);
      await refreshPermissions();
      if (onChanged) onChanged();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Transition appear show as={Fragment}>
      <Dialog as="div" className="relative z-[1000]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white p-0 shadow-2xl transition-all">
                <div className="px-5 py-4 border-b border-slate-200">
                  <Dialog.Title className="text-lg font-semibold text-slate-800">Manage Access</Dialog.Title>
                </div>
                {error && <div className="mx-5 mt-4 mb-0 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
                <div className="max-h-[70vh] overflow-y-auto p-5 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Add user</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Search by name or email"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                      />
                      <select value={roleToAdd} onChange={(e) => setRoleToAdd(e.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm">
                        <option value="viewer">viewer</option>
                        <option value="reviewer">reviewer</option>
                        <option value="editor">editor</option>
                      </select>
                    </div>
                    {searchResults.length > 0 && (
                      <div className="mt-2 overflow-hidden rounded border border-slate-200">
                        {searchResults.map(u => (
                          <div key={u.id} className="flex items-center justify-between border-b border-slate-100 px-3 py-2 text-sm">
                            <div>{u.first_name} {u.last_name} <span className="text-slate-500">({u.email})</span></div>
                            <button onClick={() => handleAdd(u.id)} className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">Add</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Current members</label>
                    <div className="overflow-hidden rounded border border-slate-200">
                      {loading ? (
                        <div className="p-3 text-center text-slate-500 text-sm">Loading...</div>
                      ) : permissions.length === 0 ? (
                        <div className="p-3 text-slate-500 text-sm">No members yet.</div>
                      ) : permissions.map(p => {
                        const name = `${p.first_name || ''} ${p.last_name || ''}`.trim();
                        const label = name || p.email || 'Unknown user';
                        return (
                          <div key={p.user_id} className="flex items-center justify-between border-b border-slate-100 px-3 py-2 text-sm">
                            <div>{label}{p.email && name ? <span className="text-slate-500"> ({p.email})</span> : null}</div>
                            <div className="flex gap-2">
                              <select value={p.role} onChange={(e) => handleRoleChange(p.user_id, e.target.value)} className="rounded border border-slate-300 px-2 py-1 text-sm">
                                <option value="viewer">viewer</option>
                                <option value="reviewer">reviewer</option>
                                <option value="editor">editor</option>
                                <option value="owner" disabled>owner</option>
                              </select>
                              <button onClick={() => handleRemove(p.user_id)} className="rounded border border-slate-300 px-2 py-1 text-sm hover:bg-slate-50">Remove</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">
                  <button onClick={onClose} className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">Close</button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}