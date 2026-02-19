"use client";

import api from "@/utils/axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type TaskStatus = "PENDING" | "COMPLETED";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  createdAt: string;
}

const API = "http://localhost:5000";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/tasks`, {
        params: {
          page,
          search,
          status: statusFilter || undefined,
        },
      });

      setTasks(res?.data?.data || []);
      setTotalPages(res?.data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Fetch tasks error:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, search, statusFilter]);

  // =============================
  // Create Task
  // =============================
  const handleCreateOrUpdate = async () => {
    if (!title.trim()) {
      toast.warning("Task title is required");
      return;
    }

    const toastId = toast.loading(
      editId ? "Updating task..." : "Creating task...",
    );

    try {
      if (editId) {
        // UPDATE
        await api.put(`/tasks/${editId}`, {
          title,
          description,
        });

        toast.update(toastId, {
          render: "Task updated successfully ✏",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
      } else {
        // CREATE
        await api.post(`/tasks`, { title, description });

        toast.update(toastId, {
          render: "Task created successfully 🎉",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
      }

      // Reset form
      setTitle("");
      setDescription("");
      setEditId(null);
      fetchTasks();
    } catch (error) {
      toast.update(toastId, {
        render: editId
          ? "Failed to update task ❌"
          : "Failed to create task ❌",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };
  const handleEdit = (task: Task) => {
    setEditId(task.id);
    setTitle(task.title || "");
    setDescription(task.description || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // =============================
  // Delete Task
  // =============================
  const handleDelete = async (id: string) => {
    const toastId = toast.loading("Deleting task...");

    try {
      await api.delete(`/tasks/${id}`);

      toast.update(toastId, {
        render: "Task deleted 🗑",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      fetchTasks();
    } catch (error) {
      toast.update(toastId, {
        render: "Failed to delete task ❌",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  // =============================
  // Toggle Task
  // =============================
  const handleToggle = async (id: string) => {
    const toastId = toast.loading("Updating task...");

    try {
      await api.patch(`/tasks/${id}/toggle`);

      toast.update(toastId, {
        render: "Task updated ✔",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      fetchTasks();
    } catch (error) {
      toast.update(toastId, {
        render: "Failed to update task ❌",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  const handleLogout = async () => {
    const toastId = toast.loading("Logging out...");

    try {
      await api.post("/auth/logout");

      toast.update(toastId, {
        render: "Logged out successfully 👋",
        type: "success",
        isLoading: false,
        autoClose: 1500,
      });

      window.location.href = "/login";
    } catch (error) {
      toast.update(toastId, {
        render: "Logout failed ❌",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Task Manager
          </h1>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-xl shadow hover:bg-red-600 transition-all duration-200"
          >
            Logout
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white/70 backdrop-blur-lg shadow-xl rounded-2xl p-6 border border-white/40">
          {/* Create Task */}
          <div className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl shadow-lg mb-8">
            <div className="flex flex-col gap-4">
              {/* Inputs Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Task Title */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 px-4 py-3 rounded-xl
          focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          outline-none transition-all duration-200"
                    placeholder="Enter task title..."
                    value={title || ""}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Task Description */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 px-4 py-3 rounded-xl
          focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          outline-none transition-all duration-200"
                    placeholder="Enter description..."
                    value={description || ""}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Buttons Section */}
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={handleCreateOrUpdate}
                  disabled={!title?.trim()}
                  className={`h-[48px] px-6 rounded-xl font-semibold shadow-md
        transition-all duration-200 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${
          editId
            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        }`}
                >
                  {editId ? "✏ Update Task" : "➕ Add Task"}
                </button>

                {editId && (
                  <button
                    onClick={() => {
                      setEditId(null);
                      setTitle("");
                      setDescription("");
                    }}
                    className="h-[48px] px-6 rounded-xl font-medium
          bg-gray-100 hover:bg-gray-200 text-gray-700
          transition-all duration-200 active:scale-95"
                  >
                    ❌ Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <input
              className="border border-gray-200 p-3 rounded-xl w-full focus:ring-2 focus:ring-purple-400 outline-none"
              placeholder="🔍 Search by title"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />

            <select
              className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none"
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value);
              }}
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Task List */}
          {loading ? (
            <div className="text-center py-6 text-gray-500 animate-pulse">
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              📭 No tasks found. Start by adding one!
            </div>
          ) : (
            <ul className="space-y-4">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center 
             gap-4 p-4 rounded-xl bg-white shadow-sm border border-gray-100 
             hover:shadow-md transition-all"
                >
                  {/* Left Section */}
                  <div className="flex-1">
                    <h3
                      className={`text-lg font-semibold ${
                        task.status === "COMPLETED"
                          ? "line-through text-gray-400"
                          : "text-gray-800"
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {task.description}
                      </p>
                    )}

                    <span
                      className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${
                        task.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  {/* Buttons Section */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {/* Toggle Button */}
                    <button
                      onClick={() => handleToggle(task.id)}
                      className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg 
      transition-all duration-200
      ${
        task.status === "COMPLETED"
          ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
          : "bg-green-500 text-white hover:bg-green-600 shadow-sm"
      }`}
                    >
                      {task.status === "COMPLETED"
                        ? "↩ Undo"
                        : "✔ Mark Complete"}
                    </button>
                    <button
                      onClick={() => handleEdit(task)}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium 
             bg-yellow-100 text-yellow-700 rounded-lg 
             hover:bg-yellow-200 transition-all duration-200"
                    >
                      ✏ Edit
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium 
                 bg-red-100 text-red-600 rounded-lg 
                 hover:bg-red-200 transition-all duration-200"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination */}
          <div className="flex justify-center items-center gap-6 mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-4 py-2 bg-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-300 transition"
            >
              ⬅ Prev
            </button>

            <span className="text-gray-600 font-medium">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages || 1))}
              className="px-4 py-2 bg-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-300 transition"
            >
              Next ➡
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
