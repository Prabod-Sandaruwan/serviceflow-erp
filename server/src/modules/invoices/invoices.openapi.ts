import { registry } from '../../config/openapi';

export function registerInvoiceOpenApi() {
  registry.registerPath({
    method: 'get',
    path: '/api/v1/invoices',
    summary: 'List invoices',
    responses: { 200: { description: 'Invoices list' }, 401: { description: 'Unauthenticated' } },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/invoices/{id}',
    summary: 'Get invoice details',
    responses: {
      200: { description: 'Invoice details' },
      401: { description: 'Unauthenticated' },
      404: { description: 'Not found' },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/invoices/{id}/pdf',
    summary: 'Get invoice PDF',
    responses: {
      200: { description: 'Invoice PDF' },
      401: { description: 'Unauthenticated' },
      404: { description: 'Not found' },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/invoices',
    summary: 'Create invoice',
    responses: {
      201: { description: 'Invoice created' },
      401: { description: 'Unauthenticated' },
      403: { description: 'Forbidden' },
    },
  });

  registry.registerPath({
    method: 'patch',
    path: '/api/v1/invoices/{id}',
    summary: 'Update draft invoice',
    responses: {
      200: { description: 'Invoice updated' },
      401: { description: 'Unauthenticated' },
      403: { description: 'Forbidden' },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/invoices/{id}/issue',
    summary: 'Issue draft invoice',
    responses: {
      200: { description: 'Invoice issued' },
      401: { description: 'Unauthenticated' },
      403: { description: 'Forbidden' },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/invoices/{id}/cancel',
    summary: 'Cancel invoice',
    responses: {
      200: { description: 'Invoice cancelled' },
      401: { description: 'Unauthenticated' },
      403: { description: 'Forbidden' },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/invoices/dunning-notices',
    summary: 'Dispatch overdue dunning notices',
    responses: {
      200: { description: 'Dunning notices dispatched' },
      401: { description: 'Unauthenticated' },
      403: { description: 'Forbidden' },
    },
  });
}
