import { useCallback, useEffect, useMemo, useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { BookOpen, Home, GraduationCap, Users, LogOut, Menu, Bell, ShoppingCart as CartIcon, FileText, User as UserIcon } from 'lucide-react';
import { Button } from './components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from './components/ui/dropdown-menu';
import { Popover, PopoverTrigger, PopoverContent } from './components/ui/popover';
import { Toaster } from './components/ui/sonner';
import GuestHome from './components/guest/GuestHome';
import CourseCatalog from './components/guest/CourseCatalog';
import { toast } from 'sonner';
import CourseDetail from './components/guest/CourseDetail';
import About from './components/guest/About';
import Contact from './components/guest/Contact';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import VerifyAccount from './components/auth/VerifyAccount';
import StudentDashboard from './components/student/StudentDashboard';
import MyCourses from './components/student/MyCourses';
import CourseContent from './components/student/CourseContent';
import StudentProfile from './components/student/StudentProfile';
import ShoppingCart from './components/student/ShoppingCart';
import Checkout from './components/student/Checkout';
import PaymentReturn from './components/student/PaymentReturn';
import TransactionHistory from './components/student/TransactionHistory';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import ManageCourses from './components/teacher/ManageCourses';
import TeacherCourseContentManager from './components/teacher/TeacherCourseContentManager';
import TeacherProfile from './components/teacher/TeacherProfile';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import CourseManagement from './components/admin/CourseManagement';
import OrderManagement from './components/admin/OrderManagement';

// ---- Mapping between old page-keys and URL paths ----
const pageToPath: Record<string, string> = {
  // public
  'home': '/',
  'courses': '/courses',
  'course-detail': '/course',
  'about': '/about',
  'contact': '/contact',
  'login': '/login',
  'register': '/register',
  'verify-account': '/verify-account',
  'forgot-password': '/forgot-password',
  // student
  'student-dashboard': '/student',
  'my-courses': '/student/my-courses',
  'course-content': '/student/course-content',
  'student-profile': '/student/profile',
  'shopping-cart': '/cart',
  'checkout': '/checkout',
  'payment-return': '/payment/return',
  'transaction-history': '/student/transactions',
  // teacher
  'teacher-dashboard': '/teacher',
  'manage-courses': '/teacher/manage-courses',
  'teacher-course-content': '/teacher/course-content',
  'teacher-profile': '/teacher/profile',
  // admin
  'admin-dashboard': '/admin',
  'user-management': '/admin/users',
  'admin-courses': '/admin/courses',
  'admin-orders': '/admin/orders',
  'admin-course-content': '/admin/course-content',
};

// Helper: derive current page-key from pathname
const pathToPage = (path: string): string => {
  const normalized = path.replace(/\/$/, '') || '/';
  const entries = Object.entries(pageToPath);
  for (const [page, p] of entries) {
    if (p === normalized || (p !== '/' && normalized.startsWith(p))) return page;
  }
  return 'home';
};

// ---- Route guard component ----
function RequireAuth({ user, children }: { user: string | null; children: React.ReactNode }) {
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RequireRole({ user, role, children }: { user: string | null; role: string; children: React.ReactNode }) {
  if (user !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<string | null>(null); // null, 'student', 'teacher', 'admin'
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Derive current page-key from the URL for sidebar highlighting
  const currentPage = pathToPage(location.pathname);
  const showSidebar = user && !['home', 'courses', 'course-detail', 'about', 'contact'].includes(currentPage);

  // ---- Bridge function: translates old page-key calls to router navigations ----
  // Child components call onNavigate('shopping-cart') → this converts to navigate('/cart')
  const onNavigate = useCallback(
    (page: string, state?: any) => {
      const path = pageToPath[page] ?? '/';
      navigate(path, { state });
    },
    [navigate],
  );

  const mapApiRoleToClient = (role?: string | null) => {
    switch (role) {
      case 'ADMIN':
        return 'admin';
      case 'STAFF':
      case 'MANAGER':
        return 'teacher';
      case 'USER':
      default:
        return role ? 'student' : null;
    }
  };

  // Simple in-memory notifications
  const [notifications, setNotifications] = useState<Array<{
    id: number;
    title: string;
    message: string;
    time: string;
    read: boolean;
  }>>([
    { id: 1, title: 'Bài tập mới', message: 'Giáo viên đã giao bài tập tuần này.', time: '2 giờ trước', read: false },
    { id: 2, title: 'Cập nhật khóa học', message: 'Khóa React đã thêm bài giảng mới.', time: 'Hôm qua', read: true },
  ]);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const clearAll = () => setNotifications([]);
  const markReadById = (id: number) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const handleLogin = (role: string) => {
    setUser(role);
    sessionStorage.removeItem('pending_email');
    navigate('/');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('pending_email');
    navigate('/');
  };

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    if (!token || !storedUser) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      return;
    }
    try {
      const parsed = JSON.parse(storedUser) as { role?: string | null };
      const mapped = mapApiRoleToClient(parsed.role);
      if (mapped) {
        setUser(mapped);
      }
    } catch (error) {
      console.warn('Không thể đọc thông tin đăng nhập đã lưu', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }, []);

  // ---- Course selection helpers (uses location.state) ----
  const handleCourseSelect = useCallback(
    (course: any) => {
      navigate('/course', { state: { course } });
    },
    [navigate],
  );

  const handleAddToCart = (course: any) => {
    try {
      const raw = localStorage.getItem('cart');
      const arr = raw ? JSON.parse(raw) : [];
      if (!arr.find((c: any) => c.id === course.id)) {
        const numericPrice = typeof course.price === 'number'
          ? course.price
          : (typeof course.price === 'string'
              ? Number(course.price.replace(/[^0-9]/g, ''))
              : 0);
        arr.push({
          id: course.id,
          title: course.title,
          price: numericPrice,
          instructor: course.instructor,
          image: course.image,
        });
        localStorage.setItem('cart', JSON.stringify(arr));
        toast.success('Đã thêm vào giỏ hàng');
      } else {
        toast.message('Khóa học đã có trong giỏ');
      }
    } catch (_e) {
      toast.error('Không thể thêm vào giỏ hàng');
    }
  };

  // ---- Navigation rendering ----
  const renderNavigation = () => {
    if (!user) {
      return (
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-8 h-8 text-blue-600" />
                <span className="font-bold text-xl">EduSmart</span>
              </div>
              <div className="hidden md:flex gap-6">
                <button onClick={() => navigate('/')} className="hover:text-blue-600">
                  Trang chủ
                </button>
                <button onClick={() => navigate('/courses')} className="hover:text-blue-600">
                  Khóa học
                </button>
                <button onClick={() => navigate('/about')} className="hover:text-blue-600">
                  Giới thiệu
                </button>
                <button onClick={() => navigate('/contact')} className="hover:text-blue-600">
                  Liên hệ
                </button>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Đăng nhập
                </Button>
                <Button onClick={() => navigate('/register')}>Đăng ký</Button>
              </div>
            </div>
          </div>
        </nav>
      );
    }

    return (
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16 relative">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-8 h-8 text-blue-600" />
                <span className="font-bold text-xl">EduPlatform</span>
              </div>
            </div>
            {/* Centered quick nav (logged-in) */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-6">
              <button onClick={() => navigate('/')} className={`hover:text-blue-600 ${currentPage==='home'?'text-blue-600':''}`}>Trang chủ</button>
              <button onClick={() => navigate('/courses')} className={`hover:text-blue-600 ${currentPage==='courses'?'text-blue-600':''}`}>Khóa học</button>
              <button onClick={() => navigate('/about')} className={`hover:text-blue-600 ${currentPage==='about'?'text-blue-600':''}`}>Giới thiệu</button>
              <button onClick={() => navigate('/contact')} className={`hover:text-blue-600 ${currentPage==='contact'?'text-blue-600':''}`}>Liên hệ</button>
            </div>
            <div className="flex items-center gap-4">
              {/* Notifications popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="relative p-1 rounded hover:bg-gray-100">
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[10px] leading-4 text-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-auto p-0 overflow-hidden" style={{ minWidth: '24rem' }}>
                  <div className="border-b px-3 py-2 flex items-center justify-between">
                    <div className="font-medium">Thông báo</div>
                    <div className="flex items-center gap-2">
                      <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">Đánh dấu đã đọc</button>
                      <button onClick={clearAll} className="text-xs text-gray-500 hover:underline">Xóa tất cả</button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-sm text-gray-500 text-center">Chưa có thông báo</div>
                    ) : (
                      <ul className="divide-y">
                        {notifications.map((n) => (
                          <li key={n.id}>
                            <button
                              className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${n.read ? 'opacity-80' : ''}`}
                              onClick={() => markReadById(n.id)}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-sm font-medium flex items-center gap-2">
                                    {n.title}
                                    {!n.read && <span className="inline-block w-2 h-2 rounded-full bg-blue-600" />}
                                  </div>
                                  <div className="text-sm text-gray-600 line-clamp-2">{n.message}</div>
                                </div>
                                <div className="text-xs text-gray-400 whitespace-nowrap">{n.time}</div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              {/* Cart shortcut for students */}
              {user === 'student' && (
                <button onClick={() => navigate('/cart')} title="Giỏ hàng" className="relative">
                  <CartIcon className="w-5 h-5 text-gray-700" />
                </button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 focus:outline-none">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                      {user === 'student' ? 'S' : user === 'teacher' ? 'T' : 'M'}
                    </div>
                    <span className="hidden md:block text-sm font-medium">
                      {user === 'student' ? 'Học sinh' : user === 'teacher' ? 'Giáo viên' : 'Quản lý'}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuSeparator />
                  {user === 'student' && (
                    <DropdownMenuItem onClick={() => navigate('/student/profile')} className="cursor-pointer gap-2">
                      <UserIcon className="w-4 h-4" /> Hồ sơ của tôi
                    </DropdownMenuItem>
                  )}
                  {user === 'teacher' && (
                    <DropdownMenuItem onClick={() => navigate('/teacher/profile')} className="cursor-pointer gap-2">
                      <UserIcon className="w-4 h-4" /> Hồ sơ giáo viên
                    </DropdownMenuItem>
                  )}
                  {user === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer gap-2">
                      <UserIcon className="w-4 h-4" /> Trang quản trị
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 text-red-600 focus:text-red-600">
                    <LogOut className="w-4 h-4" /> Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
    );
  };

  const renderSidebar = () => {
    if (!user) return null;

    let menuItems: Array<{ icon: any; label: string; path: string; page: string }> = [];

    if (user === 'student') {
      menuItems = [
        { icon: Home, label: 'Dashboard', path: '/student', page: 'student-dashboard' },
        { icon: BookOpen, label: 'Khóa học của tôi', path: '/student/my-courses', page: 'my-courses' },
        { icon: Users, label: 'Hồ sơ', path: '/student/profile', page: 'student-profile' },
        { icon: CartIcon, label: 'Giỏ hàng', path: '/cart', page: 'shopping-cart' },
        { icon: FileText, label: 'Giao dịch', path: '/student/transactions', page: 'transaction-history' },
      ];
    } else if (user === 'teacher') {
      menuItems = [
        { icon: Home, label: 'Dashboard', path: '/teacher', page: 'teacher-dashboard' },
        { icon: BookOpen, label: 'Quản lý khóa học', path: '/teacher/manage-courses', page: 'manage-courses' },
        { icon: Users, label: 'Hồ sơ', path: '/teacher/profile', page: 'teacher-profile' },
      ];
    } else if (user === 'admin') {
      menuItems = [
        { icon: Home, label: 'Dashboard', path: '/admin', page: 'admin-dashboard' },
        { icon: Users, label: 'Quản lý người dùng', path: '/admin/users', page: 'user-management' },
        { icon: BookOpen, label: 'Quản lý khóa học', path: '/admin/courses', page: 'admin-courses' },
        { icon: FileText, label: 'Quản lý đơn hàng', path: '/admin/orders', page: 'admin-orders' },
      ];
    }

    return (
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-64 bg-white border-r min-h-screen`}>
        <div className="p-4">
          {menuItems.map((item) => (
            <button
              key={item.page}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 hover:bg-gray-100 ${
                currentPage === item.page ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 hover:bg-gray-100 text-red-600"
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    );
  };

  // ---- Wrapper pages that read location.state ----
  const CourseDetailPage = () => {
    const course = (location.state as any)?.course ?? null;
    return (
      <CourseDetail
        course={course}
        onNavigate={onNavigate}
        userRole={user === 'student' || user === 'teacher' || user === 'admin' ? user : null}
        onAddToCart={handleAddToCart}
        onRequestLogin={() => navigate('/login')}
      />
    );
  };

  const CourseContentPage = () => {
    const course = (location.state as any)?.course ?? null;
    return <CourseContent course={course} />;
  };

  const TeacherCourseContentPage = () => {
    const course = (location.state as any)?.course ?? null;
    return <TeacherCourseContentManager course={course} onNavigate={onNavigate} />;
  };

  const AdminCourseContentPage = () => {
    const course = (location.state as any)?.course ?? null;
    return <TeacherCourseContentManager course={course} onNavigate={onNavigate} backPage="admin-courses" />;
  };

  const AdminDashboardPage = () => {
    if (user !== 'admin') {
      return (
        <Login
          adminOnly
          onLogin={(role: string) => { setUser(role); navigate('/admin'); }}
          onNavigate={onNavigate}
        />
      );
    }
    return <AdminDashboard onNavigate={onNavigate} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNavigation()}
      <div className="flex">
        {showSidebar ? renderSidebar() : null}
        <div className="flex-1">
          <Routes>
            {/* ---- Public routes ---- */}
            <Route path="/" element={<GuestHome onNavigate={onNavigate} onCourseSelect={handleCourseSelect} />} />
            <Route
              path="/courses"
              element={
                <CourseCatalog
                  onCourseSelect={handleCourseSelect}
                  userRole={user === 'student' || user === 'teacher' || user === 'admin' ? user : null}
                  onAddToCart={handleAddToCart}
                  onRequestLogin={() => navigate('/login')}
                />
              }
            />
            <Route path="/course" element={<CourseDetailPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* ---- Auth routes ---- */}
            <Route path="/login" element={<Login onLogin={handleLogin} onNavigate={onNavigate} />} />
            <Route
              path="/register"
              element={<Register onNavigate={onNavigate} onRegisterSuccess={(_email) => navigate('/verify-account')} />}
            />
            <Route path="/verify-account" element={<VerifyAccount onNavigate={onNavigate} />} />
            <Route path="/forgot-password" element={<ForgotPassword onNavigate={onNavigate} />} />

            {/* ---- Student routes ---- */}
            <Route path="/student" element={<RequireAuth user={user}><StudentDashboard onNavigate={onNavigate} /></RequireAuth>} />
            <Route
              path="/student/my-courses"
              element={
                <RequireAuth user={user}>
                  <MyCourses
                    onCourseSelect={(course: any) => {
                      navigate('/student/course-content', { state: { course } });
                    }}
                  />
                </RequireAuth>
              }
            />
            <Route path="/student/course-content" element={<RequireAuth user={user}><CourseContentPage /></RequireAuth>} />
            <Route path="/student/profile" element={<RequireAuth user={user}><StudentProfile /></RequireAuth>} />
            <Route path="/cart" element={<RequireAuth user={user}><ShoppingCart onNavigate={onNavigate} /></RequireAuth>} />
            <Route path="/checkout" element={<RequireAuth user={user}><Checkout onNavigate={onNavigate} /></RequireAuth>} />
            <Route path="/payment/return" element={<RequireAuth user={user}><PaymentReturn onNavigate={onNavigate} /></RequireAuth>} />
            <Route path="/student/transactions" element={<RequireAuth user={user}><TransactionHistory onNavigate={onNavigate} /></RequireAuth>} />

            {/* ---- Teacher routes ---- */}
            <Route
              path="/teacher"
              element={
                <RequireRole user={user} role="teacher">
                  <TeacherDashboard onNavigate={onNavigate} token={localStorage.getItem('auth_token')} />
                </RequireRole>
              }
            />
            <Route
              path="/teacher/manage-courses"
              element={
                <RequireRole user={user} role="teacher">
                  <ManageCourses
                    onOpenCourse={(course: any) => {
                      localStorage.setItem('last_course_id', String(course.id));
                      navigate('/teacher/course-content', { state: { course } });
                    }}
                  />
                </RequireRole>
              }
            />
            <Route
              path="/teacher/course-content"
              element={<RequireRole user={user} role="teacher"><TeacherCourseContentPage /></RequireRole>}
            />
            <Route path="/teacher/profile" element={<RequireRole user={user} role="teacher"><TeacherProfile /></RequireRole>} />

            {/* ---- Admin routes ---- */}
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<RequireRole user={user} role="admin"><UserManagement /></RequireRole>} />
            <Route
              path="/admin/courses"
              element={
                <RequireRole user={user} role="admin">
                  <CourseManagement
                    onOpenCourse={(course: any) => {
                      localStorage.setItem('last_course_id', String(course.id));
                      navigate('/admin/course-content', { state: { course } });
                    }}
                  />
                </RequireRole>
              }
            />
            <Route path="/admin/orders" element={<RequireRole user={user} role="admin"><OrderManagement /></RequireRole>} />
            <Route
              path="/admin/course-content"
              element={<RequireRole user={user} role="admin"><AdminCourseContentPage /></RequireRole>}
            />

            {/* ---- Catch-all: redirect to home ---- */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

// Legacy inline pages removed; now using full About & Contact components.