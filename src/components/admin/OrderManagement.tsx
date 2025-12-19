import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'

import { getOrdersPage, getOrdersDetail, filterOrders, search } from '../../services/orderService';
import type { Order, OrderItemDTO } from '../../services/orderService';

import {
  DollarSign,
  FileDown,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  ShoppingCart
} from 'lucide-react'

// const [Order, setOrders] = useState<Order[]>([]);

function OrderList() {
    const [orders, setOrders] = useState<Order[]>([]);
    useEffect(() => {
      async function fetchOrders() {
        try {
          const data = await getAllOrders();
          setOrders(data);
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
      }
      fetchOrders();
    }, []);
}

// // Mock Data cho danh sách đơn hàng
// const mockOrders = [
//   { id: 'ORD-001', customer: 'Nguyễn Văn A', date: '2023-10-25', amount: 500000, status: 'completed', course: 'React Pro' },
//   { id: 'ORD-002', customer: 'Trần Thị B', date: '2023-10-26', amount: 350000, status: 'pending', course: 'UI/UX Design' },
//   { id: 'ORD-003', customer: 'Lê Văn C', date: '2023-10-27', amount: 1200000, status: 'cancelled', course: 'Fullstack Java' },
//   { id: 'ORD-004', customer: 'Phạm Minh D', date: '2023-10-28', amount: 450000, status: 'completed', course: 'Node.js Basic' },
// ];



export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]) // ✅ thêm state ở đây
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [inputPage, setInputPage] = useState(1);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItemDTO[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

//   const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [searchType, setSearchType] = useState<"orderId" | "userId">("orderId");

  const [error, setError] = useState<string | null>(null);




  const viewOrderDetail = async (orderId: number) => {
    try {
      const items = await getOrdersDetail (orderId);
      setSelectedOrderItems(items);
      setSelectedOrderId(orderId);
    } catch (error) {
      console.error("Error fetching order items:", error);
    }
  };

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getOrdersPage(page, 10); // mỗi trang 10 order
        console.log("Refresh data:", data);
        setOrders(data.content);
        setTotalPages(data.totalPages);

        const items = await viewOrderDetail(orderId);
        setSelectedOrderItems(items ?? []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    }
    fetchOrders();
  }, [page]);


  const refresh = async () => {
    setLoading(true)
    try {
      const data = await getOrdersPage(page, 10); // lấy lại dữ liệu trang hiện tại
      setOrders(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error refreshing orders:", error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Thành công</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Chờ xử lý</Badge>
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Đã hủy</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const kpis = [
    { label: 'Tổng doanh thu', value: '1.28 tỷ', icon: DollarSign, color: 'text-green-600' },
    { label: 'Đơn hàng mới', value: '42', icon: ShoppingCart, color: 'text-blue-600' },
    { label: 'Đang chờ', value: '12', icon: Clock, color: 'text-yellow-600' },
    { label: 'Tỷ lệ hủy', value: '3.2%', icon: XCircle, color: 'text-red-600' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
          <p className="text-gray-500 text-sm">Theo dõi và quản lý các giao dịch trên hệ thống</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => alert('Xuất báo cáo...')} className="gap-2">
            <FileDown className="w-4 h-4" /> Xuất Excel
          </Button>
          <Button onClick={refresh} disabled={loading}>
            {loading ? 'Đang tải...' : 'Làm mới'}
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {kpis.map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{kpi.label}</p>
                  <p className="text-2xl font-semibold">{kpi.value}</p>
                </div>
                <kpi.icon className={`w-10 h-10 opacity-20 ${kpi.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
              <select value={searchType} onChange={(e) => setSearchType(e.target.value as "orderId" | "userId")}>
                <option value="orderId">Mã đơn hàng</option>
                <option value="userId">Mã khách hàng</option>
              </select>


              <Input placeholder="Nhập số..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    try {
                        setError(null); // reset lỗi trước khi gọi
                        if (!searchTerm.trim()) {
                          setError("Vui lòng nhập số để tìm kiếm");
                          alert("Vui lòng nhập số để tìm kiếm");
                          return;
                        }
                      const data = await search(searchType as "orderId" | "userId", Number(searchTerm));
                      setOrders(Array.isArray(data) ? data : [data]);
                    } catch (err) {
                      console.error("Search error", err);
                    }
                  }
                }}
              />
            </div>
            <div className="flex flex-row gap-4">
              {/* Status filter */}
              <div className="flex flex-col">
                <span className="text-sm font-medium mb-1">Trạng thái</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="SUCCESS">Thành công</SelectItem>
                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                    <SelectItem value="FAILED">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date range filter */}
              <div className="flex flex-row gap-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium mb-1">Ngày bắt đầu</span>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full md:w-[180px]"
                  />
                </div>

                <div className="flex flex-col">
                  <span className="text-sm font-medium mb-1">Ngày kết thúc</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full md:w-[180px]"
                  />
                </div>
              </div>
            </div>



          <Button
            variant="ghost"
            className="gap-2"
            onClick={async () => {
              try {
                const data = await filterOrders(startDate, endDate, statusFilter);
                setOrders(data); // cập nhật danh sách đơn hàng
              } catch (err) {
                console.error("Filter error", err);
              }
            }}
          >
            <Filter className="w-4 h-4" /> Lọc
          </Button>

        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-medium">
                <tr>
                  <th className="px-6 py-4">Id</th>
                  <th className="px-6 py-4">Mã đơn hàng</th>
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Ngày giao dịch</th>
                  <th className="px-6 py-4">Số tiền</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => ( //tai sao
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-blue-600">{order.id}</td>
                    <td className="px-6 py-4">{order.orderId}</td>
                    <td className="px-6 py-4">{order.userId}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : ''}
                    </td>
                    <td className="px-6 py-4 font-semibold">{order.amount.toLocaleString()}đ</td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => viewOrderDetail(order.id)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


            <div className="p-4 border-t flex justify-between items-center text-gray-500 text-xs">
              <span>Trang {page + 1} / {totalPages}</span>
              <div className="flex gap-2 items-center">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => { setPage(page - 1); setInputPage(page); }} >
                  Trước
                </Button>
                <Input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={inputPage}
                  onChange={(e) => setInputPage(Number(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const newPage = inputPage - 1;
                      if (newPage >= 0 && newPage < totalPages) setPage(newPage);
                    }
                  }}
                  className="w-16 text-center"
                />

                <Button variant="outline" size="sm" disabled={page + 1 >= totalPages}
                  onClick={() => {
                    setPage(page + 1);
                    setInputPage(page + 2); // đồng bộ input
                  }}
                >
                  Sau
                </Button>
              </div>
            </div>

            {selectedOrderId && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <Card className="w-[900px]">
                  <CardHeader>
                    <CardTitle>Chi tiết đơn hàng #{selectedOrderId}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <table className="table-fixed w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          {/* Cột tên khóa học chiếm phần lớn diện tích */}
                          <th className="text-left px-4 py-2 font-medium text-blue-600">
                            Khóa học
                          </th>
                          {/* Cột giá tiền cố định chiều rộng */}
                          <th className="w-[120px] px-6 py-2 text-right font-medium text-blue-600">
                            Giá
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedOrderItems.map(item => (
                          <tr key={item.id}>
                            <td className="px-4 py-3">
                              {/* Để truncate hoạt động, bọc text trong một div có max-width hoặc dùng class truncate trực tiếp */}
                              <div className="truncate max-w-[500px]" title={item.courseTitle}>
                                {item.courseTitle}
                              </div>
                            </td>
                            <td className="px-6 py-3 text-right whitespace-nowrap">
                              {item.price.toLocaleString()}đ
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="mt-4 text-right">
                      <Button onClick={() => setSelectedOrderId(null)}>
                        Đóng
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

        </CardContent>
      </Card>
    </div>
  )
}