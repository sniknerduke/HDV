import axios from 'axios';
import { format } from 'date-fns';

export interface CourseSalesResponse {
    courseId: number;
    courseCode: string;
    courseTitle: string;
    totalSold: number;
    totalRevenue: number;
}

export interface TotalSummary {
    totalSold: number;
    totalRevenue: number;
}

// Gọi qua API Gateway (9090) thay vì trực tiếp 8084
const API_URL = 'http://localhost:9090/api/statistics'; 

export async function fetchCourseSales(startDate: Date, endDate: Date): Promise<CourseSalesResponse[]> { 
    try {
        // Định dạng chuẩn yyyy-MM-dd để khớp với @JsonFormat bên Java
        const startString = format(startDate, 'yyyy-MM-dd');
        const endString = format(endDate, 'yyyy-MM-dd');

        // Log ra xem gửi cái gì đi
        console.log("Đang gọi API:", `${API_URL}/sales`);
        console.log("Dữ liệu gửi:", { start: startString, end: endString });

        const response = await axios.post(`${API_URL}/sales`, {
            start: startString, 
            end: endString
        });
        
        // Map dữ liệu (Giữ nguyên như bạn đã làm đúng)
        return response.data.map((item: any) => ({
            courseId: item.courseId,
            courseCode: item.courseCode || `KH-${item.courseId}`, 
            courseTitle: item.courseName || "Chưa có tên", 
            totalSold: item.totalSold || 0,
            totalRevenue: parseFloat(item.totalRevenue) || 0
        })) as CourseSalesResponse[];
        
    } catch (error: any) {
        console.error("Lỗi API Thống kê:", error);
        // Ném lỗi ra để Dashboard hiển thị lên màn hình
        throw new Error(error.response?.data?.message || error.message || "Không kết nối được với server");
    }
}

export function calculateTotalSummary(salesData: CourseSalesResponse[]): TotalSummary {
    const totalSold = salesData.reduce((sum, item) => sum + (item.totalSold || 0), 0);
    const totalRevenue = salesData.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
    return { totalSold, totalRevenue };
}