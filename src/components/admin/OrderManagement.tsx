import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'

import { getOrdersPage } from '../../services/orderService';
import type { Order } from '../../services/orderService';

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

// useEffect(() => {
//       async function fetchOrders() {
//         try {
//           const data = await getAllOrders();
//           setOrders(data);
//         } catch (error) {
//           console.error('Error fetching orders:', error);
//         }
//       }
//       fetchOrders();
//     }, []);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getOrdersPage(page, 10); // mỗi trang 10 order
        console.log("Refresh data:", data);
        setOrders(data.content);
        setTotalPages(data.totalPages);
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
      case 'cancelled':
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm theo mã đơn hoặc tên khách hàng..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="completed">Thành công</SelectItem>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" className="gap-2">
            <Filter className="w-4 h-4" /> Lọc nâng cao
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
                    <td className="px-6 py-4">{order.userId}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : ''}
                    </td>
                    <td className="px-6 py-4 font-semibold">{order.amount.toLocaleString()}đ</td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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

        </CardContent>
      </Card>
    </div>
  )
}