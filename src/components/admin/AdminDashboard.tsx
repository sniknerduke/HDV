import { useMemo } from 'react'
import TeacherDashboard from '../teacher/TeacherDashboard'

interface AdminDashboardProps {
  onNavigate: (page: string) => void
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const token = useMemo(() => localStorage.getItem('auth_token'), [])
  return <TeacherDashboard onNavigate={onNavigate} token={token} />
}
