export const formatEmployee = (emp: any) => ({
  id: emp.id,
  fullName: emp.full_name,
  email: emp.user?.email,
  jobTitle: emp.job_title,
  department: emp.department || null,
  phone: emp.phone,
  isActive: emp.is_active,
  createdAt: emp.created_at,
  updatedAt: emp.updated_at,
  full_name: emp.full_name,
  job_title: emp.job_title,
  is_active: emp.is_active,
  role: emp.user?.role || 'STAFF',
});

export default formatEmployee;
