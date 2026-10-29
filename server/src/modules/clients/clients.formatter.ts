export const formatClient = (client: any) => ({
  id: client.id.toString(),
  displayName: client.display_name ?? client.displayName,
  clientType: client.client_type ?? client.clientType,
  email: client.email ?? null,
  phone: client.phone ?? null,
  address: client.address ?? null,
  registrationNumber: client.registration_number ?? client.registrationNumber ?? null,
  notes: client.notes ?? null,
  isActive: client.is_active ?? client.isActive ?? true,
  createdAt: client.created_at ?? client.createdAt,
  updatedAt: client.updated_at ?? client.updatedAt,
  display_name: client.display_name ?? client.displayName,
  client_type: client.client_type ?? client.clientType,
  registration_number: client.registration_number ?? client.registrationNumber ?? null,
  is_active: client.is_active ?? client.isActive ?? true,
});

export default formatClient;

