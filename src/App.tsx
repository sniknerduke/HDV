import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Home, GraduationCap, Users, Settings, LogOut, Menu, Bell, ShoppingCart as CartIcon, FileText, BarChart, Award, User as UserIcon } from 'lucide-react';
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
// Removed assignments feature
// import Assignments from './components/student/Assignments';
import TransactionHistory from './components/student/TransactionHistory';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import ManageCourses from './components/teacher/ManageCourses';
import TeacherCourseContentManager from './components/teacher/TeacherCourseContentManager';
// Removed: TeacherSchedule, GradeAssignments, StudentList
import TeacherProfile from './components/teacher/TeacherProfile';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import CourseManagement from './components/admin/CourseManagement';
import OrderManagement from './components/admin/OrderManagement';


export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<string | null>(null); // null, 'student', 'teacher', 'admin'
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const showSidebar = user && !['home', 'courses', 'course-detail', 'about', 'contact'].includes(currentPage);

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

  // Simple path <-> page mapping to enable real URLs (e.g., /admin)
  const pageToPath = useMemo(() => ({
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
    // removed routes for schedule, grading, student list
    'teacher-profile': '/teacher/profile',
    // admin
    'admin-dashboard': '/admin',
    'user-management': '/admin/users',
    'admin-courses': '/admin/courses',
    'admin-orders': '/admin/orders', // Thêm dòng này
    'admin-course-content': '/admin/course-content',
  } as Record<string, string>), []);

  const pathToPage = (path: string): string => {
    const normalized = path.replace(/\/$/, '');
    const entries = Object.entries(pageToPath);
    for (const [page, p] of entries) {
      if (p === normalized || (p !== '/' && normalized.startsWith(p))) return page;
    }
    return 'home';
  };

  const navigateTo = (page: string) => {
    const path = pageToPath[page] ?? '/';
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPage(page);
  };

  // Simple in-memory notifications; could be loaded from API/localStorage later
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
    navigateTo('home');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('pending_email');
    navigateTo('home');
  };

  // Redirect guard: if user becomes null while on protected page, force home (except admin path which shows admin login)
  if (!user && /^(student|teacher)-/.test(currentPage)) {
    // simple synchronous guard; in real app use useEffect + router
    navigateTo('home');
  }

  // Sync current page with URL on first load and back/forward
  useEffect(() => {
    const initial = pathToPage(window.location.pathname);
    setCurrentPage(initial);
    const onPopState = () => setCurrentPage(pathToPage(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    // If missing token or user info, clear any stale auth and stay logged out
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

  const handleCourseSelect = (course: any) => {
    setSelectedCourse(course);
    setCurrentPage('course-detail');
  };

  const handleAddToCart = (course: any) => {
    try {
      const raw = localStorage.getItem('cart');
      const arr = raw ? JSON.parse(raw) : [];
      // de-duplicate by id if exists
      if (!arr.find((c: any) => c.id === course.id)) {
        // Normalize price: accept number or string like '500,000đ'
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
            image: course.image
        });
        localStorage.setItem('cart', JSON.stringify(arr));
        toast.success('Đã thêm vào giỏ hàng');
      } else {
        toast.message('Khóa học đã có trong giỏ');
      }
    } catch (e) {
      toast.error('Không thể thêm vào giỏ hàng');
    }
  };

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
                <button onClick={() => navigateTo('home')} className="hover:text-blue-600">
                  Trang chủ
                </button>
                <button onClick={() => navigateTo('courses')} className="hover:text-blue-600">
                  Khóa học
                </button>
                <button onClick={() => navigateTo('about')} className="hover:text-blue-600">
                  Giới thiệu
                </button>
                <button onClick={() => navigateTo('contact')} className="hover:text-blue-600">
                  Liên hệ
                </button>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => navigateTo('login')}>
                  Đăng nhập
                </Button>
                <Button onClick={() => navigateTo('register')}>Đăng ký</Button>
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
              <button onClick={() => navigateTo('home')} className={`hover:text-blue-600 ${currentPage==='home'?'text-blue-600':''}`}>Trang chủ</button>
              <button onClick={() => navigateTo('courses')} className={`hover:text-blue-600 ${currentPage==='courses'?'text-blue-600':''}`}>Khóa học</button>
              <button onClick={() => navigateTo('about')} className={`hover:text-blue-600 ${currentPage==='about'?'text-blue-600':''}`}>Giới thiệu</button>
              <button onClick={() => navigateTo('contact')} className={`hover:text-blue-600 ${currentPage==='contact'?'text-blue-600':''}`}>Liên hệ</button>
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
                <button onClick={() => navigateTo('shopping-cart')} title="Giỏ hàng" className="relative">
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
                  {/* <div className="px-2 py-2 text-xs text-gray-500">
                    Đang đăng nhập: <span className="font-semibold text-gray-700">{user}</span>
                  </div> */}
                  <DropdownMenuSeparator />
                  {user === 'student' && (
                    <DropdownMenuItem onClick={() => setCurrentPage('student-profile')} className="cursor-pointer gap-2">
                      <UserIcon className="w-4 h-4" /> Hồ sơ của tôi
                    </DropdownMenuItem>
                  )}
                  {user === 'teacher' && (
                    <DropdownMenuItem onClick={() => setCurrentPage('teacher-profile')} className="cursor-pointer gap-2">
                      <UserIcon className="w-4 h-4" /> Hồ sơ giáo viên
                    </DropdownMenuItem>
                  )}
                  {user === 'admin' && (
                    <DropdownMenuItem onClick={() => navigateTo('admin-dashboard')} className="cursor-pointer gap-2">
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

    let menuItems: Array<{ icon: any; label: string; page: string }> = [];
    
    if (user === 'student') {
      menuItems = [
        { icon: Home, label: 'Dashboard', page: 'student-dashboard' },
        { icon: BookOpen, label: 'Khóa học của tôi', page: 'my-courses' },
        { icon: Users, label: 'Hồ sơ', page: 'student-profile' },
        { icon: CartIcon, label: 'Giỏ hàng', page: 'shopping-cart' },
        { icon: FileText, label: 'Giao dịch', page: 'transaction-history' },
      ];
    } else if (user === 'teacher') {
      menuItems = [
        { icon: Home, label: 'Dashboard', page: 'teacher-dashboard' },
        { icon: BookOpen, label: 'Quản lý khóa học', page: 'manage-courses' },
        { icon: Users, label: 'Hồ sơ', page: 'teacher-profile' },
      ];
    } else if (user === 'admin') {
      menuItems = [
        { icon: Home, label: 'Dashboard', page: 'admin-dashboard' },
        // Analytics merged into dashboard; removed separate page
        { icon: Users, label: 'Quản lý người dùng', page: 'user-management' },
        { icon: BookOpen, label: 'Quản lý khóa học', page: 'admin-courses' },
        { icon: FileText, label: 'Quản lý đơn hàng', page: 'admin-orders' }, // Thêm dòng này
      ];
    }

    return (
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-64 bg-white border-r min-h-screen`}>
        <div className="p-4">
          {menuItems.map((item) => (
            <button
              key={item.page}
              onClick={() => {
                navigateTo(item.page);
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

  const renderContent = () => {
    if (currentPage === 'login') return <Login onLogin={handleLogin} onNavigate={navigateTo} />;
    if (currentPage === 'register') return <Register onNavigate={navigateTo} onRegisterSuccess={(_email) => navigateTo('verify-account')} />;
    if (currentPage === 'verify-account') return <VerifyAccount onNavigate={navigateTo} />;
    if (currentPage === 'forgot-password') return <ForgotPassword onNavigate={navigateTo} />;
    if (currentPage === 'home') return <GuestHome onNavigate={navigateTo} onCourseSelect={handleCourseSelect} />;
    if (currentPage === 'courses') return (
      <CourseCatalog
        onCourseSelect={handleCourseSelect}
        userRole={user === 'student' || user === 'teacher' || user === 'admin' ? user : null}
        onAddToCart={handleAddToCart}
        onRequestLogin={() => navigateTo('login')}
      />
    );
    if (currentPage === 'course-detail') return (
      <CourseDetail
        course={selectedCourse}
        onNavigate={navigateTo}
        userRole={user === 'student' || user === 'teacher' || user === 'admin' ? user : null}
        onAddToCart={handleAddToCart}
        onRequestLogin={() => navigateTo('login')}
      />
    );
  if (currentPage === 'about') return <About />;
  if (currentPage === 'contact') return <Contact />;
    
    if (currentPage === 'student-dashboard') return <StudentDashboard onNavigate={navigateTo} />;
    if (currentPage === 'my-courses') return <MyCourses onCourseSelect={(course: any) => { setSelectedCourse(course); navigateTo('course-content'); }} />;
    if (currentPage === 'course-content') return <CourseContent course={selectedCourse} />;
    if (currentPage === 'student-profile') return <StudentProfile />;
    if (currentPage === 'shopping-cart') return <ShoppingCart onNavigate={navigateTo} />;
    if (currentPage === 'checkout') return <Checkout onNavigate={navigateTo} />;
    if (currentPage === 'payment-return') return <PaymentReturn onNavigate={navigateTo} />;
    if (currentPage === 'transaction-history') return <TransactionHistory onNavigate={navigateTo} />;
    
    if (currentPage === 'teacher-dashboard') return <TeacherDashboard onNavigate={navigateTo} token={localStorage.getItem('auth_token')} />;
    if (currentPage === 'manage-courses') return (
      <ManageCourses onOpenCourse={(course: any) => { setSelectedCourse(course); localStorage.setItem('last_course_id', String(course.id)); navigateTo('teacher-course-content'); }} />
    );
    if (currentPage === 'teacher-course-content') return (
      <TeacherCourseContentManager course={selectedCourse} onNavigate={navigateTo} />
    );
  // removed teacher-schedule, grade-assignments, student-list pages
    if (currentPage === 'teacher-profile') return <TeacherProfile />;
    
  if (currentPage === 'admin-dashboard') {
    if (user !== 'admin') {
      // Show admin-only login when visiting /admin without admin session
      return <Login adminOnly onLogin={(role: string) => { setUser(role); navigateTo('admin-dashboard'); }} onNavigate={navigateTo} />;
    }
    return <AdminDashboard onNavigate={navigateTo} />;
  }
  if (currentPage === 'user-management') return <UserManagement />;
  if (currentPage === 'admin-courses') return <CourseManagement onOpenCourse={(course: any) => { setSelectedCourse(course); localStorage.setItem('last_course_id', String(course.id)); navigateTo('admin-course-content'); }} />;
  if (currentPage === 'admin-orders') return <OrderManagement />;
  if (currentPage === 'admin-course-content') return (
    <TeacherCourseContentManager course={selectedCourse} onNavigate={navigateTo} backPage="admin-courses" />
  );
  // removed admin-settings page
    
    return <GuestHome onNavigate={setCurrentPage} onCourseSelect={handleCourseSelect} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNavigation()}
      <div className="flex">
        {showSidebar ? renderSidebar() : null}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
      <Toaster />
    </div>
  );
}

// Legacy inline pages removed; now using full About & Contact components.