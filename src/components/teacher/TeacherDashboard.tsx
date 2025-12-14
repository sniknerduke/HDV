import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ChartContainer } from '../ui/chart'; 
import { BookOpen, DollarSign, FileBarChart, FileDown } from 'lucide-react'; 
import { useState, useEffect, useCallback, useMemo } from 'react'; 
import { format } from 'date-fns'; 
import axios from 'axios'; 

// Cần đảm bảo path này đúng
import { fetchCourseSales, calculateTotalSummary, CourseSalesResponse, TotalSummary } from '../../services/statisticApi'; 

import {
    BarChart, 
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell, 
} from 'recharts';


// --- CẤU HÌNH & TYPES ---
interface CourseResponse {
    id: number; 
    code: string;
    title: string;
}

const API_GATEWAY_URL = 'http://localhost:9090';
const COURSES_API_URL = `${API_GATEWAY_URL}/api/courses/list`; 

const CHART_COLORS = [
    '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#6f42c1', '#fd7e14', '#6610f2', '#20c997',
];

// --- HÀM HỖ TRỢ ---
const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(amount);
};

interface TeacherDashboardProps {
    onNavigate: (page: string) => void;
    token: string | null; 
}


export default function TeacherDashboard({ onNavigate, token }: TeacherDashboardProps) {
    
    // --- KHỞI TẠO DATE (JavaScript Date Object) ---
    const today = new Date();
    const defaultStartDateObj = new Date(today.getFullYear(), today.getMonth(), 1);
    const defaultEndDateObj = today;

    const [startDateObj, setStartDateObj] = useState<Date>(defaultStartDateObj);
    const [endDateObj, setEndDateObj] = useState<Date>(defaultEndDateObj);
    
    // State string cho input type="date"
    const [startDateStr, setStartDateStr] = useState<string>(format(defaultStartDateObj, 'yyyy-MM-dd')); 
    const [endDateStr, setEndDateStr] = useState<string>(format(defaultEndDateObj, 'yyyy-MM-dd'));   
    
    const [salesStats, setSalesStats] = useState<CourseSalesResponse[]>([]); 
    const [courses, setCourses] = useState<CourseResponse[]>([]); 
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // --- LOGIC TÍNH TOÁN TỔNG HỢP (useMemo) ---
    const totalSummary = useMemo(() => calculateTotalSummary(salesStats), [salesStats]);

    // --- HÀM LẤY DANH SÁCH KHÓA HỌC (useCallback) ---
    const fetchAllCourses = useCallback(async () => {
        if (!token) return;
        try {
            const response = await axios.get<CourseResponse[]>(COURSES_API_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCourses(response.data);
        } catch (err: unknown) {
            console.error("Lỗi khi tải danh sách khóa học:", err);
        }
    }, [token]); 

    // --- HÀM THỰC HIỆN THỐNG KÊ (useCallback) ---
    const executeStatistics = useCallback(async (start: Date, end: Date) => {
        
        if (start > end) {
            setError("Ngày bắt đầu không được sau ngày kết thúc.");
            return;
        }
        // if (!token) {
        //     setError("Vui lòng cung cấp JWT Token để tải dữ liệu thống kê.");
        //     return;
        // }

        setLoading(true);
        setError(null);
        setSalesStats([]);

        try {
            const results = await fetchCourseSales(start, end);
            setSalesStats(results); 

        } catch (err: any) { 
            console.error("Lỗi khi tải thống kê doanh thu:", err);
            setError(err.message || "Lỗi không xác định khi tải thống kê."); 
            setSalesStats([]);
        } finally {
            setLoading(false);
        }
    }, []); 
    
    // --- EFFECT: Load data lần đầu ---
    useEffect(() => {
        // fetchAllCourses(); // Tạm thời bỏ qua nếu API khóa học cũng cần token
        
        // 👇 GỌI LUÔN, KHÔNG CẦN CHECK TOKEN
        executeStatistics(startDateObj, endDateObj);
        
    }, [executeStatistics]); // Bỏ các biến khác, chỉ giữ lại hàm execute

    // --- HÀM XỬ LÝ DATE INPUT ---
    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDateStr = e.target.value;
        setStartDateStr(newDateStr);
        setStartDateObj(new Date(newDateStr));
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDateStr = e.target.value;
        setEndDateStr(newDateStr);
        setEndDateObj(new Date(newDateStr));
    };
    
    // --- HÀM EXPORT CSV (Đã sửa lỗi font & thêm tổng) ---
     const exportCSV = () => {
        if (salesStats.length === 0) return;
        
        const rows: string[] = [];
        
        // 1. Dòng tiêu đề
        rows.push('Mã Khóa Học,Tên Khóa Học,Tổng Lượt Bán,Tổng Doanh Thu');
        
        // 2. Dòng dữ liệu chi tiết
        salesStats.forEach(d => {
            // Bao quanh chuỗi bằng ngoặc kép "" để tránh lỗi nếu tên có dấu phẩy
            rows.push(`"${d.courseCode}","${d.courseTitle}",${d.totalSold},${d.totalRevenue}`);
        });

        // 3. Dòng TỔNG CỘNG (Mới thêm)
        // Cấu trúc: "TỔNG CỘNG", "", Tổng Lượt Bán, Tổng Doanh Thu
        rows.push(`"TỔNG CỘNG","",${totalSummary.totalSold},${totalSummary.totalRevenue}`);
        
        // 4. Tạo file với BOM (\uFEFF) để sửa lỗi phông chữ tiếng Việt trong Excel
        const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `doanh-thu-${startDateStr}-${endDateStr}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // --- RENDERING VÀ LAYOUT ---
    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-8 border-b pb-2">
                Dashboard Giảng Viên
            </h1>

            {/* --- CÁC THẺ KPI --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* ... (Tổng Khóa Học) ... */}
                <Card className="shadow-lg rounded-xl border-t-4 border-blue-600 hover:scale-[1.01] transition-transform">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 uppercase mb-1">Tổng khóa học</p>
                            <p className="text-4xl font-bold text-gray-900">{courses.length}</p> 
                        </div>
                        <BookOpen className="w-10 h-10 text-blue-600 opacity-40" />
                    </CardContent>
                </Card>
                
                {/* Tổng Doanh Thu */}
                <Card className="shadow-lg rounded-xl border-t-4 border-green-600 hover:scale-[1.01] transition-transform">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 uppercase mb-1">Tổng Doanh Thu</p>
                            <p className="text-3xl font-bold text-green-700">
                                {loading ? '...' : formatCurrency(totalSummary.totalRevenue)}
                            </p>
                        </div>
                        <DollarSign className="w-10 h-10 text-green-600 opacity-40" />
                    </CardContent>
                </Card>

                {/* Tổng Lượt Bán */}
                <Card className="shadow-lg rounded-xl border-t-4 border-orange-500 hover:scale-[1.01] transition-transform">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 uppercase mb-1">Tổng Lượt Bán</p>
                            <p className="text-4xl font-bold text-orange-600">
                                {loading ? '...' : totalSummary.totalSold.toLocaleString('vi-VN')}
                            </p>
                        </div>
                        <FileBarChart className="w-10 h-10 text-orange-600 opacity-40" />
                    </CardContent>
                </Card>
            </div>

            {/* --- BỘ LỌC & THAO TÁC --- */}
            <Card className="shadow-lg rounded-xl mb-6">
                <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
                    
                    {/* Date Pickers */}
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Từ ngày:</label>
                            <input 
                                type="date" 
                                value={startDateStr} 
                                onChange={handleStartDateChange} 
                                className="border border-gray-300 p-2 rounded-lg"
                            />
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Đến ngày:</label>
                            <input 
                                type="date" 
                                value={endDateStr} 
                                onChange={handleEndDateChange} 
                                className="border border-gray-300 p-2 rounded-lg"
                            />
                        </div>
                    </div>
                    
                    {/* NÚT THỐNG KÊ & EXPORT */}
                    <div className="flex items-center gap-3">
                        <Button 
                            onClick={() => executeStatistics(startDateObj, endDateObj)} 
                            // disabled={loading || !token} 
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 shadow-md font-semibold"
                        >
                            {loading ? 'Đang thống kê...' : 'Thống kê'}
                        </Button>
                        
                        <Button variant="outline" onClick={exportCSV} disabled={salesStats.length === 0}>
                            <FileDown className="w-4 h-4 mr-2" /> Xuất Excel
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Hiển thị lỗi đã được cải tiến */}
            {error && (
                <div className="p-4 mb-6 text-red-700 bg-red-100 border border-red-400 rounded-lg font-medium">
                    {/* HIỂN THỊ THÔNG BÁO LỖI CHI TIẾT TỪ API */}
                    <span className="font-bold">LỖI: </span> {error}
                </div>
            )}
            
            {/* --- BIỂU ĐỒ & THÔNG TIN TỔNG QUAN --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* BIỂU ĐỒ (2/3 cột) */}
                <Card className="shadow-lg rounded-xl lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold">Lượt bán theo Khóa học</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 h-[400px]">
                        {loading && <div className="flex items-center justify-center h-full text-gray-500">Đang tải biểu đồ...</div>}
                        {!loading && salesStats.length === 0 && !error && (
                            <div className="flex items-center justify-center h-full text-gray-500">Chưa có dữ liệu bán hàng trong kỳ này.</div>
                        )}
                        
                        {!loading && salesStats.length > 0 && (
                            <ChartContainer className="h-full w-full" config={{}}>
                                <BarChart data={salesStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis 
                                        dataKey="courseTitle" 
                                        angle={-35} 
                                        textAnchor="end" 
                                        height={100} 
                                        interval={0} 
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis dataKey="totalSold" />
                                    
                                    <Tooltip 
                                        content={({ payload, label }) => (
                                            <Card className="p-3 shadow-xl border-gray-200 rounded-lg">
                                                <p className="font-semibold text-sm text-gray-800">{label}</p>
                                                <p className="text-blue-600 text-sm">Lượt Bán: <span className="font-bold">{payload?.[0]?.value?.toLocaleString('vi-VN')}</span></p>
                                                <p className="text-green-600 text-sm">Doanh Thu: <span className="font-bold">{formatCurrency(payload?.[0]?.payload?.totalRevenue)}</span></p>
                                            </Card>
                                        )}
                                    />
                                    
                                    <Bar dataKey="totalSold" name="Lượt Bán" radius={[4, 4, 0, 0]} >
                                        {salesStats.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={CHART_COLORS[index % CHART_COLORS.length]} 
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>

                {/* THÔNG TIN TỔNG HỢP (1/3 cột) */}
                <Card className="shadow-lg rounded-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold">Tóm tắt kết quả</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 h-[340px] flex flex-col justify-center">
                        <div className="space-y-4">
                            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                                <p className="font-medium text-gray-700">Tổng Doanh Thu</p>
                                <p className="font-bold text-2xl text-green-700">{formatCurrency(totalSummary.totalRevenue)}</p>
                            </div>
                            
                            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                                <p className="font-medium text-gray-700">Tổng Lượt Bán</p>
                                <p className="font-bold text-2xl text-blue-700">{totalSummary.totalSold.toLocaleString('vi-VN')}</p>
                            </div>
                            
                            <div className="p-4 border border-gray-200 rounded-lg bg-white">
                                <p className="font-medium text-gray-700">Số Khóa Học Thống Kê</p>
                                <p className="font-bold text-xl text-gray-800">{salesStats.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            {/* --- BẢNG HIỂN THỊ KẾT QUẢ THỐNG KÊ CHI TIẾT --- */}
            <Card className="mt-6 shadow-lg rounded-xl">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Bảng chi tiết bán hàng</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    {loading && <div className="p-6 text-center text-gray-500">Đang tải dữ liệu...</div>}
                    
                    {!loading && salesStats.length > 0 && (
                        <div className="overflow-x-auto max-h-[500px] border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Mã Khóa Học</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tên Khóa Học</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Tổng Lượt Bán</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Tổng Doanh Thu</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {salesStats.map((item, index) => (
                                        <tr key={item.courseId} className="hover:bg-blue-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.courseCode}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{item.courseTitle}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-blue-600">{item.totalSold.toLocaleString('vi-VN')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600">{formatCurrency(item.totalRevenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-blue-100 sticky bottom-0 border-t-2 border-blue-300">
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase">TỔNG CỘNG</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-700">
                                            {totalSummary.totalSold.toLocaleString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-700">
                                            {formatCurrency(totalSummary.totalRevenue)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                    {!loading && salesStats.length === 0 && !error && (
                        <div className="p-6 text-center text-gray-500">Chưa có dữ liệu chi tiết bán hàng để hiển thị.</div>
                    )}
                </CardContent>
            </Card>
            
        </div>
    );
}