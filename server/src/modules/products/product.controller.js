import { success } from '../../utils/responses.js';
import { productSchema, productUpdateSchema } from './product.validation.js';
import * as productService from './product.service.js';

export async function list(req, res) {
  const result = await productService.list(req.user.id, req.query);
  return res.json({
    success: true,
    data: result.items,
    pagination: result.pagination,
  });
}

export async function create(req, res) {
  const product = await productService.create(
    req.user.id,
    productSchema.parse(req.body),
  );
  return success(res, { product }, 'Product created');
}

export async function get(req, res) {
  return success(res, await productService.get(req.user.id, req.params.id));
}

export async function update(req, res) {
  const product = await productService.update(
    req.user.id,
    req.params.id,
    productUpdateSchema.parse(req.body),
  );
  return success(res, { product }, 'Product updated');
}

export async function archive(req, res) {
  const product = await productService.archive(req.user.id, req.params.id);
  return success(res, { product }, 'Product archived');
}

export async function remove(req, res) {
  await productService.remove(req.user.id, req.params.id);
  return success(res, null, 'Product deleted');
}
