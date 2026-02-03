"use client"

import { useEffect, useState } from "react"
import { RiAddLine, RiEditLine, RiMore2Line } from "@remixicon/react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { DataTableWrapper } from "@/components/data-table-wrapper"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Course {
  id: string
  name: string
}

interface User {
  id: string
  email: string
  name: string
  role: string
  status: string
  course?: { id: string; name: string } | null
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    courseId: "",
    status: "ACTIVE",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    password: "",
    courseId: "",
    status: "ACTIVE",
  })
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.ok && res.json())
      .then((data) => (Array.isArray(data) ? setCourses(data) : []))
      .catch(() => setCourses([]))
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch {
      toast.error("Failed to fetch users")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.courseId
    )
      return
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          courseId: formData.courseId,
          status: formData.status,
        }),
      })
      const data = await response.json()
      if (response.ok) {
        toast.success("Program head added successfully")
        setFormData({
          name: "",
          email: "",
          password: "",
          courseId: "",
          status: "ACTIVE",
        })
        setAddModalOpen(false)
        fetchUsers()
      } else {
        toast.error(data.error || "Failed to add user")
      }
    } catch {
      toast.error("Failed to add user")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setEditFormData({
      name: user.name,
      email: user.email,
      password: "",
      courseId: user.course?.id ?? "",
      status: user.status ?? "ACTIVE",
    })
    setEditModalOpen(true)
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    if (!editFormData.name.trim() || !editFormData.email.trim()) return
    setIsUpdating(true)
    try {
      const payload: Record<string, unknown> = {
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        courseId: editFormData.courseId || null,
        status: editFormData.status,
      }
      if (editFormData.password && editFormData.password.length >= 6) {
        payload.password = editFormData.password
      }
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (response.ok) {
        toast.success("User updated successfully")
        setEditModalOpen(false)
        setEditingUser(null)
        fetchUsers()
      } else {
        toast.error(data.error || "Failed to update user")
      }
    } catch {
      toast.error("Failed to update user")
    } finally {
      setIsUpdating(false)
    }
  }

  const updateStatus = async (user: User, newStatus: string) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        toast.success(`Status updated to ${newStatus === "ACTIVE" ? "Active" : "Inactive"}`)
        fetchUsers()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to update status")
      }
    } catch {
      toast.error("Failed to update status")
    }
  }

  const StatusBadge = ({ status }: { status: string }) => (
    <span
      className={
        status === "ACTIVE"
          ? "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium text-white bg-linear-to-r from-emerald-600 to-teal-600"
          : "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium text-white bg-linear-to-r from-red-800 to-rose-900"
      }
    >
      {status === "ACTIVE" ? "Active" : "Inactive"}
    </span>
  )

  const columns = [
    {
      id: "no",
      header: "#",
      cell: (_row: User, rowIndex?: number) => (
        <span className="text-muted-foreground">{rowIndex ?? "-"}</span>
      ),
      headerClassName: "w-12",
    },
    {
      id: "name",
      header: "Name",
      sortable: true,
      getSortValue: (row: User) => row.name,
      cell: (row: User) => <div className="font-medium">{row.name}</div>,
    },
    {
      id: "email",
      header: "Email",
      sortable: true,
      getSortValue: (row: User) => row.email,
      cell: (row: User) => (
        <span className="text-muted-foreground">{row.email}</span>
      ),
    },
    {
      id: "course",
      header: "Course",
      sortable: true,
      getSortValue: (row: User) => row.course?.name ?? "",
      cell: (row: User) => (
        <span className="text-muted-foreground">
          {row.course?.name ?? "-"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      getSortValue: (row: User) => row.status ?? "ACTIVE",
      cell: (row: User) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 hover:bg-transparent"
            >
              <StatusBadge status={row.status ?? "ACTIVE"} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => updateStatus(row, "ACTIVE")}>
              <StatusBadge status="ACTIVE" />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateStatus(row, "INACTIVE")}>
              <StatusBadge status="INACTIVE" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
    {
      id: "role",
      header: "Role",
      sortable: true,
      getSortValue: (row: User) => row.role,
      cell: (row: User) => (
        <span className="text-muted-foreground">
          {row.role === "PROGRAM_HEAD" ? "Program Head" : row.role}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: (row: User) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 data-[state=open]:bg-muted"
            >
              <RiMore2Line className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEditModal(row)}>
              <RiEditLine className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      headerClassName: "w-24",
    },
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:gap-6 lg:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">User Management</h1>
              <p className="text-xs text-muted-foreground sm:text-sm mt-1">
                Add and manage program heads who can create and submit reports
              </p>
            </div>
            <Button onClick={() => setAddModalOpen(true)} className="w-full sm:w-auto" size="sm">
              <RiAddLine className="mr-2 h-4 w-4" />
              Add Program Head
            </Button>
          </div>
          <Card className="py-2">
            <CardContent className="pt-2 pb-2 px-3 sm:px-4 md:px-6">
              {isLoading ? (
                <div className="py-8 text-muted-foreground">Loading...</div>
              ) : (
                <DataTableWrapper
                  columns={columns}
                  data={users}
                  getRowId={(row) => row.id}
                  emptyMessage="No program heads yet"
                  emptyStateDescription="Add program heads to allow them to create and submit reports"
                  emptyStateAction={
                    <Button onClick={() => setAddModalOpen(true)}>
                      <RiAddLine className="mr-2 h-4 w-4" />
                      Add Program Head
                    </Button>
                  }
                  searchPlaceholder="Search users..."
                  getSearchableText={(row) =>
                    `${row.name} ${row.email} ${row.role} ${row.course?.name ?? ""} ${row.status}`
                  }
                />
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent title="Add Program Head" className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Program Head</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-name">Name</Label>
              <Input
                id="user-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Full name"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="user@example.com"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-password">Password</Label>
              <Input
                id="user-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, password: e.target.value }))
                }
                placeholder="Min. 6 characters"
                required
                minLength={6}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-course">Course</Label>
              <Select
                value={formData.courseId}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, courseId: v }))
                }
                required
                disabled={isSubmitting}
              >
                <SelectTrigger id="user-course" className="w-full">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {courses.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Add courses in the Courses module first.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, status: v }))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="user-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !formData.name.trim() ||
                  !formData.email.trim() ||
                  formData.password.length < 6 ||
                  !formData.courseId
                }
              >
                {isSubmitting ? "Adding..." : "Add Program Head"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open)
          if (!open) setEditingUser(null)
        }}
      >
        <DialogContent title="Edit Program Head" className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Program Head</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-user-name">Name</Label>
              <Input
                id="edit-user-name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Full name"
                required
                disabled={isUpdating}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-user-email">Email</Label>
              <Input
                id="edit-user-email"
                type="email"
                value={editFormData.email}
                onChange={(e) =>
                  setEditFormData((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="user@example.com"
                required
                disabled={isUpdating}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-user-password">Password (leave blank to keep current)</Label>
              <Input
                id="edit-user-password"
                type="password"
                value={editFormData.password}
                onChange={(e) =>
                  setEditFormData((p) => ({ ...p, password: e.target.value }))
                }
                placeholder="Min. 6 characters"
                minLength={6}
                disabled={isUpdating}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-user-course">Course</Label>
              <Select
                value={editFormData.courseId || "__none__"}
                onValueChange={(v) =>
                  setEditFormData((p) => ({
                    ...p,
                    courseId: v === "__none__" ? "" : v,
                  }))
                }
                disabled={isUpdating}
              >
                <SelectTrigger id="edit-user-course" className="w-full">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-user-status">Status</Label>
              <Select
                value={editFormData.status}
                onValueChange={(v) =>
                  setEditFormData((p) => ({ ...p, status: v }))
                }
                disabled={isUpdating}
              >
                <SelectTrigger id="edit-user-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isUpdating ||
                  !editFormData.name.trim() ||
                  !editFormData.email.trim()
                }
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
