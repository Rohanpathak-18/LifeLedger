import { success } from '../../utils/responses.js';
import { contactSchema } from './contact.validation.js';
import * as contactService from './contact.service.js';

export async function create(req, res) {
  if (req.body.website) return success(res, null, 'Message received');
  const message = await contactService.create(contactSchema.parse(req.body));
  return success(
    res,
    {
      emailDelivered: Boolean(message.emailedAt),
    },
    'Message received',
  );
}
