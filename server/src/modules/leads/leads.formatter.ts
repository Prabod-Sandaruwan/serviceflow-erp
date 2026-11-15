export const formatLead = (lead: any) => ({
  id: lead.id.toString(),
  ownerId: lead.ownerId?.toString() ?? lead.owner_id?.toString() ?? null,
  status: lead.status,
  lostReason: lead.lost_reason ?? lead.lostReason ?? null,
  expectedValue:
    lead.expected_value !== null && lead.expected_value !== undefined
      ? Number(lead.expected_value)
      : lead.expectedValue !== null && lead.expectedValue !== undefined
        ? Number(lead.expectedValue)
        : null,
  convertedClientId:
    lead.convertedClientId?.toString() ?? lead.converted_client_id?.toString() ?? null,
  createdAt: lead.created_at ?? lead.createdAt,
  updatedAt: lead.updated_at ?? lead.updatedAt,
  ...(lead.owner
    ? {
        owner: {
          id: lead.owner.id.toString(),
          email: lead.owner.email,
          fullName: lead.owner.employee?.fullName ?? lead.owner.employee?.full_name ?? null,
        },
      }
    : {}),
});

export default formatLead;
