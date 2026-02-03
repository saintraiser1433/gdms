"use client"

import { useEffect, useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTableWrapper } from "@/components/data-table-wrapper"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { RiAddLine, RiDeleteBinLine, RiEditLine } from "@remixicon/react"

interface Course {
  id: string
  name: string
  abbreviation: string
  createdAt: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [newCourseName, setNewCourseName] = useState("")
  const [newCourseAbbreviation, setNewCourseAbbreviation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [editName, setEditName] = useState("")
  const [editAbbreviation, setEditAbbreviation] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses")
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch {
      toast.error("Failed to fetch courses")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCourseName.trim()) return
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCourseName.trim(),
          abbreviation: newCourseAbbreviation.trim(),
        }),
      })
      const data = await response.json()
      if (response.ok) {
        toast.success("Course added successfully")
        setNewCourseName("")
        setNewCourseAbbreviation("")
        setAddModalOpen(false)
        fetchCourses()
      } else {
        toast.error(data.error || "Failed to add course")
      }
    } catch {
      toast.error("Failed to add course")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (course: Course) => {
    setEditingCourse(course)
    setEditName(course.name)
    setEditAbbreviation(course.abbreviation ?? "")
    setEditModalOpen(true)
  }

  const closeEditModal = () => {
    setEditModalOpen(false)
    setEditingCourse(null)
    setEditName("")
    setEditAbbreviation("")
  }

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCourse || !editName.trim()) return
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/courses/${editingCourse.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          abbreviation: editAbbreviation.trim(),
        }),
      })
      const data = await response.json()
      if (response.ok) {
        toast.success("Course updated successfully")
        closeEditModal()
        fetchCourses()
      } else {
        toast.error(data.error || "Failed to update course")
      }
    } catch {
      toast.error("Failed to update course")
    } finally {
      setIsUpdating(false)
    }
  }

  const openDeleteDialog = (id: string, name: string) => {
    setCourseToDelete({ id, name })
    setDeleteDialogOpen(true)
  }

  const deleteCourse = async () => {
    if (!courseToDelete) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/courses/${courseToDelete.id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast.success("Course deleted successfully")
        fetchCourses()
        setCourseToDelete(null)
      } else {
        toast.error("Failed to delete course")
      }
    } catch {
      toast.error("Failed to delete course")
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = [
    {
      id: "no",
      header: "#",
      cell: (_row: Course, rowIndex?: number) => (
        <span className="text-muted-foreground">{rowIndex ?? "-"}</span>
      ),
      headerClassName: "w-12",
    },
    {
      id: "name",
      header: "Course Name",
      sortable: true,
      getSortValue: (row: Course) => row.name,
      cell: (row: Course) => <div className="font-medium">{row.name}</div>,
    },
    {
      id: "abbreviation",
      header: "Abbreviation",
      sortable: true,
      getSortValue: (row: Course) => row.abbreviation ?? "",
      cell: (row: Course) => (
        <span className="text-muted-foreground">{row.abbreviation || "-"}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: (row: Course) => (
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => openEditModal(row)}
            title="Edit"
          >
            <RiEditLine className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => openDeleteDialog(row.id, row.name)}
            title="Delete"
          >
            <RiDeleteBinLine className="h-4 w-4" />
          </Button>
        </div>
      ),
      headerClassName: "w-24",
    },
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Card className="pb-2">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-2xl">Courses</CardTitle>
                <CardDescription>
                  Add and manage course offerings for reports
                </CardDescription>
              </div>
              <Button onClick={() => setAddModalOpen(true)}>
                <RiAddLine className="mr-2 h-4 w-4" />
                Add Course
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-muted-foreground">Loading...</div>
              ) : (
                <DataTableWrapper
                  columns={columns}
                  data={courses}
                  getRowId={(row) => row.id}
                  emptyMessage="No courses yet"
                  emptyStateDescription="Add courses that can be selected when creating reports"
                  emptyStateAction={
                    <Button onClick={() => setAddModalOpen(true)}>
                      <RiAddLine className="mr-2 h-4 w-4" />
                      Add Course
                    </Button>
                  }
                  searchPlaceholder="Search courses..."
                  getSearchableText={(row) => `${row.name} ${row.abbreviation ?? ""}`.trim()}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent title="Add Course" className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Course</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCourse} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="course-name">Course Name</Label>
              <Input
                id="course-name"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                placeholder="e.g. Bachelor of Science in Nursing"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="course-abbreviation">Abbreviation</Label>
              <Input
                id="course-abbreviation"
                value={newCourseAbbreviation}
                onChange={(e) => setNewCourseAbbreviation(e.target.value)}
                placeholder="e.g. BSN"
                disabled={isSubmitting}
              />
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
              <Button type="submit" disabled={isSubmitting || !newCourseName.trim()}>
                {isSubmitting ? "Adding..." : "Add Course"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editModalOpen} onOpenChange={(open) => !open && closeEditModal()}>
        <DialogContent title="Edit Course" className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditCourse} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-course-name">Course Name</Label>
              <Input
                id="edit-course-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Bachelor of Science in Nursing"
                required
                disabled={isUpdating}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-course-abbreviation">Abbreviation</Label>
              <Input
                id="edit-course-abbreviation"
                value={editAbbreviation}
                onChange={(e) => setEditAbbreviation(e.target.value)}
                placeholder="e.g. BSN"
                disabled={isUpdating}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeEditModal}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating || !editName.trim()}>
                {isUpdating ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setCourseToDelete(null)
        }}
        title="Delete course?"
        description={
          courseToDelete
            ? `Are you sure you want to delete "${courseToDelete.name}"? This action cannot be undone.`
            : "This action cannot be undone."
        }
        onConfirm={deleteCourse}
        isLoading={isDeleting}
      />
    </SidebarProvider>
  )
}
