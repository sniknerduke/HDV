import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Search, Plus, Pencil, Trash2, CheckCircle2, XCircle, BookOpen, Users, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { Course as SvcCourse, createCourse, deleteCourseRemote, getCourses, persistCoursesSnapshot, updateCourseRemote } from '../../services/courseService'
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend as ChartLegend, CategoryScale, LinearScale, BarElement, type ChartOptions } from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'

ChartJS.register(ArcElement, ChartTooltip, ChartLegend, CategoryScale, LinearScale, BarElement)

const chartPalette = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#22c55e', '#cbd5e1']
const pieOptions: ChartOptions<'pie'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' } },
}

const horizontalBarOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: { legend: { display: false } },
  scales: {
    x: { beginAtZero: true, ticks: { precision: 0 } },
    y: { ticks: { autoSkip: false } },
  },
}

type Course = SvcCourse
type StatusFilter = 'all' | 'draft' | 'published'

type Props = {
  onOpenCourse?: (course: Course) => void;
}

export default function CourseManagement({ onOpenCourse }: Props) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [category, setCategory] = useState<'all' | string>('all')

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [publishingId, setPublishingId] = useState<number | null>(null)
  const [statsChartKey, setStatsChartKey] = useState(0)

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    category: 'Programming',
    level: 'Beginner',
    price: '',
    duration: '',
    status: 'draft' as 'draft' | 'published',
  })

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      setLoading(false)
      setLoadError('Bạn cần đăng nhập để quản lý khóa học.')
      toast.error('Bạn cần đăng nhập để quản lý khóa học.')
      return
    }
    setAuthToken(token)
    ;(async () => {
      try {
        const data = await getCourses(token)
        setCourses(data)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải danh sách khóa học'
        setLoadError(message)
        toast.error(message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (!isStatsOpen) return
    const id = requestAnimationFrame(() => setStatsChartKey(prev => prev + 1))
    return () => cancelAnimationFrame(id)
  }, [isStatsOpen])

  const categories = useMemo(() => {
    const unique = new Set<string>()
    courses.forEach(course => {
      if (course.category) unique.add(course.category)
    })
    return Array.from(unique)
  }, [courses])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return courses.filter(course => {
      const matchesQuery =
        !query ||
        course.title.toLowerCase().includes(query) ||
        (course.code ? course.code.toLowerCase().includes(query) : false)
      const matchesStatus = status === 'all' || course.status === status
      const matchesCategory = category === 'all' || course.category === category
      return matchesQuery && matchesStatus && matchesCategory
    })
  }, [courses, search, status, category])

  const total = courses.length
  const totalPublished = courses.filter(course => course.status === 'published').length
  const totalStudents = courses.reduce((acc, course) => acc + course.students, 0)
  const estimatedRevenue = courses.reduce((acc, course) => acc + course.students * course.price, 0)
  const totalDraft = total - totalPublished
  const averagePrice = total ? Math.round(courses.reduce((acc, course) => acc + course.price, 0) / total) : 0
  const averageDuration = total
    ? Math.round(
        courses.reduce((acc, course) => {
          const hours = Number(course.duration.match(/\d+/)?.[0] ?? 0)
          return acc + (Number.isFinite(hours) ? hours : 0)
        }, 0) / total
      )
    : 0

  const statusData = useMemo(
    () => [
      { name: 'Xuất bản', value: totalPublished, color: '#22c55e' },
      { name: 'Nháp', value: totalDraft, color: '#cbd5e1' },
    ],
    [totalDraft, totalPublished]
  )

  const categoryData = useMemo(() => {
    const map = new Map<string, number>()
    courses.forEach(course => {
      const key = course.category || 'Khác'
      map.set(key, (map.get(key) ?? 0) + 1)
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [courses])

  const topCoursesByStudents = useMemo(() => {
    return [...courses]
      .sort((a, b) => b.students - a.students)
      .slice(0, 5)
      .map(course => ({
        name: course.title.length > 24 ? `${course.title.slice(0, 22)}…` : course.title,
        students: course.students,
      }))
  }, [courses])

  const topCoursesChartData = topCoursesByStudents.length
    ? topCoursesByStudents
    : [
        { name: 'React cơ bản (demo)', students: 120 },
        { name: 'UI/UX fundamentals (demo)', students: 95 },
        { name: 'Java Spring (demo)', students: 80 },
        { name: 'Marketing 101 (demo)', students: 64 },
        { name: 'Business basics (demo)', students: 48 },
      ]

  const hasCourseData = total > 0
  const statusChartData = hasCourseData
    ? statusData
    : [
        { name: 'Xuất bản (demo)', value: 6, color: '#22c55e' },
        { name: 'Nháp (demo)', value: 3, color: '#cbd5e1' },
      ]
  const categoryChartData = categoryData.length
    ? categoryData
    : [
        { name: 'Programming (demo)', value: 4 },
        { name: 'Design (demo)', value: 2 },
        { name: 'Business (demo)', value: 1 },
      ]

  const statusChartConfig = useMemo(
    () => ({
      labels: statusChartData.map(item => item.name),
      datasets: [
        {
          data: statusChartData.map(item => item.value),
          backgroundColor: statusChartData.map(item => item.color),
          borderWidth: 1,
        },
      ],
    }),
    [statusChartData]
  )

  const categoryChartConfig = useMemo(
    () => ({
      labels: categoryChartData.map(item => item.name),
      datasets: [
        {
          data: categoryChartData.map(item => item.value),
          backgroundColor: categoryChartData.map((_, idx) => chartPalette[idx % chartPalette.length]),
          borderWidth: 1,
        },
      ],
    }),
    [categoryChartData]
  )

  const topCoursesChartConfig = useMemo(
    () => ({
      labels: topCoursesChartData.map(item => item.name),
      datasets: [
        {
          data: topCoursesChartData.map(item => item.students),
          backgroundColor: topCoursesChartData.map((_, idx) => chartPalette[(idx + 2) % chartPalette.length]),
          borderWidth: 1,
        },
      ],
    }),
    [topCoursesChartData]
  )

  const resetForm = () => {
    setFormData({
      code: '',
      title: '',
      description: '',
      category: 'Programming',
      level: 'Beginner',
      price: '',
      duration: '',
      status: 'draft',
    })
  }

  const handleCreateCourse = () => {
    setEditingCourse(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      code: course.code ?? '',
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      price: course.price ? String(course.price) : '',
      duration: course.duration ? (course.duration.match(/\d+/)?.[0] ?? '') : '',
      status: course.status,
    })
    setIsDialogOpen(true)
  }

  const validateForm = () => {
    if (!formData.code.trim()) {
      toast.error('Vui lòng nhập mã khóa học')
      return false
    }
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tên khóa học')
      return false
    }
    const priceValue = Number(formData.price)
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      toast.error('Giá khóa học phải lớn hơn 0')
      return false
    }
    const durationValue = Number(formData.duration)
    if (!Number.isFinite(durationValue) || durationValue <= 0) {
      toast.error('Thời lượng khóa học phải lớn hơn 0')
      return false
    }
    if (!authToken) {
      toast.error('Thiếu token xác thực. Vui lòng đăng nhập lại.')
      return false
    }
    return { priceValue, durationValue }
  }

  const handleSaveCourse = async () => {
    const validation = validateForm()
    if (!validation) {
      return
    }

    const { priceValue, durationValue } = validation
    if (!authToken) {
      return
    }

    setIsSaving(true)
    try {
      if (editingCourse) {
        const updated = await updateCourseRemote(
          editingCourse.id,
          {
            code: formData.code.trim(),
            title: formData.title.trim(),
            description: formData.description.trim(),
            price: Math.round(priceValue),
            duration: Math.round(durationValue),
          },
          authToken,
          {
            category: formData.category,
            level: formData.level,
            status: formData.status,
            students: editingCourse.students,
            duration: `${Math.round(durationValue)} giờ`,
          }
        )
        setCourses(prev => {
          const next = prev.map(course =>
            course.id === updated.id
              ? { ...updated, sections: updated.sections ?? course.sections }
              : course
          )
          persistCoursesSnapshot(next)
          return next
        })
        toast.success('Cập nhật khóa học thành công!')
      } else {
        const created = await createCourse(
          {
            code: formData.code.trim(),
            title: formData.title.trim(),
            description: formData.description.trim(),
            price: Math.round(priceValue),
            duration: Math.round(durationValue),
            category: formData.category,
            level: formData.level,
            status: formData.status,
          },
          authToken
        )
        setCourses(prev => {
          const next = [...prev, created]
          persistCoursesSnapshot(next)
          return next
        })
        toast.success('Tạo khóa học thành công!')
      }
      setEditingCourse(null)
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể lưu khóa học'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (courseId: number) => {
    if (!authToken) {
      toast.error('Thiếu token xác thực. Vui lòng đăng nhập lại.')
      return
    }
    if (!confirm('Bạn chắc chắn muốn xóa khóa học này?')) {
      return
    }
    setDeletingId(courseId)
    try {
      await deleteCourseRemote(courseId, authToken)
      setCourses(prev => {
        const next = prev.filter(course => course.id !== courseId)
        persistCoursesSnapshot(next)
        return next
      })
      toast.success('Xóa khóa học thành công!')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể xóa khóa học'
      toast.error(message)
    } finally {
      setDeletingId(null)
    }
  }

  const handlePublishToggle = async (courseId: number) => {
    if (!authToken) {
      toast.error('Thiếu token xác thực. Vui lòng đăng nhập lại.')
      return
    }
    const target = courses.find(course => course.id === courseId)
    if (!target) {
      toast.error('Không tìm thấy khóa học cần cập nhật')
      return
    }
    if (!target.code) {
      toast.error('Khóa học chưa có mã. Vui lòng cập nhật trước khi đổi trạng thái.')
      return
    }

    const nextStatus: 'draft' | 'published' = target.status === 'published' ? 'draft' : 'published'
    const parsedDuration = Number(target.duration.match(/\d+/)?.[0] ?? 0)
    const safeDuration = Number.isFinite(parsedDuration) && parsedDuration > 0 ? Math.round(parsedDuration) : 1

    setPublishingId(courseId)
    try {
      const updated = await updateCourseRemote(
        courseId,
        {
          code: target.code,
          title: target.title,
          description: target.description,
          price: Math.round(target.price),
          duration: safeDuration,
        },
        authToken,
        {
          category: target.category,
          level: target.level,
          status: nextStatus,
          students: target.students,
          duration: target.duration || `${safeDuration} giờ`,
        }
      )
      setCourses(prev => {
        const next = prev.map(course =>
          course.id === updated.id
            ? { ...updated, sections: updated.sections ?? course.sections }
            : course
        )
        persistCoursesSnapshot(next)
        return next
      })
      toast.success('Cập nhật trạng thái khóa học thành công!')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể cập nhật trạng thái khóa học'
      toast.error(message)
    } finally {
      setPublishingId(null)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8 text-center text-gray-600">Đang tải danh sách khóa học...</CardContent>
        </Card>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8 text-center text-red-600">{loadError}</CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mb-2">Quản lý khóa học</h1>
          <p className="text-gray-600">Theo dõi, tạo mới và chỉnh sửa khóa học của hệ thống</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isStatsOpen} onOpenChange={setIsStatsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">Xem thống kê</Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Thống kê khóa học</DialogTitle>
                <DialogDescription>Tổng quan nhanh về số liệu khóa học bạn quản lý.</DialogDescription>
              </DialogHeader>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Trạng thái</h4>
                  </div>
                  <div className="h-72 w-full">
                    {isStatsOpen && (
                      <Pie
                        key={`status-${statsChartKey}`}
                        data={statusChartConfig}
                        options={pieOptions}
                      />
                    )}
                    {!hasCourseData && (
                      <p className="mt-2 text-xs text-slate-500">Hiển thị số liệu demo do chưa có dữ liệu thực.</p>
                    )}
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Danh mục</h4>
                  </div>
                  <div className="h-72 w-full">
                    {isStatsOpen && (
                      <Bar
                        key={`category-${statsChartKey}`}
                        data={categoryChartConfig}
                        options={horizontalBarOptions}
                      />
                    )}
                    {categoryData.length === 0 && (
                      <p className="mt-2 text-xs text-slate-500">Đang hiển thị danh mục demo để minh họa.</p>
                    )}
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Top khóa học theo học viên</h4>
                  </div>
                  <div className="h-72 w-full">
                    {isStatsOpen && (
                      <Bar
                        key={`top-${statsChartKey}`}
                        data={topCoursesChartConfig}
                        options={horizontalBarOptions}
                      />
                    )}
                    {topCoursesByStudents.length === 0 && (
                      <p className="mt-2 text-xs text-slate-500">Đang hiển thị dữ liệu demo do chưa có số liệu thực.</p>
                    )}
                  </div>
                </Card>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isDialogOpen}
            onOpenChange={open => {
              setIsDialogOpen(open)
              if (!open) {
                setEditingCourse(null)
                resetForm()
              }
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={handleCreateCourse}>
                <Plus className="w-4 h-4 mr-2" /> Thêm khóa học
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCourse ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}</DialogTitle>
                <DialogDescription>Vui lòng nhập thông tin chi tiết của khóa học</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Mã khóa học</Label>
                  <Input
                    value={formData.code}
                    onChange={event => setFormData(prev => ({ ...prev, code: event.target.value }))}
                    placeholder="VD: REACT-2025"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <Label>Tên khóa học</Label>
                  <Input
                    value={formData.title}
                    onChange={event => setFormData(prev => ({ ...prev, title: event.target.value }))}
                    placeholder="VD: React nâng cao"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <Label>Mô tả</Label>
                  <Textarea
                    rows={4}
                    value={formData.description}
                    onChange={event => setFormData(prev => ({ ...prev, description: event.target.value }))}
                    placeholder="Mô tả chi tiết khóa học..."
                    disabled={isSaving}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Danh mục</Label>
                    <Select
                      value={formData.category}
                      onValueChange={value => setFormData(prev => ({ ...prev, category: value }))}
                      disabled={isSaving}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Programming">Lập trình</SelectItem>
                        <SelectItem value="Design">Thiết kế</SelectItem>
                        <SelectItem value="Business">Kinh doanh</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Cấp độ</Label>
                    <Select
                      value={formData.level}
                      onValueChange={value => setFormData(prev => ({ ...prev, level: value }))}
                      disabled={isSaving}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Cấp độ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Cơ bản</SelectItem>
                        <SelectItem value="Intermediate">Trung cấp</SelectItem>
                        <SelectItem value="Advanced">Nâng cao</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Giá (VNĐ)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.price}
                      onChange={event => setFormData(prev => ({ ...prev, price: event.target.value }))}
                      placeholder="1500000"
                      disabled={isSaving}
                    />
                  </div>
                  <div>
                    <Label>Thời lượng (giờ)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.duration}
                      onChange={event => setFormData(prev => ({ ...prev, duration: event.target.value }))}
                      placeholder="40"
                      disabled={isSaving}
                    />
                  </div>
                </div>
                <div>
                  <Label>Trạng thái</Label>
                  <Select
                    value={formData.status}
                    onValueChange={value => setFormData(prev => ({ ...prev, status: value as 'draft' | 'published' }))}
                    disabled={isSaving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Bản nháp</SelectItem>
                      <SelectItem value="published">Xuất bản</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                  Hủy
                </Button>
                <Button onClick={handleSaveCourse} disabled={isSaving}>
                  {isSaving ? 'Đang lưu...' : editingCourse ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng khóa học</p>
              <p className="text-3xl font-semibold">{total}</p>
            </div>
            <BookOpen className="w-10 h-10 text-blue-600 opacity-20" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Đã xuất bản</p>
              <p className="text-3xl font-semibold">{totalPublished}</p>
            </div>
            <CheckCircle2 className="w-10 h-10 text-green-600 opacity-20" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng học viên</p>
              <p className="text-3xl font-semibold">{totalStudents}</p>
            </div>
            <Users className="w-10 h-10 text-purple-600 opacity-20" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Doanh thu ước tính</p>
              <p className="text-3xl font-semibold">{(estimatedRevenue / 1_000_000).toFixed(1)}M</p>
            </div>
            <DollarSign className="w-10 h-10 text-orange-600 opacity-20" />
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Tìm kiếm theo tên hoặc mã"
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </div>
          <Select value={status} onValueChange={value => setStatus(value as StatusFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="published">Xuất bản</SelectItem>
              <SelectItem value="draft">Nháp</SelectItem>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={value => setCategory(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách khóa học</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên khóa học</TableHead>
                <TableHead>Mã</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Cấp độ</TableHead>
                <TableHead className="text-right">Giá (VNĐ)</TableHead>
                <TableHead>Thời lượng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Học viên</TableHead>
                <TableHead className="w-[220px]">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(course => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.code ?? '-'}</TableCell>
                  <TableCell>{course.category}</TableCell>
                  <TableCell>{course.level}</TableCell>
                  <TableCell className="text-right">{course.price.toLocaleString('vi-VN')}</TableCell>
                  <TableCell>{course.duration || '-'}</TableCell>
                  <TableCell>
                    {course.status === 'published' ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Xuất bản</Badge>
                    ) : (
                      <Badge variant="secondary">Nháp</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{course.students}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {onOpenCourse ? (
                        <Button variant="outline" size="sm" onClick={() => onOpenCourse(course)}>
                          <BookOpen className="w-4 h-4 mr-1" /> Nội dung
                        </Button>
                      ) : null}
                      <Button variant="outline" size="sm" onClick={() => handleEditCourse(course)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePublishToggle(course.id)}
                        disabled={publishingId === course.id}
                      >
                        {course.status === 'published' ? (
                          <XCircle className="w-4 h-4 text-red-600" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(course.id)}
                        disabled={deletingId === course.id}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-500">
                    Không có khóa học phù hợp
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
