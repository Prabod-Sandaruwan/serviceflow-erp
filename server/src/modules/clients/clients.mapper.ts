import { Prisma } from '@prisma/client';

export const normalizeClientType = (t?: string): 'INDIVIDUAL' | 'COMPANY' =>
  t === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'COMPANY';

export const mapCreate = (d: any): Prisma.ClientCreateInput => ({
  display_name: d.displayName ?? d.display_name,
  client_type: normalizeClientType(d.clientType ?? d.client_type),
  email: d.email || null,
  phone: d.phone || null,
  address: d.address || null,
  registration_number: d.registrationNumber ?? d.registration_number ?? null,
  notes: d.notes || null,
  is_active: d.isActive ?? d.is_active ?? true,
});

export const mapUpdate = (d: any): Prisma.ClientUpdateInput => {
  const u: Prisma.ClientUpdateInput = {};
  if (d.displayName !== undefined || d.display_name !== undefined)
    u.display_name = d.displayName ?? d.display_name;
  if (d.clientType !== undefined || d.client_type !== undefined) {
    u.client_type = normalizeClientType(d.clientType ?? d.client_type);
  }
  if (d.email !== undefined) u.email = d.email || null;
  if (d.phone !== undefined) u.phone = d.phone || null;
  if (d.address !== undefined) u.address = d.address || null;
  if (d.registrationNumber !== undefined || d.registration_number !== undefined) {
    u.registration_number = d.registrationNumber ?? d.registration_number ?? null;
  }
  if (d.notes !== undefined) u.notes = d.notes || null;
  if (d.isActive !== undefined || d.is_active !== undefined)
    u.is_active = d.isActive ?? d.is_active;
  return u;
};
