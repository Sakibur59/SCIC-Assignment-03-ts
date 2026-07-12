'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { 
  Users, Search, Phone, Trash2, Plus, User, Mail,
  AlertCircle, X, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserType {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'patient' | 'doctor' | 'admin';
  createdAt: string;
  profilePicture?: string;
  status?: 'active' | 'inactive';
}

// ✅ Delete Confirmation Modal
const DeleteModal = ({ isOpen, onClose, onConfirm, userName, userRole, loading }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Delete User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete <span className="font-semibold text-gray-800 dark:text-white">{userName}</span>?
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Role: <span className="font-medium capitalize">{userRole}</span>
          </p>
          <p className="text-sm text-red-400 dark:text-red-300 mt-2">
            This action cannot be undone. All associated data will be removed.
          </p>
        </div>

        <div className="flex gap-3 mt-4">
          <button onClick={onClose} disabled={loading} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete User
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: '',
    userName: '',
    userRole: '',
    loading: false,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  // ✅ Load all users from database
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">Admin</span>;
      case 'doctor':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Doctor</span>;
      case 'patient':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Patient</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">{role}</span>;
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'All' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    doctors: users.filter(u => u.role === 'doctor').length,
    patients: users.filter(u => u.role === 'patient').length,
  };

  const handleDeleteClick = (id: string, name: string, role: string) => {
    setDeleteModal({
      isOpen: true,
      userId: id,
      userName: name,
      userRole: role,
      loading: false,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));
      
      if (deleteModal.userId === user?._id) {
        toast.error('You cannot delete your own account');
        setDeleteModal(prev => ({ ...prev, isOpen: false, loading: false }));
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${deleteModal.userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete user');
      }

      toast.success('User deleted successfully');
      setDeleteModal(prev => ({ ...prev, isOpen: false, loading: false }));
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage all users in the system</p>
            <p className="text-sm text-blue-500 dark:text-blue-400 mt-1">{stats.total} total users</p>
          </div>
          <button
            onClick={loadUsers}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Users</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Admins</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.admins}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Doctors</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.doctors}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Patients</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.patients}</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <option value="All">All Roles</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
            </select>
          </div>
        </div>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-100 dark:border-gray-700">
            <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400">No users found</h3>
            <p className="text-gray-400 dark:text-gray-500 mt-2">No users match your search criteria.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {u.profilePicture ? (
                            <img src={u.profilePicture} alt={u.name} className="w-10 h-10 rounded-full" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                              {u.name?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white">{u.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {u.phone || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteClick(u._id, u.name, u.role)}
                          className="text-red-500 hover:text-red-600 transition-colors p-1"
                          disabled={u._id === user?._id}
                          title={u._id === user?._id ? "Cannot delete yourself" : "Delete user"}
                        >
                          <Trash2 className={`h-4 w-4 ${u._id === user?._id ? 'opacity-50 cursor-not-allowed' : ''}`} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        userName={deleteModal.userName}
        userRole={deleteModal.userRole}
        loading={deleteModal.loading}
      />
    </>
  );
}